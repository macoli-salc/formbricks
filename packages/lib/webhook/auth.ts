import { ZId } from "@formbricks/types/common";
import { hasUserEnvironmentAccess } from "../environment/auth";
import { validateInputs } from "../utils/validate";
import { getWebhook } from "./service";

export const canUserAccessWebhook = async (userId: string, webhookId: string): Promise<boolean> => {
  validateInputs([userId, ZId], [webhookId, ZId]);

  try {
    const webhook = await getWebhook(webhookId);
    if (!webhook) return false;

    const hasAccessToEnvironment = await hasUserEnvironmentAccess(userId, webhook.environmentId);
    if (!hasAccessToEnvironment) return false;

    return true;
  } catch (error) {
    throw error;
  }
};
