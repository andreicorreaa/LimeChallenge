import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import CreateNote from './pages/CreateNote';
import NoteDetail from './pages/NoteDetail';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 gap-4">
    <h2 className="text-slate-200 text-2xl font-bold">404 — Page Not Found</h2>
    <p className="text-slate-400 max-w-sm">
      The clinical record or dashboard path you are looking for does not exist.
    </p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route path="notes/new" element={<CreateNote />} />
            <Route path="notes/:id" element={<NoteDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
