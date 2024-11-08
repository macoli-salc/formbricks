import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@formbricks/database";
import { getInProgressSurveyCount } from "@formbricks/lib/survey/service";
import { buildOrderByClause, buildWhereClause } from "@formbricks/lib/survey/utils";
import { validateInputs } from "@formbricks/lib/utils/validate";
import { ZOptionalNumber } from "@formbricks/types/common";
import { ZId } from "@formbricks/types/common";
import { DatabaseError } from "@formbricks/types/errors";
import { TSurveyFilterCriteria } from "@formbricks/types/surveys/types";
import { TSurvey } from "../types/surveys";

export const surveySelect: Prisma.SurveySelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  type: true,
  creator: {
    select: {
      name: true,
    },
  },
  status: true,
  singleUse: true,
  environmentId: true,
  _count: {
    select: { responses: true },
  },
};

export const getSurveys = async (
  environmentId: string,
  limit?: number,
  offset?: number,
  filterCriteria?: TSurveyFilterCriteria
): Promise<TSurvey[]> => {
  validateInputs([environmentId, ZId], [limit, ZOptionalNumber], [offset, ZOptionalNumber]);

  try {
    if (filterCriteria?.sortBy === "relevance") {
      return await getSurveysSortedByRelevance(environmentId, limit, offset ?? 0, filterCriteria);
    }

    const surveysPrisma = await prisma.survey.findMany({
      where: {
        environmentId,
        ...buildWhereClause(filterCriteria),
      },
      select: surveySelect,
      orderBy: buildOrderByClause(filterCriteria?.sortBy),
      take: limit,
      skip: offset,
    });

    return surveysPrisma.map((survey) => {
      return {
        ...survey,
        responseCount: survey._count.responses,
      };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error);
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getSurveysSortedByRelevance = async (
  environmentId: string,
  limit?: number,
  offset?: number,
  filterCriteria?: TSurveyFilterCriteria
): Promise<TSurvey[]> => {
  validateInputs([environmentId, ZId], [limit, ZOptionalNumber], [offset, ZOptionalNumber]);

  try {
    let surveys: TSurvey[] = [];
    const inProgressSurveyCount = await getInProgressSurveyCount(environmentId, filterCriteria);

    // Fetch surveys that are in progress first
    const inProgressSurveys =
      offset && offset > inProgressSurveyCount
        ? []
        : await prisma.survey.findMany({
            where: {
              environmentId,
              status: "inProgress",
              ...buildWhereClause(filterCriteria),
            },
            select: surveySelect,
            orderBy: buildOrderByClause("updatedAt"),
            take: limit,
            skip: offset,
          });

    surveys = inProgressSurveys.map((survey) => {
      return {
        ...survey,
        responseCount: survey._count.responses,
      };
    });

    // Determine if additional surveys are needed
    if (offset !== undefined && limit && inProgressSurveys.length < limit) {
      const remainingLimit = limit - inProgressSurveys.length;
      const newOffset = Math.max(0, offset - inProgressSurveyCount);
      const additionalSurveys = await prisma.survey.findMany({
        where: {
          environmentId,
          status: { not: "inProgress" },
          ...buildWhereClause(filterCriteria),
        },
        select: surveySelect,
        orderBy: buildOrderByClause("updatedAt"),
        take: remainingLimit,
        skip: newOffset,
      });

      surveys = [
        ...surveys,
        ...additionalSurveys.map((survey) => {
          return {
            ...survey,
            responseCount: survey._count.responses,
          };
        }),
      ];
    }

    return surveys;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error);
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getSurvey = async (surveyId: string): Promise<TSurvey | null> => {
  validateInputs([surveyId, ZId]);

  let surveyPrisma;
  try {
    surveyPrisma = await prisma.survey.findUnique({
      where: {
        id: surveyId,
      },
      select: surveySelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error);
      throw new DatabaseError(error.message);
    }
    throw error;
  }

  if (!surveyPrisma) {
    return null;
  }

  return { ...surveyPrisma, responseCount: surveyPrisma?._count.responses };
};
