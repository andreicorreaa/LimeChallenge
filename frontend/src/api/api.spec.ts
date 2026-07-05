import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import {
  CREATE_NOTE,
  DELETE_NOTE,
  GET_NOTE,
  GET_NOTES,
  GET_PATIENT,
  GET_PATIENTS,
} from '../graphql/queries';
import { mockNotes, mockPatients } from '../test/handlers';

// Helper: create an Apollo Client that routes through the MSW-intercepted /graphql endpoint
function createTestClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'no-cache' },
      query: { fetchPolicy: 'no-cache' },
    },
  });
}

describe('Frontend API layer (Apollo GraphQL)', () => {
  describe('Patients queries', () => {
    it('should fetch all patients', async () => {
      const client = createTestClient();
      const { data } = await client.query({ query: GET_PATIENTS });
      expect(data?.patients).toEqual(mockPatients);
    });

    it('should fetch one patient by ID', async () => {
      const client = createTestClient();
      const { data } = await client.query({ query: GET_PATIENT, variables: { id: 'pat-1' } });
      expect(data?.patient).toEqual(mockPatients[0]);
    });
  });

  describe('Notes queries', () => {
    it('should fetch all notes', async () => {
      const client = createTestClient();
      const { data } = await client.query({ query: GET_NOTES });
      expect(data?.notes).toEqual(mockNotes);
    });

    it('should fetch one note by ID', async () => {
      const client = createTestClient();
      const { data } = await client.query({ query: GET_NOTE, variables: { id: 'note-1' } });
      expect(data?.note).toEqual(mockNotes[0]);
    });

    it('should delete a note by ID', async () => {
      const client = createTestClient();
      const { data } = await client.mutate({ mutation: DELETE_NOTE, variables: { id: 'note-1' } });
      expect(data?.deleteNote).toBe(true);
    });

    it('should create a TEXT note successfully', async () => {
      const client = createTestClient();
      const { data } = await client.mutate({
        mutation: CREATE_NOTE,
        variables: {
          input: { patientId: 'pat-1', inputType: 'TEXT', rawText: 'Test text content' },
        },
      });
      expect(data?.createNote.id).toBe('note-new');
      expect(data?.createNote.status).toBe('ready');
    });

    it('should create an AUDIO note successfully', async () => {
      const client = createTestClient();
      const { data } = await client.mutate({
        mutation: CREATE_NOTE,
        variables: {
          input: { patientId: 'pat-2', inputType: 'AUDIO' },
          audioFile: new File(['audio content'], 'test.mp3', { type: 'audio/mp3' }),
        },
      });
      expect(data?.createNote.id).toBe('note-new');
      expect(data?.createNote.status).toBe('processing');
    });
  });
});
