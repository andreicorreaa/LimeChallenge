import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import type { CreateNotePayload, NoteInputType, Patient } from '../types';
import { PatientSelect } from './PatientSelect';

interface NoteFormProps {
  patients: Patient[];
  onSubmit: (payload: CreateNotePayload) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  patients,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [patientId, setPatientId] = useState('');
  const [inputType, setInputType] = useState<NoteInputType>('text');
  const [rawText, setRawText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    if (inputType === 'text') {
      onSubmit({ patientId, inputType, rawText });
    } else {
      if (!audioFile) return;
      onSubmit({ patientId, inputType, audioFile });
    }
  };

  const isFormValid =
    patientId && (inputType === 'text' ? rawText.trim().length > 0 : audioFile !== null);

  return (
    <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg max-w-2xl mx-auto">
      <CardContent className="p-6">
        <Typography variant="h5" className="text-slate-100 font-semibold mb-6">
          Create Clinical Note
        </Typography>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Patient Selection */}
          <Box>
            <Typography variant="subtitle2" className="text-slate-400 mb-2 font-medium">
              Select Patient Record
            </Typography>
            <PatientSelect
              patients={patients}
              selectedId={patientId}
              onChange={setPatientId}
              disabled={isSubmitting}
            />
          </Box>

          {/* Input Type Selector */}
          <Box>
            <Typography variant="subtitle2" className="text-slate-400 mb-2 font-medium">
              Input Mode
            </Typography>
            <RadioGroup
              row
              value={inputType}
              onChange={(e) => setInputType(e.target.value as NoteInputType)}
              className="text-slate-200"
            >
              <FormControlLabel
                value="text"
                control={<Radio className="text-cyan-500" />}
                label="Typed Text"
                disabled={isSubmitting}
              />
              <FormControlLabel
                value="audio"
                control={<Radio className="text-cyan-500" />}
                label="Audio Recording Upload"
                disabled={isSubmitting}
              />
            </RadioGroup>
          </Box>

          {/* Conditional Input Fields */}
          {inputType === 'text' ? (
            <Box>
              <Typography variant="subtitle2" className="text-slate-400 mb-2 font-medium">
                Clinical Details / Typed Note
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Enter patient complaints, vitals, history, or assessment findings..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={isSubmitting}
                className="bg-slate-800/50 text-slate-100 border-slate-700 focus:border-cyan-500 rounded-lg"
                InputProps={{
                  className: 'text-slate-100',
                }}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" className="text-slate-400 mb-2 font-medium">
                Select Audio Recording (.mp3, .wav, .m4a)
              </Typography>
              <Box className="flex flex-col gap-3">
                <Button
                  variant="outlined"
                  component="label"
                  disabled={isSubmitting}
                  className="border-slate-700 hover:border-cyan-500 text-slate-300 py-3 rounded-lg capitalize w-full"
                >
                  {audioFile ? `Change File: ${audioFile.name}` : 'Upload Audio File'}
                  <input type="file" accept="audio/*" hidden onChange={handleFileChange} />
                </Button>
                {audioFile && (
                  <Typography variant="caption" className="text-cyan-400 font-medium block ml-1">
                    Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Error Message */}
          {submitError && (
            <Typography variant="body2" className="text-rose-400 font-medium text-center">
              Error: {submitError}
            </Typography>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid || isSubmitting}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-slate-950 font-bold py-3 rounded-lg capitalize shadow-lg shadow-cyan-500/10"
          >
            {isSubmitting ? (
              <Box className="flex items-center gap-3 justify-center">
                <CircularProgress size={20} className="text-slate-950" />
                <span>AI Scribe is parsing findings...</span>
              </Box>
            ) : (
              <span>Process Note</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
