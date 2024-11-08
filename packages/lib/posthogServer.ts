import { PostHog } from "posthog-node";
import { TOrganizationBillingPlan, TOrganizationBillingPlanLimits } from "@formbricks/types/organizations";
import { env } from "./env";

const enabled =
  process.env.NODE_ENV === "production" &&
  env.NEXT_PUBLIC_POSTHOG_API_HOST &&
  env.NEXT_PUBLIC_POSTHOG_API_KEY;

export const capturePosthogEnvironmentEvent = async (
  environmentId: string,
  eventName: string,
  properties: any = {}
) => {
  if (
    !enabled ||
    typeof env.NEXT_PUBLIC_POSTHOG_API_HOST !== "string" ||
    typeof env.NEXT_PUBLIC_POSTHOG_API_KEY !== "string"
  ) {
    return;
  }

  try {
    const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_API_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_API_HOST,
    });

    client.capture({
      // workaround with a static string as explained in PostHog docs: https://posthog.com/docs/product-analytics/group-analytics
      distinctId: "environmentEvents",
      event: eventName,
      groups: { environment: environmentId },
      properties,
    });

    await client.shutdown();
  } catch (error) {
    console.error("error sending posthog event:", error);
  }
};

export const sendPlanLimitsReachedEventToPosthogWeekly = async (
  environmentId: string,
  billing: {
    plan: TOrganizationBillingPlan;
    limits: TOrganizationBillingPlanLimits;
  }
): Promise<string> => {
  try {
    await capturePosthogEnvironmentEvent(environmentId, "plan limit reached", {
      ...billing,
    });
    return "success";
  } catch (error) {
    console.error(error);
    throw error;
  }
};
