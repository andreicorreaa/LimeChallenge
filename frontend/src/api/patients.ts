import axios from 'axios';
import type { Patient } from '../types';

export async function getPatients(): Promise<Patient[]> {
  const response = await axios.post('/graphql', {
    query: `
      query GetPatients {
        patients {
          id
          firstName
          lastName
          dateOfBirth
          mrn
        }
      }
    `,
  });
  return response.data.data.patients;
}

export async function getPatient(id: string): Promise<Patient> {
  const response = await axios.post('/graphql', {
    query: `
      query GetPatient($id: ID!) {
        patient(id: $id) {
          id
          firstName
          lastName
          dateOfBirth
          mrn
        }
      }
    `,
    variables: { id },
  });
  return response.data.data.patient;
}
