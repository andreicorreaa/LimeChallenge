import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Patient } from '../types';

interface PatientSidebarProps {
  patient: Patient;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ patient }) => {
  const { i18n } = useTranslation();
  const [year, month, day] = patient.dateOfBirth.split('-');
  const formattedDOB = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg h-fit sticky top-6">
      <CardContent className="p-5 flex flex-col gap-4 text-left">
        <Typography
          variant="h6"
          className="text-cyan-400 font-semibold uppercase tracking-wider text-sm text-left"
        >
          {i18n.t('demographics.title')}
        </Typography>

        <Box className="flex flex-col gap-3">
          {/* Full Name */}
          <Box className="flex flex-col text-left">
            <span className="text-slate-400 text-xs font-medium">
              {i18n.t('demographics.fullName')}
            </span>
            <span className="text-slate-200 text-base font-bold mt-0.5">
              {patient.firstName} {patient.lastName}
            </span>
          </Box>
          <Divider className="bg-slate-700/50" />

          {/* Date of Birth */}
          <Box className="flex flex-col text-left">
            <span className="text-slate-400 text-xs font-medium">{i18n.t('demographics.dob')}</span>
            <span className="text-slate-200 text-sm font-semibold mt-0.5">{formattedDOB}</span>
          </Box>
          <Divider className="bg-slate-700/50" />

          {/* MRN */}
          <Box className="flex flex-col text-left">
            <span className="text-slate-400 text-xs font-medium">{i18n.t('demographics.mrn')}</span>
            <span className="text-cyan-400 text-sm font-bold mt-0.5">{patient.mrn}</span>
          </Box>
          <Divider className="bg-slate-700/50" />

          {/* System ID */}
          <Box className="flex flex-col text-left">
            <span className="text-slate-400 text-xs font-medium">
              {i18n.t('demographics.sysId')}
            </span>
            <span className="text-slate-500 text-xs font-mono break-all mt-0.5">{patient.id}</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default PatientSidebar;
