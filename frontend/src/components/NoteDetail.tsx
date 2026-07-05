import InfoIcon from '@mui/icons-material/Info';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Box, Card, CardContent, Divider, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Note } from '../types';
import { StatusBadge } from './StatusBadge';

interface NoteDetailProps {
  note: Note;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note }) => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const isAudio = note.inputType === 'audio';

  const formattedDate = new Date(Number(note.createdAt) || note.createdAt).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  const patientName = note.patient
    ? `${note.patient.firstName} ${note.patient.lastName}`
    : 'Unknown Patient';

  return (
    <Box className="flex flex-col gap-6">
      {/* ─── Detail Header ─── */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <Box className="flex flex-col gap-2">
          <Typography variant="h4" className="text-slate-100 font-extrabold tracking-tight">
            {patientName}
          </Typography>
          <Box className="flex items-center gap-3 text-slate-400 text-sm">
            <Typography
              variant="body2"
              className="flex items-center gap-1 font-medium text-slate-400"
            >
              📅 {formattedDate}
            </Typography>
            <span>•</span>
            <StatusBadge status={note.status} />
          </Box>
        </Box>
      </Box>

      {/* ─── Sub-Navigation Tabs ─── */}
      <Box className="flex gap-2">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          classes={{ indicator: 'hidden' }}
          className="min-h-0"
        >
          <Tab
            icon={<InfoIcon fontSize="small" />}
            iconPosition="start"
            label="Visit Info"
            className={`min-h-0 py-2 px-4 text-xs font-bold capitalize tracking-wide rounded-lg transition-all ${
              activeTab === 0
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            style={{ marginRight: '8px' }}
          />
          <Tab
            icon={<ListAltIcon fontSize="small" />}
            iconPosition="start"
            label="Visit Form"
            className={`min-h-0 py-2 px-4 text-xs font-bold capitalize tracking-wide rounded-lg transition-all ${
              activeTab === 1
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          />
        </Tabs>
      </Box>

      {/* ─── Tab Content ─── */}
      {activeTab === 0 ? (
        <Box className="flex flex-col gap-6">
          {/* 1. SUMMARY SECTION */}
          <Box className="flex flex-col gap-2">
            <Typography
              variant="subtitle2"
              className="font-bold text-slate-400 tracking-wider uppercase text-xs"
            >
              SUMMARY
            </Typography>
            <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg">
              <CardContent className="p-5">
                {note.status === 'processing' ? (
                  <Typography variant="body2" className="text-amber-400 font-medium animate-pulse">
                    {i18n.t('noteDetail.soapLoading')}
                  </Typography>
                ) : note.status === 'error' ? (
                  <Typography variant="body2" className="text-rose-400 font-medium">
                    {i18n.t('noteDetail.soapError')}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    className="text-slate-300 whitespace-pre-wrap leading-relaxed"
                  >
                    {note.soapSummary || i18n.t('noteDetail.noSoap')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* 2. TRANSCRIPT SECTION */}
          <Box className="flex flex-col gap-2">
            <Typography
              variant="subtitle2"
              className="font-bold text-slate-400 tracking-wider uppercase text-xs"
            >
              TRANSCRIPT
            </Typography>
            <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg">
              <CardContent className="p-5">
                <Typography
                  variant="body2"
                  className="text-slate-300 whitespace-pre-wrap leading-relaxed"
                >
                  {isAudio
                    ? note.transcribedText || i18n.t('noteDetail.soapLoading')
                    : note.rawText || i18n.t('noteDetail.noSoap')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* 3. AUDIO RECORDINGS SECTION */}
          {isAudio && note.audioFilePath && (
            <Box className="flex flex-col gap-2">
              <Typography
                variant="subtitle2"
                className="font-bold text-slate-400 tracking-wider uppercase text-xs"
              >
                AUDIO RECORDINGS (1)
              </Typography>
              <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg">
                <CardContent className="p-5">
                  <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Box>
                      <Typography variant="body2" className="font-bold text-slate-200">
                        RECORDING 1
                      </Typography>
                      <Typography variant="caption" className="text-slate-400">
                        {formattedDate}
                      </Typography>
                    </Box>
                    <Box className="w-full sm:max-w-md bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/30">
                      {/* biome-ignore lint/a11y/useMediaCaption: Dynamic clinical audio playback, transcription is displayed above */}
                      <audio
                        controls
                        src={
                          note.audioFilePath.startsWith('http')
                            ? note.audioFilePath
                            : `/api${note.audioFilePath}`
                        }
                        className="w-full h-8 outline-none"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      ) : (
        /* Visit Form tab active */
        <Box className="flex flex-col gap-6">
          <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg">
            <CardContent className="p-6 flex flex-col gap-4">
              <Typography
                variant="h6"
                className="font-bold text-slate-200 border-b border-slate-700/50 pb-2"
              >
                Structured SOAP Checklist
              </Typography>
              <Box className="flex flex-col gap-2">
                <Box className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <Typography variant="body2" className="text-slate-300">
                    Subjective: Patient symptoms and complaints parsed
                  </Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <Typography variant="body2" className="text-slate-300">
                    Objective: Vital signs and observations extracted
                  </Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <Typography variant="body2" className="text-slate-300">
                    Assessment: Diagnostic hypothesis and status generated
                  </Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <Typography variant="body2" className="text-slate-300">
                    Plan: Therapeutic recommendations verified
                  </Typography>
                </Box>
              </Box>
              <Divider className="my-2 border-slate-700/50" />
              <Typography variant="caption" className="text-slate-400">
                AI generation completed successfully. Verify findings in the Summary tab.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
export default NoteDetail;
