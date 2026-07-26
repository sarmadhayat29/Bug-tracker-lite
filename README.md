# 🐛 Bug Tracker Lite

A cross-platform bug reporting application with a unified Firebase backend powering four separate frontends.

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
│   └── shared/       # Shared types, Firebase helpers, data models
├── firestore.rules   # Firestore security rules
├── storage.rules     # Firebase Storage rules
└── firestore.indexes.json
```

All platforms share a single Firebase project and the same Firestore data model defined in `packages/shared`.

## 🔥 Firebase Services Used

- **Authentication** — Email/Password
- **Firestore** — Bug reports, activity logs, user profiles
- **Storage** — Screenshot uploads

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase project with Auth, Firestore, and Storage enabled

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

Copy the example file and fill in your Firebase credentials:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the web app

```bash
pnpm --filter @bug-tracker/web dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy Firebase rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

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

### `bugs` collection

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique bug ID |
| `title` | string | Bug title |
| `description` | string | Detailed description |
| `severity` | `low` \| `medium` \| `high` \| `critical` | Severity level |
| `status` | `open` \| `in_progress` \| `resolved` | Current status |
| `createdBy` | string | User UID |
| `screenshotUrl` | string \| null | Firebase Storage URL |
| `pageUrl` | string \| null | URL where bug was captured |
| `platform` | `web` \| `extension` \| `android` | Reporting platform |
| `createdAt` | number | Unix timestamp |
| `updatedAt` | number | Unix timestamp |

## 🔒 Security

- Firestore rules enforce owner-based access control
- Storage rules restrict uploads to authenticated users
- CSP enforced in the Tauri desktop wrapper
- `.env.local` is gitignored — never commit real API keys

## 🛠️ Tech Stack

- **Monorepo**: pnpm workspaces
- **Web**: Next.js 14, React 18, Tailwind CSS
- **Mobile**: Expo SDK, React Native
- **Desktop**: Tauri v2
- **Extension**: TypeScript, Manifest V3
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript throughout
