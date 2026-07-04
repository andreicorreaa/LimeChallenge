import { Route, Routes } from 'react-router-dom';

// Pages — will be implemented in Phase 4
const Home = () => <div>Home — Notes List (coming soon)</div>;
const CreateNote = () => <div>Create Note (coming soon)</div>;
const NoteDetail = () => <div>Note Detail (coming soon)</div>;
const NotFound = () => <div>404 — Page not found</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/notes/new" element={<CreateNote />} />
      <Route path="/notes/:id" element={<NoteDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
