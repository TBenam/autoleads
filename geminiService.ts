import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from '../types';

// Get API Key safely (supports standard Node env and Vite env)
// @ts-ignore
const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;

if (!apiKey) {
  console.warn("API_KEY is missing. Please check your environment variables.");
}

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const SYSTEM_INSTRUCTION = `
You are an expert lead generation assistant. Your job is to extract business details from advertising content (text or images).
1. Identify the 'companyName' (Business name, Facebook page name, or Shop name). If unknown, guess based on context or use 'Boutique'.
2. Identify the 'productName' (The specific item or service being advertised). If unknown, use 'produits'.
3. Extract 'phone' numbers. 
   - Strict Rule: Ignore numbers with fewer than 8 digits.
   - Ignore formatting spaces or dashes.
   - Return the number in international format if possible, otherwise keep original.
4. Return a JSON object containing an array of leads.
`;

export const extractLeadsFromContent = async (
  text: string,
  imageBase64?: string
): Promise<ExtractionResult> => {
  try {
    // Using gemini-3-flash-preview as it supports multimodal input and JSON response schema
    const model = 'gemini-3-flash-preview';

    const parts: any[] = [];

    // Add image if available
    if (imageBase64) {
      // Remove data URL prefix if present to get pure base64
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity, API handles png/jpeg
          data: base64Data
        }
      });
    }

    // Add text prompt
    parts.push({
      text: text ? `Analyze this text: "${text}"` : "Analyze this image for business contact info."
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            leads: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phone: { type: Type.STRING },
                  companyName: { type: Type.STRING },
                  productName: { type: Type.STRING },
                },
                required: ["phone", "companyName", "productName"]
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractionResult;
    }
    
    return { leads: [] };

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Impossible d'analyser le contenu. Vérifiez votre clé API ou réessayez.");
  }
};