import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 300;

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BASE_URL || "https://admin17257.n8n-wsk.com/webhook";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required", code: "auth_required" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Profile missing — create via service role and allow distribution
    const admin = createAdminClient();
    await admin.from("profiles").upsert(
      { id: user.id, plan: "free", generations_used: 1, generations_limit: 1, role: "user" },
      { onConflict: "id" }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${N8N_WEBHOOK_URL}/townshub-distribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: body.content,
        platforms: body.platforms || ["all"],
        topic: body.topic,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Distribution error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create distribution plan" },
      { status: 500 }
    );
  }
}
