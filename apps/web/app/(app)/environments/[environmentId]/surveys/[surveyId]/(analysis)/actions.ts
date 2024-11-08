"use server";

import { generateInsightsForSurvey } from "@/app/api/(internal)/insights/lib/utils";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { authenticatedActionClient } from "@formbricks/lib/actionClient";
import { checkAuthorization } from "@formbricks/lib/actionClient/utils";
import { getOrganizationIdFromSurveyId } from "@formbricks/lib/organization/utils";
import { getResponseCountBySurveyId, getResponses } from "@formbricks/lib/response/service";
import { ZId } from "@formbricks/types/common";
import { ZResponseFilterCriteria } from "@formbricks/types/responses";
import { getSurveySummary } from "./summary/lib/surveySummary";

const revalidateSurveyCache = async (surveyId: string) => {
  // Revalidate by survey ID pattern to catch all related pages
  revalidatePath(`/[environmentId]/surveys/${surveyId}`);
  revalidatePath(`/surveys/${surveyId}`);

  // Revalidate tags
  revalidateTag(`survey-${surveyId}`);
  revalidateTag(`responses-${surveyId}`);
};

const ZGetResponsesAction = z.object({
  surveyId: ZId,
  limit: z.number().optional(),
  offset: z.number().optional(),
  filterCriteria: ZResponseFilterCriteria.optional(),
});

export const getResponsesAction = authenticatedActionClient
  .schema(ZGetResponsesAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromSurveyId(parsedInput.surveyId);

    await checkAuthorization({
      userId: ctx.user.id,
      organizationId,
      rules: ["response", "read"],
    });

    const responses = await getResponses(
      parsedInput.surveyId,
      parsedInput.limit,
      parsedInput.offset,
      parsedInput.filterCriteria
    );

    await revalidateSurveyCache(parsedInput.surveyId);

    return responses;
  });

const ZGetSurveySummaryAction = z.object({
  surveyId: ZId,
  filterCriteria: ZResponseFilterCriteria.optional(),
});

export const getSurveySummaryAction = authenticatedActionClient
  .schema(ZGetSurveySummaryAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromSurveyId(parsedInput.surveyId);

    await checkAuthorization({
      userId: ctx.user.id,
      organizationId,
      rules: ["response", "read"],
    });

    const summary = await getSurveySummary(parsedInput.surveyId, parsedInput.filterCriteria);

    await revalidateSurveyCache(parsedInput.surveyId);

    return summary;
  });

const ZGetResponseCountAction = z.object({
  surveyId: ZId,
  filterCriteria: ZResponseFilterCriteria.optional(),
});

export const getResponseCountAction = authenticatedActionClient
  .schema(ZGetResponseCountAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromSurveyId(parsedInput.surveyId);

    await checkAuthorization({
      userId: ctx.user.id,
      organizationId,
      rules: ["response", "read"],
    });

    const count = await getResponseCountBySurveyId(parsedInput.surveyId, parsedInput.filterCriteria);

    await revalidateSurveyCache(parsedInput.surveyId);

    return count;
  });

const ZGenerateInsightsForSurveyAction = z.object({
  surveyId: ZId,
});

export const generateInsightsForSurveyAction = authenticatedActionClient
  .schema(ZGenerateInsightsForSurveyAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromSurveyId(parsedInput.surveyId);

    await checkAuthorization({
      userId: ctx.user.id,
      organizationId,
      rules: ["survey", "update"],
    });

    await generateInsightsForSurvey(parsedInput.surveyId);

    await revalidateSurveyCache(parsedInput.surveyId);
  });
