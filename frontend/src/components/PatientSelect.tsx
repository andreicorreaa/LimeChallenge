import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import type { Patient } from '../types';

interface PatientSelectProps {
  patients: Patient[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export const PatientSelect: React.FC<PatientSelectProps> = ({
  patients,
  selectedId,
  onChange,
  disabled = false,
}) => {
  return (
    <FormControl fullWidth variant="outlined" disabled={disabled}>
      <InputLabel id="patient-select-label" className="text-slate-400">
        Select Patient
      </InputLabel>
      <Select
        labelId="patient-select-label"
        id="patient-select"
        value={selectedId}
        onChange={(e) => onChange(e.target.value as string)}
        label="Select Patient"
        className="bg-slate-800/50 text-slate-100 border-slate-700 focus:border-cyan-500 rounded-lg"
        MenuProps={{
          PaperProps: {
            className: 'bg-slate-800 text-slate-100 border border-slate-700',
          },
        }}
      >
        <MenuItem value="" disabled>
          <em>Select a patient</em>
        </MenuItem>
        {patients.map((p) => (
          <MenuItem key={p.id} value={p.id} className="hover:bg-slate-700 focus:bg-slate-700">
            {p.firstName} {p.lastName} (MRN: {p.mrn})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
