import { NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BASE_URL || "https://admin17257.n8n-wsk.com/webhook";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${N8N_WEBHOOK_URL}/townshub-podcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Podcast API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate podcast RSS" },
      { status: 500 }
    );
  }
}
