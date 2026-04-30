import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScamAnalysisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0 to 100
  summary: string;
  reasons: string[];
  tips: string[];
  isDeepfakeSuspected: boolean;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      description: "The overall risk level of the content being a scam.",
    },
    score: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing the scam probability.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief executive summary of the analysis.",
    },
    reasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific indicators found (e.g., sense of urgency, suspicious link).",
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable security tips for the user.",
    },
    isDeepfakeSuspected: {
      type: Type.BOOLEAN,
      description: "Whether the audio or text content shows signs of being AI-generated or deepfaked.",
    },
  },
  required: ['riskLevel', 'score', 'summary', 'reasons', 'tips', 'isDeepfakeSuspected'],
};

const SYSTEM_INSTRUCTION = `You are an elite Scam Detection AI. Your goal is to analyze messages (text) and voice notes (audio) for deceptive intent.
Look for:
1. Urgency: 'Immediate action required', 'Offer expires in 1 hour'.
2. Financial pressure: Unusual payment methods (gift cards, crypto), "emergency" money transfers.
3. Social Engineering: Impersonation of authority (police, bank, boss), family member in distress.
4. Deepfake/AI Indicators: In audio, look for robotic cadence, unnatural pauses, or unusual background noise consistency. In text, look for slight grammatical oddities or inconsistent tone.
5. Suspicious Links/Attachments.

Provide a detailed, objective analysis. Be cautious but accurate. If you are unsure, flag it as MEDIUM risk.`;

export async function analyzeScam(content: string | { data: string, mimeType: string }) {
  const parts = [];
  
  if (typeof content === 'string') {
    parts.push({ text: `Analyze this message for scam potential: ${content}` });
  } else {
    parts.push({
      inlineData: {
        data: content.data,
        mimeType: content.mimeType,
      },
    });
    parts.push({ text: "Analyze this audio snippet for potential scam or deepfake voice. Determine if the intent is deceptive or if the voice sounds synthetically generated." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA as any,
      },
    });

    return JSON.parse(response.text || '{}') as ScamAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze content. Please try again.");
  }
}
