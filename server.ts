import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Finova API Server" });
});

// AI Financial Advisor Chat Endpoint
app.post("/api/advisor/chat", async (req, res) => {
  try {
    const { message, financialContext, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemInstruction = `
You are Finova AI, a calm, encouraging, and sophisticated personal finance advisor.
Your aesthetic philosophy is "Soft Minimalism": thoughtful, stress-free, empowering, and pragmatic financial guidance without jargon or overwhelming pressure.

Current Financial Overview of User:
- Total Balance: $${financialContext?.totalBalance ?? 18650}
- Monthly Income: $${financialContext?.monthlyIncome ?? 4500}
- Monthly Expenses: $${financialContext?.monthlyExpenses ?? 2439}
- Savings Rate: ${financialContext?.savingsRatePercentage ?? 45}%
- Top Spending Categories: ${financialContext?.topCategories ? JSON.stringify(financialContext.topCategories) : 'Housing, Groceries, Dining'}

Instructions:
1. Provide actionable, supportive, clear advice tailored to the user's specific query and financial metrics.
2. Structure your response with clean formatting (bullet points, bold key takeaways).
3. Always include 2-3 brief "suggested follow-up actions" as a JSON object inside your response if applicable, or in a structured JSON schema.
4. Maintain a warm, encouraging tone that celebrates progress and frames budget optimization as creating room for what truly matters.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        ...(conversationHistory || []).map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here to help you navigate your finances with clarity and ease.";

    res.json({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in AI Advisor Endpoint:", error);
    res.status(500).json({
      error: "Unable to process financial advice at this moment.",
      details: error?.message || "Internal server error",
    });
  }
});

// AI Receipt & Expense Scanner Endpoint
app.post("/api/receipt/scan", async (req, res) => {
  try {
    const { imageBase64, textContent, mimeType } = req.body;

    if (!imageBase64 && !textContent) {
      return res.status(400).json({ error: "Either imageBase64 or textContent is required" });
    }

    const parts: any[] = [];

    if (imageBase64) {
      // Clean base64 string if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const promptText = `
Analyze this receipt image or receipt text and extract the structured expense information.
Return the result as JSON with these keys:
- merchant: string (e.g. "Trader Joe's", "Starbucks", "Target")
- title: string (descriptive summary of purchase)
- amount: number (total transaction amount in dollars)
- date: string (YYYY-MM-DD format, or today's date if missing)
- categoryName: string (Choose best fit from: 'Housing & Rent', 'Dining & Cafes', 'Groceries', 'Subscriptions & Services', 'Transportation', 'Personal & Lifestyle', 'Wellness & Health', 'General Expense')
- categoryId: string (e.g. 'cat-groceries', 'cat-dining', 'cat-shopping', 'cat-sub', 'cat-transport', 'cat-housing', 'cat-health')
- paymentMethod: string (e.g., 'Credit Card', 'Apple Pay', 'Cash')
- items: array of strings (individual items listed)
- confidenceScore: number (0.0 to 1.0)
`;

    parts.push({ text: textContent ? `Receipt Text:\n${textContent}\n\n${promptText}` : promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            categoryName: { type: Type.STRING },
            categoryId: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER },
          },
          required: ["title", "amount", "categoryName", "categoryId"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error: any) {
    console.error("Error in Receipt Scanner Endpoint:", error);
    res.status(500).json({
      error: "Failed to scan receipt",
      details: error?.message || "Internal server error",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Finova Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
