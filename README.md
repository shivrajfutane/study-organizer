# 🌌 StudySpace — Personal Study Manager & Focus Workspace

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **StudySpace** is a unified, aesthetic, and production-grade personal study manager, learning roadmap tracker, and deep-work focus workspace. It combines curriculum tracking, multi-phase roadmaps, Pomodoro workflows, an offline procedural ambient sound synthesizer, synchronized YouTube study streams, markdown knowledge bases, and actionable analytics into a single responsive environment.

---

## 📸 Overview & Live Demo

- **Local Dev Server**: `http://localhost:5173/`
- **Demo Recording**: [`studyspace_app_demo_1791908154650.webp`](file:///C:/Users/geeta/.gemini/antigravity-ide/brain/14561bf2-44e2-4e63-ab6a-00037c10bea5/studyspace_app_demo_1791908154650.webp)
- **Zero-Config Instant Start**: StudySpace works right out of the box in offline guest mode with preloaded starter domains, courses, roadmaps, and sessions—no external database credentials required to test all features.

---

## 🌟 Key Features & Workspaces

StudySpace is organized into **13 deeply interconnected sections**, eliminating the need to jump between Notion, Spotify, Forest, and spreadsheets:

### 1. 🏠 Command Center Dashboard
- **Welcome Banner & Streak Counter**: Contextual greeting, motivational quote, daily study streak badge, and current active goal highlight.
- **Top Metrics Row**: 4 interactive metric cards displaying Total Study Hours, Mastered Topics, Active Roadmaps, and Completed Tasks.
- **Category Grid**: Visual cards for each active domain with direct progress meters and quick navigation.
- **Today's Action Plan**: Aggregated daily view showing scheduled tasks, priority topics, and due dates.
- **Embedded Mini-Widgets**: Direct Pomodoro controls, YouTube Lo-Fi stream player, roadmap overview, and active project snapshot.
- **7-Day Study Trend Chart**: Responsive Recharts bar chart showing daily focus hours for the past week.

### 2. 🗂️ Categories & Subcategories
- Hierarchical domain organization (e.g. *Computer Science* → *System Design*, *Cybersecurity* → *Network Defense*).
- Custom icons, color badges, and description metadata.
- **Safe Deletion Safeguard**: Category deletion modal prompts user to safely reassign existing courses and tasks to another domain or cascade delete.
- Tabbed detail view breaking down associated Subjects, Roadmaps, Tasks, Resources, and Notes.

### 3. 🗺️ Learning Roadmaps
- Milestone-based learning pathways with multi-phase curriculum tracking.
- Visual step progression bars, target completion dates, and status indicators (*Not Started*, *In Progress*, *Completed*).
- Phase expand/collapse with individual topic checklist items.

### 4. 📚 Subjects & Courses
- Nested subject tracking under specific categories.
- Topic mastery management: *Not Started*, *In Progress*, *Mastered*.
- **Accurate Mathematical Progress Calculation**: Evaluates $\frac{\text{Unique Completed Topics}}{\text{Total Unique Topics}} \times 100$ recursively across subcategories without double-counting duplicate references.
- Estimated vs. actual time tracking per subject.

### 5. 🗄️ Resource Library & File Storage
- Multi-format study material repository: PDF documents, web links, textbooks, cheat-sheets, and video links.
- Tags, category filters, and file size tracking.
- Client-side mock upload handler with Supabase Storage integration (`studyspace_resources` bucket).

### 6. 📋 Projects Board (Kanban)
- Project workflow board with drag/drop and stage management (*Planning*, *In Progress*, *Review*, *Completed*).
- Linked category attribution, GitHub repository URLs, and subtask progress indicators.

### 7. ⏱️ Tasks & Checklist
- High-performance task management with priorities (*Low*, *Medium*, *High*, *Urgent*).
- Categorization, estimated Pomodoros, due date alerts, and completion toggles.
- Micro-celebration animations powered by `canvas-confetti` upon task completion.

### 8. 🎯 Goals & Milestones
- High-level objectives with quantitative targets (e.g., "Complete AWS Solutions Architect Certification", "Finish 50 LeetCode Mediums").
- Target deadline countdown and auto-calculated progress percentage based on completed milestones.

### 9. 🎧 Focus Room (Deep Work Haven)
- **Authoritative Timestamp Timer**: Implements target epoch countdown (`targetEndTime = Date.now() + remainingMs`). Calculations remain mathematically exact across browser tab switching, background throttling, and page refreshes.
- **Procedural Web Audio API Synthesizer (100% Offline)**:
  - Generates realistic ambient noise without external MP3 dependencies:
    - 🌧️ *Gentle Rainfall* (filtered pink noise with droplet resonance)
    - 🌊 *Ocean Waves* (dual LFO low-pass modulated surf)
    - 🌲 *Forest Wind* (swept multi-pole bandpass noise)
    - 🔥 *Fireplace* (crackle transient generator with warm low-frequency roar)
    - 🧠 *432Hz Binaural Beats* (binaural sine generator for deep focus)
    - ⚪ *White Noise* & 🟤 *Brown Noise* (continuous power spectrum buffers)
  - Harmonic completion bell synthesized via pure sine wave additive harmonics.
  - Multi-track volume sliders for custom ambient soundscapes.
- **Integrated YouTube Study Player**: Curated lofi hip-hop and chill ambient music streams with full playback controls.
- **Full-Screen Zen Mode**: Hides all distracting UI elements for distraction-free study sessions.

### 10. 📅 Study Calendar
- Monthly study calendar displaying scheduled tasks, milestone deadlines, and logged study sessions.
- Visual heat indicators highlighting days with heavy study load.

### 11. 📊 In-Depth Analytics
- Weekly and monthly focus distribution by category.
- Study session history log with duration, subject tags, and completion rates.
- Productivity score and peak productivity time-of-day breakdown.

### 12. 📝 Markdown Knowledge Base & Notes
- Built-in Markdown note editor with real-time preview.
- Tagging, category linking, and automatic local-storage autosave.
- Quick search and filtering across note contents.

### 13. ⚙️ Settings & Data Portability
- Theme switcher (Dark Charcoal / Light Slate).
- Pomodoro duration defaults (Focus, Short Break, Long Break).
- **Full Data Export**: Single-click export of complete workspace to JSON or CSV.
- Local data reset with instant re-seeding option.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) (strict mode) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Charcoal Theme (`#0c0d12`) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **State & Async Cache** | [TanStack Query v5](https://tanstack.com/query) + Reactive Event-Driven Data Service |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Data Visualization** | [Recharts v3](https://recharts.org/) |
| **Audio Engine** | Web Audio API Procedural Synthesis + YouTube IFrame API |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL 15+, Row Level Security, Storage, Auth) |
| **Validation** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 1. Clone & Install
```bash
git clone https://github.com/your-username/studyspace.git
cd studyspace
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials (optional for local guest testing):
```env
# Supabase Project URL and Anon Public Key from project Settings -> API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-public-key-here

# Storage Bucket for resource documents (PDFs, images)
VITE_SUPABASE_STORAGE_BUCKET=studyspace_resources
```

> 💡 **Note**: If `VITE_SUPABASE_URL` is omitted or left as default, StudySpace automatically initializes in **Offline Guest Mode** using the reactive local data engine and preloaded seed data.

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized production bundle in the `dist/` directory.

---

## 🗄️ Supabase Database Setup

StudySpace includes complete, production-ready PostgreSQL migration scripts and seed datasets.

### Migration Files
- **Schema Migration**: [`supabase/migrations/20261013000000_studyspace_schema.sql`](file:///z:/Study%20Planner/supabase/migrations/20261013000000_studyspace_schema.sql)
  - Creates 19 relational tables with UUID primary keys, foreign keys, constraints, and performance indexes:
    - `profiles`, `categories`, `subjects`, `topics`, `roadmaps`, `roadmap_milestones`, `roadmap_topics`, `resources`, `resource_tags`, `projects`, `tasks`, `task_tags`, `goals`, `goal_milestones`, `study_sessions`, `flashcard_decks`, `flashcards`, `notes`, `youtube_streams`
  - Configures PostgreSQL Row Level Security (RLS) on all tables (`auth.uid() = user_id`).
  - Sets up automated updated-at triggers.
- **Seed Data**: [`supabase/seed.sql`](file:///z:/Study%20Planner/supabase/seed.sql)
  - Populates starter domains (Cybersecurity, Cloud Architecture, Full Stack Web Development, Data Structures, AI / Machine Learning, University Studies).
  - Populates initial roadmaps, subjects, sample tasks, resources, and curated YouTube study streams.

### Applying to Your Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open [`20261013000000_studyspace_schema.sql`](file:///z:/Study%20Planner/supabase/migrations/20261013000000_studyspace_schema.sql), paste the content into the editor, and click **Run**.
4. (Optional) Run [`seed.sql`](file:///z:/Study%20Planner/supabase/seed.sql) to populate initial data.
5. In **Storage**, create a new public bucket named `studyspace_resources`.

---

## 🚢 Production Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Framework Preset: **Vite**.
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET`
5. Click **Deploy**.
> StudySpace includes [`vercel.json`](file:///z:/Study%20Planner/vercel.json) pre-configured with SPA route rewrites to support direct URL navigation and deep-links.

### Deploying to Netlify
1. Import repository on [Netlify](https://netlify.com/).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Add environment variables in site configuration.
> StudySpace includes [`public/_redirects`](file:///z:/Study%20Planner/public/_redirects) for automatic single-page application route fallbacks.

---

## 📁 Project Structure

```text
Study Planner/
├── public/                       # Static public assets & icons
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── _redirects                # SPA redirect rules for static hosts
├── src/
│   ├── components/               # Modular UI components
│   │   ├── dashboard/            # Specialized dashboard widgets
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── MusicWidget.tsx
│   │   │   ├── PomodoroWidget.tsx
│   │   │   ├── ProjectsWidget.tsx
│   │   │   ├── RoadmapOverviewWidget.tsx
│   │   │   ├── StudyPlanWidget.tsx
│   │   │   └── TrendChartWidget.tsx
│   │   ├── layout/               # Header, Sidebar, CommandPalette, Modals
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── QuickAddModal.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                   # Reusable atomic components
│   │       ├── Badge.tsx
│   │       ├── CategoryIcon.tsx
│   │       ├── ConfirmationModal.tsx
│   │       └── ProgressBar.tsx
│   ├── context/                  # React Context providers
│   │   ├── AuthContext.tsx       # Supabase Auth & Guest session state
│   │   ├── SoundContext.tsx      # Ambient audio mixer & YouTube controls
│   │   ├── ThemeContext.tsx      # Dark/Light theme switching
│   │   └── TimerContext.tsx      # Authoritative Pomodoro countdown engine
│   ├── lib/
│   │   ├── audio-synth.ts        # Procedural Web Audio API sound generators
│   │   ├── supabase.ts           # Supabase client instantiation
│   │   └── utils.ts              # Class name merging & formatting utilities
│   ├── pages/                    # 13 Application views
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── CategoryDetailPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FocusPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── NotesPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── ResourcesPage.tsx
│   │   ├── RoadmapsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SubjectsPage.tsx
│   │   └── TasksPage.tsx
│   ├── services/
│   │   └── data-service.ts       # Unified reactive data store & calculations
│   ├── types/
│   │   └── index.ts              # Strict TypeScript interfaces for all 19 entities
│   ├── App.tsx                   # Top-level Router configuration
│   ├── index.css                 # Tailwind CSS v4 design tokens
│   └── main.tsx                  # React DOM mount point
├── supabase/
│   ├── migrations/               # PostgreSQL DDL migrations with RLS
│   └── seed.sql                  # Comprehensive starter dataset
├── vercel.json                   # Vercel SPA deployment rules
├── package.json                  # Dependencies and scripts
└── tsconfig.app.json             # TypeScript compiler settings
```

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Every single table in the database verifies that `auth.uid() = user_id`, guaranteeing cross-tenant isolation in multi-user deployments.
- **Zero Third-Party Audio Trackers**: The ambient sound mixer runs 100% locally on the device using the Web Audio API—no external audio streaming endpoints, cookies, or CDN trackers.
- **Client-Side Data Ownership**: StudySpace enables instantaneous complete export of all user data to standard JSON or CSV formats at any time.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
