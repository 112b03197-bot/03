/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Please add it via Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route for Taiwan NHI Card OCR Identification
app.post("/api/ocr", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
      res.status(400).json({ error: "Missing image files or mimeType specification." });
      return;
    }

    // Lazy load and call Gemini model
    const ai = getAiClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: image,
      },
    };

    const textPart = {
      text: "你是一位健保卡 OCR 辨識系統。請仔細辨識這張健保卡照片，從中精確辨識出「姓名」(例如：王小明)與「身分證字號」(例如：A123456789)。請確實剔除雜訊並格式化為 JSON 輸出。",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "健保卡上的中文姓名"
            },
            id: {
              type: Type.STRING,
              description: "健保卡上的身分證字號"
            }
          },
          required: ["name", "id"]
        }
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText.trim());

    res.json({
      success: true,
      data: {
        name: resultJson.name || "",
        id: resultJson.id || "",
      },
    });
  } catch (error: any) {
    console.error("OCR Exception Handled:", error);
    res.status(500).json({
      success: false,
      error: error.message || "健保卡辨識發生異常。",
    });
  }
});

// App Health Check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode with Vite live middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode serving static compiled files.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully booted on http://0.0.0.0:${PORT}`);
  });
}

startServer();
