# TownsHub Marketing AI

AI-powered content amplification platform that generates and distributes content across 300+ platforms.

## Features

- **16 Content Formats**: Headlines, articles, blog posts, social media (LinkedIn, Twitter, Facebook, Instagram), newsletters, podcast scripts, press releases, infographics, video scripts, flipbooks, and more
- **300+ Distribution Platforms**: Social media, blogs, video platforms, podcast directories, news & PR, email marketing, and more
- **AI Chat Assistant**: Conversational interface for content strategy and ideation
- **Podcast RSS Generator**: Create podcast metadata and submit to 8+ directories
- **Press Release Distributor**: Format and distribute to free and paid PR services
- **One-Click Generation**: Enter a topic and get a complete content campaign

## Content Engine Architecture

The Content Engine uses 7 parallel AI agents to generate high-quality, humanized content:

| Agent | Model | Formats | Output |
|-------|-------|---------|--------|
| Article Agent | GPT-4o | Feature article | 1300-1500 words |
| Blog Post Agent | GPT-4o | Personal blog post | 1300-1500 words |
| Social Media Agent | GPT-4o | LinkedIn, Twitter, Facebook, Instagram | 400-600 words |
| Podcast Agent | GPT-4o | Podcast script | 800-1000 words |
| Video Scripts Agent | GPT-4o | Long video + short video scripts | 700-900 words |
| Marketing Content | GPT-4o | Newsletter, press release, infographic, flipbook | 1200-1500 words |
| SEO Agent | GPT-4o | Headlines, SEO keywords, meta description | Structured data |

**Total output**: ~6,000-7,000 words per generation across all 16 formats.

### Content Quality Features

- **Humanized writing**: 40+ AI cliche words banned and auto-replaced
- **Differentiated content**: Article (third-person journalism) vs Blog Post (first-person personal essay)
- **Structured sections**: Each piece follows specific paragraph and sentence count requirements
- **Post-processing**: Regex-based banned word replacement ensures natural language

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: n8n workflows (webhook-triggered)
- **AI**: OpenAI GPT-4o (7 parallel agents)
- **Deployment**: GitHub + Vercel (auto-sync)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- n8n workflows running (TownsHub Content Engine, Chat Agent, Distributor)

### Installation

```bash
cd townshub-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook
```

## n8n Workflows

This app connects to n8n workflows via webhooks:

| Workflow | Webhook | Purpose |
|----------|---------|---------|
| Content Engine | `/townshub-content` | Generate 16 content formats (7 parallel AI agents) |
| Chat Agent | `/townshub-chat` | Conversational AI assistant |
| Distributor | `/townshub-distribute` | 300+ platform distribution plan |
| Podcast RSS | `/townshub-podcast` | Podcast metadata and directory links |
| PR Distribution | `/townshub-pr` | Press release formatting and distribution |

## Deployment

### Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variable `N8N_WEBHOOK_BASE_URL`
4. Deploy

**Note**: The Content Engine takes 2-3 minutes to generate all 16 formats. Vercel Pro plan is recommended for the 300s function timeout.

## API Routes

- `POST /api/content` - Generate 16-format content campaign
- `POST /api/chat` - Chat with AI assistant
- `POST /api/distribute` - Create distribution plan
- `POST /api/podcast` - Generate podcast metadata
- `POST /api/pr` - Prepare press release distribution

## License

MIT
