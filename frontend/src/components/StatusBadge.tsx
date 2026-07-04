import { Chip } from '@mui/material';
import React from 'react';
import type { NoteInputType, NoteStatus } from '../types';

interface StatusBadgeProps {
  status?: NoteStatus;
  type?: NoteInputType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  if (type) {
    const isAudio = type === 'audio';
    return (
      <Chip
        label={isAudio ? 'Audio' : 'Text'}
        size="small"
        className={`font-semibold rounded-md border ${
          isAudio
            ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30'
            : 'bg-slate-800 text-slate-300 border-slate-700/50'
        }`}
      />
    );
  }

  if (status) {
    let colorClass = 'bg-slate-800 text-slate-300 border-slate-700/50';
    let label = 'Unknown';

    if (status === 'processing') {
      colorClass = 'bg-amber-950/40 text-amber-400 border-amber-500/30 animate-pulse';
      label = 'Processing';
    } else if (status === 'ready') {
      colorClass = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
      label = 'Ready';
    } else if (status === 'error') {
      colorClass = 'bg-rose-950/40 text-rose-400 border-rose-500/30';
      label = 'Error';
    }

    return (
      <Chip
        label={label}
        size="small"
        className={`font-semibold rounded-md border ${colorClass}`}
      />
    );
  }

  return null;
};
