"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Zap,
  Globe,
  FileText,
  Video,
  Mic,
  Share2,
  TrendingUp,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  X,
  Menu,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ContentResult {
  success: boolean;
  topic: string;
  content: {
    headlines?: { primary: string; alternatives: string[] };
    seoKeywords?: string[];
    metaDescription?: string;
    article?: string;
    blogPost?: string;
    linkedin?: string;
    twitterThread?: string[];
    facebook?: string;
    instagram?: string;
    newsletter?: string;
    podcast?: string;
    pressRelease?: string;
    infographic?: string;
    flipbook?: string;
    longVideo?: string;
    shortVideo?: string;
  };
}

const contentTypes = [
  { key: "headlines", label: "Headlines", icon: TrendingUp, color: "text-amber-500" },
  { key: "article", label: "Article", icon: FileText, color: "text-blue-500" },
  { key: "blogPost", label: "Blog Post", icon: FileText, color: "text-indigo-500" },
  { key: "linkedin", label: "LinkedIn", icon: Share2, color: "text-sky-600" },
  { key: "twitterThread", label: "Twitter Thread", icon: MessageSquare, color: "text-cyan-500" },
  { key: "facebook", label: "Facebook", icon: Share2, color: "text-blue-600" },
  { key: "instagram", label: "Instagram", icon: Share2, color: "text-pink-500" },
  { key: "newsletter", label: "Newsletter", icon: FileText, color: "text-emerald-500" },
  { key: "podcast", label: "Podcast Script", icon: Mic, color: "text-purple-500" },
  { key: "pressRelease", label: "Press Release", icon: Globe, color: "text-rose-500" },
  { key: "longVideo", label: "Long Video", icon: Video, color: "text-red-500" },
  { key: "shortVideo", label: "Short Video", icon: Video, color: "text-orange-500" },
  { key: "infographic", label: "Infographic", icon: TrendingUp, color: "text-teal-500" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [brandVoice, setBrandVoice] = useState("Professional yet approachable");
  const [targetAudience, setTargetAudience] = useState("Business professionals and entrepreneurs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm TownsHub Marketing AI. I can help you create content, plan strategies, and amplify your brand across 300+ platforms. What would you like to work on today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setContentResult(null);
    setSelectedContent(null);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, brandVoice, targetAudience }),
      });

      const data = await response.json();
      if (data.success) {
        setContentResult(data);
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (key: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response || "I couldn't process that. Please try again." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getContentDisplay = (key: string) => {
    if (!contentResult?.content) return "";
    const content = contentResult.content[key as keyof typeof contentResult.content];
    if (Array.isArray(content)) {
      if (key === "twitterThread") {
        return content.join("\n\n---\n\n");
      }
      if (key === "seoKeywords") {
        return content.join(", ");
      }
      return content.join("\n");
    }
    if (typeof content === "object" && content !== null) {
      if (key === "headlines") {
        const h = content as { primary: string; alternatives: string[] };
        return `Primary: ${h.primary}\n\nAlternatives:\n${h.alternatives?.map((a, i) => `${i + 1}. ${a}`).join("\n") || ""}`;
      }
      return JSON.stringify(content, null, 2);
    }
    return content || "";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">TownsHub</h1>
                <p className="text-xs text-slate-500">Marketing AI</p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white font-medium hover:shadow-lg hover:shadow-brand-500/25 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">One Topic.</span>{" "}
            <span className="text-slate-900">16 Formats.</span>{" "}
            <span className="text-gradient">300+ Platforms.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform any topic into a complete content campaign. Generate articles, social posts, videos, podcasts, and more—all optimized for each platform.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Content Formats", value: "16", icon: FileText },
            { label: "Platforms", value: "300+", icon: Globe },
            { label: "Categories", value: "11", icon: Share2 },
            { label: "AI Powered", value: "GPT-4o", icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-brand-500" />
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Generator */}
        <div className="glass rounded-3xl p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Content Generator
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Topic or Keyword</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 5 AI Tools Every Small Business Should Use in 2026"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Brand Voice</label>
                <select
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none bg-white"
                >
                  <option>Professional yet approachable</option>
                  <option>Bold and authoritative</option>
                  <option>Casual and friendly</option>
                  <option>Educational and informative</option>
                  <option>Inspirational and motivating</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Small business owners"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating 16 Formats...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content Campaign
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {contentResult && (
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                Generated Content
              </h3>
              <span className="text-sm text-slate-500">
                {contentTypes.filter(ct => getContentDisplay(ct.key)).length} formats ready
              </span>
            </div>

            {/* Content Type Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {contentTypes.map((ct) => {
                const hasContent = !!getContentDisplay(ct.key);
                if (!hasContent) return null;

                return (
                  <button
                    key={ct.key}
                    onClick={() => setSelectedContent(selectedContent === ct.key ? null : ct.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedContent === ct.key
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <ct.icon className={`w-4 h-4 ${selectedContent === ct.key ? "text-white" : ct.color}`} />
                    {ct.label}
                  </button>
                );
              })}
            </div>

            {/* Content Display */}
            {selectedContent && (
              <div className="relative">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleCopy(selectedContent, getContentDisplay(selectedContent))}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {copiedKey === selectedContent ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
                <pre className="bg-slate-50 rounded-2xl p-6 pr-14 overflow-auto max-h-96 text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {getContentDisplay(selectedContent)}
                </pre>
              </div>
            )}

            {!selectedContent && (
              <p className="text-center text-slate-500 py-8">
                Select a content type above to view and copy
              </p>
            )}
          </div>
        )}
      </main>

      {/* Chat Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 glass-dark transform transition-transform duration-300 z-50 ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Marketing AI</h3>
                <p className="text-xs text-slate-400">Always ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-brand-500 to-accent-purple text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full loading-dot" />
                    <div className="w-2 h-2 bg-slate-500 rounded-full loading-dot" />
                    <div className="w-2 h-2 bg-slate-500 rounded-full loading-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
