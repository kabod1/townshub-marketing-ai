import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BASE_URL || "https://admin17257.n8n-wsk.com/webhook";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required", code: "auth_required" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Authentication required", code: "auth_required" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${N8N_WEBHOOK_URL}/townshub-pr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PR API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process press release" },
      { status: 500 }
    );
  }
}
