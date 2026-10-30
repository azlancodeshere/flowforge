# FlowForge Frontend Web Client

The modern Next.js 16 web application for FlowForge, built with React 19, Tailwind CSS v4, and `@xyflow/react`.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Canvas / Nodes**: `@xyflow/react` (React Flow)
- **Icons**: `lucide-react`
- **HTTP Client**: Axios with credentials enabled
- **State Management**: React Context (`AuthContext`)

---

## 📁 Directory Structure

```text
frontend/
├── app/
│   ├── components/          # Reusable UI components (Navbar)
│   ├── context/             # Authentication state context (AuthContext)
│   ├── login/               # User login view
│   ├── register/            # User onboarding view
│   ├── favicon.ico
│   ├── globals.css          # Tailwind CSS v4 directives
│   ├── layout.tsx           # Global HTML shell & providers
│   └── page.tsx             # Landing hero and features
├── lib/
│   └── api.ts               # Configured Axios instance with baseURL
├── public/                  # Static assets and media
├── .env.example             # Frontend environment template
├── Dockerfile               # Container build configuration
├── eslint.config.mjs        # Next.js 16 Flat ESLint configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.mjs       # PostCSS configuration for Tailwind v4
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Environment Configuration

```bash
cp .env.example .env.local
```

Set the backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Linting & Quality Checks

```bash
npm run lint
```

### 4. Build for Production

```bash
npm run build
npm start
```
