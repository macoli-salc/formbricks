import "server-only";
import { prisma } from "@formbricks/database";
import { CRON_SECRET, WEBAPP_URL } from "@formbricks/lib/constants";
import { doesSurveyHasOpenTextQuestion, getInsightsEnabled } from "@formbricks/lib/survey/utils";
import { validateInputs } from "@formbricks/lib/utils/validate";
import { ZId } from "@formbricks/types/common";
import { ResourceNotFoundError } from "@formbricks/types/errors";
import { TResponse } from "@formbricks/types/responses";
import { TSurvey } from "@formbricks/types/surveys/types";

export const generateInsightsForSurvey = (surveyId: string) => {
  try {
    return fetch(`${WEBAPP_URL}/api/insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CRON_SECRET,
      },
      body: JSON.stringify({
        surveyId,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: new Error(`Error while generating insights for survey: ${error.message}`),
    };
  }
};

export const generateInsightsEnabledForSurveyQuestions = async (
  surveyId: string
): Promise<
  | {
      success: false;
    }
  | {
      success: true;
      survey: Pick<TSurvey, "id" | "name" | "environmentId" | "questions">;
    }
> => {
  validateInputs([surveyId, ZId]);
  try {
    const survey = await prisma.survey.findUnique({
      where: {
        id: surveyId,
      },
      select: {
        id: true,
        name: true,
        environmentId: true,
        questions: true,
      },
    });

    if (!survey) {
      throw new ResourceNotFoundError("Survey", surveyId);
    }

    if (!doesSurveyHasOpenTextQuestion(survey.questions)) {
      return { success: false };
    }

    const openTextQuestions = survey.questions.filter((question) => question.type === "openText");

    // const openTextQuestionsWithoutInsightsEnabled = openTextQuestions.filter(
    //   (question) => question.type === "openText" && typeof question.insightsEnabled === "undefined"
    // );

    // if (openTextQuestionsWithoutInsightsEnabled.length === 0) {
    //   return { success: false };
    // }

    const insightsEnabledValues = await Promise.allSettled(
      openTextQuestions.map(async (question) => {
        const insightsEnabled = await getInsightsEnabled(question);

        return { id: question.id, insightsEnabled };
      })
    );

    const fullfilledInsightsEnabledValues = insightsEnabledValues.filter(
      (value) => value.status === "fulfilled"
    ) as PromiseFulfilledResult<{ id: string; insightsEnabled: boolean }>[];

    const insightsEnabledQuestionIds = fullfilledInsightsEnabledValues
      .filter((value) => value.value.insightsEnabled)
      .map((value) => value.value.id);

    const updatedQuestions = survey.questions.map((question) => {
      if (question.type === "openText") {
        const areInsightsEnabled = insightsEnabledQuestionIds.includes(question.id);
        return {
          ...question,
          insightsEnabled: areInsightsEnabled,
        };
      }

      return question;
    });

    const updatedSurvey = await prisma.survey.update({
      where: {
        id: survey.id,
      },
      data: {
        questions: updatedQuestions,
      },
      select: {
        id: true,
        name: true,
        environmentId: true,
        questions: true,
      },
    });

    if (insightsEnabledQuestionIds.length > 0) {
      return { success: true, survey: updatedSurvey };
    }

    return { success: false };
  } catch (error) {
    console.error("Error generating insights for surveys:", error);
    throw error;
  }
};

export const doesResponseHasAnyOpenTextAnswer = (
  openTextQuestionIds: string[],
  response: TResponse["data"]
): boolean => {
  return openTextQuestionIds.some((questionId) => {
    const answer = response[questionId];
    return typeof answer === "string" && answer.length > 0;
  });
};
