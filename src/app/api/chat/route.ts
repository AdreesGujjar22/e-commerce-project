import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the official Google GenAI SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid message parameters" }, { status: 400 });
    }

    // Map system roles: 'assistant' to 'model', 'user' to 'user' for Gemini API compatibility
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction:
          "You are Aura, the private AI Styling Concierge for Maison L'Étoile, a high-end ultra-premium e-commerce boutique selling silk apparel, Swiss timepieces, Kyoto clay vases, and rare organic sandalwood perfumes. Speak with extreme sophistication, courtesy, and storytelling style. Tailor recommendations to look editorial and high-prestige.",
        temperature: 0.75,
      },
    });

    const replyText = response.text || "Apologies, patron. I find myself momentarily silent. Let me seek counsel inside the atelier.";
    return NextResponse.json({ content: replyText });
  } catch (err: any) {
    console.error("Gemini server-side error:", err);
    return NextResponse.json({ error: err.message || "Model communication friction" }, { status: 500 });
  }
}
