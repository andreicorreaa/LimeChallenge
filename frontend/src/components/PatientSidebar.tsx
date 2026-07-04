import {
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import type { Patient } from '../types';

interface PatientSidebarProps {
  patient: Patient;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ patient }) => {
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
      <CardContent className="p-5">
        <Typography
          variant="h6"
          className="text-cyan-400 font-semibold mb-4 uppercase tracking-wider text-sm"
        >
          Patient Demographics
        </Typography>
        <List className="p-0">
          <ListItem className="px-0 py-2 flex flex-col items-start">
            <ListItemText
              primary={<span className="text-slate-400 text-xs">Full Name</span>}
              secondary={
                <span className="text-slate-200 text-base font-medium">
                  {patient.firstName} {patient.lastName}
                </span>
              }
              className="m-0"
            />
          </ListItem>
          <Divider className="bg-slate-700/50" />
          <ListItem className="px-0 py-2 flex flex-col items-start">
            <ListItemText
              primary={<span className="text-slate-400 text-xs">Date of Birth</span>}
              secondary={<span className="text-slate-200 text-sm font-medium">{formattedDOB}</span>}
              className="m-0"
            />
          </ListItem>
          <Divider className="bg-slate-700/50" />
          <ListItem className="px-0 py-2 flex flex-col items-start">
            <ListItemText
              primary={<span className="text-slate-400 text-xs">Medical Record Number (MRN)</span>}
              secondary={<span className="text-cyan-400 text-sm font-semibold">{patient.mrn}</span>}
              className="m-0"
            />
          </ListItem>
          <Divider className="bg-slate-700/50" />
          <ListItem className="px-0 py-2 flex flex-col items-start">
            <ListItemText
              primary={<span className="text-slate-400 text-xs">Patient System ID</span>}
              secondary={
                <span className="text-slate-400 text-xs font-mono break-all">{patient.id}</span>
              }
              className="m-0"
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
