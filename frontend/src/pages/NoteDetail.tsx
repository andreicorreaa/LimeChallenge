import {
  type QueryRef,
  skipToken,
  useBackgroundQuery,
  useMutation,
  useReadQuery,
} from '@apollo/client/react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Container, Grid2, Typography } from '@mui/material';
import React, { Suspense, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NoteDetail } from '../components/NoteDetail';
import { PatientSidebar } from '../components/PatientSidebar';
import { DELETE_NOTE, GET_NOTE, GET_NOTES, type GetNoteData } from '../graphql/queries';
import type { Note } from '../types';

interface NoteContentProps {
  queryRef: QueryRef<GetNoteData, { id: string }, 'complete' | 'streaming' | 'empty'>;
  refetch: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

// Inner component — useReadQuery suspends until note data is ready
const NoteContent: React.FC<NoteContentProps> = ({ queryRef, refetch, onDelete, isDeleting }) => {
  const { i18n } = useTranslation();
  const { data, error } = useReadQuery(queryRef);

  // Normalize GraphQL enum strings ("TEXT"/"AUDIO" → "text"/"audio")
  // data.note is guaranteed non-null when useReadQuery resolves
  const note: Note | undefined = useMemo(
    () =>
      data?.note
        ? ({
            ...data.note,
            inputType: data.note.inputType.toLowerCase() as Note['inputType'],
            status: data.note.status.toLowerCase() as Note['status'],
            updatedAt: data.note.createdAt,
          } as Note)
        : undefined,
    [data?.note],
  );

  // Poll every 5s only while note is still awaiting transcription or SOAP summary
  useEffect(() => {
    if (!note) return;
    const stillProcessing =
      (note.inputType === 'audio' && !note.transcribedText) || !note.soapSummary;
    if (!stillProcessing) return;

    const timer = setInterval(() => refetch(), 5000);
    return () => clearInterval(timer);
  }, [note, refetch]);

  if (error) {
    return (
      <Box className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-xl text-center">
        <Typography variant="body1" className="text-rose-400 font-medium">
          {i18n.t('dashboard.errorMsgDetail', { message: error.message })}
        </Typography>
      </Box>
    );
  }

  if (!note) {
    return (
      <Box className="text-center p-12 bg-slate-800/20 border border-slate-700/40 rounded-xl">
        <Typography variant="body1" className="text-slate-400">
          {i18n.t('dashboard.noteNotFound')}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid2 container spacing={4}>
      {/* Note Info Column */}
      <Grid2 size={{ xs: 12, md: 8 }} className="flex flex-col gap-4">
        <NoteDetail note={note} />
      </Grid2>

      {/* Patient Details Column */}
      <Grid2 size={{ xs: 12, md: 4 }} className="flex flex-col gap-4">
        {note.patient && <PatientSidebar patient={note.patient} />}

        {/* Delete note card/button aligned with demographics */}
        <Box className="mt-4">
          <Button
            variant="outlined"
            color="error"
            onClick={onDelete}
            disabled={isDeleting}
            fullWidth
            startIcon={<DeleteIcon />}
            className="border-rose-500/50 hover:border-rose-500 text-rose-400 hover:bg-rose-950/20 capitalize font-semibold rounded-lg py-2 bg-slate-900/50"
          >
            {i18n.t('dashboard.deleteBtn')}
          </Button>
        </Box>
      </Grid2>
    </Grid2>
  );
};

// Outer shell — starts query without suspending, owns Suspense boundary and delete mutation
export const NoteDetailContainer: React.FC = () => {
  const { i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [queryRef, { refetch }] = useBackgroundQuery<GetNoteData>(
    GET_NOTE,
    id ? { variables: { id }, fetchPolicy: 'cache-and-network', errorPolicy: 'all' } : skipToken,
  );

  const [deleteNote, { loading: isDeleting }] = useMutation(DELETE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
    onCompleted: () => navigate('/'),
  });

  const handleDelete = () => {
    if (!id) return;
    if (window.confirm(i18n.t('dashboard.deleteConfirm'))) {
      deleteNote({ variables: { id } });
    }
  };

  return (
    <Container maxWidth="xl" className="px-0">
      {/* Suspense boundary — skeleton shown while note details load */}
      <Suspense fallback={<LoadingSkeleton variant="detail" />}>
        {queryRef && (
          <NoteContent
            queryRef={queryRef}
            refetch={refetch}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </Suspense>
    </Container>
  );
};
export default NoteDetailContainer;
