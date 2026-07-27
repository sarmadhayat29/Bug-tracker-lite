# 🐛 Bug Tracker Lite

A cross-platform bug reporting application with a unified Supabase backend powering four separate frontends.

## 📦 Platforms

| Platform | Stack | Location |
|---|---|---|
| **Web App** | Next.js 14, React, Tailwind CSS | `apps/web` |
| **Chrome Extension** | TypeScript, Manifest V3 | `apps/extension` |
| **Mobile App** | Expo / React Native | `apps/android` |
| **Desktop App** | Tauri (wraps web) | `apps/desktop` |

## 🏗️ Architecture

```
bug-tracker-lite/
├── apps/
│   ├── web/          # Next.js web application
│   ├── extension/    # Chrome extension (Manifest V3)
│   ├── android/      # Expo React Native app
│   └── desktop/      # Tauri desktop shell
├── packages/
│   └── shared/       # Shared types, Supabase helpers, data models
└── supabase_schema.sql # Supabase DB schema
```

All platforms share a single Supabase project and the same Postgres data model defined in `packages/shared`.

## 🔥 Supabase Services Used

- **Authentication** — Email/Password
- **Database** — Postgres (Bug reports, activity logs, user profiles)
- **Storage** — Screenshot uploads
- **Realtime** — Subscribing to bug changes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase project with Auth, Postgres Database, and Storage enabled

### 1. Clone the repo

```bash
git clone https://github.com/sarmadhayat29/Bug-tracker-lite.git
cd Bug-tracker-lite
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the web app

```bash
pnpm --filter @bug-tracker/web dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Other Platforms

### Chrome Extension

```bash
cd apps/extension
pnpm install
pnpm build
```
Load `apps/extension/dist` as an unpacked extension in Chrome.

### Mobile App (Expo)

```bash
cd apps/android
pnpm install
pnpm start
```

### Desktop App (Tauri)

Requires [Rust](https://rustup.rs/) installed.

```bash
pnpm --filter @bug-tracker/web build
pnpm --filter @bug-tracker/desktop build
```

## 📐 Data Model

### `bugs` table

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Unique bug ID |
| `title` | text | Bug title |
| `description` | text | Detailed description |
| `severity` | text | Severity level |
| `status` | text | Current status |
| `createdBy` | uuid | User ID |
| `screenshotUrl` | text \| null | Supabase Storage URL |
| `pageUrl` | text \| null | URL where bug was captured |
| `platform` | text | Reporting platform |
| `createdAt` | timestamp | Creation time |
| `updatedAt` | timestamp | Last update time |

## 🔒 Security

- Row Level Security (RLS) policies enforce owner-based access control
- Storage policies restrict uploads to authenticated users
- CSP enforced in the Tauri desktop wrapper
- `.env.local` is gitignored — never commit real API keys

## 🛠️ Tech Stack

- **Monorepo**: pnpm workspaces
- **Web**: Next.js 14, React 18, Tailwind CSS
- **Mobile**: Expo SDK, React Native
- **Desktop**: Tauri v2
- **Extension**: TypeScript, Manifest V3
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Language**: TypeScript throughout
