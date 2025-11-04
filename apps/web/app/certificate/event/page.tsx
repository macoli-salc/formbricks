"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const EVENT_DATE = "2025-11-08";
const EVENT_HOURS = "06";

const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += Number.parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += Number.parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cpf.substring(10, 11))) return false;

  return true;
};

const certificateSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .refine((val) => validateCPF(val), {
      message: "CPF inválido",
    }),
  company: z.string().min(2, "Nome da empresa deve ter no mínimo 2 caracteres"),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const getCPFValidationStatus = (cpf: string): "valid" | "invalid" | "incomplete" => {
  if (!cpf) return "incomplete";
  const cleaned = cpf.replace(/[^\d]/g, "");
  if (cleaned.length < 11) return "incomplete";
  return validateCPF(cpf) ? "valid" : "invalid";
};

export default function CertificatePage() {
  const [formData, setFormData] = useState<CertificateFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
  });

  const cpfValue = watch("cpf");
  const cpfStatus = getCPFValidationStatus(cpfValue);

  const onSubmit = (data: CertificateFormData) => {
    setFormData(data);
  };

  const generatePDF = async () => {
    if (!certificateRef.current || !formData) return;

    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const element = certificateRef.current;
      await html2pdf()
        .set({
          filename: `Certificado_${formData.name.replace(/\s+/g, "_")}.pdf`,
          margin: 0,
          html2canvas: {
            scale: 2,
            useCORS: true,
            width: element.offsetWidth,
            height: element.offsetHeight,
          },
          jsPDF: { orientation: "landscape", format: "a4" },
        })
        .from(element)
        .save();

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o certificado. Por favor, tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r px-4 py-2 shadow-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-end text-sm">
          <Image src="/escuta.svg" alt="Escuta Logo" width={80} height={20} className="h-5" />
        </nav>
      </header>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="bg-[#222222] px-8 py-6">
              <div className="flex items-center justify-between gap-4">
                {/* Left side with icon and text */}
                <div className="flex items-center gap-4">
                  <hgroup>
                    <h1 className="text-3xl font-bold tracking-wide text-white">Certificado de Presença</h1>
                    <p className="mt-1 font-medium text-blue-100">Emissão de Certificado Digital Oficial</p>
                  </hgroup>
                </div>
                {/* Right side with icon */}
                <div className="flex-shrink-0 rounded-lg p-3 backdrop-blur-sm">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-[#222222]/90 px-8 py-3">
              <p className="text-sm font-semibold tracking-wide text-white">
                SUMMIT RH & ESG 2025 - INOVAÇÃO | PESSOAS | GESTÃO SUSTENTÁVEL
              </p>
            </div>
          </header>

          {!formData ? (
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
              <header className="border-b border-slate-200 bg-slate-50 px-8 py-6">
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Etapa 1 de 2:</span>
                  <span>Dados do Participante</span>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">Dados do Participante</h2>
                <p className="text-sm text-slate-600">
                  Preencha os campos abaixo para emitir seu certificado oficial de participação no evento.
                </p>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                    Nome Completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite seu nome completo conforme documento"
                  />
                  {errors.name && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cpf" className="mb-2 block text-sm font-semibold text-slate-700">
                    CPF <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="cpf"
                      type="text"
                      {...register("cpf")}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        setValue("cpf", formatted);
                      }}
                      value={cpfValue || ""}
                      maxLength={14}
                      className={`w-full rounded-lg border-2 bg-white px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                        cpfStatus === "valid"
                          ? "border-green-500"
                          : cpfStatus === "invalid"
                            ? "border-red-500"
                            : "border-slate-300"
                      }`}
                      placeholder="000.000.000-00"
                    />
                    {cpfValue && cpfStatus === "valid" && (
                      <svg
                        className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {cpfStatus === "invalid" && (
                      <svg
                        className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {errors.cpf && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-semibold text-slate-700">
                    Empresa <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    {...register("company")}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o nome da empresa representada"
                  />
                  {errors.company && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#E2377B] bg-gradient-to-r px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Próxima Etapa
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Após preencher os dados, você poderá visualizar e baixar seu certificado
                  </p>
                </div>
              </form>
            </article>
          ) : (
            <article>
              <header className="mb-6 flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Etapa 2 de 2:</span>
                <span>Visualização e Download</span>
              </header>

              <div className="mb-6 flex flex-wrap justify-center gap-4 text-center">
                <button
                  onClick={() => {
                    setFormData(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-600 hover:shadow-lg">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Voltar
                </button>

                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E2377B] px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#C92F6B] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                  {isGenerating ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Baixar PDF
                    </>
                  )}
                </button>
              </div>

              {showSuccessMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Certificado baixado com sucesso!</span>
                </div>
              )}

              <section className="mt-8 overflow-x-auto rounded-lg bg-white p-4 shadow-2xl sm:p-8">
                <div className="min-w-full">
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "900px",
                      aspectRatio: "297 / 210",
                      background: "#fff",
                      margin: "0 auto",
                      padding: "5%",
                      border: "4px solid #398EA7",
                      boxShadow: "inset 0 0 0 2px #398EA7, inset 0 0 0 8px #fff",
                      position: "relative",
                      fontFamily: "Arial, sans-serif",
                      boxSizing: "border-box",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}>
                      <Image
                        src="/certificate/event/assets/logo-ciesp.jpg"
                        alt="Logo CIESP"
                        width={120}
                        height={85}
                        style={{ height: "85px", width: "auto" }}
                      />
                      <Image
                        src="/certificate/event/assets/logo-evento.png"
                        alt="Logo do Evento"
                        width={120}
                        height={85}
                        style={{ height: "85px", width: "auto" }}
                      />
                    </div>

                    <h1
                      style={{
                        fontSize: "clamp(24px, 5vw, 48px)",
                        color: "#398EA7",
                        letterSpacing: "0.3em",
                        marginBottom: "0.5em",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}>
                      CERTIFICADO
                    </h1>

                    <p
                      style={{
                        fontSize: "clamp(20px, 4vw, 50px)",
                        margin: "0.3em 0",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#000",
                      }}>
                      {formData.name}
                    </p>

                    <p
                      style={{
                        fontSize: "clamp(10px, 1.5vw, 16px)",
                        color: "#333",
                        textAlign: "center",
                        marginTop: "0.3em",
                        marginBottom: "0.5em",
                      }}>
                      CPF: {formData.cpf}
                    </p>

                    <p
                      style={{
                        fontSize: "clamp(10px, 1.8vw, 19px)",
                        lineHeight: "1.7",
                        color: "#000",
                        margin: "0.5em auto",
                        textAlign: "center",
                      }}>
                      participou no dia{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {new Date(EVENT_DATE).toLocaleDateString("pt-BR")}
                      </span>
                      , do{" "}
                      <span style={{ fontWeight: "bold" }}>
                        SUMMIT RH & ESG 2025 - INOVAÇÃO | PESSOAS | GESTÃO SUSTENTÁVEL
                      </span>
                      , realizado pelo Centro de Indústrias do Estado de São Paulo - Regional Indaiatuba, em
                      sua sede própria, representando a empresa{" "}
                      <span style={{ fontWeight: "bold" }}>{formData.company}</span>.
                    </p>

                    <p
                      style={{
                        fontSize: "clamp(10px, 1.8vw, 19px)",
                        lineHeight: "1.7",
                        color: "#000",
                        margin: "0.5em auto 0",
                        textAlign: "center",
                      }}>
                      Carga Horária: <span style={{ fontWeight: "bold" }}>{EVENT_HOURS} horas.</span>
                    </p>

                    <div
                      style={{
                        marginTop: "clamp(20px, 5vw, 50px)",
                        fontSize: "clamp(8px, 1.5vw, 15px)",
                        lineHeight: "1.4",
                        textAlign: "center",
                      }}>
                      <Image
                        src="/certificate/assinatura.png"
                        alt="Assinatura"
                        width={150}
                        height={40}
                        style={{
                          maxHeight: "clamp(35px, 8vw,30px)",
                          width: "auto",
                          margin: "0 auto 0",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          borderTop: "2px solid #000",
                          width: "40%",
                          margin: "-5px auto 0px",
                        }}
                      />
                      <p style={{ margin: "5px 0 0 0", fontSize: "clamp(8px, 1.3vw, 13px)" }}>
                        <span style={{ fontWeight: "bold", fontSize: "clamp(9px, 1.5vw, 15px)" }}>
                          Anita Moraes Parizzi Revolti
                        </span>
                        <br />
                        Gerente do Ciesp Regional Indaiatuba
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "clamp(8px, 2vw, 25px)",
                        marginTop: "1em",
                        flexWrap: "wrap",
                      }}>
                      <Image
                        src="/certificate/event/assets/logo-apollo.png"
                        alt="Apollo"
                        width={64}
                        height={32}
                        style={{ maxHeight: "clamp(16px, 3vw, 32px)", width: "auto" }}
                      />
                      <Image
                        src="/certificate/event/assets/logo-inovares.png"
                        alt="Inovares"
                        width={64}
                        height={32}
                        style={{ maxHeight: "clamp(16px, 3vw, 32px)", width: "auto" }}
                      />
                      <Image
                        src="/certificate/event/assets/logo-profcenter.png"
                        alt="Profcenter"
                        width={64}
                        height={32}
                        style={{ maxHeight: "clamp(16px, 3vw, 32px)", width: "auto" }}
                      />
                      <Image
                        src="/certificate/event/assets/logo-marca.png"
                        alt="Marca Brindes"
                        width={64}
                        height={32}
                        style={{ maxHeight: "clamp(16px, 3vw, 32px)", width: "auto" }}
                      />
                      <Image
                        src="/certificate/event/assets/logo-mediarh.png"
                        alt="MediaRH"
                        width={64}
                        height={32}
                        style={{ maxHeight: "clamp(16px, 3vw, 32px)", width: "auto" }}
                      />
                      <Image
                        src="/certificate/event/assets/logo-sicoob.png"
                        alt="Sicoob"
                        width={64}
                        height={32}
                        style={{ maxHeight: "clamp(16px, 3vw, 32px)", width: "auto" }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div
                  ref={certificateRef}
                  style={{
                    width: "297mm",
                    height: "210mm",
                    background: "#fff",
                    margin: "0",
                    padding: "40px 60px",
                    border: "6px solid #398EA7",
                    boxShadow: "inset 0 0 0 2px #398EA7, inset 0 0 0 8px #fff",
                    position: "relative",
                    fontFamily: "Arial, sans-serif",
                    boxSizing: "border-box",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5em",
                    }}>
                    <Image
                      src="/certificate/event/assets/logo-ciesp.jpg"
                      alt="Logo CIESP"
                      width={120}
                      height={85}
                      style={{ height: "clamp(30px, 8vw, 85px)", width: "auto" }}
                    />
                    <Image
                      src="/certificate/event/assets/logo-evento.png"
                      alt="Logo do Evento"
                      width={120}
                      height={85}
                      style={{ height: "clamp(30px, 8vw, 85px)", width: "auto" }}
                    />
                  </div>

                  <h1
                    style={{
                      fontSize: "48px",
                      color: "#398EA7",
                      letterSpacing: "8px",
                      marginBottom: "15px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}>
                    CERTIFICADO
                  </h1>

                  <p
                    style={{
                      fontSize: "50px",
                      margin: "10px 0",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#000",
                    }}>
                    {formData.name}
                  </p>

                  <p
                    style={{
                      fontSize: "16px",
                      color: "#333",
                      textAlign: "center",
                      marginTop: "5px",
                      marginBottom: "15px",
                    }}>
                    CPF: {formData.cpf}
                  </p>

                  <p
                    style={{
                      fontSize: "19px",
                      lineHeight: "1.7",
                      color: "#000",
                      margin: "15px auto",
                      maxWidth: "900px",
                      textAlign: "center",
                    }}>
                    participou no dia{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {new Date(EVENT_DATE).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    , do{" "}
                    <span style={{ fontWeight: "bold" }}>
                      SUMMIT RH & ESG 2025 - INOVAÇÃO | PESSOAS | GESTÃO SUSTENTÁVEL
                    </span>
                    , realizado pelo Centro de Indústrias do Estado de São Paulo - Regional Indaiatuba, em sua
                    sede própria, representando a empresa{" "}
                    <span style={{ fontWeight: "bold" }}>{formData.company}</span>.
                  </p>

                  <p
                    style={{
                      fontSize: "19px",
                      lineHeight: "1.7",
                      color: "#000",
                      margin: "15px auto 0",
                      maxWidth: "900px",
                      textAlign: "center",
                    }}>
                    Carga Horária: <span style={{ fontWeight: "bold" }}>{EVENT_HOURS} horas.</span>
                  </p>

                  <div
                    style={{
                      marginTop: "50px",
                      fontSize: "15px",
                      lineHeight: "1.4",
                      textAlign: "center",
                    }}>
                    <Image
                      src="/certificate/assinatura.png"
                      alt="Assinatura"
                      width={150}
                      height={40}
                      style={{
                        maxHeight: "40px",
                        width: "auto",
                        margin: "-12px auto 0",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        borderTop: "2px solid #000",
                        width: "40%",
                        margin: "-12px auto 0px",
                      }}
                    />
                    <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                        Anita Moraes Parizzi Revolti
                      </span>
                      <br />
                      Gerente do Ciesp Regional Indaiatuba
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "25px",
                      marginTop: "25px",
                      flexWrap: "wrap",
                    }}>
                    <Image
                      src="/certificate/event/assets/logo-apollo.png"
                      alt="Apollo"
                      width={64}
                      height={32}
                      style={{ maxHeight: "32px", width: "auto" }}
                    />
                    <Image
                      src="/certificate/event/assets/logo-inovares.png"
                      alt="Inovares"
                      width={64}
                      height={32}
                      style={{ maxHeight: "32px", width: "auto" }}
                    />
                    <Image
                      src="/certificate/event/assets/logo-profcenter.png"
                      alt="Profcenter"
                      width={64}
                      height={32}
                      style={{ maxHeight: "32px", width: "auto" }}
                    />
                    <Image
                      src="/certificate/event/assets/logo-marca.png"
                      alt="Marca Brindes"
                      width={64}
                      height={32}
                      style={{ maxHeight: "32px", width: "auto" }}
                    />
                    <Image
                      src="/certificate/event/assets/logo-mediarh.png"
                      alt="MediaRH"
                      width={64}
                      height={32}
                      style={{ maxHeight: "32px", width: "auto" }}
                    />
                    <Image
                      src="/certificate/event/assets/logo-sicoob.png"
                      alt="Sicoob"
                      width={64}
                      height={32}
                      style={{ maxHeight: "32px", width: "auto" }}
                    />
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
