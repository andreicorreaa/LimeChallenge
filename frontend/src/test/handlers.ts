import { http, HttpResponse } from 'msw';
import type { Note, Patient } from '../types';

export const mockPatients: Patient[] = [
  {
    id: 'pat-1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-01',
    mrn: 'MRN001',
    createdAt: '2026-07-04T00:00:00.000Z',
  },
  {
    id: 'pat-2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1990-02-02',
    mrn: 'MRN002',
    createdAt: '2026-07-04T00:00:00.000Z',
  },
];

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    patientId: 'pat-1',
    inputType: 'text',
    rawText: 'Patient text details',
    audioFilePath: null,
    transcribedText: null,
    status: 'ready',
    soapSummary:
      'Subjective: complains of cough\nObjective: clear chest\nAssessment: acute bronchitis\nPlan: rest',
    createdAt: '2026-07-04T12:00:00.000Z',
    updatedAt: '2026-07-04T12:00:00.000Z',
    patient: mockPatients[0],
  },
  {
    id: 'note-2',
    patientId: 'pat-2',
    inputType: 'audio',
    rawText: null,
    audioFilePath: null,
    transcribedText: 'Spoken transcript text',
    status: 'processing',
    createdAt: '2026-07-04T13:00:00.000Z',
    updatedAt: '2026-07-04T13:00:00.000Z',
    patient: mockPatients[1],
  },
];

export const handlers = [
  // Intercept GraphQL requests to /graphql
  http.post('/graphql', async ({ request }) => {
    const contentType = request.headers.get('Content-Type');

    if (contentType?.includes('multipart/form-data')) {
      // Return mock note response directly to avoid JSDOM/MSW body stream parsing deadlock
      const newNote: Note = {
        id: 'note-new',
        patientId: 'pat-2',
        inputType: 'audio',
        status: 'processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json({
        data: { createNote: newNote },
      });
    }

    const body = (await request.json()) as {
      query: string;
      // biome-ignore lint/suspicious/noExplicitAny: graphql variables can have dynamic nested shapes
      variables?: Record<string, any>;
    };

    const { query, variables = {} } = body;

    // 1. query GetPatients
    if (query.includes('query GetPatients')) {
      return HttpResponse.json({
        data: { patients: mockPatients },
      });
    }

    // 2. query GetPatient
    if (query.includes('query GetPatient')) {
      const patient = mockPatients.find((p) => p.id === variables.id) || null;
      return HttpResponse.json({
        data: { patient },
      });
    }

    // 3. query GetNotes
    if (query.includes('query GetNotes')) {
      return HttpResponse.json({
        data: { notes: mockNotes },
      });
    }

    // 4. query GetNote
    if (query.includes('query GetNote')) {
      const note = mockNotes.find((n) => n.id === variables.id) || null;
      return HttpResponse.json({
        data: { note },
      });
    }

    // 5. mutation CreateNote
    if (query.includes('mutation CreateNote')) {
      const isAudio = variables.input.inputType?.toLowerCase() === 'audio';
      const newNote: Note = {
        id: 'note-new',
        patientId: variables.input.patientId,
        inputType: variables.input.inputType,
        rawText: variables.input.rawText,
        status: isAudio ? 'processing' : 'ready',
        soapSummary: isAudio ? undefined : 'AI generated summary',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json({
        data: { createNote: newNote },
      });
    }

    // 6. mutation DeleteNote
    if (query.includes('mutation DeleteNote')) {
      return HttpResponse.json({
        data: { deleteNote: true },
      });
    }

    // Default error response for unhandled queries
    return HttpResponse.json({
      errors: [{ message: 'Unhandled GraphQL Query in mock handler' }],
    });
  }),
];
