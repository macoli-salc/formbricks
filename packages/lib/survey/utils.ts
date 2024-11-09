import "server-only";
import { Prisma } from "@prisma/client";
import { generateObject } from "ai";
import { z } from "zod";
import { TSegment } from "@formbricks/types/segment";
import {
  TSurvey,
  TSurveyFilterCriteria,
  TSurveyQuestion,
  TSurveyQuestions,
} from "@formbricks/types/surveys/types";
import { llmModel } from "../aiModels";

export const transformPrismaSurvey = (surveyPrisma: any): TSurvey => {
  let segment: TSegment | null = null;

  if (surveyPrisma.segment) {
    segment = {
      ...surveyPrisma.segment,
      surveys: surveyPrisma.segment.surveys.map((survey) => survey.id),
    };
  }

  const transformedSurvey: TSurvey = {
    ...surveyPrisma,
    displayPercentage: Number(surveyPrisma.displayPercentage) || null,
    segment,
  };

  return transformedSurvey;
};

export const buildWhereClause = (filterCriteria?: TSurveyFilterCriteria) => {
  const whereClause: Prisma.SurveyWhereInput["AND"] = [];

  // for name
  if (filterCriteria?.name) {
    whereClause.push({ name: { contains: filterCriteria.name, mode: "insensitive" } });
  }

  // for status
  if (filterCriteria?.status && filterCriteria?.status?.length) {
    whereClause.push({ status: { in: filterCriteria.status } });
  }

  // for type
  if (filterCriteria?.type && filterCriteria?.type?.length) {
    whereClause.push({ type: { in: filterCriteria.type } });
  }

  // for createdBy
  if (filterCriteria?.createdBy?.value && filterCriteria?.createdBy?.value?.length) {
    if (filterCriteria.createdBy.value.length === 1) {
      if (filterCriteria.createdBy.value[0] === "you") {
        whereClause.push({ createdBy: filterCriteria.createdBy.userId });
      }
      if (filterCriteria.createdBy.value[0] === "others") {
        whereClause.push({
          OR: [
            {
              createdBy: {
                not: filterCriteria.createdBy.userId,
              },
            },
            {
              createdBy: null,
            },
          ],
        });
      }
    }
  }

  return { AND: whereClause };
};

export const buildOrderByClause = (
  sortBy?: TSurveyFilterCriteria["sortBy"]
): Prisma.SurveyOrderByWithRelationInput[] | undefined => {
  const orderMapping: { [key: string]: Prisma.SurveyOrderByWithRelationInput } = {
    name: { name: "asc" },
    createdAt: { createdAt: "desc" },
    updatedAt: { updatedAt: "desc" },
  };

  return sortBy ? [orderMapping[sortBy] || { updatedAt: "desc" }] : undefined;
};

export const anySurveyHasFilters = (surveys: TSurvey[]): boolean => {
  return surveys.some((survey) => {
    if ("segment" in survey && survey.segment) {
      return survey.segment.filters && survey.segment.filters.length > 0;
    }
    return false;
  });
};

export const doesSurveyHasOpenTextQuestion = (questions: TSurveyQuestions): boolean => {
  return questions.some((question) => question.type === "openText");
};

export const getInsightsEnabled = async (question: TSurveyQuestion): Promise<boolean> => {
  try {
    const { object } = await generateObject({
      model: llmModel,
      schema: z.object({
        insightsEnabled: z.boolean(),
      }),
      system: `You are an AI expert in survey analysis and user feedback categorization. Your task is to determine if meaningful insights can be extracted from open-ended survey questions. Focus on identifying if the question can elicit:
    - Customer feedback about products/services
    - Feature requests or improvement suggestions
    - Pain points or complaints
    - User experience descriptions
    - General sentiment and satisfaction levels
    - Product usage patterns
    Only return true if the question can generate actionable or analyzable responses.`,

      prompt: `Analyze this survey question: "${question.headline.default}"
    
    Consider:
    1. Is this an open-ended question that allows for detailed responses?
    2. Can the potential answers provide actionable feedback or meaningful insights?
    3. Would responses likely contain specific details rather than just yes/no or numerical ratings?
    4. Could the answers reveal patterns or trends in user behavior/feedback?
    
    Return true only if meaningful insights can be extracted from the responses.`,
      experimental_telemetry: { isEnabled: true },
    });

    return object.insightsEnabled;
  } catch (error) {
    console.log({ error });
    throw error;
  }
};
