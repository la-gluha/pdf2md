import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Define the worker src.
// We handle potential structure variations of the imported module (ESM/CJS interop)
const pdfjs = pdfjsLib as any;

// Handle different export structures that might come from the CDN/Bundler
const GlobalWorkerOptions = pdfjs.GlobalWorkerOptions || (pdfjs.default && pdfjs.default.GlobalWorkerOptions);

if (GlobalWorkerOptions) {
    GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
} else {
    console.warn("Could not find GlobalWorkerOptions in pdfjs-dist import");
}

export const convertPdfToMarkdownLocal = async (file: File): Promise<string> => {
  let tesseractWorker: any = null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const getDocument = pdfjs.getDocument || (pdfjs.default && pdfjs.default.getDocument);
    
    if (!getDocument) {
        throw new Error("PDF.js getDocument function not found");
    }

    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullMarkdown = `# ${file.name}\n\n`;
    
    // Iterate through all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items
      const rawText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Heuristic: If text length is very small relative to a typical page, assume it's scanned or image-based.
      // We use 50 characters as a conservative threshold for an "empty" page that might contain an image.
      const isLikelyScanned = rawText.trim().length < 50;
      
      if (isLikelyScanned) {
         console.log(`Page ${pageNum} appears to be scanned. Starting OCR...`);
         
         // Initialize Tesseract worker only when needed to save resources for non-scanned docs
         if (!tesseractWorker) {
             console.log("Initializing Tesseract.js worker...");
             tesseractWorker = await createWorker('eng');
         }

         // Render page to canvas for OCR
         // We use a scale of 2.0 to improve OCR accuracy
         const viewport = page.getViewport({ scale: 2.0 });
         const canvas = document.createElement('canvas');
         canvas.width = viewport.width;
         canvas.height = viewport.height;
         
         const context = canvas.getContext('2d');
         if (context) {
             await page.render({ canvasContext: context, viewport }).promise;
             
             // Run recognition
             const { data: { text } } = await tesseractWorker.recognize(canvas);
             
             if (pdf.numPages > 1) {
               fullMarkdown += `## Page ${pageNum} (OCR)\n\n`;
             }
             fullMarkdown += `${text}\n\n`;
         } else {
             fullMarkdown += `> [OCR Error: Could not generate image for page ${pageNum}]\n\n`;
         }

      } else {
         // Use extracted text
         if (pdf.numPages > 1) {
            fullMarkdown += `## Page ${pageNum}\n\n`;
         }
         fullMarkdown += `${rawText}\n\n`;
      }
      
      // Add a separator between pages
      if (pageNum < pdf.numPages) {
        fullMarkdown += `---\n\n`;
      }
    }
    
    return fullMarkdown;
  } catch (error) {
    console.error("Local PDF conversion error:", error);
    throw new Error("Failed to process PDF locally. It might be password protected or corrupted.");
  } finally {
      if (tesseractWorker) {
          await tesseractWorker.terminate();
      }
  }
};