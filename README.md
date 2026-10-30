<div align="center">

# ⚡ FlowForge

**A modern, production-grade visual workflow automation platform.**  
Build, connect, and automate complex tasks with a high-performance node-based canvas and secure authentication.

[![CI Pipeline](https://github.com/azlancodeshere/flowforge/actions/workflows/ci.yml/badge.svg)](https://github.com/azlancodeshere/flowforge/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
  - [1. Clone & Install](#1-clone--install)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Start Development Server](#3-start-development-server)
- [Docker Deployment](#-docker-deployment)
- [Available Scripts](#-available-scripts)
- [REST API Reference](#-rest-api-reference)
- [Security & Authentication](#-security--authentication)
- [Engineering Standards & CI/CD](#-engineering-standards--cicd)

---

## 🚀 Overview

**FlowForge** is a full-stack workflow automation platform designed for building interactive, node-based automation pipelines. It features:

- **Interactive Canvas UI**: Drag-and-drop workflow authoring with smart conditions, automated triggers, and execution steps powered by `@xyflow/react`.
- **Stateless & Secure Authentication**: Dual-token architecture (Access + Refresh Tokens) issued via secure HTTP-only cookies with cryptographic verification.
- **Robust API Gateway**: Express 5 REST API built with TypeScript, strict schema validation powered by Zod, and centralized error handling.
- **Modern Monorepo Tooling**: Unified npm workspace orchestration, containerization with Docker Compose, and automated CI pipelines.

---

## 🛠 Architecture & Tech Stack

```mermaid
graph TD
    Client["Next.js 16 Web Client<br/>(React 19, Tailwind CSS v4, XYFlow)"]
    API["Express 5 REST API<br/>(TypeScript, Zod, JWT)"]
    DB[("MongoDB<br/>(Mongoose ODM)")]

    Client -->|HTTP / Credentials (Cookies)| API
    API -->|Mongoose Queries| DB
```

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack, Partial Prerendering)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React
- **Canvas Engine**: `@xyflow/react` (React Flow)
- **State & Networking**: React Context API (`AuthContext`), Axios with credentials support

### Backend
- **Runtime**: Node.js 20+ with TypeScript & `tsx`
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, `cookie-parser`
- **Validation**: Zod schema validation middleware

---

## 📂 Repository Structure

```text
flowforge/
├── .github/
│   ├── workflows/
│   │   └── ci.yml               # Automated CI (lint, typecheck, build)
│   ├── ISSUE_TEMPLATE/          # Standard bug report & feature request templates
│   └── PULL_REQUEST_TEMPLATE.md # Standard PR checklist & summary
├── .vscode/                     # Recommended editor settings & extensions
├── backend/                     # Express REST API service
│   ├── db/                      # Database connection setup
│   ├── src/
│   │   ├── config/              # Centralized environment configuration
│   │   ├── controllers/         # Request handling & business controllers
│   │   ├── middlewares/         # JWT auth & Zod request validation
│   │   ├── models/              # Mongoose data schemas (User)
│   │   ├── routes/              # Express API route declarations
│   │   ├── types/               # TypeScript type extensions
│   │   ├── utils/               # ApiError & ApiResponse helpers
│   │   └── validators/          # Zod input schemas
│   ├── .env.example             # Backend environment template
│   ├── Dockerfile               # Production container definition
│   ├── package.json
│   ├── server.ts                # Application entrypoint
│   └── tsconfig.json
├── frontend/                    # Next.js 16 Web Application
│   ├── app/                     # App Router pages & layouts
│   │   ├── components/          # Reusable UI components (Navbar, etc.)
│   │   ├── context/             # React Context providers (AuthContext)
│   │   ├── login/               # Authentication sign-in page
│   │   ├── register/            # User onboarding registration page
│   │   ├── globals.css          # Tailwind CSS v4 entrypoint
│   │   └── layout.tsx           # Root application shell
│   ├── lib/                     # Axios API client instance
│   ├── .env.example             # Frontend environment template
│   ├── Dockerfile               # Production container definition
│   ├── package.json
│   └── tsconfig.json
├── .dockerignore
├── .editorconfig                # Multi-IDE formatting standards
├── .gitignore                   # Monorepo-wide git exclusion rules
├── .prettierrc                  # Prettier formatting rules
├── docker-compose.yml           # Multi-container local orchestration
├── package.json                 # Monorepo root scripts & workspaces
└── README.md                    # Project documentation
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have:

- **Node.js**: v20.x or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v10.x or higher
- **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- **Docker & Docker Compose** *(optional, for containerized run)*

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/azlancodeshere/flowforge.git
cd flowforge

# Install monorepo dependencies across root, backend, and frontend
npm install
```

### 2. Environment Configuration

Copy the template environment files into active configuration:

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env.local
```

Update `backend/.env` with your MongoDB connection string and secure JWT secrets:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/flowforge
ACCESS_TOKEN_SECRET=your_super_secret_access_key_min_32_chars
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_min_32_chars
REFRESH_TOKEN_EXPIRY=7d
```

### 3. Start Development Server

Run both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health / Base**: [http://localhost:5000/api/user](http://localhost:5000/api/user)

Alternatively, run services individually:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

---

## 🐳 Docker Deployment

To spin up the entire ecosystem (MongoDB + Backend + Frontend) using Docker Compose:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

---

## 📜 Available Scripts

| Command | Scope | Description |
| :--- | :--- | :--- |
| `npm run dev` | Monorepo | Concurrently starts backend and frontend development servers |
| `npm run dev:backend` | Backend | Starts Express API with `tsx watch` hot-reloading |
| `npm run dev:frontend` | Frontend | Starts Next.js development server with Turbopack |
| `npm run build` | Monorepo | Compiles backend TypeScript and builds Next.js production bundle |
| `npm run build:backend` | Backend | Compiles TypeScript into `dist/` |
| `npm run build:frontend` | Frontend | Creates optimized production build of Next.js app |
| `npm run lint` | Frontend | Runs ESLint analysis across the frontend codebase |
| `npm run typecheck` | Backend | Executes TypeScript typecheck without emitting output files |

---

## 📡 REST API Reference

All backend endpoints are prefixed with `/api/user`.

### Authentication & User Management

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/user/register` | No | `{ username, email, password }` | Registers a new user and sets auth cookies |
| `POST` | `/api/user/login` | No | `{ email?, username?, password }` | Authenticates credentials and sets auth cookies |
| `POST` | `/api/user/logout` | **Yes** | None | Invalidates refresh token and clears auth cookies |
| `POST` | `/api/user/refresh-token` | No | `{ refreshToken? }` (or cookie) | Rotates and issues a new access token |
| `GET` | `/api/user/me` | **Yes** | None | Returns profile details of the authenticated user |
| `PATCH` | `/api/user/update` | **Yes** | `{ username?, email? }` | Updates username or email for current user |

### Standard Response Envelope

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "User logged in successfully",
  "success": true
}
```

### Standard Error Envelope

```json
{
  "statusCode": 401,
  "message": "Invalid email/username or password",
  "success": false
}
```

---

## 🔒 Security & Authentication

- **HttpOnly Cookies**: JWT tokens are transmitted via `httpOnly` and `sameSite` cookies, protecting against Cross-Site Scripting (XSS).
- **Password Salting & Hashing**: Passwords are securely hashed with `bcryptjs` using 10 salt rounds before persistence.
- **Dual-Token Lifecycle**: Short-lived Access Tokens for resource requests paired with long-lived Refresh Tokens stored in the database for secure rotation.
- **Schema Validation**: Every incoming request payload is validated by Zod schemas before hitting business logic controllers.

---

## 🛡 Engineering Standards & CI/CD

- **Strict Type Safety**: TypeScript enabled across both client and server tiers.
- **Automated Quality Gate**: GitHub Actions runs on all commits and PRs to `main`, ensuring zero lint warnings and successful builds.
- **Code Style Consistency**: Enforced via `.editorconfig` and `.prettierrc`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
