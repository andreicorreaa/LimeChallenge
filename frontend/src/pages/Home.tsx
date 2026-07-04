import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getNotes } from '../api/notes';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NoteCard } from '../components/NoteCard';

export const Home: React.FC = () => {
  const { i18n } = useTranslation();
  const {
    data: notes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
    refetchInterval: 5000, // Background poll every 5 seconds to update "processing" notes
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

      {/* Main content grid */}
      {isLoading ? (
        <LoadingSkeleton variant="list" />
      ) : isError ? (
        <Box className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-xl text-center">
          <Typography variant="body1" className="text-rose-400 font-medium">
            {i18n.t('dashboard.errorMsg', { message: (error as Error).message })}
          </Typography>
        </Box>
      ) : notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
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
      )}
    </Container>
  );
};
export default Home;
