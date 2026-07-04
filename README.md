# AI Scribe Notes Management Tool

This is a clinical notes management tool built as part of the Lime 1-Day Takehome challenge. It allows healthcare providers to create and review clinical notes for patients via free text or direct audio uploads. Notes are automatically transcribed and structured into a standard clinical **SOAP** (Subjective, Objective, Assessment, Plan) format using AI.

---

## 🏗️ Architecture & Core Decisions

The application is structured into a backend service, a frontend application, and a database layer orchestrating local file storage and optional cloud integration.

```
┌──────────────────────────────────────────────┐
│             Docker Compose                   │
│  ┌─────────────┐  ┌────────────┐  ┌───────┐ │
│  │  React App  │  │  NestJS    │  │  PG   │ │
│  │  (Vite)     │→ │  Backend   │→ │  DB   │ │
│  │  :3000      │  │  :3001     │  │ :5432 │ │
│  └─────────────┘  └────────────┘  └───────┘ │
│                        │                     │
│                 Gemini 1.5 API               │
│             (Transcription + SOAP)           │
└──────────────────────────────────────────────┘
```

### 1. Unified GraphQL API (Apollo)
Instead of REST endpoints, the application exposes a typed schema using code-first **GraphQL with Apollo Server 5**. 
- The entire application communicates through `/graphql`.
- Large audio uploads are streamed directly via the same endpoint using the `Upload` scalar (`graphql-upload`), avoiding out-of-band upload endpoints.
- Interstellar-fast schemas generated automatically from TypeScript decorators.

### 2. Native Multimodal AI (Gemini 1.5 Flash)
Rather than splitting transcription and summary across multiple services (e.g. Whisper + GPT), the backend uses **Gemini 1.5 Flash** via the Google Gen AI SDK:
- Audio uploads are sent directly to the Gemini File API.
- Gemini performs transcription and clinical SOAP structuring in a highly efficient sequence.
- Reduces network overhead, reduces latency, and simplifies backend dependencies.

### 3. Dynamic Storage Strategy (Local ⇄ AWS S3)
To maintain ease of local setup while preparing for a production cloud environment, the backend implements the **Strategy Pattern**:
- If `AWS_S3_BUCKET` and credentials are provided in `.env`, the system automatically selects `S3StorageService` and generates pre-signed URLs.
- Otherwise, it falls back to `LocalStorageService` to store files inside a local `uploads/` directory (mounted via Docker volume).
- Switches transparently without code changes.

### 4. API Security (IP-based Rate Limiting)
To protect both standard queries and costly AI endpoints:
- A global limit of **60 requests/minute** per IP is enforced via `@nestjs/throttler`.
- Important mutations (like `createNote` and `deleteNote`) have strict overrides restricted to **20 requests/minute** per IP.
- Read-only operations are optimized and bypass the throttler.

### 5. Developer Experience & Quality (Biome)
The codebase uses **Biome** to handle both linting and code formatting:
- Replaces Prettier, ESLint, and import sorters in a single rust-powered package.
- Formats and checks files in milliseconds.
- Run `yarn lint` inside any folder to check/format code.

---

## 🛠️ Tech Stack

*   **Backend**: NestJS, Apollo GraphQL v13 (Code-First), TypeORM, PostgreSQL, `@nestjs/throttler` (Rate limiter), Pino (JSON logging).
*   **Frontend**: React (Vite), React Router v6, React Query (`@tanstack/react-query`), Tailwind CSS, Material UI (MUI) v6, Biome.
*   **Testing**: Jest (Backend), Vitest + React Testing Library + MSW (Frontend).
*   **Deployment**: Docker Compose.

---

## 🚀 Quick Start (Docker Compose)

The easiest way to run the entire stack is using Docker Compose.

### 1. Set up Environment Variables
Copy `.env.example` at the root to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your `GEMINI_API_KEY` (Get a free key at [aistudio.google.com](https://aistudio.google.com)).

### 2. Spin up Services
Run the following command from the root directory:
```bash
docker compose up --build
```
This command starts:
- **PostgreSQL Database** at `localhost:5432` (with database health checks).
- **NestJS Backend** at `localhost:3001` (automatically seeds 3 mock patients on first run).
- **React Frontend** at `localhost:3000` (nginx-served single-page app proxying API calls).

---

## 💻 Local Manual Setup

If you prefer to run the applications locally without Docker:

### Prerequisites
*   Node.js >= 22
*   Yarn 1.22.x
*   PostgreSQL running locally

### 1. Install Dependencies
You can install dependencies for both the root helper, backend, and frontend at once:
```bash
yarn install-all
```
*(This command runs `yarn install` at the root, in `backend/`, and in `frontend/` separately).*

### 2. Configure Environment
1.  Configure `.env` in the root (ensure `DATABASE_HOST=localhost` and local PostgreSQL credentials match).
2.  Start the backend:
    ```bash
    yarn dev:backend
    ```
3.  Start the frontend:
    ```bash
    yarn dev:frontend
    ```

---

## 🧪 Running Tests

Unit tests are provided for both projects.

To run all backend (Jest) and frontend (Vitest) tests together from the root:
```bash
yarn test
```

### Run Backend Tests only
```bash
cd backend
yarn test
# To view coverage
yarn test:cov
```

### Run Frontend Tests only
```bash
cd frontend
yarn test
# To view coverage
yarn test:coverage
```

---

## ⚙️ Environment Variables Config

| Name | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_HOST` | `localhost` | Database host (use `postgres` for Docker) |
| `DATABASE_PORT` | `5432` | Database port |
| `DATABASE_USER` | `postgres` | Database username |
| `DATABASE_PASSWORD` | `postgres` | Database password |
| `DATABASE_NAME` | `scribe_db` | Database schema name |
| `GEMINI_API_KEY` | *(Required)* | Gemini API Key for audio and text processing |
| `PORT` | `3001` | Backend port |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed origin for CORS requests |
| `AWS_S3_BUCKET` | *(Optional)* | AWS S3 Bucket Name for audio storage |
| `AWS_ACCESS_KEY_ID` | *(Optional)* | AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY`| *(Optional)* | AWS Secret Access Key |
| `AWS_REGION` | `us-east-1` | AWS Region |

> [!TIP]
> **AWS S3 Switch**: If `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` are all filled, the backend starts saving recordings to S3 immediately. If any are blank, files save locally in the backend's `./uploads/` directory.

---

## 📁 Key Files & Modules

- **Patients Module** (`backend/src/patients`): Handles query resolvers and services for retrieving seeded patients.
- **Notes Module** (`backend/src/notes`): Holds the GraphQL mutation for note creation, handles multipart data streams, and schedules AI workflows.
- **AI Module** (`backend/src/ai`): Communicates with the Google Gen AI API (Whisper alternative and SOAP structuring prompts).
- **Storage Module** (`backend/src/storage`): Custom Factory that returns either Local or S3 upload behaviors dynamically based on `.env` configuration.
- **Database Seeder** (`backend/src/database/seed.service.ts`): Populates 3 mock patients (Alice Johnson, Robert Chen, Maria Garcia) on application startup.
- **REST Health** (`backend/src/health/health.controller.ts`): Separate REST controller mapping `/health` (exempt from GraphQL rules, used by AWS ALB/ECS health checks).