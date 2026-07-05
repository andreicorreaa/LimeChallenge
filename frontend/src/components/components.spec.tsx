import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockNotes, mockPatients } from '../test/handlers';
import { LoadingSkeleton } from './LoadingSkeleton';
import { NoteCard } from './NoteCard';
import { NoteDetail } from './NoteDetail';
import { NoteForm } from './NoteForm';
import { PatientSelect } from './PatientSelect';
import { PatientSidebar } from './PatientSidebar';
import { StatusBadge } from './StatusBadge';

describe('Frontend Shared Components', () => {
  describe('StatusBadge', () => {
    it('should render correct text input badge style', () => {
      render(<StatusBadge type="text" />);
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should render correct audio input badge style', () => {
      render(<StatusBadge type="audio" />);
      expect(screen.getByText('Audio')).toBeInTheDocument();
    });

    it('should render correct processing status badge style', () => {
      render(<StatusBadge status="processing" />);
      expect(screen.getByText(/Processing/)).toBeInTheDocument();
    });

    it('should render correct ready status badge style', () => {
      render(<StatusBadge status="ready" />);
      expect(screen.getByText(/Ready/)).toBeInTheDocument();
    });

    it('should render correct error status badge style', () => {
      render(<StatusBadge status="error" />);
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });

  describe('PatientSelect', () => {
    it('should call onChange when selecting patient option', () => {
      const handleChange = vi.fn();
      render(<PatientSelect patients={mockPatients} selectedId="" onChange={handleChange} />);

      // Material UI Select utilizes role button to trigger dropdown
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);

      // Select an option
      const option = screen.getByText(/John Doe/);
      fireEvent.click(option);

      expect(handleChange).toHaveBeenCalledWith('pat-1');
    });
  });

  describe('NoteCard', () => {
    it('should render patient name, preview content and badges', () => {
      render(
        <MemoryRouter>
          <NoteCard note={mockNotes[0]} />
        </MemoryRouter>,
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Patient text details')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText(/Ready/)).toBeInTheDocument();
    });
  });

  describe('PatientSidebar', () => {
    it('should render all fields of demographics details', () => {
      render(<PatientSidebar patient={mockPatients[0]} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('MRN001')).toBeInTheDocument();
      expect(screen.getByText('January 1, 1980')).toBeInTheDocument();
    });
  });

  describe('NoteDetail', () => {
    it('should render text note contents correctly', () => {
      render(<NoteDetail note={mockNotes[0]} />);
      expect(screen.getByText('TRANSCRIPT')).toBeInTheDocument();
      expect(screen.getByText('Patient text details')).toBeInTheDocument();
      expect(screen.getByText('SUMMARY')).toBeInTheDocument();
      expect(screen.getByText(/Subjective: complains of cough/)).toBeInTheDocument();
    });

    it('should render audio transcript and player details correctly', () => {
      const audioNote = {
        ...mockNotes[1],
        audioFilePath: '/uploads/file.mp3',
      };
      render(<NoteDetail note={audioNote} />);
      expect(screen.getByText('TRANSCRIPT')).toBeInTheDocument();
      expect(screen.getByText('Spoken transcript text')).toBeInTheDocument();
      expect(screen.getByText('SUMMARY')).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton', () => {
    it('should render list grid skeletons', () => {
      const { container } = render(<LoadingSkeleton variant="list" />);
      expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
    });

    it('should render detail view page skeletons', () => {
      const { container } = render(<LoadingSkeleton variant="detail" />);
      expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
    });
  });

  describe('NoteForm', () => {
    it('should submit text note parameters', () => {
      const handleSubmit = vi.fn();
      render(
        <NoteForm
          patients={mockPatients}
          onSubmit={handleSubmit}
          isSubmitting={false}
          submitError={null}
        />,
      );

      // Select patient
      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);
      fireEvent.click(screen.getByText(/John Doe/));

      // Type details
      const input = screen.getByPlaceholderText(/Enter patient complaints/);
      fireEvent.change(input, { target: { value: 'Patient is coughing.' } });

      // Click submit
      const submitBtn = screen.getByRole('button', { name: 'Process Note' });
      fireEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledWith({
        patientId: 'pat-1',
        inputType: 'text',
        rawText: 'Patient is coughing.',
      });
    });

    it('should toggle input forms between text and audio file', () => {
      render(
        <NoteForm
          patients={mockPatients}
          onSubmit={vi.fn()}
          isSubmitting={false}
          submitError={null}
        />,
      );

      expect(screen.getByPlaceholderText(/Enter patient complaints/)).toBeInTheDocument();

      // Click radio button
      const audioRadio = screen.getByLabelText('Audio Recording Upload');
      fireEvent.click(audioRadio);

      expect(screen.queryByPlaceholderText(/Enter patient complaints/)).not.toBeInTheDocument();
      expect(screen.getByText('Upload Audio File')).toBeInTheDocument();
    });
  });
});
