import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the API key from process.env as per guidelines.
// The API key availability is assumed to be handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Updated to gemini-3-flash-preview as per guidelines for Basic Text Tasks
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