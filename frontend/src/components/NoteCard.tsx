import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import type { Note } from '../types';
import { StatusBadge } from './StatusBadge';

interface NoteCardProps {
  note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const formattedDate = new Date(Number(note.createdAt) || note.createdAt).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  const previewText = note.inputType === 'text' ? note.rawText : note.transcribedText;
  const patientName = note.patient
    ? `${note.patient.firstName} ${note.patient.lastName}`
    : 'Unknown Patient';

  return (
    <Link to={`/notes/${note.id}`} className="block transition-transform hover:-translate-y-1">
      <Card className="bg-slate-800/60 border border-slate-700/50 hover:border-cyan-500/40 rounded-xl shadow-lg backdrop-blur-sm h-full flex flex-col justify-between">
        <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
          <div>
            <Box className="flex justify-between items-center mb-2">
              <Typography
                variant="subtitle2"
                className="text-cyan-400 font-semibold uppercase tracking-wider"
              >
                {patientName}
              </Typography>
              <Box className="flex gap-2">
                <StatusBadge type={note.inputType} />
                <StatusBadge status={note.status} />
              </Box>
            </Box>

            <Typography
              variant="body2"
              className="text-slate-300 line-clamp-3 mb-4 h-12 leading-relaxed"
            >
              {previewText ||
                (note.status === 'processing'
                  ? 'Generating note content...'
                  : 'No preview available.')}
            </Typography>
          </div>

          <Typography variant="caption" className="text-slate-500 block text-right mt-auto">
            {formattedDate}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};
