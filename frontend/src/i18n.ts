import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: {
        title: 'AI Clinical Scribe',
        subtitle: 'Review and create patient clinical summaries.',
        createBtn: 'Create Note',
        deleteBtn: 'Delete Note',
        backBtn: 'Back to Clinic Dashboard',
        emptyTitle: 'No Clinical Notes Found',
        emptySubtitle:
          'Create your first clinical note by typing findings or uploading an audio recording.',
        getStarted: 'Get Started',
        loading: 'Loading...',
        errorMsg: 'Error fetching notes: {{message}}',
        errorMsgDetail: 'Error loading note detail: {{message}}',
        errorMsgPatients: 'Error loading patients: {{message}}',
        noteDetailTitle: 'Clinical Record Detail',
        noteNotFound: 'Note not found.',
        deleteConfirm: 'Are you sure you want to delete this note?',
      },
      demographics: {
        title: 'Patient Demographics',
        fullName: 'Full Name',
        dob: 'Date of Birth',
        mrn: 'Medical Record Number (MRN)',
        sysId: 'Patient System ID',
      },
      noteForm: {
        title: 'Create Clinical Note',
        selectPatient: 'Select Patient Record',
        inputMode: 'Input Mode',
        modeText: 'Typed Text',
        modeAudio: 'Audio Recording Upload',
        typedPlaceholder: 'Enter patient complaints, vitals, history, or assessment findings...',
        audioLabel: 'Select Audio Recording (.mp3, .wav, .m4a)',
        uploadBtn: 'Upload Audio File',
        changeBtn: 'Change File',
        submitBtn: 'Process Note',
        submitLoading: 'AI Scribe is parsing findings...',
        validationError: 'Error: {{message}}',
      },
      noteDetail: {
        rawInput: 'Raw Input Note',
        audioTranscript: 'Audio Transcript',
        audioPlayback: 'Original Audio Playback:',
        soapTitle: 'Clinical SOAP Note Summary (AI Generated)',
        soapLoading: 'AI Scribe is parsing clinical findings and generating SOAP summary...',
        soapError: 'Failed to generate AI SOAP summary. Please verify raw input or check logs.',
        noSoap: 'No SOAP summary generated.',
        ready: 'Ready',
        processing: 'Processing',
        error: 'Error',
      },
    },
  },
  es: {
    translation: {
      dashboard: {
        title: 'Escribano Clínico IA',
        subtitle: 'Revise y cree resúmenes clínicos de pacientes.',
        createBtn: 'Crear Nota',
        deleteBtn: 'Eliminar Nota',
        backBtn: 'Volver al Panel Clínico',
        emptyTitle: 'No se Encontraron Notas Clínicas',
        emptySubtitle:
          'Cree su primera nota clínica escribiendo hallazgos o subiendo una grabación de audio.',
        getStarted: 'Comenzar',
        loading: 'Cargando...',
        errorMsg: 'Error al obtener notas: {{message}}',
        errorMsgDetail: 'Error al cargar detalle de la nota: {{message}}',
        errorMsgPatients: 'Error al cargar pacientes: {{message}}',
        noteDetailTitle: 'Detalle del Registro Clínico',
        noteNotFound: 'Nota no encontrada.',
        deleteConfirm: '¿Está seguro de que desea eliminar esta nota?',
      },
      demographics: {
        title: 'Datos Demográficos del Paciente',
        fullName: 'Nombre Completo',
        dob: 'Fecha de Nacimiento',
        mrn: 'Número de Registro Médico (MRN)',
        sysId: 'ID del Sistema del Paciente',
      },
      noteForm: {
        title: 'Crear Nota Clínica',
        selectPatient: 'Seleccionar Registro de Paciente',
        inputMode: 'Modo de Entrada',
        modeText: 'Texto Escrito',
        modeAudio: 'Subir Grabación de Audio',
        typedPlaceholder:
          'Ingrese las quejas del paciente, signos vitales, antecedentes o hallazgos de la evaluación...',
        audioLabel: 'Seleccionar Grabación de Audio (.mp3, .wav, .m4a)',
        uploadBtn: 'Subir Archivo de Audio',
        changeBtn: 'Cambiar Archivo',
        submitBtn: 'Procesar Nota',
        submitLoading: 'El escribano de IA está analizando los hallazgos...',
        validationError: 'Error: {{message}}',
      },
      noteDetail: {
        rawInput: 'Nota de Entrada Original',
        audioTranscript: 'Transcripción de Audio',
        audioPlayback: 'Reproducción de Audio Original:',
        soapTitle: 'Resumen de Nota Clínica SOAP (Generado por IA)',
        soapLoading:
          'El escribano de IA está analizando los hallazgos clínicos y generando el resumen SOAP...',
        soapError:
          'Error al generar el resumen SOAP por IA. Verifique la entrada original o revise los registros.',
        noSoap: 'No se generó ningún resumen SOAP.',
        ready: 'Listo',
        processing: 'Procesando',
        error: 'Error',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
