import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { getMe } from './services/api';
import { useAuthStore } from './store/authStore';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LearningWorkspacePage from './pages/LearningWorkspacePage';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
  const { isAuthenticated, setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getMe();
        setAuth(response.user);
      } catch {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };
    void checkAuth();
  }, [setAuth, setLoading]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/learn/:lessonId" element={<ProtectedRoute><LearningWorkspacePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
