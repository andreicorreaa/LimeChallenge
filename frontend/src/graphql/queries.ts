import { type TypedDocumentNode, gql } from '@apollo/client';
import type { Note, Patient } from '../types';

// ─── GraphQL response shapes (enums are uppercase as returned by the API) ─────

export type GetPatientsData = {
  patients: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'mrn'>[];
};

export type GetPatientData = {
  patient: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'mrn'> | null;
};

export type GetPatientVariables = {
  id: string;
};

export type GetNotesData = {
  notes: Array<
    Pick<Note, 'id' | 'patientId' | 'rawText' | 'createdAt'> & {
      inputType: string;
      status: string;
      patient?: Pick<Patient, 'firstName' | 'lastName'>;
    }
  >;
};

export type GetNoteData = {
  note: Pick<
    Note,
    | 'id'
    | 'patientId'
    | 'rawText'
    | 'audioFilePath'
    | 'transcribedText'
    | 'soapSummary'
    | 'createdAt'
  > & {
    inputType: string;
    status: string;
    patient?: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'mrn'>;
  };
};

export type GetNoteVariables = {
  id: string;
};

export type CreateNoteData = {
  createNote: Pick<Note, 'id'> & {
    inputType: string;
    status: string;
  };
};

export type CreateNoteVariables = {
  input: {
    patientId: string;
    inputType: string;
    rawText?: string;
  };
  audioFile?: File;
};

export type DeleteNoteData = {
  deleteNote: boolean;
};

export type DeleteNoteVariables = {
  id: string;
};

// ─── Patient Queries ──────────────────────────────────────────────────────────

export const GET_PATIENTS: TypedDocumentNode<GetPatientsData> = gql`
  query GetPatients {
    patients {
      id
      firstName
      lastName
      dateOfBirth
      mrn
    }
  }
`;

export const GET_PATIENT: TypedDocumentNode<GetPatientData, GetPatientVariables> = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      firstName
      lastName
      dateOfBirth
      mrn
    }
  }
`;

// ─── Note Queries ─────────────────────────────────────────────────────────────

export const GET_NOTES: TypedDocumentNode<GetNotesData> = gql`
  query GetNotes {
    notes {
      id
      patientId
      inputType
      rawText
      status
      createdAt
      patient {
        firstName
        lastName
      }
    }
  }
`;

export const GET_NOTE: TypedDocumentNode<GetNoteData, GetNoteVariables> = gql`
  query GetNote($id: ID!) {
    note(id: $id) {
      id
      patientId
      inputType
      rawText
      audioFilePath
      transcribedText
      soapSummary
      status
      createdAt
      patient {
        id
        firstName
        lastName
        dateOfBirth
        mrn
      }
    }
  }
`;

// ─── Note Mutations ───────────────────────────────────────────────────────────

export const CREATE_NOTE: TypedDocumentNode<CreateNoteData, CreateNoteVariables> = gql`
  mutation CreateNote($input: CreateNoteInput!, $audioFile: Upload) {
    createNote(input: $input, audioFile: $audioFile) {
      id
      inputType
      status
    }
  }
`;

export const DELETE_NOTE: TypedDocumentNode<DeleteNoteData, DeleteNoteVariables> = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id)
  }
`;
