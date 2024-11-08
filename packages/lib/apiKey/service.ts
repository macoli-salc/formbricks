import "server-only";
import { Prisma } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@formbricks/database";
import { TApiKey, TApiKeyCreateInput, ZApiKeyCreateInput } from "@formbricks/types/api-keys";
import { ZOptionalNumber, ZString } from "@formbricks/types/common";
import { ZId } from "@formbricks/types/common";
import { DatabaseError, InvalidInputError } from "@formbricks/types/errors";
import { ITEMS_PER_PAGE } from "../constants";
import { getHash } from "../crypto";
import { validateInputs } from "../utils/validate";

export const getApiKey = async (apiKeyId: string): Promise<TApiKey | null> => {
  validateInputs([apiKeyId, ZString]);

  if (!apiKeyId) {
    throw new InvalidInputError("API key cannot be null or undefined.");
  }

  try {
    const apiKeyData = await prisma.apiKey.findUnique({
      where: {
        id: apiKeyId,
      },
    });

    return apiKeyData;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const getApiKeys = async (environmentId: string, page?: number): Promise<TApiKey[]> => {
  validateInputs([environmentId, ZId], [page, ZOptionalNumber]);

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        environmentId,
      },
      take: page ? ITEMS_PER_PAGE : undefined,
      skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
    });

    return apiKeys;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const hashApiKey = (key: string): string => createHash("sha256").update(key).digest("hex");

export const createApiKey = async (
  environmentId: string,
  apiKeyData: TApiKeyCreateInput
): Promise<TApiKey> => {
  validateInputs([environmentId, ZId], [apiKeyData, ZApiKeyCreateInput]);
  try {
    const key = randomBytes(16).toString("hex");
    const hashedKey = hashApiKey(key);

    const result = await prisma.apiKey.create({
      data: {
        ...apiKeyData,
        hashedKey,
        environment: { connect: { id: environmentId } },
      },
    });

    return { ...result, apiKey: key };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getApiKeyFromKey = async (apiKey: string): Promise<TApiKey | null> => {
  const hashedKey = getHash(apiKey);
  validateInputs([apiKey, ZString]);

  if (!apiKey) {
    throw new InvalidInputError("API key cannot be null or undefined.");
  }

  try {
    const apiKeyData = await prisma.apiKey.findUnique({
      where: {
        hashedKey,
      },
    });

    return apiKeyData;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const deleteApiKey = async (id: string): Promise<TApiKey | null> => {
  validateInputs([id, ZId]);

  try {
    const deletedApiKeyData = await prisma.apiKey.delete({
      where: {
        id: id,
      },
    });

    return deletedApiKeyData;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};
