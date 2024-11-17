import { documentCache } from "@/lib/cache/document";
import { Prisma } from "@prisma/client";
import { embed, generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@formbricks/database";
import { embeddingsModel, llmModel } from "@formbricks/lib/aiModels";
import { validateInputs } from "@formbricks/lib/utils/validate";
import {
  TCreatedDocument,
  TDocumentCreateInput,
  ZDocumentCreateInput,
  ZGenerateDocumentObjectSchema,
} from "@formbricks/types/documents";
import { DatabaseError } from "@formbricks/types/errors";

const translateToPortuguese = async (text: string) => {
  const { object } = await generateObject({
    model: llmModel,
    schema: z.object({
      translatedText: z.string(),
    }),
    system: `Você é um tradutor profissional especializado em traduzir textos do inglês para português do Brasil.
    Mantenha o contexto e a naturalidade do texto. Retorne apenas o texto traduzido.`,
    prompt: `Traduza este texto para português do Brasil: "${text}"`,
    temperature: 0,
    experimental_telemetry: { isEnabled: true },
  });

  return object.translatedText;
};

export const createDocument = async (
  surveyName: string,
  documentInput: TDocumentCreateInput
): Promise<TCreatedDocument> => {
  validateInputs([surveyName, z.string()], [documentInput, ZDocumentCreateInput]);

  try {
    // Generate text embedding
    const { embedding } = await embed({
      model: embeddingsModel,
      value: documentInput.text,
      experimental_telemetry: { isEnabled: true },
    });

    // generate sentiment and insights
    // const { object } = await generateObject({
    //   model: llmModel,
    //   schema: ZGenerateDocumentObjectSchema,
    //   system: `You are an XM researcher. You analyse a survey response (survey name, question headline & user answer) and generate insights from it. The insight title (1-3 words) should concicely answer the question, e.g. "What type of people do you think would most benefit" -> "Developers". You are very objective, for the insights split the feedback in the smallest parts possible and only use the feedback itself to draw conclusions. You must output at least one insight. The answer wants to be in pt-br`,
    //   prompt: `Survey: ${surveyName}\n${documentInput.text}`,
    //   temperature: 0,
    //   experimental_telemetry: { isEnabled: true },
    // });

    const { object } = await generateObject({
      model: llmModel,
      schema: ZGenerateDocumentObjectSchema,
      system: `Você é um assistente brasileiro especializado em análise de pesquisas. 
   REGRA MAIS IMPORTANTE: TODAS as respostas DEVEM ser 100% em português do Brasil.
   NUNCA responda em inglês, sempre em português.

   Sua função é analisar respostas de pesquisas (nome, título e resposta) e gerar insights em português.
   O título do insight (1-3 palavras) deve responder a pergunta de forma concisa.
   Exemplo: 
   Pergunta: "Que tipo de pessoas mais se beneficiariam?"
   Resposta correta em PT-BR: "Desenvolvedores"
   Resposta errada em inglês: "Developers" (NUNCA USE)

   Seja objetivo e divida o feedback nas menores partes possíveis.
   Use apenas o próprio feedback para conclusões.
   Gere pelo menos um insight.

   Categorias permitidas (SEMPRE em português):
   Sentimento:
   - "positivo"
   - "neutro" 
   - "negativo"

   Tipo de feedback:
   - "elogio"
   - "pedido de recurso"  
   - "reclamação"
   - "outro"

   LEMBRE-SE: Toda resposta, conclusão, título ou análise DEVE ser em português do Brasil.`,
      prompt: `Pesquisa: ${surveyName}\n${documentInput.text}`,
      temperature: 0,
      experimental_telemetry: { isEnabled: true },
    });

    // Traduzir insights do inglês para português
    const translatedInsights = await Promise.all(
      object.insights.map(async (insight) => ({
        ...insight,
        title: await translateToPortuguese(insight.title),
        description: await translateToPortuguese(insight.description),
      }))
    );

    const sentiment = object.sentiment;
    const isSpam = object.isSpam;

    // create document
    const prismaDocument = await prisma.document.create({
      data: {
        ...documentInput,
        sentiment,
        isSpam,
      },
    });

    const document = {
      ...prismaDocument,
      vector: embedding,
    };

    // update document vector with the embedding
    const vectorString = `[${embedding.join(",")}]`;
    await prisma.$executeRaw`
         UPDATE "Document"
         SET "vector" = ${vectorString}::vector(512)
         WHERE "id" = ${document.id};
       `;

    documentCache.revalidate({
      id: document.id,
      responseId: document.responseId,
      questionId: document.questionId,
    });

    return { ...document, insights: translatedInsights, isSpam };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};
