import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Board from './components/Board/Board.jsx';
import TaskDetailPage from './pages/TaskDetailPage/TaskDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;