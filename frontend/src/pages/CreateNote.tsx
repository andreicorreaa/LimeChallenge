import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createNote } from '../api/notes';
import { getPatients } from '../api/patients';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NoteForm } from '../components/NoteForm';

export const CreateNote: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch patients list for dropdown selection
  const {
    data: patients,
    isLoading: isPatientsLoading,
    isError: isPatientsError,
    error: patientsError,
  } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  // Note creation mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // Invalidate notes list cache and redirect home
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/');
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'An error occurred while creating the note.');
    },
  });

  return (
    <Container maxWidth="lg" className="py-8 flex flex-col gap-6">
      {/* Back navigation */}
      <Box className="flex items-center gap-2">
        <Link to="/">
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            className="text-slate-400 hover:text-slate-200 capitalize font-medium"
            disabled={isPending}
          >
            Back to Dashboard
          </Button>
        </Link>
      </Box>

      {/* Main Form content */}
      {isPatientsLoading ? (
        <Box className="max-w-2xl mx-auto w-full mt-6">
          <LoadingSkeleton variant="detail" />
        </Box>
      ) : isPatientsError ? (
        <Box className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-xl text-center max-w-2xl mx-auto w-full">
          <Typography variant="body1" className="text-rose-400 font-medium">
            Error loading patients: {(patientsError as Error).message}
          </Typography>
        </Box>
      ) : patients ? (
        <NoteForm
          patients={patients}
          onSubmit={mutate}
          isSubmitting={isPending}
          submitError={errorMsg}
        />
      ) : null}
    </Container>
  );
};
export default CreateNote;
