import { prisma } from "@formbricks/database";
import { getActionClasses } from "@formbricks/lib/actionClass/service";
import { IS_FORMBRICKS_CLOUD } from "@formbricks/lib/constants";
import { getEnvironment } from "@formbricks/lib/environment/service";
import {
  getMonthlyOrganizationResponseCount,
  getOrganizationByEnvironmentId,
} from "@formbricks/lib/organization/service";
import {
  capturePosthogEnvironmentEvent,
  sendPlanLimitsReachedEventToPosthogWeekly,
} from "@formbricks/lib/posthogServer";
import { getProductByEnvironmentId } from "@formbricks/lib/product/service";
import { getSurveys } from "@formbricks/lib/survey/service";
import { ResourceNotFoundError } from "@formbricks/types/errors";
import { TJsEnvironmentState } from "@formbricks/types/js";

/**
 *
 * @param environmentId
 * @returns The environment state
 * @throws ResourceNotFoundError if the environment or organization does not exist
 */
export const getEnvironmentState = async (
  environmentId: string
): Promise<{ state: TJsEnvironmentState["data"]; revalidateEnvironment?: boolean }> => {
  let revalidateEnvironment = false;

  const [environment, organization, product] = await Promise.all([
    getEnvironment(environmentId),
    getOrganizationByEnvironmentId(environmentId),
    getProductByEnvironmentId(environmentId),
  ]);

  if (!environment) {
    throw new ResourceNotFoundError("environment", environmentId);
  }

  if (!organization) {
    throw new ResourceNotFoundError("organization", null);
  }

  if (!product) {
    throw new ResourceNotFoundError("product", null);
  }

  if (!environment.appSetupCompleted) {
    await Promise.all([
      prisma.environment.update({
        where: {
          id: environmentId,
        },
        data: { appSetupCompleted: true },
      }),
      capturePosthogEnvironmentEvent(environmentId, "app setup completed"),
    ]);

    revalidateEnvironment = true;
  }

  // check if MAU limit is reached
  let isMonthlyResponsesLimitReached = false;

  if (IS_FORMBRICKS_CLOUD) {
    const monthlyResponseLimit = organization.billing.limits.monthly.responses;
    const currentResponseCount = await getMonthlyOrganizationResponseCount(organization.id);
    isMonthlyResponsesLimitReached =
      monthlyResponseLimit !== null && currentResponseCount >= monthlyResponseLimit;
  }

  if (isMonthlyResponsesLimitReached) {
    try {
      await sendPlanLimitsReachedEventToPosthogWeekly(environmentId, {
        plan: organization.billing.plan,
        limits: {
          monthly: {
            miu: organization.billing.limits.monthly.miu,
            responses: organization.billing.limits.monthly.responses,
          },
        },
      });
    } catch (err) {
      console.error(`Error sending plan limits reached event to Posthog: ${err}`);
    }
  }

  const [surveys, actionClasses] = await Promise.all([
    getSurveys(environmentId),
    getActionClasses(environmentId),
  ]);

  const filteredSurveys = surveys.filter((survey) => survey.type === "app" && survey.status === "inProgress");

  const state: TJsEnvironmentState["data"] = {
    surveys: !isMonthlyResponsesLimitReached ? filteredSurveys : [],
    actionClasses,
    product,
  };

  return {
    state,
    revalidateEnvironment,
  };
};
