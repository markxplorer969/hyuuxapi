import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { targetUrl, method, headers, body } = await req.json();

    // Validate required fields
    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Target URL is required" },
        { status: 400 }
      );
    }

    // Prepare request headers
    const requestHeaders = {
      ...headers,
      "User-Agent": "Slowly-Docs",
    };

    // Prepare request options
    const fetchOptions: RequestInit = {
      method: method || "GET",
      headers: requestHeaders,
    };

    // Add body for POST requests
    if (method === "POST" && body) {
      // Handle different content types
      if (typeof body === "object" && !(body instanceof FormData)) {
        fetchOptions.body = JSON.stringify(body);
        requestHeaders["Content-Type"] = "application/json";
      } else {
        fetchOptions.body = body;
      }
    }

    // Make the actual request
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get("content-type") || "";
    const status = response.status;

    // Handle Image/Binary responses
    if (contentType.includes("image")) {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return NextResponse.json({
        success: response.ok,
        type: "image",
        mime: contentType,
        data: `data:${contentType};base64,${base64}`,
        status: status,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    // Handle JSON responses
    if (contentType.includes("json")) {
      try {
        const data = await response.json();
        return NextResponse.json({
          success: response.ok,
          type: "json",
          data: data,
          status: status,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (jsonError) {
        // If JSON parsing fails, treat as text
        const text = await response.text();
        return NextResponse.json({
          success: response.ok,
          type: "text",
          data: text,
          status: status,
          headers: Object.fromEntries(response.headers.entries())
        });
      }
    }

    // Handle Text responses (HTML, XML, plain text, etc.)
    const text = await response.text();
    return NextResponse.json({
      success: response.ok,
      type: "text",
      data: text,
      status: status,
      headers: Object.fromEntries(response.headers.entries())
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        type: "error"
      },
      { status: 500 }
    );
  }
}