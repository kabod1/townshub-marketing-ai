import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BASE_URL || "https://admin17257.n8n-wsk.com/webhook";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${N8N_WEBHOOK_URL}/townshub-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
        sessionId: body.sessionId || `session-${Date.now()}`,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { response: "Sorry, I encountered an error. Please try again.", error: true },
      { status: 500 }
    );
  }
}
