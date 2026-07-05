// ─── Patient ──────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  mrn: string; // Medical Record Number
  createdAt: string;
}

// ─── Note ─────────────────────────────────────────────────────────────────────
export type NoteInputType = 'text' | 'audio';

export type NoteStatus = 'processing' | 'ready' | 'error';

export interface Note {
  id: string;
  patientId: string;
  patient?: Patient;
  inputType: NoteInputType;
  rawText?: string | null;
  audioFilePath?: string | null;
  transcribedText?: string | null;
  soapSummary?: string | null;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateNotePayload {
  patientId: string;
  inputType: NoteInputType;
  rawText?: string;
  audioFile?: File;
}

// ─── API responses ────────────────────────────────────────────────────────────
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
