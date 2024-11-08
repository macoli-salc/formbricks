import { prisma } from "@formbricks/database";
import { getDisplaysByUserId } from "@formbricks/lib/display/service";
import { getEnvironment } from "@formbricks/lib/environment/service";
import { getOrganizationByEnvironmentId } from "@formbricks/lib/organization/service";
import { getPersonByUserId } from "@formbricks/lib/person/service";
import { getResponsesByUserId } from "@formbricks/lib/response/service";
import { ResourceNotFoundError } from "@formbricks/types/errors";
import { TJsPersonState } from "@formbricks/types/js";
import { getPersonSegmentIds } from "./segments";

/**
 *
 * @param environmentId - The environment id
 * @param userId - The user id
 * @param device - The device type
 * @returns The person state
 * @throws {ValidationError} - If the input is invalid
 * @throws {ResourceNotFoundError} - If the environment or organization is not found
 */
export const getPersonState = async ({
  environmentId,
  userId,
  device,
}: {
  environmentId: string;
  userId: string;
  device: "phone" | "desktop";
}): Promise<{
  state: TJsPersonState["data"];
  revalidateProps?: { personId: string; revalidate: boolean };
}> => {
  let revalidatePerson = false;
  const environment = await getEnvironment(environmentId);

  if (!environment) {
    throw new ResourceNotFoundError(`environment`, environmentId);
  }

  const organization = await getOrganizationByEnvironmentId(environmentId);

  if (!organization) {
    throw new ResourceNotFoundError(`organization`, environmentId);
  }

  let person = await getPersonByUserId(environmentId, userId);

  if (!person) {
    person = await prisma.person.create({
      data: {
        environment: {
          connect: {
            id: environmentId,
          },
        },
        userId,
      },
    });

    revalidatePerson = true;
  }

  const [personResponses, personDisplays, segments] = await Promise.all([
    getResponsesByUserId(environmentId, userId),
    getDisplaysByUserId(environmentId, userId),
    getPersonSegmentIds(environmentId, person, device),
  ]);

  // If the person exists, return the persons's state
  const userState: TJsPersonState["data"] = {
    userId: person.userId,
    segments,
    displays:
      personDisplays?.map((display) => ({
        surveyId: display.surveyId,
        createdAt: display.createdAt,
      })) ?? [],
    responses: personResponses?.map((response) => response.surveyId) ?? [],
    lastDisplayAt:
      personDisplays.length > 0
        ? personDisplays.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : null,
  };

  return {
    state: userState,
    revalidateProps: revalidatePerson ? { personId: person.id, revalidate: true } : undefined,
  };
};
