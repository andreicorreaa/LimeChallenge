import axios from 'axios';
import type { CreateNotePayload, Note } from '../types';

interface RawNote extends Omit<Note, 'inputType' | 'status'> {
  inputType: string;
  status: string;
}

function normalizeNote(note: RawNote): Note {
  if (!note) return note as unknown as Note;
  return {
    ...note,
    inputType: note.inputType?.toLowerCase() as Note['inputType'],
    status: note.status?.toLowerCase() as Note['status'],
  };
}

export async function getNotes(): Promise<Note[]> {
  const response = await axios.post('/graphql', {
    query: `
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
    `,
  });
  return (response.data.data.notes || []).map(normalizeNote);
}

export async function getNote(id: string): Promise<Note> {
  const response = await axios.post('/graphql', {
    query: `
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
            firstName
            lastName
            dateOfBirth
            mrn
          }
        }
      }
    `,
    variables: { id },
  });
  return normalizeNote(response.data.data.note);
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  if (payload.inputType === 'text') {
    // 1. Standard JSON post for TEXT notes (no files)
    const response = await axios.post('/graphql', {
      query: `
        mutation CreateNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            id
            inputType
            status
          }
        }
      `,
      variables: {
        input: {
          patientId: payload.patientId,
          inputType: payload.inputType.toUpperCase(),
          rawText: payload.rawText,
        },
      },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return normalizeNote(response.data.data.createNote);
  }

  // 2. Multipart form POST for AUDIO notes (standard GraphQL multipart upload spec)
  const formData = new FormData();

  const operations = {
    query: `
      mutation CreateNote($input: CreateNoteInput!, $audioFile: Upload) {
        createNote(input: $input, audioFile: $audioFile) {
          id
          inputType
          status
        }
      }
    `,
    variables: {
      input: {
        patientId: payload.patientId,
        inputType: payload.inputType.toUpperCase(),
      },
      audioFile: null,
    },
  };

  formData.append('operations', JSON.stringify(operations));
  formData.append('map', JSON.stringify({ '0': ['variables.audioFile'] }));
  formData.append('0', payload.audioFile as File);

  const response = await axios.post('/graphql', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'apollo-require-preflight': 'true',
    },
  });

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }
  return normalizeNote(response.data.data.createNote);
}

export async function deleteNote(id: string): Promise<boolean> {
  const response = await axios.post('/graphql', {
    query: `
      mutation DeleteNote($id: ID!) {
        deleteNote(id: $id)
      }
    `,
    variables: { id },
  });
  return response.data.data.deleteNote;
}
