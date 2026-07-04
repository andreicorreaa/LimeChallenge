import { describe, expect, it, vi } from 'vitest';
import { mockNotes, mockPatients } from '../test/handlers';
import { createNote, deleteNote, getNote, getNotes } from './notes';
import { getPatient, getPatients } from './patients';

// Mock axios to avoid JSDOM XMLHttpRequest stream deadlock with File objects
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    default: {
      ...actual.default,
      post: vi.fn().mockImplementation((url, data, config) => {
        if (config?.headers?.['Content-Type']?.includes('multipart/form-data')) {
          return Promise.resolve({
            data: {
              data: {
                createNote: {
                  id: 'note-new',
                  inputType: 'audio',
                  status: 'processing',
                },
              },
            },
          });
        }
        return actual.default.post(url, data, config);
      }),
    },
  };
});

describe('Frontend API layer (GraphQL clients)', () => {
  describe('Patients API', () => {
    it('should fetch all patients', async () => {
      const patients = await getPatients();
      expect(patients).toEqual(mockPatients);
    });

    it('should fetch one patient by ID', async () => {
      const patient = await getPatient('pat-1');
      expect(patient).toEqual(mockPatients[0]);
    });
  });

  describe('Notes API', () => {
    it('should fetch all notes', async () => {
      const notes = await getNotes();
      expect(notes).toEqual(mockNotes);
    });

    it('should fetch one note by ID', async () => {
      const note = await getNote('note-1');
      expect(note).toEqual(mockNotes[0]);
    });

    it('should delete a note by ID', async () => {
      const result = await deleteNote('note-1');
      expect(result).toBe(true);
    });

    it('should create a TEXT note successfully', async () => {
      const note = await createNote({
        patientId: 'pat-1',
        inputType: 'text',
        rawText: 'Test text content',
      });
      expect(note.id).toBe('note-new');
      expect(note.inputType).toBe('text');
      expect(note.status).toBe('ready');
    });

    it('should create an AUDIO note successfully', async () => {
      const fakeFile = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });
      const note = await createNote({
        patientId: 'pat-2',
        inputType: 'audio',
        audioFile: fakeFile,
      });
      expect(note.id).toBe('note-new');
      expect(note.inputType).toBe('audio');
      expect(note.status).toBe('processing');
    });
  });
});
