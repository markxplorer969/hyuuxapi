import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { adminDb, adminCollections, Timestamp } from "@/lib/firebase-admin";

// ID generator (mirip PublicAI versi JS)
function generateId(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// call PublicAI
async function publicAiGenerate(question: string) {
  const { data } = await axios.post(
    "https://publicai.co/api/chat",
    {
      tools: {},
      id: generateId(),
      messages: [
        {
          id: generateId(),
          role: "user",
          parts: [
            {
              type: "text",
              text: question,
            },
          ],
        },
      ],
      trigger: "submit-message",
    },
    {
      headers: {
        origin: "https://publicai.co",
        referer: "https://publicai.co/chat",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
      },
    }
  );

  // parse streaming response
  const result = data
    .split("\n\n")
    .filter((line: string) => line && !line.includes("[DONE]"))
    .map((line: string) => JSON.parse(line.substring(6)))
    .filter((l: any) => l.type === "text-delta")
    .map((l: any) => l.delta)
    .join("");

  return result || "No result returned.";
}

export async function POST(req: NextRequest) {
  try {
    const { question, apikey } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Missing question" },
        { status: 400 }
      );
    }

    if (!apikey) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 401 }
      );
    }

    // Validate API key
    const keySnap = await adminDb
      .collection(adminCollections.apiKeys)
      .where("key", "==", apikey)
      .limit(1)
      .get();

    if (keySnap.empty) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 }
      );
    }

    const keyDoc = keySnap.docs[0];
    const keyData = keyDoc.data();

    if (!keyData.isActive) {
      return NextResponse.json(
        { error: "API key is disabled" },
        { status: 403 }
      );
    }

    // usage limit check
    if (keyData.usage >= keyData.limit) {
      return NextResponse.json(
        { error: "API key usage limit reached" },
        { status: 429 }
      );
    }

    // CALL PUBLIC AI
    const output = await publicAiGenerate(question);

    // update usage
    await keyDoc.ref.update({
      usage: (keyData.usage || 0) + 1,
      lastUsed: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      question,
      answer: output,
    });
  } catch (err: any) {
    console.error("PublicAI error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
