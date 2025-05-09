import { createDocumentAndAssignInsight } from "@/app/api/(internal)/pipeline/lib/documents";
import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { getIsAIEnabled } from "@/app/lib/utils";
import { headers } from "next/headers";
import { prisma } from "@formbricks/database";
import { sendResponseFinishedEmail } from "@formbricks/email";
import { CRON_SECRET, IS_AI_CONFIGURED } from "@formbricks/lib/constants";
import { getIntegrations } from "@formbricks/lib/integration/service";
import { getOrganizationByEnvironmentId } from "@formbricks/lib/organization/service";
import { getResponseCountBySurveyId } from "@formbricks/lib/response/service";
import { getSurvey, updateSurvey } from "@formbricks/lib/survey/service";
import { convertDatesInObject } from "@formbricks/lib/time";
import { getPromptText } from "@formbricks/lib/utils/ai";
import { ZPipelineInput } from "@formbricks/types/pipelines";
import { TWebhook } from "@formbricks/types/webhooks";
import { handleIntegrations } from "./lib/handleIntegrations";

export const POST = async (request: Request) => {
  // Check authentication
  if (headers().get("x-api-key") !== CRON_SECRET) {
    return responses.notAuthenticatedResponse();
  }

  const jsonInput = await request.json();
  const convertedJsonInput = convertDatesInObject(jsonInput);

  const inputValidation = ZPipelineInput.safeParse(convertedJsonInput);

  if (!inputValidation.success) {
    console.error(inputValidation.error);
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  const { environmentId, surveyId, event, response } = inputValidation.data;

  // Fetch webhooks directly from the database
  const webhooks: TWebhook[] = await prisma.webhook.findMany({
    where: {
      environmentId,
      triggers: { has: event },
      OR: [{ surveyIds: { has: surveyId } }, { surveyIds: { isEmpty: true } }],
    },
  });

  // Prepare webhook and email promises
  const fetchWithTimeout = (url: string, options: RequestInit, timeout: number = 5000): Promise<Response> => {
    return Promise.race([
      fetch(url, options),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
    ]);
  };

  const webhookPromises = webhooks.map((webhook) =>
    fetchWithTimeout(webhook.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        webhookId: webhook.id,
        event,
        data: response,
      }),
    }).catch((error) => {
      console.error(`Webhook call to ${webhook.url} failed:`, error);
    })
  );

  if (event === "responseFinished") {
    // Fetch integrations, survey, and responseCount in parallel
    const [integrations, survey, responseCount] = await Promise.all([
      getIntegrations(environmentId),
      getSurvey(surveyId),
      getResponseCountBySurveyId(surveyId),
    ]);

    if (!survey) {
      console.error(`Survey with id ${surveyId} not found`);
      return new Response("Survey not found", { status: 404 });
    }

    if (integrations.length > 0) {
      await handleIntegrations(integrations, inputValidation.data, survey);
    }

    const usersWithNotifications = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organization: {
              products: {
                some: {
                  environments: {
                    some: { id: environmentId },
                  },
                },
              },
            },
          },
        },
        notificationSettings: {
          path: ["alert", surveyId],
          equals: true,
        },
      },
      select: { email: true, locale: true },
    });

    const emailPromises = usersWithNotifications.map((user) =>
      sendResponseFinishedEmail(
        user.email,
        environmentId,
        survey,
        response,
        responseCount,
        user.locale
      ).catch((error) => {
        console.error(`Failed to send email to ${user.email}:`, error);
      })
    );

    // Update survey status if necessary
    if (survey.autoComplete && responseCount === survey.autoComplete) {
      survey.status = "completed";
      await updateSurvey(survey);
    }

    // Await webhook and email promises with allSettled to prevent early rejection
    const results = await Promise.allSettled([...webhookPromises, ...emailPromises]);
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Promise rejected:", result.reason);
      }
    });

    // generate embeddings for all open text question responses for all paid plans
    const hasSurveyOpenTextQuestions = survey.questions.some((question) => question.type === "openText");
    if (hasSurveyOpenTextQuestions) {
      const isAICofigured = IS_AI_CONFIGURED;
      if (hasSurveyOpenTextQuestions && isAICofigured) {
        const organization = await getOrganizationByEnvironmentId(environmentId);
        if (!organization) {
          throw new Error("Organization not found");
        }

        const isAIEnabled = await getIsAIEnabled();

        if (isAIEnabled) {
          for (const question of survey.questions) {
            if (question.type === "openText" && question.insightsEnabled) {
              const isQuestionAnswered =
                response.data[question.id] !== undefined && response.data[question.id] !== "";
              if (!isQuestionAnswered) {
                continue;
              }
              const text = getPromptText(question.headline.default, response.data[question.id] as string);
              try {
                await createDocumentAndAssignInsight(survey.name, {
                  environmentId,
                  surveyId,
                  responseId: response.id,
                  questionId: question.id,
                  text,
                });
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      }
    }
  } else {
    // Await webhook promises if no emails are sent
    const results = await Promise.allSettled(webhookPromises);
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Promise rejected:", result.reason);
      }
    });
  }

  return Response.json({ data: {} });
};
