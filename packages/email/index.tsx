import { render } from "@react-email/render";
import { createTransport } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  DEBUG,
  MAIL_FROM,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_REJECT_UNAUTHORIZED_TLS,
  SMTP_SECURE_ENABLED,
  SMTP_USER,
  WEBAPP_URL,
} from "@formbricks/lib/constants";
import { createInviteToken, createToken, createTokenForLinkSurvey } from "@formbricks/lib/jwt";
import { getOrganizationByEnvironmentId } from "@formbricks/lib/organization/service";
import type { TLinkSurveyEmailData } from "@formbricks/types/email";
import type { TResponse } from "@formbricks/types/responses";
import type { TSurvey } from "@formbricks/types/surveys/types";
import type { TWeeklySummaryNotificationResponse } from "@formbricks/types/weekly-summary";
import { ForgotPasswordEmail } from "./emails/auth/forgot-password-email";
import { PasswordResetNotifyEmail } from "./emails/auth/password-reset-notify-email";
import { VerificationEmail } from "./emails/auth/verification-email";
import { InviteAcceptedEmail } from "./emails/invite/invite-accepted-email";
import { InviteEmail } from "./emails/invite/invite-email";
import { OnboardingInviteEmail } from "./emails/invite/onboarding-invite-email";
import { EmbedSurveyPreviewEmail } from "./emails/survey/embed-survey-preview-email";
import { LinkSurveyEmail } from "./emails/survey/link-survey-email";
import { ResponseFinishedEmail } from "./emails/survey/response-finished-email";
import { NoLiveSurveyNotificationEmail } from "./emails/weekly-summary/no-live-survey-notification-email";
import { WeeklySummaryNotificationEmail } from "./emails/weekly-summary/weekly-summary-notification-email";
import { translateEmailText } from "./lib/utils";

export const IS_SMTP_CONFIGURED = Boolean(SMTP_HOST && SMTP_PORT);

interface SendEmailDataProps {
  to: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html: string;
}

interface TEmailUser {
  id: string;
  email: string;
  locale: string;
}

const getEmailSubject = (productName: string): string => {
  return `${productName} Insights do Usuário - Última Semana por EscutaAI`;
};

export const sendEmail = async (emailData: SendEmailDataProps): Promise<void> => {
  if (!IS_SMTP_CONFIGURED) return;

  const transporter = createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE_ENABLED, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: SMTP_REJECT_UNAUTHORIZED_TLS,
    },
    logger: DEBUG,
    debug: DEBUG,
  } as SMTPTransport.Options);
  const emailDefaults = {
    from: `EscutaAI <${MAIL_FROM ?? "noreply@escuta.ai"}>`,
  };
  await transporter.sendMail({ ...emailDefaults, ...emailData });
};

export const sendVerificationEmail = async (user: TEmailUser): Promise<void> => {
  const token = createToken(user.id, user.email, {
    expiresIn: "1d",
  });
  const verifyLink = `${WEBAPP_URL}/auth/verify?token=${encodeURIComponent(token)}`;
  const verificationRequestLink = `${WEBAPP_URL}/auth/verification-requested?email=${encodeURIComponent(
    user.email
  )}`;
  const html = await render(VerificationEmail({ verificationRequestLink, verifyLink, locale: user.locale }));
  await sendEmail({
    to: user.email,
    subject: translateEmailText("verification_email_subject", user.locale),
    html,
  });
};

export const sendForgotPasswordEmail = async (user: TEmailUser, locale: string): Promise<void> => {
  const token = createToken(user.id, user.email, {
    expiresIn: "1d",
  });
  const verifyLink = `${WEBAPP_URL}/auth/forgot-password/reset?token=${encodeURIComponent(token)}`;
  const html = await render(ForgotPasswordEmail({ verifyLink, locale }));
  await sendEmail({
    to: user.email,
    subject: "Redefina sua senha do EscutaAI",
    html,
  });
};

export const sendPasswordResetNotifyEmail = async (user: TEmailUser): Promise<void> => {
  const html = await render(PasswordResetNotifyEmail({ locale: user.locale }));
  await sendEmail({
    to: user.email,
    subject: "Sua senha do EscutaAI foi alterada",
    html,
  });
};

export const sendInviteMemberEmail = async (
  inviteId: string,
  email: string,
  inviterName: string,
  inviteeName: string,
  isOnboardingInvite?: boolean,
  inviteMessage?: string,
  locale = "en-US"
): Promise<void> => {
  const token = createInviteToken(inviteId, email, {
    expiresIn: "7d",
  });

  const verifyLink = `${WEBAPP_URL}/invite?token=${encodeURIComponent(token)}`;

  if (isOnboardingInvite && inviteMessage) {
    const html = await render(OnboardingInviteEmail({ verifyLink, inviteMessage, inviterName, locale }));
    await sendEmail({
      to: email,
      subject: `${inviterName} precisa de ajuda para configurar o EscutaAI. Você pode ajudar?`,
      html,
    });
  } else {
    const html = await render(InviteEmail({ inviteeName, inviterName, verifyLink, locale }));
    await sendEmail({
      to: email,
      subject: `Você foi convidado para colaborar no EscutaAI!`,
      html,
    });
  }
};

export const sendInviteAcceptedEmail = async (
  inviterName: string,
  inviteeName: string,
  email: string,
  locale: string
): Promise<void> => {
  const html = await render(InviteAcceptedEmail({ inviteeName, inviterName, locale }));
  await sendEmail({
    to: email,
    subject: `Você tem um novo membro na organização!`,
    html,
  });
};

export const sendResponseFinishedEmail = async (
  email: string,
  environmentId: string,
  survey: TSurvey,
  response: TResponse,
  responseCount: number,
  locale: string
): Promise<void> => {
  const personEmail = response.personAttributes?.email;
  const organization = await getOrganizationByEnvironmentId(environmentId);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const html = await render(
    ResponseFinishedEmail({
      survey,
      responseCount,
      response,
      WEBAPP_URL,
      environmentId,
      organization,
      locale,
    })
  );

  await sendEmail({
    to: email,
    subject: personEmail
      ? `${personEmail} acabou de completar sua pesquisa ${survey.name} ✅`
      : `Uma resposta para ${survey.name} foi completada ✅`,
    replyTo: personEmail?.toString() ?? MAIL_FROM,
    html,
  });
};

export const sendEmbedSurveyPreviewEmail = async (
  to: string,
  subject: string,
  innerHtml: string,
  environmentId: string,
  locale: string
): Promise<void> => {
  const html = await render(EmbedSurveyPreviewEmail({ html: innerHtml, environmentId, locale }));
  await sendEmail({
    to,
    subject,
    html,
  });
};

export const sendLinkSurveyToVerifiedEmail = async (data: TLinkSurveyEmailData): Promise<void> => {
  const surveyId = data.surveyId;
  const email = data.email;
  const surveyName = data.surveyName;
  const singleUseId = data.suId;
  const locale = data.locale;
  const token = createTokenForLinkSurvey(surveyId, email);
  const getSurveyLink = (): string => {
    if (singleUseId) {
      return `${WEBAPP_URL}/s/${surveyId}?verify=${encodeURIComponent(token)}&suId=${singleUseId}`;
    }
    return `${WEBAPP_URL}/s/${surveyId}?verify=${encodeURIComponent(token)}`;
  };
  const surveyLink = getSurveyLink();

  const html = await render(LinkSurveyEmail({ surveyName, surveyLink, locale }));
  await sendEmail({
    to: data.email,
    subject: "Sua pesquisa está pronta para ser preenchida.",
    html,
  });
};

export const sendWeeklySummaryNotificationEmail = async (
  email: string,
  notificationData: TWeeklySummaryNotificationResponse,
  locale: string
): Promise<void> => {
  const startDate = `${notificationData.lastWeekDate.getDate().toString()} ${notificationData.lastWeekDate.toLocaleString(
    "default",
    { month: "short" }
  )}`;
  const endDate = `${notificationData.currentDate.getDate().toString()} ${notificationData.currentDate.toLocaleString(
    "default",
    { month: "short" }
  )}`;
  const startYear = notificationData.lastWeekDate.getFullYear();
  const endYear = notificationData.currentDate.getFullYear();
  const html = await render(
    WeeklySummaryNotificationEmail({
      notificationData,
      startDate,
      endDate,
      startYear,
      endYear,
      locale,
    })
  );
  await sendEmail({
    to: email,
    subject: getEmailSubject(notificationData.productName),
    html,
  });
};

export const sendNoLiveSurveyNotificationEmail = async (
  email: string,
  notificationData: TWeeklySummaryNotificationResponse,
  locale: string
): Promise<void> => {
  const startDate = `${notificationData.lastWeekDate.getDate().toString()} ${notificationData.lastWeekDate.toLocaleString(
    "default",
    { month: "short" }
  )}`;
  const endDate = `${notificationData.currentDate.getDate().toString()} ${notificationData.currentDate.toLocaleString(
    "default",
    { month: "short" }
  )}`;
  const startYear = notificationData.lastWeekDate.getFullYear();
  const endYear = notificationData.currentDate.getFullYear();
  const html = await render(
    NoLiveSurveyNotificationEmail({
      notificationData,
      startDate,
      endDate,
      startYear,
      endYear,
      locale,
    })
  );
  await sendEmail({
    to: email,
    subject: getEmailSubject(notificationData.productName),
    html,
  });
};
