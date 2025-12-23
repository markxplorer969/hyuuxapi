import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import { sendToDiscord } from '@/lib/discord';

// ===================================
//      GRADIENT AI CLIENT
// ===================================
async function gradientChat({
  model,
  clusterMode,
  messages,
  enableThinking,
}: {
  model: string;
  clusterMode: string;
  messages: Array<{ role: string; content: string }>;
  enableThinking?: boolean;
}) {
  if (!["Qwen3 235B", "GPT OSS 120B"].includes(model)) {
    throw new Error("Model harus 'Qwen3 235B' atau 'GPT OSS 120B'");
  }
  if (!["nvidia", "hybrid"].includes(clusterMode)) {
    throw new Error("clusterMode harus 'nvidia' atau 'hybrid'");
  }

  const params: any = { model, clusterMode, messages };
  if (model === "GPT OSS 120B") params.enableThinking = !!enableThinking;

  try {
    const response = await fetch("https://chat.gradient.network/api/generate", {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://chat.gradient.network",
        referer: "https://chat.gradient.network/",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.text();
    const lines = raw.trim().split(/\r?\n/);

    const result = {
      jobInfo: null as any,
      clusterInfo: null as any,
      replies: [] as any[],
      content: "",
      blockUpdates: [] as any[],
    };

    for (const line of lines) {
      if (!line.trim()) continue;

      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }

      switch (obj.type) {
        case "clusterInfo":
          result.clusterInfo = obj.data;
          break;
        case "reply":
          result.replies.push(obj.data);
          result.content += obj.data?.content || "";
          break;
        case "blockUpdate":
          result.blockUpdates.push(...obj.data);
          break;
      }
    }

    return result;
  } catch (error) {
    console.error("Gradient AI API Error:", error);
    throw new Error(`Failed to call Gradient AI API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ===================================
//             API ROUTE
// ===================================
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "Unknown";

  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const apikey = searchParams.get("apikey");

    if (!text) {
      return NextResponse.json(
        { status: false, error: "text parameter is required" },
        { status: 400 }
      );
    }

    if (!apikey) {
      return NextResponse.json(
        { status: false, error: "apikey is required" },
        { status: 401 }
      );
    }

    // ===================================
    //  VALIDASI API KEY (FIRESTORE)
    // ===================================
    const keySnap = await adminDb
      .collection(adminCollections.apiKeys)
      .where("key", "==", apikey)
      .limit(1)
      .get();

    if (keySnap.empty) {
      return NextResponse.json(
        { status: false, error: "Invalid API key" },
        { status: 403 }
      );
    }

    const keyDoc = keySnap.docs[0];
    const keyData = keyDoc.data();

    if (!keyData.isActive) {
      return NextResponse.json(
        { status: false, error: "API key is disabled" },
        { status: 403 }
      );
    }

    if (keyData.limit && keyData.usage >= keyData.limit) {
      return NextResponse.json(
        { status: false, error: "API key usage limit reached" },
        { status: 429 }
      );
    }

    // ===================================
    //         CALL GRADIENT AI
    // ===================================
    const result = await gradientChat({
      model: "GPT OSS 120B",
      clusterMode: "nvidia",
      messages: [{ role: "user", content: text }],
      enableThinking: true,
    });

    // ===================================
    //         UPDATE USAGE LOG
    // ===================================
    await keyDoc.ref.update({
      usage: (keyData.usage ?? 0) + 1,
      lastUsed: Timestamp.now(),
    });

    // ===================================
    //        SEND LOG TO DISCORD
    // ===================================
    await sendToDiscord({
      ip,
      endpoint: "/api/ai/oss",
      method: "GET",
      query: { text, apikey },
      response: { result: result.content },
    });

    // ===================================
    //             SUCCESS
    // ===================================
    return NextResponse.json({
      status: true,
      result: result.content,
    });

  } catch (error: any) {
    console.error("AI OSS Error:", error);

    // LOG ERROR TO DISCORD
    await sendToDiscord({
      ip,
      endpoint: "/api/ai/oss",
      method: "GET",
      query: {},
      response: { error: error.message },
    });

    return NextResponse.json(
      { status: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
