import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import BoardsListPage from './pages/BoardsListPage/BoardsListPage.jsx';
import BoardPage from './pages/BoardPage/BoardPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage/TaskDetailPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><BoardsListPage /></PrivateRoute>} />
          <Route path="/boards/:boardId" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
          <Route path="/boards/:boardId/tasks/:id" element={<PrivateRoute><TaskDetailPage /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;