import { Body, Container, Html, Img, Link, Section, Tailwind } from "@react-email/components";

export function EmailTemplate({ children }): React.JSX.Element {
  return (
    <Html>
      <Tailwind>
        <Body
          className="m-0 h-full w-full justify-center bg-slate-100 bg-slate-50 p-6 text-center text-base font-medium text-slate-800"
          style={{
            fontFamily: "'Jost', 'Helvetica Neue', 'Segoe UI', 'Helvetica', 'sans-serif'",
          }}>
          <Section>
            <Link href="https://escuta.ai/" target="_blank">
              <Img
                alt="EscutaAI Logo"
                className="mx-auto w-80"
                src="https://s3.eu-central-1.amazonaws.com/listmonk-formbricks/Formbricks-Light-transparent.png"
              />
            </Link>
          </Section>
          <Container className="mx-auto my-8 max-w-xl bg-white p-4 text-left">{children}</Container>

          <Section className="mt-4 text-center">
            EscutaAI {new Date().getFullYear()}. All rights reserved.
            <br />
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
