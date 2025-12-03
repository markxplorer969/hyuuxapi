import { NextRequest, NextResponse } from 'next/server';

async function gradientChat({
  model,
  clusterMode,
  messages,
  enableThinking,
}: {
  model: string;
  clusterMode: string;
  messages: Array<{role: string; content: string}>;
  enableThinking?: boolean;
}) {
  // === Build Params ===
  if (!["Qwen3 235B", "GPT OSS 120B"].includes(model)) {
    throw new Error("Model harus 'Qwen3 235B' atau 'GPT OSS 120B'");
  }
  if (!["nvidia", "hybrid"].includes(clusterMode)) {
    throw new Error("clusterMode harus 'nvidia' atau 'hybrid'");
  }
  const params: any = { model, clusterMode, messages };
  if (model === "GPT OSS 120B") {
    params.enableThinking = !!enableThinking;
  }

  // === Request ===
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
  
  // === Parse Response ===
  const lines = raw.trim().split(/\r?\n/);
  const result = {
    jobInfo: null,
    clusterInfo: null,
    replies: [],
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) {
      return NextResponse.json({
        status: false,
        error: 'Text parameter is required'
      }, { status: 400 });
    }

    const result = await gradientChat({
      model: "GPT OSS 120B",
      clusterMode: "nvidia",
      messages: [{ role: "user", content: text }],
      enableThinking: true,
    });

    return NextResponse.json({
      status: true,
      result: result.content,
    });
  } catch (error) {
    console.error('AI OSS Error:', error);
    return NextResponse.json({ 
      status: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}