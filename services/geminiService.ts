import { GoogleGenAI } from "@google/genai";

// Fix for TypeScript in Vite/Browser environment:
// Declare 'process' so TypeScript doesn't throw "Cannot find name 'process'"
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible in the execution context where the API client is initialized.

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (ai) return ai;
  
  // Note: If AI features are disabled via the feature flag in App.tsx, 
  // this code path should not be reached, preventing runtime errors if the key is missing.
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
};

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Sends the PDF to Gemini for conversion to Markdown.
 */
export const convertPdfToMarkdown = async (file: File): Promise<string> => {
  try {
    const base64Data = await fileToBase64(file);
    const client = getAiClient();

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: `Please convert the provided PDF document into clean, well-structured Markdown. 
            Follow these rules:
            1. Preserve headers, lists (ordered and unordered), and tables using standard Markdown syntax.
            2. Ignore page numbers, headers, and footers that are repetitive across pages.
            3. If there are code blocks, format them as code blocks.
            4. Do not wrap the output in a markdown block (no \`\`\`markdown ... \`\`\`), just return the raw markdown content.
            5. Ensure mathematical formulas are preserved if present.`
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response generated from the model.");
    }
    return text;
  } catch (error) {
    console.error("Gemini conversion error:", error);
    throw error;
  }
};