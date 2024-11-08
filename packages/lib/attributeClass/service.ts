"use server";

import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@formbricks/database";
import {
  TAttributeClass,
  TAttributeClassType,
  TAttributeClassUpdateInput,
  ZAttributeClassType,
  ZAttributeClassUpdateInput,
} from "@formbricks/types/attribute-classes";
import { ZOptionalNumber, ZString } from "@formbricks/types/common";
import { ZId } from "@formbricks/types/common";
import { DatabaseError, OperationNotAllowedError } from "@formbricks/types/errors";
import { ITEMS_PER_PAGE, MAX_ATTRIBUTE_CLASSES_PER_ENVIRONMENT } from "../constants";
import { validateInputs } from "../utils/validate";
import { attributeClassCache } from "./cache";

export const getAttributeClass = async (attributeClassId: string): Promise<TAttributeClass | null> => {
  validateInputs([attributeClassId, ZId]);

  try {
    const attributeClass = await prisma.attributeClass.findFirst({
      where: {
        id: attributeClassId,
      },
    });

    return attributeClass;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getAttributeClasses = async (
  environmentId: string,
  page?: number
): Promise<TAttributeClass[]> => {
  validateInputs([environmentId, ZId], [page, ZOptionalNumber]);

  try {
    const attributeClasses = await prisma.attributeClass.findMany({
      where: {
        environmentId: environmentId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: page ? ITEMS_PER_PAGE : undefined,
      skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
    });

    return attributeClasses.filter((attributeClass) => {
      if (attributeClass.name === "userId" && attributeClass.type === "automatic") {
        return false;
      }

      return true;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const updateAttributeClass = async (
  attributeClassId: string,
  data: Partial<TAttributeClassUpdateInput>
): Promise<TAttributeClass | null> => {
  validateInputs([attributeClassId, ZId], [data, ZAttributeClassUpdateInput.partial()]);

  try {
    const attributeClass = await prisma.attributeClass.update({
      where: {
        id: attributeClassId,
      },
      data: {
        description: data.description,
        archived: data.archived,
      },
    });

    attributeClassCache.revalidate({
      id: attributeClass.id,
      environmentId: attributeClass.environmentId,
      name: attributeClass.name,
    });

    return attributeClass;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getAttributeClassByName = async (
  environmentId: string,
  name: string
): Promise<TAttributeClass | null> => {
  validateInputs([environmentId, ZId], [name, ZString]);

  try {
    const attributeClass = await prisma.attributeClass.findFirst({
      where: {
        environmentId,
        name,
      },
    });

    return attributeClass;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const createAttributeClass = async (
  environmentId: string,
  name: string,
  type: TAttributeClassType
): Promise<TAttributeClass | null> => {
  validateInputs([environmentId, ZId], [name, ZString], [type, ZAttributeClassType]);

  const attributeClassesCount = await getAttributeClassesCount(environmentId);

  if (attributeClassesCount >= MAX_ATTRIBUTE_CLASSES_PER_ENVIRONMENT) {
    throw new OperationNotAllowedError(
      `Maximum number of attribute classes (${MAX_ATTRIBUTE_CLASSES_PER_ENVIRONMENT}) reached for environment ${environmentId}`
    );
  }

  try {
    const attributeClass = await prisma.attributeClass.create({
      data: {
        name,
        type,
        environment: {
          connect: {
            id: environmentId,
          },
        },
      },
    });

    attributeClassCache.revalidate({
      id: attributeClass.id,
      environmentId: attributeClass.environmentId,
      name: attributeClass.name,
    });

    return attributeClass;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const deleteAttributeClass = async (attributeClassId: string): Promise<TAttributeClass> => {
  validateInputs([attributeClassId, ZId]);

  try {
    const deletedAttributeClass = await prisma.attributeClass.delete({
      where: {
        id: attributeClassId,
      },
    });

    attributeClassCache.revalidate({
      id: deletedAttributeClass.id,
      environmentId: deletedAttributeClass.environmentId,
      name: deletedAttributeClass.name,
    });

    return deletedAttributeClass;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getAttributeClassesCount = async (environmentId: string): Promise<number> => {
  validateInputs([environmentId, ZId]);

  try {
    return prisma.attributeClass.count({
      where: {
        environmentId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};
