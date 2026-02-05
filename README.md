# TownsHub Marketing AI

AI-powered content amplification platform that generates and distributes content across 300+ platforms.

## Features

- **16 Content Formats**: Headlines, articles, blog posts, social media (LinkedIn, Twitter, Facebook, Instagram), newsletters, podcast scripts, press releases, infographics, video scripts, and more
- **300+ Distribution Platforms**: Social media, blogs, video platforms, podcast directories, news & PR, email marketing, and more
- **AI Chat Assistant**: Conversational interface for content strategy and ideation
- **One-Click Generation**: Enter a topic and get a complete content campaign

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: n8n workflows (webhook-triggered)
- **AI**: OpenAI GPT-4o

## Getting Started

### Prerequisites

- Node.js 18+ installed
- n8n workflows running (TownsHub Content Engine, Chat Agent, Distributor)

### Installation

```bash
# Navigate to the project
cd townshub-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook
```

## n8n Workflows

This app connects to three n8n workflows:

| Workflow | Webhook | Purpose |
|----------|---------|---------|
| Content Engine | `/townshub-content` | Generate 16 content formats |
| Chat Agent | `/townshub-chat` | Conversational AI assistant |
| Distributor | `/townshub-distribute` | 300+ platform distribution |

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variable `N8N_WEBHOOK_BASE_URL`
4. Deploy

## API Routes

- `POST /api/content` - Generate content campaign
- `POST /api/chat` - Chat with AI assistant
- `POST /api/distribute` - Create distribution plan

## License

MIT
