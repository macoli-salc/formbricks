import { FormWrapper } from "@/app/(auth)/auth/components/FormWrapper";
import { SigninForm } from "@/app/(auth)/auth/login/components/SigninForm";
import { Metadata } from "next";
import Image from "next/image";
import { getIsMultiOrgEnabled } from "@formbricks/ee/lib/service";
import {
  AZURE_OAUTH_ENABLED,
  EMAIL_AUTH_ENABLED,
  GITHUB_OAUTH_ENABLED,
  GOOGLE_OAUTH_ENABLED,
  OIDC_DISPLAY_NAME,
  OIDC_OAUTH_ENABLED,
  PASSWORD_RESET_DISABLED,
  SIGNUP_ENABLED,
} from "@formbricks/lib/constants";

export const metadata: Metadata = {
  title: "Login",
  description: "Escuta AI - Ouça seus clientes para crescer rápido com IA",
};

const Page = async () => {
  const isMultiOrgEnabled = await getIsMultiOrgEnabled();

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex flex-col p-8">
        <div className="flex flex-grow items-center justify-center">
          <FormWrapper>
            <SigninForm
              emailAuthEnabled={EMAIL_AUTH_ENABLED}
              publicSignUpEnabled={SIGNUP_ENABLED}
              passwordResetEnabled={!PASSWORD_RESET_DISABLED}
              googleOAuthEnabled={GOOGLE_OAUTH_ENABLED}
              githubOAuthEnabled={GITHUB_OAUTH_ENABLED}
              azureOAuthEnabled={AZURE_OAUTH_ENABLED}
              oidcOAuthEnabled={OIDC_OAUTH_ENABLED}
              oidcDisplayName={OIDC_DISPLAY_NAME}
              isMultiOrgEnabled={isMultiOrgEnabled}
            />
          </FormWrapper>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="/woman-smartphone.png"
          alt="Mulher com Smartphone"
          fill
          style={{ objectFit: "cover" }}
          sizes="50vw"
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="max-w-[720px] justify-center gap-20 px-16 py-24">
            <span className="font-sans text-5xl font-semibold text-white">
              Aprimore seu negócio: Comece aqui a jornada para uma gestão eficiente
            </span>
            <div className="mb-5" />
            <span className="text-lg font-medium text-white">
              Crie uma conta gratuita e tenha acesso a todas as funcionalidades. É rápido, leva apenas 2
              minutos.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
