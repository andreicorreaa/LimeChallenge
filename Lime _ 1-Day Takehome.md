## **Technical Interview Project: AI Scribe Notes Management Tool**

### **Overview**

You will build a lightweight **AI Scribe Notes Management Tool**. This tool allows users to:

* Create and view **AI-generated clinical notes** associated with patients.                                                                                                                                                                                                                                                                                                                                           

* Input can be either **typed** or **audio** (basic audio upload is fine; transcription can use any AI API or open-source model).

* Each note is stored and associated with a **mock patient**.

* Users can view a list of notes and click on a note to view:

  * The note content (transcribed/generated)

  * Related patient details

This tool simulates a core part of a home healthcare compliance suite, and we aim to assess your ability to implement clean, functional, and maintainable code in a familiar stack.

---

### **Requirements**

#### **Functional Requirements**

1. **Patient Record Creation (Seeded)**

   * On first run, seed the database with 2-3 fake patients (name, DOB, ID, etc.)

2. **Note Input**

   * A simple frontend form to:

     * Select an existing patient

     * Upload an audio file **or** enter free text

     * Submit the note for transcription (audio) and/or generation (AI summary)

3. **AI Processing**

   * Use **OpenAI**, **Whisper**, or a similar service to:

     * Transcribe audio to text

     * Optionally, summarize or structure the note (e.g., “SOAP” format)

     * Save both raw and processed output

4. **Note Listing View**

   * List all notes with patient name, date/time, and preview of note

   * Click on a note to view:

     * Transcription / Summary

     * Patient metadata (on a sidebar or adjacent panel)

5. **Persistence**

   * Store patients and notes in **PostgreSQL**

6. **Backend**

   * Built in **Node.js / TypeScript** (Express or similar)

   * REST or GraphQL API

7. **Frontend**

   * Minimal UI using any framework or even plain HTML/CSS \+ JS (React preferred but not required)

8. **Deployment**

   * Can run locally, Dockerized setup preferred

   * No need to deploy to a public cloud, but AWS usage is a bonus (e.g., S3 for audio file storage)

---

### **Deliverables**

* GitHub repo link (public or private, with access)

* Video walkthrough (5–10 min screen recording):

  * Explaining your setup

  * Demonstrating core features

  * Describing major architectural decisions

* `README.md` with:

  * Setup instructions

  * Any assumptions or shortcuts taken

  * API documentation if needed

---

### **Grading Rubric (Total: 100 pts)**

| Category | Points | Criteria |
| ----- | ----- | ----- |
| **Correctness** | 30 | Functional flows work: add note, view list, see note \+ patient data |
| **Code Quality** | 20 | Clean structure, modular code, follows TypeScript best practices |
| **Use of Stack** | 15 | Uses Node.js, TypeScript, and Postgres effectively |
| **AI Integration** | 15 | Audio transcription and/or AI summary is integrated and working |
| **Dev Experience** | 10 | Clear README, runnable locally, well-organized repo |
| **Presentation & Communication** | 10 | Clear, concise screen recording; shows understanding of the project |

---

### **Notes**

* Feel free to use open-source libraries or AI tools to speed up development.

* Focus on building a vertical slice of functionality with clean boundaries rather than extra features.

* We’re evaluating both execution and how well you can ship a realistic feature in our stack.

