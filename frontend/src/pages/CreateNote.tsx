import { type OperationVariables } from '@apollo/client';
import { type QueryRef, useBackgroundQuery, useMutation, useReadQuery } from '@apollo/client/react';
import { Box, Container, Typography } from '@mui/material';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NoteForm } from '../components/NoteForm';
import { CREATE_NOTE, GET_NOTES, GET_PATIENTS, type GetPatientsData } from '../graphql/queries';
import type { CreateNotePayload, Patient } from '../types';

interface CreateNoteFormProps {
  queryRef: QueryRef<GetPatientsData, OperationVariables, 'complete' | 'streaming' | 'empty'>;
  onSubmit: (payload: CreateNotePayload) => void;
  isPending: boolean;
  errorMsg: string | null;
}

// Inner component — useReadQuery suspends until patients are loaded
const CreateNoteForm: React.FC<CreateNoteFormProps> = ({
  queryRef,
  onSubmit,
  isPending,
  errorMsg,
}) => {
  const { i18n } = useTranslation();
  const { data, error } = useReadQuery(queryRef);

  if (error) {
    return (
      <Box className="bg-rose-50 border border-rose-200 p-6 rounded-xl text-center max-w-2xl mx-auto w-full">
        <Typography variant="body1" className="text-rose-600 font-medium">
          {i18n.t('dashboard.errorMsgPatients', { message: error.message })}
        </Typography>
      </Box>
    );
  }

  if (!data?.patients) return null;

  return (
    <NoteForm
      patients={data.patients as Patient[]}
      onSubmit={onSubmit}
      isSubmitting={isPending}
      submitError={errorMsg}
    />
  );
};

// Outer shell — starts query without suspending, owns the Suspense boundary and mutation
export const CreateNote: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [queryRef] = useBackgroundQuery<GetPatientsData>(GET_PATIENTS, {
    errorPolicy: 'all',
  });

  // Note creation mutation — refetch notes list on success
  const [createNote, { loading: isPending }] = useMutation(CREATE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
    onCompleted: (data) => {
      // Redirect to the newly created note's detail page
      if (data?.createNote?.id) {
        navigate(`/notes/${data.createNote.id}`);
      } else {
        navigate('/');
      }
    },
    onError: (err) => {
      setErrorMsg(err.message || 'An error occurred while creating the note.');
    },
  });

  const handleSubmit = (payload: CreateNotePayload) => {
    if (payload.inputType === 'text') {
      createNote({
        variables: {
          input: {
            patientId: payload.patientId,
            inputType: payload.inputType.toUpperCase(),
            rawText: payload.rawText,
          },
        },
      });
    } else {
      createNote({
        variables: {
          input: {
            patientId: payload.patientId,
            inputType: payload.inputType.toUpperCase(),
          },
          audioFile: payload.audioFile,
        },
      });
    }
  };

  return (
    <Container maxWidth="xl" className="px-0 py-2">
      {/* Title */}
      <Box className="max-w-2xl mx-auto w-full mb-6">
        <Typography variant="h5" className="font-extrabold text-slate-100 tracking-tight">
          {i18n.t('noteForm.title')}
        </Typography>
        <Typography variant="body2" className="text-slate-400 mt-1">
          Record clinical notes via typing or uploading files.
        </Typography>
      </Box>

      {/* Suspense boundary — skeleton shown while patients list loads */}
      <Box className="max-w-2xl mx-auto w-full">
        <Suspense fallback={<LoadingSkeleton variant="detail" />}>
          <CreateNoteForm
            queryRef={queryRef}
            onSubmit={handleSubmit}
            isPending={isPending}
            errorMsg={errorMsg}
          />
        </Suspense>
      </Box>
    </Container>
  );
};
export default CreateNote;
