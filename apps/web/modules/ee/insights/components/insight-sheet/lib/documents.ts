import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@formbricks/database";
import { DOCUMENTS_PER_PAGE } from "@formbricks/lib/constants";
import { validateInputs } from "@formbricks/lib/utils/validate";
import { ZId } from "@formbricks/types/common";
import {
  TDocument,
  TDocumentFilterCriteria,
  ZDocument,
  ZDocumentFilterCriteria,
} from "@formbricks/types/documents";
import { DatabaseError } from "@formbricks/types/errors";
import { TSurveyQuestionId, ZSurveyQuestionId } from "@formbricks/types/surveys/types";

export const getDocumentsByInsightId = async (
  insightId: string,
  limit?: number,
  offset?: number,
  filterCriteria?: TDocumentFilterCriteria
): Promise<TDocument[]> => {
  validateInputs(
    [insightId, ZId],
    [limit, z.number().optional()],
    [offset, z.number().optional()],
    [filterCriteria, ZDocumentFilterCriteria.optional()]
  );

  limit = limit ?? DOCUMENTS_PER_PAGE;
  try {
    const documents = await prisma.document.findMany({
      where: {
        documentInsights: {
          some: {
            insightId,
          },
        },
        createdAt: {
          gte: filterCriteria?.createdAt?.min,
          lte: filterCriteria?.createdAt?.max,
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      take: limit ? limit : undefined,
      skip: offset ? offset : undefined,
    });

    return documents;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getDocumentsByInsightIdSurveyIdQuestionId = async (
  insightId: string,
  surveyId: string,
  questionId: TSurveyQuestionId,
  limit?: number,
  offset?: number
): Promise<TDocument[]> => {
  validateInputs(
    [insightId, ZId],
    [surveyId, ZId],
    [questionId, ZSurveyQuestionId],
    [limit, z.number().optional()],
    [offset, z.number().optional()]
  );

  limit = limit ?? DOCUMENTS_PER_PAGE;
  try {
    const documents = await prisma.document.findMany({
      where: {
        questionId,
        surveyId,
        documentInsights: {
          some: {
            insightId,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      take: limit ? limit : undefined,
      skip: offset ? offset : undefined,
    });

    return documents;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getDocument = async (documentId: string): Promise<TDocument | null> => {
  validateInputs([documentId, ZId]);

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    return document;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const updateDocument = async (documentId: string, data: Partial<TDocument>): Promise<TDocument> => {
  validateInputs([documentId, ZId], [data, ZDocument.partial()]);
  try {
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data,
    });

    return updatedDocument;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};
