import { ZId } from "@formbricks/types/common";
import { hasUserEnvironmentAccess } from "../environment/auth";
import { getMembershipByUserIdOrganizationId } from "../membership/service";
import { getAccessFlags } from "../membership/utils";
import { getOrganizationByEnvironmentId } from "../organization/service";
import { validateInputs } from "../utils/validate";
import { getSurvey } from "./service";

export const canUserAccessSurvey = async (userId: string, surveyId: string): Promise<boolean> => {
  validateInputs([surveyId, ZId], [userId, ZId]);

  if (!userId) return false;

  try {
    const survey = await getSurvey(surveyId);
    if (!survey) throw new Error("Survey not found");

    const hasAccessToEnvironment = await hasUserEnvironmentAccess(userId, survey.environmentId);
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
};
