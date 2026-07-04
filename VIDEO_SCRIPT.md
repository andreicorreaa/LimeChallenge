# Video Walkthrough Script — AI Scribe Notes Management Tool

> **Language level**: English B1  
> **Target duration**: 5–10 minutes  
> **Tip**: Speak slowly and clearly. You can pause and re-record any section.

---

## Part 1 — Introduction (about 1 minute)

> *Show the project folder or the running app on screen.*

---

"Hello! My name is [your name], and today I will show you the project I built for the Lime challenge.

The project is called **AI Scribe Notes Management Tool**.

This tool helps healthcare workers to create and manage clinical notes for their patients.

The user can write a note as text, or upload an audio file. The system uses AI to read the audio and create a summary of the note in a structured format called **SOAP**.

Let me explain what SOAP means: it stands for Subjective, Objective, Assessment, and Plan. It is a standard format that doctors and nurses use to write medical notes.

Now let me show you how the project is organized."

---

## Part 2 — Project Structure (about 1.5 minutes)

> *Show the folder structure in VS Code or your file explorer.*

---

"The project has three main parts:

**First**, the **backend**. I used **NestJS**, which is a Node.js framework that helps you build APIs in TypeScript. The backend connects to a PostgreSQL database and handles all the business logic.

**Second**, the **frontend**. I used **React** with **Vite**. The user interface has three screens: a list of all notes, a form to create a new note, and a detail view to read one note.

**Third**, I have a **Docker Compose** file. With only one command — `docker compose up` — you can run the database, the backend, and the frontend together. No manual setup is needed.

Let me also quickly show the `.env.example` file. This file shows all the environment variables you need to configure. The most important one is the Gemini API key, which is required for the AI features."

---

## Part 3 — Architecture Decisions (about 2 minutes)

> *You can use a simple diagram, or just talk while showing the code.*

---

"Now let me explain some important technical decisions I made.

**Decision 1 — GraphQL API**

I chose GraphQL instead of REST. GraphQL is a query language for APIs. With GraphQL, the frontend can ask for exactly the data it needs — not more, not less. Everything goes through one endpoint: `/graphql`. In development, there is a Playground interface where you can test all the queries and mutations directly in the browser.

File uploads are handled in GraphQL using a special scalar type called `Upload`. This means audio files are sent through the same GraphQL endpoint, without a separate REST endpoint.

**Decision 2 — Rate Limiting**

I added rate limiting to protect the API. The rule is: each IP address can send a maximum of 60 requests per minute. For mutations that use AI — like `createNote` — the limit is lower: 20 requests per minute. If someone sends too many requests, the server returns a 429 error. I used the `@nestjs/throttler` package for this.

**Decision 3 — AI Provider: Gemini 1.5 Flash**

I chose Google Gemini instead of OpenAI. Gemini is very useful here because it can work with audio files directly. So when a user uploads an audio file, I send it to Gemini and it gives me back the transcription AND the SOAP summary — all in one API call. This makes the code simpler and faster.

**Decision 4 — File Storage: Strategy Pattern**

For audio files, the app supports two storage options: local storage and AWS S3. I built a strategy pattern in NestJS. This means the app automatically chooses S3 if you add the AWS variables to your `.env` file. If you don't add them, it uses local storage. You don't need to change any code — just change the configuration.

**Decision 5 — NestJS Module Architecture**

I separated the backend into clear modules: Patients, Notes, AI, Storage, and Health. Each module has one responsibility. This makes the code easy to read, test, and change in the future.

**Decision 6 — Cloud Ready**

The app is designed to be deployed on AWS. The backend has a `GET /health` endpoint for ECS health checks. The logger uses structured JSON format for CloudWatch. The storage module is already ready for S3.

---

## Part 4 — Live Demo (about 3 minutes)

> *Open the running application in the browser. Use `docker compose up` to start it, or run backend and frontend manually.*

---

"Now let me show you the application working.

**Step 1 — The Notes List**

Here you can see the main page. It shows all the clinical notes. Each card shows the patient name, the date, and a short preview of the note. You can also see a badge that tells you if the note is from text or audio.

**Step 2 — Create a Text Note**

I will click on 'Create Note'. Here I can select a patient from the list. The patients were added automatically when the server started — this is called seeding. I will select the patient, choose 'Text' as the input type, and write a short note. Now I click Submit. The AI will process this and create a SOAP summary.

**Step 3 — Create an Audio Note**

Let me create another note. This time I will select 'Audio' and upload an audio file. When I submit, the backend sends the file to Gemini, which transcribes it and creates the SOAP summary automatically.

**Step 4 — View Note Details**

Now I click on one of the notes. Here I can see the full note. On the left, I see the transcription and the SOAP summary. On the right, I see the patient information — the name, date of birth, and medical record number."

---

## Part 5 — Tests (about 1 minute)

> *Show the test files in the editor, or run `npm test` in the terminal.*

---

"The project also has unit tests.

For the backend, I used **Jest**, which is the default testing tool for NestJS. I tested the most important parts of the system: the AI service, the storage service, the patients and notes services, and the seeder.

For the frontend, I used **Vitest** with **React Testing Library**. I tested the API functions, all the components, and the full user flows using **MSW** — Mock Service Worker — which simulates the API responses in the tests.

You can run all tests with the command `yarn test` from the root folder."

---

## Part 6 — Closing (about 30 seconds)

---

"To summarize, I built a full-stack clinical notes tool with:
- NestJS and PostgreSQL on the backend
- GraphQL API with Apollo — code-first approach
- Rate limiting to protect the API from too many requests
- React and Vite on the frontend
- AI-powered transcription and SOAP summary using Gemini
- Optional AWS S3 support for file storage
- Docker Compose for easy local setup
- Unit tests for both backend and frontend

Thank you for watching! If you have any questions, please feel free to reach out."

---

## Quick Reference — Commands to show during the video

```bash
# Start everything with Docker
docker compose up

# Or start manually (from project root)
yarn dev:backend   # starts NestJS on port 3001
yarn dev:frontend  # starts React on port 3000
yarn dev           # starts both simultaneously

# Run all tests
yarn test

# View API documentation
open http://localhost:3001/graphql
```

---

## Key URLs to show

| What | URL |
|---|---|
| Frontend app | http://localhost:3000 |
| GraphQL Playground | http://localhost:3001/graphql |
| Health check | http://localhost:3001/health |
| Uploads (local) | http://localhost:3001/uploads/ |
