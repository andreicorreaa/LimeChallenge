import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../test/server';
import { CreateNote } from './CreateNote';
import { Home } from './Home';
import { NoteDetailContainer } from './NoteDetail';

// Wrapper helper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Frontend Integrated Pages', () => {
  describe('Home Page', () => {
    it('should render loading skeletons then loaded notes list', async () => {
      const Wrapper = createWrapper();
      render(<Home />, { wrapper: Wrapper });

      // Skeletons are visible initially
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);

      // Wait for Mock Notes to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display error message on API query fail', async () => {
      // Temporarily override MSW handler to return 500 error
      server.use(
        http.post('/graphql', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const Wrapper = createWrapper();
      render(<Home />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Error fetching notes/)).toBeInTheDocument();
      });
    });
  });

  describe('CreateNote Page', () => {
    it('should load patients list and handle creation redirect flow', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      // Wrap page with path routes to verify redirect transitions
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/notes/new']}>
            <Routes>
              <Route path="/notes/new" element={<CreateNote />} />
              <Route path="/" element={<div>Dashboard Page</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // Verify dropdown loaded patients list
      await waitFor(() => {
        expect(screen.getByLabelText('Select Patient')).toBeInTheDocument();
      });

      // Fill form values
      const selectBox = screen.getByRole('combobox');
      fireEvent.mouseDown(selectBox);
      fireEvent.click(screen.getByText(/John Doe/));

      const textarea = screen.getByPlaceholderText(/Enter patient complaints/);
      fireEvent.change(textarea, { target: { value: 'Patient feels dizzy.' } });

      // Click submit and verify redirection to root '/'
      const submitBtn = screen.getByRole('button', { name: 'Process Note' });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  describe('NoteDetail Page', () => {
    it('should render detailed note content, patient details, and handle delete trigger', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/notes/note-1']}>
            <Routes>
              <Route path="/notes/:id" element={<NoteDetailContainer />} />
              <Route path="/" element={<div>Dashboard Page</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // Verify note details and demographics sections rendered
      await waitFor(() => {
        expect(screen.getByText('Clinical Record Detail')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('MRN001')).toBeInTheDocument();
        expect(screen.getByText('Patient text details')).toBeInTheDocument();
      });

      // Click delete button and verify redirect home
      const deleteBtn = screen.getByRole('button', { name: 'Delete Note' });
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });
  });
});
