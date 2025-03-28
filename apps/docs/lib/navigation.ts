import type { NavGroup } from "@/components/Navigation";

export const navigation: Array<NavGroup> = [
  {
    title: "Introduction",
    links: [
      { title: "What is Formbricks?", href: "/introduction/what-is-formbricks" },
      { title: "Why open source?", href: "/introduction/why-open-source" },
      { title: "How does it work?", href: "/introduction/how-it-works" },
      {
        title: "Best Practices",
        children: [
          { title: "Learn from Churn", href: "/best-practices/cancel-subscription" },
          { title: "Interview Prompt", href: "/best-practices/interview-prompt" },
          { title: "Product-Market Fit", href: "/best-practices/pmf-survey" },
          { title: "Trial Conversion", href: "/best-practices/improve-trial-cr" },
          { title: "Feature Chaser", href: "/best-practices/feature-chaser" },
          { title: "Feedback Box", href: "/best-practices/feedback-box" },
          { title: "Docs Feedback", href: "/best-practices/docs-feedback" },
          { title: "Improve Email Content", href: "/best-practices/improve-email-content" },
          { title: "Contact Form", href: "/best-practices/contact-form" },
          { title: "Quiz Time", href: "/best-practices/quiz-time" },
        ],
      },
    ],
  },
  {
    title: "Link Surveys",
    links: [
      { title: "Quickstart", href: "/link-surveys/quickstart" },
      {
        title: "Features",
        children: [
          { title: "Data Prefilling", href: "/link-surveys/data-prefilling" },
          { title: "Identify Users", href: "/link-surveys/user-identification" },
          { title: "Single Use Links", href: "/link-surveys/single-use-links" },
          { title: "Source Tracking", href: "/link-surveys/source-tracking" },
          { title: "Hidden Fields", href: "/link-surveys/hidden-fields" },
          { title: "Start At Question", href: "/link-surveys/start-at-question" },
          { title: "Embed Surveys Anywhere", href: "/link-surveys/embed-surveys" },
          { title: "Market Research Panel", href: "/link-surveys/market-research-panel" },
          { title: "Multi Language Surveys", href: "/global/multi-language-surveys" },
          { title: "User Metadata", href: "/global/metadata" },
          { title: "Custom Styling", href: "/global/overwrite-styling" }, // global
          { title: "Conditional Logic", href: "/global/conditional-logic" },
          { title: "Shareable Dashboards", href: "/global/shareable-dashboards" },
          { title: "Start & End Dates", href: "/global/schedule-start-end-dates" },
          { title: "Limit submissions", href: "/global/limit-submissions" }, // global
          { title: "Recall Functionality", href: "/global/recall" },
          { title: "Verify Email before Survey", href: "/link-surveys/verify-email-before-survey" },
          { title: "PIN Protected Surveys", href: "/link-surveys/pin-protected-surveys" },
          { title: "Partial Submissions", href: "/global/partial-submissions" },
          {
            title: "Add Image/Video to Question",
            href: "/global/add-image-or-video-question",
          },
        ],
      },
    ],
  },
  {
    title: "Website & App Surveys",
    links: [
      { title: "Quickstart", href: "/app-surveys/quickstart" },
      { title: "Framework Guides", href: "/app-surveys/framework-guides" },
      {
        title: "Features",
        children: [
          { title: "Identify Users", href: "/app-surveys/user-identification" },
          { title: "Actions", href: "/app-surveys/actions" },
          { title: "Advanced Targeting", href: "/app-surveys/advanced-targeting" },
          { title: "Show Survey to % of users", href: "/global/show-survey-to-percent-of-users" }, // app and website
          { title: "Recontact Options", href: "/app-surveys/recontact" },
          { title: "Hidden Fields", href: "/global/hidden-fields" }, // global
          { title: "Multi Language Surveys", href: "/global/multi-language-surveys" }, // global
          { title: "User Metadata", href: "/global/metadata" }, // global
          { title: "Custom Styling", href: "/global/overwrite-styling" }, // global
          { title: "Conditional Logic", href: "/global/conditional-logic" }, // global
          { title: "Start & End Dates", href: "/global/schedule-start-end-dates" }, // global
          { title: "Limit submissions", href: "/global/limit-submissions" }, // global
          { title: "Recall Functionality", href: "/global/recall" }, // global
          { title: "Partial Submissions", href: "/global/partial-submissions" }, // global
          { title: "Shareable Dashboards", href: "/global/shareable-dashboards" },
          {
            title: "Add Image/Video to Question",
            href: "/global/add-image-or-video-question",
          },
        ],
      },
    ],
  },
  {
    title: "Core Features",
    links: [
      {
        title: "Question Types",
        children: [
          { title: "Free Text", href: "/global/question-type/free-text" },
          { title: "Select Single", href: "/global/question-type/single-select" },
          { title: "Select Multiple", href: "/global/question-type/multi-select" },
          { title: "Select Picture", href: "/global/question-type/picture-selection" },
          { title: "Rating", href: "/global/question-type/rating" },
          { title: "Net Promoter Score", href: "/global/question-type/net-promoter-score" },
          { title: "Ranking", href: "/global/question-type/ranking" },
          { title: "Matrix", href: "/global/question-type/matrix" },
          { title: "Statement (Call to Action)", href: "/global/question-type/statement-cta" },
          { title: "Consent", href: "/global/question-type/consent" },
          { title: "File Upload", href: "/global/question-type/file-upload" },
          { title: "Date", href: "/global/question-type/date" },
          { title: "Schedule a Meeting", href: "/global/question-type/schedule" },
          { title: "Address", href: "/global/question-type/address" },
          { title: "Contact Info", href: "/global/question-type/contact" },
        ],
      },
      // {
      //   title: "Integrations",
      //   children: [
      //     { title: "Overview", href: "/developer-docs/integrations/overview" },
      //     { title: "Airtable", href: "/developer-docs/integrations/airtable" },
      //     { title: "Google Sheets", href: "/developer-docs/integrations/google-sheets" },
      //     { title: "Make", href: "/developer-docs/integrations/make" },
      //     { title: "n8n", href: "/developer-docs/integrations/n8n" },
      //     { title: "Notion", href: "/developer-docs/integrations/notion" },
      //     { title: "Slack", href: "/developer-docs/integrations/slack" },
      //     { title: "Wordpress", href: "/developer-docs/integrations/wordpress" },
      //     { title: "Zapier", href: "/developer-docs/integrations/zapier" },
      //   ],
      // },
      { title: "Access Roles", href: "/global/access-roles" },
      { title: "Styling Theme", href: "/global/styling-theme" },
    ],
  },
  {
    title: "Self-Hosting",
    links: [
      { title: "Overview", href: "/self-hosting/overview" },
      { title: "One-Click Setup", href: "/self-hosting/one-click" },
      { title: "Custom SSL Certificate", href: "/self-hosting/custom-ssl" },
      { title: "Docker Setup", href: "/self-hosting/docker" },
      { title: "Migration Guide", href: "/self-hosting/migration-guide" },
      { title: "Configuration", href: "/self-hosting/configuration" },
      // { title: "Integrations", href: "/self-hosting/integrations" },
      { title: "License", href: "/self-hosting/license" },
    ],
  },
  {
    title: "Developer Docs",
    links: [
      { title: "Overview", href: "/developer-docs/overview" },
      { title: "SDK: Formbricks JS", href: "/developer-docs/js-sdk" },
      { title: "SDK: React Native", href: "/developer-docs/react-native-in-app-surveys" },
      { title: "SDK: Formbricks API", href: "/developer-docs/api-sdk" },
      { title: "REST API", href: "/developer-docs/rest-api" },
      { title: "Webhooks", href: "/developer-docs/webhooks" },
      {
        title: "Contributing",
        children: [
          { title: "Get started", href: "/developer-docs/contributing/get-started" },
          { title: "Codespaces", href: "/developer-docs/contributing/codespaces" },
          { title: "Gitpod", href: "/developer-docs/contributing/gitpod" },
          { title: "Troubleshooting", href: "/developer-docs/contributing/troubleshooting" },
        ],
      },
    ],
  },
];
