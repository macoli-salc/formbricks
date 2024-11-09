import { TInvite } from "@formbricks/types/invites";

export const isInviteExpired = (invite: TInvite) => {
  const now = new Date();
  const expiresAt = new Date(invite.expiresAt);
  return now > expiresAt;
};

export const getIsOrganizationAIReady = async () => {
  // TODO: We'll remove the IS_FORMBRICKS_CLOUD check once we have the AI feature available for self-hosted customers
  return Boolean(true);
};

export const getIsAIEnabled = async () => {
  const isOrganizationAIReady = await getIsOrganizationAIReady();
  return Boolean(isOrganizationAIReady);
};
