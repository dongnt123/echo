import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";

import { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: openai.chat("gpt-4o-mini"),
  pdf: openai.chat("gpt-4o"),
  html: openai.chat("gpt-4o")
} as const;

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/tiff", "image/webp", "image/heic", "image/gif"] as const;

const SYSTEM_PROMPT = {
  image: "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it",
  pdf: "You turn PDF files into text. If it is a photo of a document, transcribe it. If it is not a document, describe it",
  html: "You turn html content into markdown. If it is a photo of a document, transcribe it. If it is not a document, describe it"
};

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  filename: string;
  bytes?: ArrayBuffer;
  mimeType: string;
};

const extractImageText = async (url: string): Promise<string> => {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPT.image,
    messages: [
      {
        role: "user",
        content: [{ type: "image", image: new URL(url) }]
      }
    ]
  });

  return result.text;
}

const extractPdfText = async (url: string, mimeType: string, filename: string): Promise<string> => {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPT.pdf,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: new URL(url), filename, mediaType: mimeType },
          {
            type: "text",
            text: "Extract the text from the PDF and print it without explaining you'll do so"
          }
        ]
      }
    ]
  });

  return result.text;
}

const extractTextFileContent = async (
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> => {
  const arrayBuffer = bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());
  if (!arrayBuffer) throw new Error("Failed to get array buffer!");

  const text = new TextDecoder().decode(arrayBuffer);
  if (mimeType.toLowerCase() !== "text/plain") {
    const result = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPT.html,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text },
            {
              type: "text",
              text: "Extract the text and print it in a markdown format without explaining that you'll do so"
            }
          ]
        }
      ]
    });

    return result.text;
  }

  return text;
}

export const extractTextContent = async (ctx: { storage: StorageActionWriter }, args: ExtractTextContentArgs): Promise<string> => {
  const { storageId, filename, bytes, mimeType } = args;
  const url = await ctx.storage.getUrl(storageId);
  assert(url, "Failed to get storage URL!");

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) return extractImageText(url);
  if (mimeType.toLowerCase().includes("pdf")) return extractPdfText(url, mimeType, filename);
  if (mimeType.toLowerCase().includes("text")) return extractTextFileContent(ctx, storageId, bytes, mimeType);

  throw new Error(`Unsupported file type: ${mimeType}`);
} 