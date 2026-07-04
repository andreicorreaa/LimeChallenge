import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

// Start MSW mock server before all tests run
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (prevents leak between test cases)
afterEach(() => server.resetHandlers());

// Clean up server after tests finish
afterAll(() => server.close());

// Mock react-i18next globally for Vitest specs
vi.mock('react-i18next', () => {
  const tMock = (key: string, options?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'dashboard.title': 'AI Clinical Scribe',
      'dashboard.subtitle': 'Review and create patient clinical summaries.',
      'dashboard.createBtn': 'Create Note',
      'dashboard.deleteBtn': 'Delete Note',
      'dashboard.backBtn': 'Back to Clinic Dashboard',
      'dashboard.emptyTitle': 'No Clinical Notes Found',
      'dashboard.emptySubtitle':
        'Create your first clinical note by typing findings or uploading an audio recording.',
      'dashboard.getStarted': 'Get Started',
      'dashboard.noteDetailTitle': 'Clinical Record Detail',
      'dashboard.noteNotFound': 'Note not found.',
      'demographics.title': 'Patient Demographics',
      'demographics.fullName': 'Full Name',
      'demographics.dob': 'Date of Birth',
      'demographics.mrn': 'Medical Record Number (MRN)',
      'demographics.sysId': 'Patient System ID',
      'noteForm.title': 'Create Clinical Note',
      'noteForm.selectPatient': 'Select Patient Record',
      'noteForm.inputMode': 'Input Mode',
      'noteForm.modeText': 'Typed Text',
      'noteForm.modeAudio': 'Audio Recording Upload',
      'noteForm.typedPlaceholder':
        'Enter patient complaints, vitals, history, or assessment findings...',
      'noteForm.audioLabel': 'Select Audio Recording (.mp3, .wav, .m4a)',
      'noteForm.uploadBtn': 'Upload Audio File',
      'noteForm.changeBtn': 'Change File',
      'noteForm.submitBtn': 'Process Note',
      'noteForm.submitLoading': 'AI Scribe is parsing findings...',
      'noteDetail.rawInput': 'Raw Input Note',
      'noteDetail.audioTranscript': 'Audio Transcript',
      'noteDetail.audioPlayback': 'Original Audio Playback:',
      'noteDetail.soapTitle': 'Clinical SOAP Note Summary (AI Generated)',
      'noteDetail.soapLoading':
        'AI Scribe is parsing clinical findings and generating SOAP summary...',
      'noteDetail.soapError':
        'Failed to generate AI SOAP summary. Please verify raw input or check logs.',
      'noteDetail.noSoap': 'No SOAP summary generated.',
      'noteDetail.ready': 'Ready',
      'noteDetail.processing': 'Processing',
      'noteDetail.error': 'Error',
    };
    if (key === 'dashboard.errorMsg') {
      return `Error fetching notes: ${options?.message || ''}`;
    }
    if (key === 'dashboard.errorMsgDetail') {
      return `Error loading note detail: ${options?.message || ''}`;
    }
    if (key === 'dashboard.errorMsgPatients') {
      return `Error loading patients: ${options?.message || ''}`;
    }
    if (key === 'noteForm.validationError') {
      return `Error: ${options?.message || ''}`;
    }
    return translations[key] || key;
  };

  return {
    useTranslation: () => ({
      t: tMock,
      i18n: {
        changeLanguage: () => Promise.resolve(),
        language: 'en',
        t: tMock,
      },
    }),
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  };
});
