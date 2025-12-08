import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminCollections } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const keySnap = await adminDb
      .collection(adminCollections.apiKeys)
      .where("key", "==", apiKey)
      .limit(1)
      .get();

    if (keySnap.empty) {
      return NextResponse.json(
        { 
          exists: false,
          message: "API key not found",
          key: apiKey
        },
        { status: 404 }
      );
    }

    const keyDoc = keySnap.docs[0];
    const keyData = keyDoc.data();

    return NextResponse.json({
      exists: true,
      message: "API key found",
      key: apiKey,
      data: {
        id: keyDoc.id,
        key: keyData.key,
        userId: keyData.userId,
        isActive: keyData.isActive,
        usage: keyData.usage,
        limit: keyData.limit,
        lastUsed: keyData.lastUsed,
        createdAt: keyData.createdAt
      }
    });
  } catch (error: any) {
    console.error("Check API key error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}