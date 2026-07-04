import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Note } from '../types';

interface NoteDetailProps {
  note: Note;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note }) => {
  const { i18n } = useTranslation();
  const isAudio = note.inputType === 'audio';

  return (
    <Box className="flex flex-col gap-6">
      {/* Input Section (Text or Audio) */}
      <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg">
        <CardContent className="p-6">
          <Typography
            variant="h6"
            className="text-slate-100 font-semibold mb-3 border-b border-slate-700 pb-2"
          >
            {isAudio ? i18n.t('noteDetail.audioTranscript') : i18n.t('noteDetail.rawInput')}
          </Typography>

          {isAudio && note.audioFilePath && (
            <Box className="mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
              <Typography variant="body2" className="text-slate-400 mb-2 font-medium">
                {i18n.t('noteDetail.audioPlayback')}
              </Typography>
              {/* biome-ignore lint/a11y/useMediaCaption: Dynamic clinical audio playback, transcription is displayed below */}
              <audio
                controls
                src={
                  note.audioFilePath.startsWith('http')
                    ? note.audioFilePath
                    : `/api${note.audioFilePath}`
                }
                className="w-full h-10 rounded-md outline-none"
              />
            </Box>
          )}

          <Typography
            variant="body1"
            className="text-slate-300 whitespace-pre-wrap leading-relaxed"
          >
            {isAudio
              ? note.transcribedText || i18n.t('noteDetail.soapLoading')
              : note.rawText || i18n.t('noteDetail.noSoap')}
          </Typography>
        </CardContent>
      </Card>

      {/* Structured SOAP Summary Section */}
      <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg border-l-4 border-l-cyan-500">
        <CardContent className="p-6">
          <Typography
            variant="h6"
            className="text-cyan-400 font-semibold mb-3 border-b border-slate-700 pb-2"
          >
            {i18n.t('noteDetail.soapTitle')}
          </Typography>

          {note.status === 'processing' ? (
            <Typography variant="body1" className="text-amber-400 animate-pulse font-medium">
              {i18n.t('noteDetail.soapLoading')}
            </Typography>
          ) : note.status === 'error' ? (
            <Typography variant="body1" className="text-rose-400 font-medium">
              {i18n.t('noteDetail.soapError')}
            </Typography>
          ) : (
            <Box className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
              {note.soapSummary || i18n.t('noteDetail.noSoap')}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
