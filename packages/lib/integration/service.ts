import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@formbricks/database";
import { ZOptionalNumber, ZString } from "@formbricks/types/common";
import { ZId } from "@formbricks/types/common";
import { DatabaseError } from "@formbricks/types/errors";
import { TIntegration, TIntegrationInput, ZIntegrationType } from "@formbricks/types/integration";
import { ITEMS_PER_PAGE } from "../constants";
import { validateInputs } from "../utils/validate";
import { integrationCache } from "./cache";

export const createOrUpdateIntegration = async (
  environmentId: string,
  integrationData: TIntegrationInput
): Promise<TIntegration> => {
  validateInputs([environmentId, ZId]);

  try {
    const integration = await prisma.integration.upsert({
      where: {
        type_environmentId: {
          environmentId,
          type: integrationData.type,
        },
      },
      update: {
        ...integrationData,
        environment: { connect: { id: environmentId } },
      },
      create: {
        ...integrationData,
        environment: { connect: { id: environmentId } },
      },
    });

    integrationCache.revalidate({
      environmentId,
      type: integrationData.type,
    });
    return integration;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error);
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getIntegrations = async (environmentId: string, page?: number): Promise<TIntegration[]> => {
  validateInputs([environmentId, ZId], [page, ZOptionalNumber]);

  try {
    const integrations = await prisma.integration.findMany({
      where: {
        environmentId,
      },
      take: page ? ITEMS_PER_PAGE : undefined,
      skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
    });
    return integrations;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getIntegration = async (integrationId: string): Promise<TIntegration | null> => {
  try {
    const integration = await prisma.integration.findUnique({
      where: {
        id: integrationId,
      },
    });
    return integration;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getIntegrationByType = async (
  environmentId: string,
  type: TIntegrationInput["type"]
): Promise<TIntegration | null> => {
  validateInputs([environmentId, ZId], [type, ZIntegrationType]);

  try {
    const integration = await prisma.integration.findUnique({
      where: {
        type_environmentId: {
          environmentId,
          type,
        },
      },
    });
    return integration;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const deleteIntegration = async (integrationId: string): Promise<TIntegration> => {
  validateInputs([integrationId, ZString]);

  try {
    const integrationData = await prisma.integration.delete({
      where: {
        id: integrationId,
      },
    });

    integrationCache.revalidate({
      id: integrationData.id,
      environmentId: integrationData.environmentId,
      type: integrationData.type,
    });

    return integrationData;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};
