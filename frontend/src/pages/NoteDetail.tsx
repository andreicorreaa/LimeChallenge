import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Container, Grid2, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteNote, getNote } from '../api/notes';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NoteDetail } from '../components/NoteDetail';
import { PatientSidebar } from '../components/PatientSidebar';

export const NoteDetailContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query note details
  const {
    data: note,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNote(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 5s if note exists but is still awaiting transcription or clinical summary
      const data = query.state.data;
      if (data && ((data.inputType === 'audio' && !data.transcribedText) || !data.soapSummary)) {
        return 5000;
      }
      return false;
    },
  });

  // Delete note mutation
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteNote(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      performDelete();
    }
  };

  const formattedDate = note
    ? new Date(note.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Container maxWidth="lg" className="py-8 px-4 sm:px-6 lg:px-8">
      {/* Header bar */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          className="text-slate-400 hover:text-slate-200 capitalize font-medium p-0 hover:bg-transparent"
        >
          Back to Clinic Dashboard
        </Button>

        {note && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
            className="border-rose-500/50 hover:border-rose-500 text-rose-400 hover:bg-rose-950/20 capitalize font-semibold rounded-lg px-4"
          >
            Delete Note
          </Button>
        )}
      </Box>

      {/* Main Details grid */}
      {isLoading ? (
        <LoadingSkeleton variant="detail" />
      ) : isError ? (
        <Box className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-xl text-center">
          <Typography variant="body1" className="text-rose-400 font-medium">
            Error loading note detail: {(error as Error).message}
          </Typography>
        </Box>
      ) : note ? (
        <Grid2 container spacing={4}>
          {/* Note Info Column */}
          <Grid2 size={{ xs: 12, md: 8 }} className="flex flex-col gap-4">
            <Box className="flex items-center gap-3">
              <Typography variant="h5" className="text-slate-100 font-bold">
                Clinical Record Detail
              </Typography>
              <span className="text-slate-500">•</span>
              <Typography variant="body2" className="text-slate-400">
                {formattedDate}
              </Typography>
            </Box>
            <NoteDetail note={note} />
          </Grid2>

          {/* Patient Details Column */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            {note.patient && <PatientSidebar patient={note.patient} />}
          </Grid2>
        </Grid2>
      ) : (
        <Box className="text-center p-12">
          <Typography variant="body1" className="text-slate-400">
            Note not found.
          </Typography>
        </Box>
      )}
    </Container>
  );
};
export default NoteDetailContainer;
