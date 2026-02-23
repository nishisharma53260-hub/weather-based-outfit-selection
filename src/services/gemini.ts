import { GoogleGenAI, Type } from "@google/genai";
import { Occasion, OutfitRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFashionRecommendations(
  occasion: Occasion,
  weather?: string,
  userContext?: string
): Promise<OutfitRecommendation> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a complete fashion outfit recommendation for a ${occasion} occasion.
  ${weather ? `Current weather: ${weather}.` : ""}
  ${userContext ? `User context: ${userContext}.` : ""}
  Provide coordinated clothing items, styling tips, and a color palette.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                item: { type: Type.STRING },
                stylingTip: { type: Type.STRING },
              },
              required: ["category", "item", "stylingTip"],
            },
          },
          overallStylingTip: { type: Type.STRING },
          colorPalette: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "description", "items", "overallStylingTip", "colorPalette"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateVirtualTryOn(
  base64Image: string,
  mimeType: string,
  outfitDescription: string
): Promise<string | null> {
  const model = "gemini-2.5-flash-image";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Modify the person in this image to be wearing the following outfit: ${outfitDescription}. 
          Ensure the clothing fits their body shape and face naturally. 
          Maintain the original person's identity but change their attire completely to match the description.
          The output should be just the modified image.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  return null;
}
