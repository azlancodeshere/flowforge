# FlowForge Backend API

The Express 5 REST API service powering FlowForge's authentication, user state, and workflow operations.

---

## 🛠 Tech Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript (ES2022 / NodeNext)
- **Framework**: Express 5.3
- **Database**: MongoDB with Mongoose 9
- **Validation**: Zod
- **Auth**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Development Engine**: `tsx watch`

---

## 📁 Directory Structure

```text
backend/
├── db/
│   └── db.ts                # Database connection lifecycle
├── dist/                    # Compiled JavaScript build artifacts
├── src/
│   ├── config/              # Centralized environment variable loader
│   ├── controllers/         # Request handling & database operations
│   ├── middlewares/         # Auth verification & Zod request validation
│   ├── models/              # Mongoose data models (User)
│   ├── routes/              # Route definitions & router chaining
│   ├── types/               # Type augmentations (Express.Request)
│   ├── utils/               # ApiError & ApiResponse helpers
│   └── validators/          # Zod schema definitions
├── .env.example             # Environment configuration template
├── Dockerfile               # Container build configuration
├── package.json             # Service dependencies and scripts
├── server.ts                # Application bootstrap entrypoint
└── tsconfig.json            # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### 1. Environment Setup

```bash
cp .env.example .env
```

Ensure the following keys are provided:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/flowforge
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret_key_min_32_characters
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret_key_min_32_characters
REFRESH_TOKEN_EXPIRY=7d
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 📡 Endpoints Overview

| Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/user/register` | No | Register new user account |
| `POST` | `/api/user/login` | No | Login user and issue cookies |
| `POST` | `/api/user/logout` | Yes | Clear tokens and logout |
| `GET` | `/api/user/me` | Yes | Get authenticated user profile |
| `PATCH` | `/api/user/update` | Yes | Update profile fields |
| `POST` | `/api/user/refresh-token` | No | Refresh expired access token |
