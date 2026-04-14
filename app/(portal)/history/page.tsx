"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, ChevronDown, ChevronUp, Copy, Check, Edit3,
  ArrowLeft, Zap, Search, BookOpen, Share2, MessageSquare,
  Image, Mail, Mic, Newspaper, Video, PlayCircle, TrendingUp,
  Loader2, Trash2,
} from "lucide-react";

interface HistoryEntry {
  id: string;
  topic: string;
  brand_voice: string;
  target_audience: string;
  formats_count: number;
  created_at: string;
  content: Record<string, unknown> | null;
}

const contentTypes = [
  { key: "headlines", label: "Headlines", icon: TrendingUp, color: "text-amber-500" },
  { key: "seoKeywords", label: "SEO Keywords", icon: Search, color: "text-lime-500" },
  { key: "metaDescription", label: "Meta Description", icon: FileText, color: "text-slate-400" },
  { key: "article", label: "Article", icon: FileText, color: "text-blue-500" },
  { key: "blogPost", label: "Blog Post", icon: BookOpen, color: "text-indigo-500" },
  { key: "linkedin", label: "LinkedIn", icon: Share2, color: "text-sky-600" },
  { key: "twitterThread", label: "Twitter Thread", icon: MessageSquare, color: "text-cyan-500" },
  { key: "facebook", label: "Facebook", icon: Share2, color: "text-blue-600" },
  { key: "instagram", label: "Instagram", icon: Image, color: "text-pink-500" },
  { key: "newsletter", label: "Newsletter", icon: Mail, color: "text-emerald-500" },
  { key: "podcast", label: "Podcast Script", icon: Mic, color: "text-purple-500" },
  { key: "pressRelease", label: "Press Release", icon: Newspaper, color: "text-rose-500" },
  { key: "infographic", label: "Infographic", icon: Image, color: "text-teal-500" },
  { key: "flipbook", label: "Flipbook", icon: BookOpen, color: "text-orange-400" },
  { key: "longVideo", label: "Long Video Script", icon: Video, color: "text-red-500" },
  { key: "shortVideo", label: "Short Video Script", icon: PlayCircle, color: "text-orange-500" },
];

function getContentText(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    if (key === "twitterThread") return value.map((t, i) => `Tweet ${i + 1}:\n${t}`).join("\n\n---\n\n");
    if (key === "seoKeywords") return (value as string[]).join(", ");
    return (value as string[]).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    if (key === "headlines") {
      const h = value as { primary: string; alternatives: string[] };
      return `PRIMARY HEADLINE:\n${h.primary}\n\nALTERNATIVE HEADLINES:\n${h.alternatives?.map((a, i) => `${i + 1}. ${a}`).join("\n") ?? ""}`;
    }
    return JSON.stringify(value, null, 2);
  }
  return (value as string) || "";
}

function ContentPanel({ entry }: { entry: HistoryEntry }) {
  const [activeKey, setActiveKey] = useState("article");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!entry.content) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Content data not available for this entry.
      </div>
    );
  }

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const available = contentTypes.filter(ct => {
    const val = entry.content![ct.key];
    return val !== undefined && val !== null && val !== "";
  });

  const activeType = available.find(ct => ct.key === activeKey) ?? available[0];
  const activeText = activeType ? getContentText(activeType.key, entry.content[activeType.key]) : "";

  return (
    <div className="border-t border-white/10">
      {/* Format tabs */}
      <div className="flex gap-1 overflow-x-auto px-4 py-3 border-b border-white/10 scrollbar-hide">
        {available.map(ct => {
          const Icon = ct.icon;
          const isActive = ct.key === (activeType?.key ?? "");
          return (
            <button
              key={ct.key}
              onClick={() => setActiveKey(ct.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                isActive
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon className={`w-3 h-3 ${ct.color}`} />
              {ct.label}
            </button>
          );
        })}
      </div>

      {/* Content viewer */}
      {activeType && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">{activeType.label}</span>
            <button
              onClick={() => handleCopy(activeType.key, activeText)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              {copiedKey === activeType.key ? (
                <><Check className="w-3 h-3 text-green-400" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy</>
              )}
            </button>
          </div>
          <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto bg-black/20 rounded-xl p-4 border border-white/5">
            {activeText}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("content_history")
        .select("id, topic, brand_voice, target_audience, formats_count, created_at, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setHistory(data ?? []);
      setLoading(false);
    });
  }, [router]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("content_history").delete().eq("id", id);
    setHistory(prev => prev.filter(h => h.id !== id));
    if (expandedId === id) setExpandedId(null);
    setDeletingId(null);
  };

  const handleEdit = (entry: HistoryEntry) => {
    const params = new URLSearchParams({
      topic: entry.topic,
      voice: entry.brand_voice || "Professional yet approachable",
      audience: entry.target_audience || "Business professionals and entrepreneurs",
    });
    router.push(`/?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Content History</h1>
            <p className="text-slate-400 text-sm mt-0.5">{history.length} generation{history.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all"
        >
          <Zap className="w-4 h-4" /> New Generation
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-24">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No content generated yet.</p>
          <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm">
            Generate your first piece
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Row header */}
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{entry.topic}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                        {" · "}
                        {new Date(entry.created_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      {entry.brand_voice && (
                        <span className="text-xs text-slate-600 bg-white/5 px-2 py-0.5 rounded-full hidden sm:inline">
                          {entry.brand_voice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={() => handleEdit(entry)}
                      title="Load into form to edit & regenerate"
                      className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 px-3 py-1.5 rounded-xl transition-colors border border-sky-500/20"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      title="Delete this entry"
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      {deletingId === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      {isExpanded ? (
                        <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                      ) : (
                        <><ChevronDown className="w-3.5 h-3.5" /> View</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && <ContentPanel entry={entry} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
