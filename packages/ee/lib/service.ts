import "server-only";
import {
  E2E_TESTING,
  ENTERPRISE_LICENSE_KEY,
  IS_FORMBRICKS_CLOUD,
  PRODUCT_FEATURE_KEYS,
} from "@formbricks/lib/constants";
import { TOrganization } from "@formbricks/types/organizations";
import { TEnterpriseLicenseDetails, TEnterpriseLicenseFeatures } from "./types";

// Store previous result in memory
let previousResult = {
  active: null,
  lastChecked: new Date(0),
  features: null,
} as {
  active: boolean | null;
  lastChecked: Date;
  features: TEnterpriseLicenseFeatures | null;
};

const fetchLicenseForE2ETesting = async (): Promise<{
  active: boolean | null;
  lastChecked: Date;
  features: TEnterpriseLicenseFeatures | null;
} | null> => {
  const currentTime = new Date();
  try {
    if (previousResult.lastChecked.getTime() === new Date(0).getTime()) {
      // first call
      const newResult = {
        active: true,
        features: { isMultiOrgEnabled: true },
        lastChecked: currentTime,
      };
      previousResult = newResult;
      return newResult;
    } else if (currentTime.getTime() - previousResult.lastChecked.getTime() > 60 * 60 * 1000) {
      // Fail after 1 hour
      console.log("E2E_TESTING is enabled. Enterprise license was revoked after 1 hour.");
      return null;
    }
    return previousResult;
  } catch (error) {
    console.error("Error fetching license: ", error);
    return null;
  }
};

export const getEnterpriseLicense = async (): Promise<{
  active: boolean;
  features: TEnterpriseLicenseFeatures | null;
  lastChecked: Date;
  isPendingDowngrade?: boolean;
}> => {
  if (!ENTERPRISE_LICENSE_KEY || ENTERPRISE_LICENSE_KEY.length === 0) {
    return {
      active: false,
      features: null,
      lastChecked: new Date(),
    };
  }

  if (E2E_TESTING) {
    const result = await fetchLicenseForE2ETesting();
    return {
      active: result?.active ?? false,
      features: result ? result.features : null,
      lastChecked: result ? result.lastChecked : new Date(),
    };
  }

  const license = await fetchLicense();
  const isValid = license ? license.status === "active" : null;
  const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
  const currentTime = new Date();

  // Case: First time checking license and the server errors out
  if (previousResult.active === null) {
    if (isValid === null) {
      const newResult = {
        active: false,
        features: { isMultiOrgEnabled: false },
        lastChecked: new Date(),
      };
      previousResult = newResult;
      return newResult;
    }
  }

  if (isValid !== null && license) {
    const newResult = {
      active: isValid,
      features: license.features,
      lastChecked: new Date(),
    };
    previousResult = newResult;
    return newResult;
  } else {
    const elapsedTime = currentTime.getTime() - previousResult.lastChecked.getTime();
    if (elapsedTime < threeDaysInMillis) {
      return {
        active: previousResult.active !== null ? previousResult.active : false,
        features: previousResult.features,
        lastChecked: previousResult.lastChecked,
        isPendingDowngrade: true,
      };
    }

    console.error("Error while checking license: The license check failed");

    return {
      active: false,
      features: null,
      lastChecked: previousResult.lastChecked,
      isPendingDowngrade: true,
    };
  }
};

export const getLicenseFeatures = async (): Promise<TEnterpriseLicenseFeatures | null> => {
  if (previousResult.features) {
    return previousResult.features;
  }

  const license = await fetchLicense();
  if (!license || !license.features) return null;
  return license.features;
};

export const fetchLicense = async (): Promise<TEnterpriseLicenseDetails | null> => {
  try {
    const result = {
      status: "active",
      features: { isMultiOrgEnabled: true },
    } as TEnterpriseLicenseDetails;
    return result;
  } catch (error) {
    console.error("Error while checking license: ", error);
    return null;
  }
};

export const getRemoveInAppBrandingPermission = (organization: TOrganization): boolean => {
  if (IS_FORMBRICKS_CLOUD) return organization.billing.plan !== PRODUCT_FEATURE_KEYS.FREE;
  else if (!IS_FORMBRICKS_CLOUD) return true;
  return false;
};

export const getRemoveLinkBrandingPermission = (organization: TOrganization): boolean => {
  if (IS_FORMBRICKS_CLOUD) return organization.billing.plan !== PRODUCT_FEATURE_KEYS.FREE;
  else if (!IS_FORMBRICKS_CLOUD) return true;
  return false;
};

export const getRoleManagementPermission = async (organization: TOrganization): Promise<boolean> => {
  if (IS_FORMBRICKS_CLOUD)
    return (
      organization.billing.plan === PRODUCT_FEATURE_KEYS.SCALE ||
      organization.billing.plan === PRODUCT_FEATURE_KEYS.ENTERPRISE
    );
  else if (!IS_FORMBRICKS_CLOUD) return (await getEnterpriseLicense()).active;
  return false;
};

export const getAdvancedTargetingPermission = async (organization: TOrganization): Promise<boolean> => {
  if (IS_FORMBRICKS_CLOUD)
    return (
      organization.billing.plan === PRODUCT_FEATURE_KEYS.SCALE ||
      organization.billing.plan === PRODUCT_FEATURE_KEYS.ENTERPRISE
    );
  else if (!IS_FORMBRICKS_CLOUD) return (await getEnterpriseLicense()).active;
  else return false;
};

export const getBiggerUploadFileSizePermission = async (organization: TOrganization): Promise<boolean> => {
  if (IS_FORMBRICKS_CLOUD) return organization.billing.plan !== PRODUCT_FEATURE_KEYS.FREE;
  else if (!IS_FORMBRICKS_CLOUD) return (await getEnterpriseLicense()).active;
  return false;
};

export const getMultiLanguagePermission = async (organization: TOrganization): Promise<boolean> => {
  if (E2E_TESTING) {
    const previousResult = await fetchLicenseForE2ETesting();
    return previousResult && previousResult.active !== null ? previousResult.active : false;
  }
  if (IS_FORMBRICKS_CLOUD)
    return (
      organization.billing.plan === PRODUCT_FEATURE_KEYS.SCALE ||
      organization.billing.plan === PRODUCT_FEATURE_KEYS.ENTERPRISE
    );
  else if (!IS_FORMBRICKS_CLOUD) return (await getEnterpriseLicense()).active;
  return false;
};

export const getIsMultiOrgEnabled = async (): Promise<boolean> => {
  if (E2E_TESTING) {
    const result = await fetchLicenseForE2ETesting();
    return result && result.features ? result.features.isMultiOrgEnabled : false;
  }
  const licenseFeatures = await getLicenseFeatures();
  if (!licenseFeatures) return false;
  return licenseFeatures.isMultiOrgEnabled;
};
