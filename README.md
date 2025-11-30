# Personal CRM - Relationship Management App

A modern, people-centric personal CRM application designed to help busy professionals maintain meaningful relationships. Built with a focus on simplicity, speed, and thoughtful interactions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)

## 🎯 Overview

This application serves as a personal relationship manager, similar in purpose to tools like [Dex](https://getdex.com). It helps users:

- **Track connections** with rich context (how you met, shared interests, important dates)
- **Set follow-up reminders** with customizable cadences
- **Log interactions** via voice notes with AI-powered transcription
- **Get AI-generated activity suggestions** based on shared interests
- **Manage todos** associated with specific connections
- **Receive smart follow-up message drafts** powered by AI

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev) | 18.3 | UI library |
| [TypeScript](https://www.typescriptlang.org) | 5.x | Type safety |
| [Vite](https://vitejs.dev) | 5.x | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Latest | Component library (Radix-based) |
| [React Router](https://reactrouter.com) | 6.30 | Client-side routing |
| [TanStack Query](https://tanstack.com/query) | 5.83 | Server state management |
| [React Hook Form](https://react-hook-form.com) | 7.61 | Form handling |
| [Zod](https://zod.dev) | 3.25 | Schema validation |
| [Framer Motion](https://www.framer.com/motion) | - | Animations (via Tailwind) |
| [Lucide React](https://lucide.dev) | 0.462 | Icon library |
| [date-fns](https://date-fns.org) | 3.6 | Date manipulation |
| [Recharts](https://recharts.org) | 2.15 | Data visualization |
| [Sonner](https://sonner.emilkowal.ski) | 1.7 | Toast notifications |

### Backend (Lovable Cloud / Supabase)

| Service | Purpose |
|---------|---------|
| **PostgreSQL Database** | Primary data store |
| **Row Level Security (RLS)** | Data access control |
| **Edge Functions (Deno)** | Serverless backend logic |
| **Storage Buckets** | File storage (connection photos) |
| **Authentication** | User auth with email/password |
| **Realtime** | Live data subscriptions (available) |

### AI & Machine Learning

| Service | Model | Purpose |
|---------|-------|---------|
| **Lovable AI Gateway** | `google/gemini-2.5-flash` | Activity suggestions, follow-up messages, voice note extraction |
| **ElevenLabs** | Speech-to-Text API | Voice note transcription |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components      │  Hooks                  │
│  - Index        │  - ConnectionCard│  - useConnections       │
│  - ConnectionDetail │ - Header     │  - useAuth              │
│  - FollowUps    │  - Navigation    │  - useFollowUps         │
│  - Suggestions  │  - GlobalSearch  │  - useActivitySuggestions│
│  - Todos        │  - RecordingModal│  - useVoiceRecorder     │
│  - Settings     │  - EmptyState    │  - useTodos             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Client SDK                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Lovable Cloud (Supabase)                   │
├─────────────────────────────────────────────────────────────┤
│  Database Tables        │  Edge Functions                    │
│  - profiles             │  - process-voice-note              │
│  - connections          │  - generate-activity-suggestions   │
│  - todos                │  - generate-followup-messages      │
│  - suggestions          │                                    │
│  - notifications        │  Storage Buckets                   │
│  - activity_suggestions │  - connection-photos               │
└─────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    External AI Services                      │
├─────────────────────────────────────────────────────────────┤
│  Lovable AI Gateway          │  ElevenLabs                   │
│  (google/gemini-2.5-flash)   │  (Speech-to-Text)             │
│  - Structured data extraction│  - Audio transcription        │
│  - Activity suggestions      │                               │
│  - Follow-up message drafts  │                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Core Tables

#### `profiles`
Stores user profile information and preferences.
- `id` (UUID, PK) - References auth.users
- `full_name`, `email`, `avatar_url`
- `interests`, `industries`, `topics` (arrays)
- `default_follow_up_frequency`, `default_view`
- Social links: `linkedin_url`, `twitter_url`, `website_url`

#### `connections`
The central table for storing contact information.
- `id` (UUID, PK)
- `user_id` (UUID, FK) - Owner of the connection
- `name`, `email`, `phone`, `location`
- `company`, `profession_or_role`
- `tags` (array), `relationship_type`
- `warmth_level`, `priority`, `is_favorite`
- `follow_up_enabled`, `follow_up_frequency`, `next_follow_up_at`
- `how_we_met`, `how_i_can_help`, `how_they_can_help`
- `important_facts` (array), `additional_notes`
- Social links and metadata

#### `todos`
Tasks associated with specific connections.
- `id`, `user_id`, `connection_id`
- `text`, `is_completed`, `completed_at`

#### `suggestions`
AI-generated suggestions for connections.
- `id`, `user_id`, `connection_id`
- `type`, `text`, `url`
- `is_completed`, `completed_at`

#### `activity_suggestions`
AI-generated activity ideas based on shared interests.
- `id`, `user_id`, `connection_id`
- `title`, `description`, `emoji`
- `shared_interest`, `connection_name`
- `expires_at`, `is_dismissed`

#### `notifications`
System notifications for reminders and updates.
- `id`, `user_id`, `connection_id`
- `type`, `title`, `message`
- `is_read`, `is_dismissed`, `action_url`

---

## 🤖 AI Features

### 1. Voice Note Processing
**Edge Function:** `process-voice-note`

Records or uploads audio → Transcribes via ElevenLabs → Extracts structured data via Lovable AI

**Extracted Data:**
- Contact name, email, phone, company, role
- Location, how you met, relationship type
- Tags, important facts, interests
- Todos and suggestions

### 2. Activity Suggestions
**Edge Function:** `generate-activity-suggestions`

Analyzes user interests + connection tags → Generates personalized activity ideas

**Features:**
- Identifies shared interests between user and connections
- Generates 3 actionable suggestions with emojis
- 24-hour expiration with refresh countdown
- Dismissible cards

### 3. Follow-up Message Generation
**Edge Function:** `generate-followup-messages`

Analyzes connection context + pending todos → Generates 3 message variants

**Message Types:**
- Professional/formal tone
- Interest-based (shared hobbies/topics)
- Casual/friendly tone

---

## 🎨 Design System

### Color Palette (HSL)

```css
/* Primary - Warm Indigo */
--primary: 245 58% 51%
--primary-foreground: 0 0% 100%

/* Backgrounds */
--background: 220 20% 97%
--card: 0 0% 100%
--muted: 220 14% 96%

/* Semantic Colors */
--destructive: 0 84% 60%
--success: 142 76% 36%
--warning: 38 92% 50%
```

### Typography
- **Font Family:** Inter (system fallback)
- **Headings:** Semi-bold to bold, tight tracking
- **Body:** Regular weight, relaxed line-height

### Components (shadcn/ui)
- Button (variants: default, secondary, outline, ghost, soft, hero)
- Card, Dialog, Sheet, Popover
- Input, Textarea, Select, Checkbox
- Avatar, Badge, Tooltip
- Tabs, Accordion, Collapsible

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # App shell, page layouts
│   ├── connections/           # Connection-specific components
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── GlobalSearch.tsx
│   ├── ConnectionCard.tsx
│   ├── RecordingModal.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useConnections.ts
│   ├── useFollowUps.ts
│   ├── useTodos.ts
│   ├── useActivitySuggestions.ts
│   ├── useVoiceRecorder.ts
│   └── ...
├── pages/
│   ├── Index.tsx              # Main connections list
│   ├── ConnectionDetail.tsx   # Single connection view
│   ├── FollowUps.tsx
│   ├── Suggestions.tsx
│   ├── Todos.tsx
│   ├── Settings.tsx
│   └── Auth pages...
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client (auto-generated)
│       └── types.ts           # Database types (auto-generated)
├── lib/
│   ├── utils.ts               # Utility functions
│   └── commonGround.ts        # Interest matching logic
├── types/
│   ├── connection.ts
│   ├── notification.ts
│   └── ...
└── main.tsx

supabase/
├── config.toml                # Supabase configuration
├── functions/
│   ├── process-voice-note/
│   ├── generate-activity-suggestions/
│   └── generate-followup-messages/
└── migrations/                # Database migrations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Lovable account (for cloud backend)

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

The following environment variables are auto-configured by Lovable Cloud:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

### Edge Function Secrets

| Secret | Purpose |
|--------|---------|
| `LOVABLE_API_KEY` | AI Gateway authentication (auto-provisioned) |
| `ELEVENLABS_API_KEY` | Speech-to-text transcription |

---

## 🔒 Security

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view their own connections"
ON public.connections
FOR SELECT
USING (auth.uid() = user_id);
```

### Authentication
- Email/password authentication via Supabase Auth
- Auto-confirm enabled for development
- Protected routes via `ProtectedRoute` component

---

## 📱 Features by Page

| Page | Features |
|------|----------|
| **Connections** | List/grid/table views, search, filters, sorting, favorites |
| **Connection Detail** | Full profile, timeline, todos, suggestions, follow-up settings |
| **Follow-ups** | Due/overdue reminders, quick actions, cadence management |
| **Suggestions** | AI activity ideas, connection suggestions |
| **Todos** | Global todo list across all connections |
| **Settings** | Profile, preferences, integrations |

---

## 🧪 Development

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting (via editor)

### Key Patterns
- **Custom hooks** for data fetching and state management
- **TanStack Query** for server state with optimistic updates
- **Zod schemas** for form validation
- **Compound components** for complex UI patterns

---

## 📄 License

This project is built with [Lovable](https://lovable.dev).

---

## 🔗 Links

- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
