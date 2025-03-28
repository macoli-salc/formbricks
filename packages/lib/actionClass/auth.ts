import "server-only";
import { ZId } from "@formbricks/types/common";
import { hasUserEnvironmentAccess } from "../environment/auth";
import { getMembershipByUserIdOrganizationId } from "../membership/service";
import { getAccessFlags } from "../membership/utils";
import { getOrganizationByEnvironmentId } from "../organization/service";
import { validateInputs } from "../utils/validate";
import { getActionClass } from "./service";

export const canUserUpdateActionClass = async (userId: string, actionClassId: string): Promise<boolean> => {
  validateInputs([userId, ZId], [actionClassId, ZId]);

  try {
    if (!userId) return false;

    const actionClass = await getActionClass(actionClassId);
    if (!actionClass) return false;

    const hasAccessToEnvironment = await hasUserEnvironmentAccess(userId, actionClass.environmentId);

    if (!hasAccessToEnvironment) return false;

    return true;
  } catch (error) {
    throw error;
  }
};

export const verifyUserRoleAccess = async (
  environmentId: string,
  userId: string
): Promise<{
  hasCreateOrUpdateAccess: boolean;
  hasDeleteAccess: boolean;
}> => {
  try {
    const accessObject = {
      hasCreateOrUpdateAccess: true,
      hasDeleteAccess: true,
    };

    const organization = await getOrganizationByEnvironmentId(environmentId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    const currentUserMembership = await getMembershipByUserIdOrganizationId(userId, organization.id);
    const { isViewer } = getAccessFlags(currentUserMembership?.role);

    if (isViewer) {
      accessObject.hasCreateOrUpdateAccess = false;
      accessObject.hasDeleteAccess = false;
    }
    return accessObject;
  } catch (error) {
    throw error;
  }
};
