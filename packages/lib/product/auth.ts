import { ZId } from "@formbricks/types/common";
import { getMembershipByUserIdOrganizationId } from "../membership/service";
import { getAccessFlags } from "../membership/utils";
import { getOrganizationsByUserId } from "../organization/service";
import { validateInputs } from "../utils/validate";
import { getProduct } from "./service";

export const canUserAccessProduct = async (userId: string, productId: string): Promise<boolean> => {
  validateInputs([userId, ZId], [productId, ZId]);

  if (!userId || !productId) return false;

  try {
    const product = await getProduct(productId);
    if (!product) return false;

    const organizationIds = (await getOrganizationsByUserId(userId)).map((organization) => organization.id);
    return organizationIds.includes(product.organizationId);
  } catch (error) {
    throw error;
  }
};

export const verifyUserRoleAccess = async (
  organizationId: string,
  userId: string
): Promise<{
  hasCreateOrUpdateAccess: boolean;
  hasDeleteAccess: boolean;
}> => {
  const accessObject = {
    hasCreateOrUpdateAccess: true,
    hasDeleteAccess: true,
  };

  if (!organizationId) {
    throw new Error("Organization not found");
  }

  const currentUserMembership = await getMembershipByUserIdOrganizationId(userId, organizationId);
  const { isDeveloper, isViewer } = getAccessFlags(currentUserMembership?.role);

  if (isDeveloper || isViewer) {
    accessObject.hasCreateOrUpdateAccess = false;
    accessObject.hasDeleteAccess = false;
  }

  return accessObject;
};
