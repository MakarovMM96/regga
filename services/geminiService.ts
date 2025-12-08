import { GoogleGenAI } from "@google/genai";

// Safely access process.env to avoid ReferenceError in browser environments that don't polyfill 'process'
const getApiKey = () => {
  try {
    // Check if process is defined to avoid ReferenceError
    if (typeof process !== 'undefined' && process.env) {
      return process.env.VITE_GEMINI_API_KEY || '';
    }
    // For Vite environment, use import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_GEMINI_API_KEY || '';
    }
    return '';
  } catch (error) {
    console.warn("Environment variables are not accessible");
    return '';
  }
};

export const generateHypeMessage = async (nickname: string, nominations: string[]): Promise<string> => {
  const apiKey = getApiKey();
  const nominationStr = nominations.join(', ');
  
  // If no API key, return fallback immediately without trying to instantiate client
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return `Добро пожаловать на Йолку, ${nickname}! Удачи в номинациях: ${nominationStr}!`;
  }

  try {
    // Instantiate client here to prevent top-level crashes
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Generate a short, energetic, hype-up welcome message (max 2 sentences) in Russian 
        for a dancer named "${nickname}" who just registered for the "${nominationStr}" categories 
        at the "Йолка" (Yolka) street dance festival. 
        Use slang appropriate for hip-hop/breaking culture. 
        Don't use quotes.
      `,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Йо, ${nickname}! Твоя заявка принята. Порви всех в категориях: ${nominationStr}!`;
  }
};