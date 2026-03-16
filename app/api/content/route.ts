import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BASE_URL || "https://admin17257.n8n-wsk.com/webhook";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required", code: "auth_required" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, generations_used, generations_limit")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found.", code: "profile_missing" }, { status: 403 });
  }

  if (profile.generations_limit < 99999 && profile.generations_used >= profile.generations_limit) {
    return NextResponse.json({ error: "Generation limit reached. Upgrade your plan to continue.", code: "limit_reached" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${N8N_WEBHOOK_URL}/townshub-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: body.topic,
        brandVoice: body.brandVoice || "Professional yet approachable",
        targetAudience: body.targetAudience || "Business professionals and entrepreneurs",
        action: "generate",
      }),
    });

    const data = await response.json();

    // Track usage after successful generation
    if (data.success) {
      await Promise.all([
        supabase
          .from("profiles")
          .update({ generations_used: profile.generations_used + 1 })
          .eq("id", user.id),
        supabase.from("content_history").insert({
          user_id: user.id,
          topic: body.topic,
          formats_count: 16,
          total_words: 0,
        }),
        supabase.from("usage_events").insert({
          user_id: user.id,
          event_type: "generate",
          metadata: { topic: body.topic },
        }),
      ]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
