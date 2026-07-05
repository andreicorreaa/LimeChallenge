import { type OperationVariables } from '@apollo/client';
import { type QueryRef, useBackgroundQuery, useReadQuery } from '@apollo/client/react';
import AddIcon from '@mui/icons-material/Add';
import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { GET_NOTES, type GetNotesData } from '../graphql/queries';
import type { NoteStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface SidebarListProps {
  queryRef: QueryRef<GetNotesData, OperationVariables, 'complete' | 'streaming' | 'empty'>;
  refetch: () => void;
  activeId?: string;
}

const SidebarList: React.FC<SidebarListProps> = ({ queryRef, refetch, activeId }) => {
  const { i18n } = useTranslation();
  const { data, error } = useReadQuery(queryRef);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language || 'en';

  // Background polling to update processing state
  useEffect(() => {
    const timer = setInterval(() => refetch(), 5000);
    return () => clearInterval(timer);
  }, [refetch]);

  if (error) {
    return (
      <Box className="p-4 text-rose-400 text-xs">
        {i18n.t('dashboard.errorMsg', { message: error.message })}
      </Box>
    );
  }

  const notes = data?.notes || [];

  // If we are at root "/" and have notes, redirect to the first note detail
  const location = useLocation();
  if (location.pathname === '/' && notes.length > 0) {
    return <Navigate to={`/notes/${notes[0].id}`} replace />;
  }
  if (location.pathname === '/' && notes.length === 0) {
    return <Navigate to="/notes/new" replace />;
  }

  return (
    <Box
      className="border-r border-slate-800/80 bg-slate-900 flex flex-col w-80"
      style={{ height: '100vh' }}
    >
      {/* Sidebar Header */}
      <Box className="p-4 border-b border-slate-800/60 flex flex-col gap-3 overflow-hidden bg-slate-950/20">
        <Box className="flex items-center justify-between gap-2">
          <Typography variant="subtitle1" className="font-bold text-slate-100 whitespace-nowrap">
            {i18n.t('dashboard.title')} ({notes.length})
          </Typography>
          <Box className="flex items-center gap-1 ml-auto">
            <Link to="/notes/new">
              <IconButton
                size="small"
                className="bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-500/20 rounded-lg p-1.5"
                title="Create new visit"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Link>
          </Box>
        </Box>

        {/* Inline Language Selector inside Sidebar */}
        <Box className="flex justify-between items-center border-t border-slate-800/40 pt-2 w-full">
          <Typography variant="caption" className="text-slate-500 font-medium">
            Language / Idioma:
          </Typography>
          <Box className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                currentLang.startsWith('en')
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <span className="text-slate-700 text-xs">|</span>
            <button
              type="button"
              onClick={() => changeLanguage('es')}
              className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                currentLang.startsWith('es')
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ES
            </button>
          </Box>
        </Box>
      </Box>

      {/* Visits List */}
      <Box className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {notes.map((note) => {
          const isActive = note.id === activeId;
          const formattedDate = new Date(
            Number(note.createdAt) || note.createdAt,
          ).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const patientName = note.patient
            ? `${note.patient.firstName} ${note.patient.lastName}`
            : 'Unknown Patient';

          return (
            <Link key={note.id} to={`/notes/${note.id}`} className="no-underline">
              <Paper
                elevation={0}
                className={`p-3.5 border transition-all rounded-lg cursor-pointer ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/5'
                    : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/40 hover:border-slate-700/40 text-slate-300'
                }`}
              >
                <Box className="flex flex-col gap-2">
                  <Box className="flex justify-between items-center gap-2">
                    <Typography variant="caption" className="text-slate-400 font-medium">
                      📅 {formattedDate}
                    </Typography>
                    <StatusBadge status={note.status.toLowerCase() as NoteStatus} />
                  </Box>
                  <Typography variant="body2" className="font-bold text-slate-200 line-clamp-2">
                    {patientName}
                  </Typography>
                  <Typography variant="caption" className="text-slate-500 capitalize">
                    {note.inputType === 'audio' ? '🎤 Audio recording' : '📝 Typed note'}
                  </Typography>
                </Box>
              </Paper>
            </Link>
          );
        })}

        {notes.length === 0 && (
          <Box className="p-4 text-center">
            <Typography variant="body2" className="text-slate-500">
              No visits found.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const DashboardLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [queryRef, { refetch }] = useBackgroundQuery<GetNotesData>(GET_NOTES, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return (
    <Box className="flex flex-row bg-slate-950 min-h-screen">
      {/* Sidebar Section */}
      <Suspense
        fallback={
          <Box className="w-80 border-r border-slate-800/60 bg-slate-900 p-4 flex justify-center items-center">
            <CircularProgress size={24} />
          </Box>
        }
      >
        <SidebarList queryRef={queryRef} refetch={refetch} activeId={id} />
      </Suspense>

      {/* Main Details Section */}
      <Box className="flex-1 overflow-y-auto p-6 md:p-8" style={{ height: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
export default DashboardLayout;
