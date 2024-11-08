import "server-only";
import { ZId } from "@formbricks/types/common";
import { hasUserEnvironmentAccess } from "../environment/auth";
import { validateInputs } from "../utils/validate";
import { getApiKey } from "./service";

export const canUserAccessApiKey = async (userId: string, apiKeyId: string): Promise<boolean> => {
  validateInputs([userId, ZId], [apiKeyId, ZId]);

  try {
    const apiKeyFromServer = await getApiKey(apiKeyId);
    if (!apiKeyFromServer) return false;

    const hasAccessToEnvironment = await hasUserEnvironmentAccess(userId, apiKeyFromServer.environmentId);
    if (!hasAccessToEnvironment) return false;

    return true;
  } catch (error) {
    throw error;
  }
};
