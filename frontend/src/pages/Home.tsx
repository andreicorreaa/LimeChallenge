import { type OperationVariables } from '@apollo/client';
import { type QueryRef, useBackgroundQuery, useReadQuery } from '@apollo/client/react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Container, Typography } from '@mui/material';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NoteCard } from '../components/NoteCard';
import { GET_NOTES, type GetNotesData } from '../graphql/queries';
import type { Note } from '../types';

interface NotesListProps {
  queryRef: QueryRef<GetNotesData, OperationVariables, 'complete' | 'streaming' | 'empty'>;
  refetch: () => void;
}

// Inner component — useReadQuery suspends until data is ready
const NotesList: React.FC<NotesListProps> = ({ queryRef, refetch }) => {
  const { i18n } = useTranslation();
  const { data, error } = useReadQuery(queryRef);

  // Poll every 5s to catch notes that change from 'processing' to 'ready'
  useEffect(() => {
    const timer = setInterval(() => refetch(), 5000);
    return () => clearInterval(timer);
  }, [refetch]);

  const notes = data?.notes?.map((note) => ({
    ...note,
    inputType: note.inputType.toLowerCase() as Note['inputType'],
    status: note.status.toLowerCase() as Note['status'],
    updatedAt: note.createdAt,
  })) as Note[] | undefined;

  if (error) {
    return (
      <Box className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-xl text-center">
        <Typography variant="body1" className="text-rose-400 font-medium">
          {i18n.t('dashboard.errorMsg', { message: error.message })}
        </Typography>
      </Box>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Box className="bg-slate-800/20 border border-slate-700/40 p-12 rounded-xl text-center flex flex-col gap-4 items-center">
        <Typography variant="h6" className="text-slate-300 font-semibold">
          {i18n.t('dashboard.emptyTitle')}
        </Typography>
        <Typography variant="body2" className="text-slate-400 max-w-sm">
          {i18n.t('dashboard.emptySubtitle')}
        </Typography>
        <Link to="/notes/new" className="mt-2">
          <Button
            variant="outlined"
            className="border-cyan-500 hover:border-cyan-600 text-cyan-400 hover:bg-cyan-950/20 px-5 py-2 rounded-lg capitalize"
          >
            {i18n.t('dashboard.getStarted')}
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};

// Outer shell — starts query without suspending, owns the Suspense boundary
export const Home: React.FC = () => {
  const { i18n } = useTranslation();
  const [queryRef, { refetch }] = useBackgroundQuery(GET_NOTES, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return (
    <Container maxWidth="lg" className="py-8 flex flex-col gap-6">
      {/* Header section */}
      <Box className="flex justify-between items-center pb-4 border-b border-slate-800">
        <Box>
          <Typography variant="h4" className="text-slate-100 font-bold tracking-tight">
            {i18n.t('dashboard.title')}
          </Typography>
          <Typography variant="body2" className="text-slate-400 mt-1">
            {i18n.t('dashboard.subtitle')}
          </Typography>
        </Box>
        <Link to="/notes/new">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg capitalize shadow-lg shadow-cyan-500/10"
          >
            {i18n.t('dashboard.createBtn')}
          </Button>
        </Link>
      </Box>

      {/* Suspense boundary — skeleton shown while NotesList fetches */}
      <Suspense fallback={<LoadingSkeleton variant="list" />}>
        <NotesList queryRef={queryRef} refetch={refetch} />
      </Suspense>
    </Container>
  );
};
export default Home;
