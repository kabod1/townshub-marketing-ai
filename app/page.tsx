"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  Search,
  BookOpen,
  Image,
  Mail,
  Newspaper,
  PlayCircle,
  Radio,
  Rss,
  Upload,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  User,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

interface DistributionResult {
  success: boolean;
  totalPlatformsAvailable: number;
  totalPlatformsQueued: number;
  categoryCounts: {
    social: number;
    blogs: number;
    video: number;
    podcast: number;
    documents: number;
    news: number;
    news_aggregators: number;
    email: number;
    syndication: number;
    directories: number;
    bookmarking: number;
  };
  platforms: Array<{
    platform: string;
    category: string;
    contentType: string;
    status: string;
  }>;
}

interface PodcastResult {
  success: boolean;
  episode: {
    title: string;
    description: string;
    audioUrl: string;
    pubDate: string;
    guid: string;
  };
  feed: {
    title: string;
    author: string;
  };
  submitTo: Array<{
    name: string;
    url: string;
  }>;
  instructions: string;
}

interface PRResult {
  success: boolean;
  pressRelease: {
    headline: string;
    body: string;
    date: string;
    contact: string;
  };
  distribution: {
    free: Array<{ name: string; url: string; cost: string }>;
    paid: Array<{ name: string; url: string; cost: string }>;
  };
  instructions: string;
}

// All 16 content formats
const contentTypes = [
  { key: "headlines", label: "Headlines", icon: TrendingUp, color: "text-amber-500", category: "SEO" },
  { key: "seoKeywords", label: "SEO Keywords", icon: Search, color: "text-lime-500", category: "SEO" },
  { key: "metaDescription", label: "Meta Description", icon: FileText, color: "text-slate-500", category: "SEO" },
  { key: "article", label: "Article", icon: FileText, color: "text-blue-500", category: "Written" },
  { key: "blogPost", label: "Blog Post", icon: BookOpen, color: "text-indigo-500", category: "Written" },
  { key: "linkedin", label: "LinkedIn", icon: Share2, color: "text-sky-600", category: "Social" },
  { key: "twitterThread", label: "Twitter Thread", icon: MessageSquare, color: "text-cyan-500", category: "Social" },
  { key: "facebook", label: "Facebook", icon: Share2, color: "text-blue-600", category: "Social" },
  { key: "instagram", label: "Instagram", icon: Image, color: "text-pink-500", category: "Social" },
  { key: "newsletter", label: "Newsletter", icon: Mail, color: "text-emerald-500", category: "Email" },
  { key: "podcast", label: "Podcast Script", icon: Mic, color: "text-purple-500", category: "Audio" },
  { key: "pressRelease", label: "Press Release", icon: Newspaper, color: "text-rose-500", category: "PR" },
  { key: "infographic", label: "Infographic", icon: Image, color: "text-teal-500", category: "Visual" },
  { key: "flipbook", label: "Flipbook", icon: BookOpen, color: "text-orange-400", category: "Visual" },
  { key: "longVideo", label: "Long Video Script", icon: Video, color: "text-red-500", category: "Video" },
  { key: "shortVideo", label: "Short Video Script", icon: PlayCircle, color: "text-orange-500", category: "Video" },
];

// Distribution platform categories
const distributionCategories = [
  { key: "social", label: "Social Media", icon: Share2, color: "from-blue-500 to-cyan-500", count: 25 },
  { key: "blogs", label: "Blogging", icon: BookOpen, color: "from-indigo-500 to-purple-500", count: 35 },
  { key: "video", label: "Video Platforms", icon: Video, color: "from-red-500 to-orange-500", count: 30 },
  { key: "podcast", label: "Podcast Directories", icon: Mic, color: "from-purple-500 to-pink-500", count: 35 },
  { key: "documents", label: "Document Sharing", icon: FileText, color: "from-emerald-500 to-teal-500", count: 25 },
  { key: "news", label: "News & PR", icon: Newspaper, color: "from-rose-500 to-red-500", count: 50 },
  { key: "news_aggregators", label: "News Aggregators", icon: Rss, color: "from-amber-500 to-orange-500", count: 25 },
  { key: "email", label: "Email Marketing", icon: Mail, color: "from-green-500 to-emerald-500", count: 25 },
  { key: "syndication", label: "Content Syndication", icon: Upload, color: "from-cyan-500 to-blue-500", count: 15 },
  { key: "directories", label: "Business Directories", icon: Globe, color: "from-slate-500 to-zinc-500", count: 25 },
  { key: "bookmarking", label: "Bookmarking", icon: BookOpen, color: "from-violet-500 to-purple-500", count: 15 },
];

export default function Home() {
  const [authUser, setAuthUser] = useState<{ email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ plan: string; generations_used: number; generations_limit: number } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUser({ email: user.email ?? "" });
        supabase.from("profiles").select("plan,generations_used,generations_limit").eq("id", user.id).single()
          .then(({ data }) => {
            if (data) setUserProfile(data);
            setProfileLoading(false);
          });
      } else {
        setProfileLoading(false);
      }
    });
  }, []);

  const isSubscribed = !profileLoading && !!userProfile && userProfile.plan !== "free";
  const isFreeWithUsage = !profileLoading && !!userProfile && userProfile.plan === "free" &&
    userProfile.generations_used < userProfile.generations_limit;

  // Used only for content GENERATION — checks generation limit
  const checkSubscription = () => {
    if (profileLoading) return false;
    if (!authUser) { setShowGate(true); return false; }
    if (!userProfile) return true; // let server decide if profile not loaded
    if (isSubscribed || isFreeWithUsage) return true;
    setShowGate(true);
    return false;
  };

  // Used for distribute / podcast / PR — only requires login, not generation quota
  const checkAuth = () => {
    if (!authUser) { setShowGate(true); return false; }
    return true;
  };

  const [topic, setTopic] = useState("");
  const [brandVoice, setBrandVoice] = useState("Professional yet approachable");
  const [targetAudience, setTargetAudience] = useState("Business professionals and entrepreneurs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "distribute" | "podcast" | "pr">("generate");

  // Distribution state
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionResult, setDistributionResult] = useState<DistributionResult | null>(null);
  const [distributionError, setDistributionError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);

  // Podcast state
  const [podcastName, setPodcastName] = useState("TownsHub Podcast");
  const [podcastAuthor, setPodcastAuthor] = useState("");
  const [isPodcastLoading, setIsPodcastLoading] = useState(false);
  const [podcastResult, setPodcastResult] = useState<PodcastResult | null>(null);

  // PR state
  const [contactEmail, setContactEmail] = useState("");
  const [isPRLoading, setIsPRLoading] = useState(false);
  const [prResult, setPRResult] = useState<PRResult | null>(null);

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

  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!checkSubscription()) return;
    if (!topic.trim()) return;

    setIsGenerating(true);
    setContentResult(null);
    setSelectedContent(null);
    setDistributionResult(null);
    setGenerateError(null);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, brandVoice, targetAudience }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh profile so generation count updates on client
        if (authUser) {
          const supabase = createClient();
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase.from("profiles").select("plan,generations_used,generations_limit").eq("id", user.id).single()
                .then(({ data: p }) => { if (p) setUserProfile(p); });
            }
          });
        }
        setContentResult(data);
        // Auto-distribute immediately after generation
        setActiveTab("distribute");
        await runDistribute(data.content, data.topic);
      } else if (data.code === "limit_reached") {
        setShowGate(true);
      } else {
        setGenerateError(data.error || "Generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const runDistribute = async (content: unknown, topic: string) => {
    setIsDistributing(true);
    setDistributionResult(null);
    setDistributionError(null);
    try {
      const response = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedCategories, topic }),
      });
      const data = await response.json();
      if (data.success) {
        setDistributionResult(data);
      } else {
        setDistributionError(data.error || "Distribution failed. Please try again.");
      }
    } catch (error) {
      console.error("Distribution error:", error);
      setDistributionError("Distribution failed. Please try again.");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleDistribute = async () => {
    if (!checkAuth()) return;
    if (!contentResult?.content) return;
    await runDistribute(contentResult.content, contentResult.topic);
  };

  const toggleCategory = (key: string) => {
    if (key === "all") {
      setSelectedCategories(["all"]);
    } else {
      const newCategories = selectedCategories.filter(c => c !== "all");
      if (newCategories.includes(key)) {
        const filtered = newCategories.filter(c => c !== key);
        setSelectedCategories(filtered.length ? filtered : ["all"]);
      } else {
        setSelectedCategories([...newCategories, key]);
      }
    }
  };

  const handleCopy = async (key: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePodcast = async () => {
    if (!checkAuth()) return;
    if (!contentResult?.content) return;

    setIsPodcastLoading(true);
    setPodcastResult(null);

    try {
      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: contentResult.topic,
          content: contentResult.content,
          podcastName,
          author: podcastAuthor,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPodcastResult(data);
      }
    } catch (error) {
      console.error("Podcast error:", error);
    } finally {
      setIsPodcastLoading(false);
    }
  };

  const handlePR = async () => {
    if (!checkAuth()) return;
    if (!contentResult?.content) return;

    setIsPRLoading(true);
    setPRResult(null);

    try {
      const response = await fetch("/api/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: contentResult.topic,
          content: contentResult.content,
          contactEmail,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPRResult(data);
      }
    } catch (error) {
      console.error("PR error:", error);
    } finally {
      setIsPRLoading(false);
    }
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
        return content.map((tweet, i) => `Tweet ${i + 1}:\n${tweet}`).join("\n\n---\n\n");
      }
      if (key === "seoKeywords") {
        return content.join(", ");
      }
      return content.join("\n");
    }
    if (typeof content === "object" && content !== null) {
      if (key === "headlines") {
        const h = content as { primary: string; alternatives: string[] };
        return `PRIMARY HEADLINE:\n${h.primary}\n\nALTERNATIVE HEADLINES:\n${h.alternatives?.map((a, i) => `${i + 1}. ${a}`).join("\n") || ""}`;
      }
      return JSON.stringify(content, null, 2);
    }
    return content || "";
  };

  const totalPlatforms = distributionCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="TownsHub" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">TownsHub</h1>
                <p className="text-xs text-slate-500">Marketing AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {authUser ? (
                <>
                  {userProfile && userProfile.generations_limit < 99999 && (
                    <span className="hidden sm:inline text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                      {userProfile.generations_used}/{userProfile.generations_limit} generations
                    </span>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                  >
                    Upgrade
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white font-medium hover:shadow-lg hover:shadow-brand-500/25 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            </div>
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
            Transform any topic into a complete content campaign. Generate articles, videos, podcasts, and more—then distribute across 300+ platforms instantly.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Content Formats", value: "16", icon: FileText },
            { label: "Platforms", value: `${totalPlatforms}+`, icon: Globe },
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

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "generate"
                ? "bg-gradient-to-r from-brand-500 to-accent-purple text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">Generate</span>
          </button>
          <button
            onClick={() => setActiveTab("distribute")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "distribute"
                ? "bg-gradient-to-r from-brand-500 to-accent-purple text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="hidden sm:inline">Distribute</span>
          </button>
          <button
            onClick={() => setActiveTab("podcast")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "podcast"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline">Podcast</span>
          </button>
          <button
            onClick={() => setActiveTab("pr")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "pr"
                ? "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="hidden sm:inline">Press Release</span>
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === "generate" && (
          <>
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

                {generateError && (
                  <p className="text-red-500 text-sm mt-3 text-center">{generateError}</p>
                )}
              </div>
            </div>

            {/* Results */}
            {contentResult && (
              <div className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    Generated Content — 16 Formats
                  </h3>
                  <button
                    onClick={() => setActiveTab("distribute")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg transition-all text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Distribute Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Type Tabs - Grouped by Category */}
                <div className="space-y-4 mb-6">
                  {["SEO", "Written", "Social", "Email", "Audio", "PR", "Visual", "Video"].map(category => {
                    const categoryTypes = contentTypes.filter(ct => ct.category === category && getContentDisplay(ct.key));
                    if (categoryTypes.length === 0) return null;

                    return (
                      <div key={category}>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{category}</div>
                        <div className="flex flex-wrap gap-2">
                          {categoryTypes.map((ct) => (
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
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Content Display */}
                {selectedContent && (
                  <div className="relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => handleCopy(selectedContent, getContentDisplay(selectedContent))}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedKey === selectedContent ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-50 rounded-2xl p-6 pr-14 overflow-auto max-h-[500px] text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
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
          </>
        )}

        {/* Distribute Tab */}
        {activeTab === "distribute" && (
          <div className="space-y-8">
            {/* Distribution Panel */}
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-500" />
                Multi-Channel Distribution
              </h3>
              <p className="text-slate-600 mb-6">
                Distribute your content across {totalPlatforms}+ platforms in 11 categories. Select categories below or distribute to all.
              </p>

              {!contentResult ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">No Content Generated Yet</h4>
                  <p className="text-slate-500 mb-4">Generate content first, then distribute it across 300+ platforms.</p>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="px-6 py-2 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
                  >
                    Go to Content Generator
                  </button>
                </div>
              ) : (
                <>
                  {/* Category Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-700">Select Distribution Channels</span>
                      <button
                        onClick={() => setSelectedCategories(["all"])}
                        className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                          selectedCategories.includes("all")
                            ? "bg-brand-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Select All ({totalPlatforms}+ platforms)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {distributionCategories.map((cat) => {
                        const isSelected = selectedCategories.includes("all") || selectedCategories.includes(cat.key);
                        return (
                          <button
                            key={cat.key}
                            onClick={() => toggleCategory(cat.key)}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-brand-500 bg-brand-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-brand-500" />
                            )}
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2`}>
                              <cat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="font-semibold text-slate-900 text-sm">{cat.label}</div>
                            <div className="text-xs text-slate-500">{cat.count} platforms</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Distribute Button */}
                  <button
                    onClick={handleDistribute}
                    disabled={isDistributing}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDistributing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Distribution Plan...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Create Distribution Plan
                      </>
                    )}
                  </button>
                  {distributionError && (
                    <p className="text-red-500 text-sm mt-3">{distributionError}</p>
                  )}
                </>
              )}
            </div>

            {/* Distribution Results */}
            {distributionResult && (
              <div className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Distribution Plan Ready
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-600">{distributionResult.totalPlatformsQueued}</div>
                    <div className="text-xs text-slate-500">platforms queued</div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {distributionCategories.map((cat) => {
                    const count = distributionResult.categoryCounts[cat.key as keyof typeof distributionResult.categoryCounts] || 0;
                    if (count === 0) return null;

                    return (
                      <div key={cat.key} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <cat.icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{count}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Platform List */}
                <div className="bg-slate-50 rounded-2xl p-4 max-h-96 overflow-auto">
                  <div className="text-sm font-medium text-slate-500 mb-3">Platforms ({distributionResult.platforms?.length || 0})</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {distributionResult.platforms?.slice(0, 50).map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{p.platform}</span>
                        <span className="text-xs text-slate-400 ml-auto">{p.contentType}</span>
                      </div>
                    ))}
                  </div>
                  {(distributionResult.platforms?.length || 0) > 50 && (
                    <p className="text-center text-sm text-slate-500 mt-4">
                      + {distributionResult.platforms!.length - 50} more platforms...
                    </p>
                  )}
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> This is a distribution plan. To publish content automatically, configure platform credentials in your n8n instance for each platform you want to automate.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Podcast Tab */}
        {activeTab === "podcast" && (
          <div className="space-y-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-500" />
                Podcast RSS Generator
              </h3>
              <p className="text-slate-600 mb-6">
                Generate podcast metadata and get submission links for 8+ major podcast directories.
              </p>

              {!contentResult ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                  <Mic className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">No Content Generated Yet</h4>
                  <p className="text-slate-500 mb-4">Generate content first to create podcast episodes.</p>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="px-6 py-2 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
                  >
                    Go to Content Generator
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Podcast Name</label>
                      <input
                        type="text"
                        value={podcastName}
                        onChange={(e) => setPodcastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Author Name</label>
                      <input
                        type="text"
                        value={podcastAuthor}
                        onChange={(e) => setPodcastAuthor(e.target.value)}
                        placeholder="Your name or company"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePodcast}
                    disabled={isPodcastLoading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPodcastLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Rss className="w-5 h-5" />
                        Generate Podcast Metadata
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {podcastResult && (
              <div className="glass rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Podcast Episode Ready
                </h3>

                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">{podcastResult.episode.title}</h4>
                  <p className="text-sm text-slate-600 mb-4">{podcastResult.episode.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>Feed: {podcastResult.feed.title}</span>
                    <span>Author: {podcastResult.feed.author}</span>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-900 mb-4">Submit to Podcast Directories</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {podcastResult.submitTo.map((dir, idx) => (
                    <a
                      key={idx}
                      href={dir.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <Mic className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">{dir.name}</span>
                    </a>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm text-purple-800">
                    <strong>Next Steps:</strong> {podcastResult.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PR Tab */}
        {activeTab === "pr" && (
          <div className="space-y-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-rose-500" />
                Press Release Distributor
              </h3>
              <p className="text-slate-600 mb-6">
                Format your press release and get distribution links for free and paid PR services.
              </p>

              {!contentResult ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">No Content Generated Yet</h4>
                  <p className="text-slate-500 mb-4">Generate content first to create press releases.</p>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="px-6 py-2 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
                  >
                    Go to Content Generator
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email (for press inquiries)</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="press@yourcompany.com"
                      className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                    />
                  </div>

                  <button
                    onClick={handlePR}
                    disabled={isPRLoading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPRLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Newspaper className="w-5 h-5" />
                        Prepare Press Release
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {prResult && (
              <div className="glass rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Press Release Ready
                </h3>

                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-slate-900 text-lg mb-2">{prResult.pressRelease.headline}</h4>
                  <p className="text-xs text-slate-500 mb-4">{prResult.pressRelease.date} | Contact: {prResult.pressRelease.contact}</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{prResult.pressRelease.body}</p>
                  <button
                    onClick={() => handleCopy("pr", `${prResult.pressRelease.headline}\n\n${prResult.pressRelease.date}\n\n${prResult.pressRelease.body}`)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-sm"
                  >
                    {copiedKey === "pr" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    Copy Press Release
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">FREE</span>
                      Free Distribution Services
                    </h4>
                    <div className="space-y-2">
                      {prResult.distribution.free.map((service, idx) => (
                        <a
                          key={idx}
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-slate-700">{service.name}</span>
                          <span className="text-xs text-emerald-600">{service.cost}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">PAID</span>
                      Premium Distribution Services
                    </h4>
                    <div className="space-y-2">
                      {prResult.distribution.paid.map((service, idx) => (
                        <a
                          key={idx}
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-slate-700">{service.name}</span>
                          <span className="text-xs text-amber-600">{service.cost}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-800">
                    <strong>Tip:</strong> {prResult.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Subscription Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowGate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {authUser && userProfile ? "Free generation used" : "Unlock TownsHub"}
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                {authUser && userProfile
                  ? "You've used your 1 free generation. Upgrade to keep creating content."
                  : "Generate content across 16 formats and distribute to 300+ platforms. Start free — no credit card needed."}
              </p>

              {/* Free plan highlight — only for guests */}
              {!authUser && (
                <Link
                  href="/register?plan=free"
                  onClick={() => setShowGate(false)}
                  className="block w-full mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-5 py-4 text-center transition-all shadow-lg shadow-emerald-500/20"
                >
                  <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-0.5">Try Free</div>
                  <div className="text-xl font-bold">$0 <span className="text-sm font-normal opacity-80">· 1 generation</span></div>
                  <div className="text-xs opacity-70 mt-0.5">No credit card required</div>
                </Link>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { name: "Starter", price: "$44", color: "from-slate-500 to-slate-600", popular: false },
                  { name: "Pro", price: "$119", color: "from-sky-500 to-cyan-500", popular: true },
                  { name: "Business", price: "$299", color: "from-violet-500 to-purple-600", popular: false },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`bg-gradient-to-br ${plan.color} rounded-2xl p-3 text-center text-white ${plan.popular ? "ring-2 ring-sky-400 scale-105" : ""}`}
                  >
                    <div className="text-xs font-medium opacity-80 mb-1">{plan.name}</div>
                    <div className="text-xl font-bold">{plan.price}</div>
                    <div className="text-xs opacity-70">/mo</div>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                onClick={() => setShowGate(false)}
                className="block w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all text-center"
              >
                View All Plans & Subscribe →
              </Link>
              {authUser && (
                <p className="text-xs text-slate-400 mt-4">
                  Signed in as {authUser.email} ·{" "}
                  <button onClick={() => setShowGate(false)} className="underline hover:text-slate-600">
                    dismiss
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
