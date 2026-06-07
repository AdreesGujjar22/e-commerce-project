import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSettingsAction } from "../../../actions/settings.actions";
import { getProductsAction } from "../../../actions/product.actions";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// SIMPLE IN-MEMORY SESSION STORE (replace with Redis later in production)
const sessionStore = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const lastMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // =========================
    // SESSION INIT
    // =========================
    const sid = sessionId || "default";
    const session = sessionStore.get(sid) || {
      query: {},
      offset: 0,
    };

    // =========================
    // ADMIN SETTINGS
    // =========================
    const settingsRes = await getSettingsAction();
    const settings = settingsRes.settings;

    // =========================
    // INTENT DETECTION
    // =========================
    const isMore =
      lastMessage.includes("more") ||
      lastMessage.includes("show more");

    const isGreeting =
      lastMessage.includes("hi") ||
      lastMessage.includes("hello");

    // =========================
    // BUILD QUERY ONLY ON NEW SEARCH
    // =========================
    if (!isMore) {
      session.offset = 0;
      session.query = { limit: 6 };

      if (lastMessage.includes("suit")) session.query.category = "suit";
      if (lastMessage.includes("dress")) session.query.category = "dress";
      if (lastMessage.includes("bag")) session.query.category = "bag";

      const price = lastMessage.match(/\d+/g);
      if (price) session.query.maxPrice = Number(price[0]);
    } else {
      session.offset += 3;
    }

    // attach pagination
    const query = {
      ...session.query,
      limit: 3,
      skip: session.offset,
    };

    // save session
    sessionStore.set(sid, session);

    // =========================
    // FETCH PRODUCTS (PAGINATED)
    // =========================
    const productsRes = await getProductsAction(query);
    const products = productsRes.success ? productsRes.products : [];

    // =========================
    // PRODUCT FORMAT
    // =========================
    const productText = products
      .map((p: any) => `• ${p.name} - ${p.price}\n  /products/${p.slug}/${p.id}`)
      .join("\n");

    // =========================
    // SYSTEM PROMPT (STRICT)
    // =========================
    const systemInstruction = `
${settings?.chatbot_instruction}

RULES:
- Keep answers VERY SHORT (max 5 lines)
- NO storytelling
- NO luxury paragraphs
- ONLY use given products
- MAX 3 products only
- If greeting, reply short only
- If no products, say "No more products found"

CURRENT PRODUCTS:
${productText || "No products found"}
`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return NextResponse.json({
      content:
        response.text || "No response available.",
      products,
      hasMore: products.length === 3,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}