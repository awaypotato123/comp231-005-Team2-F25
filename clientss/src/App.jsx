import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classes from './pages/Classes';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ClassDetail from './pages/ClassDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  // Redirect to home if no user is logged in
  return user ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  // Check if user is logged in and has admin role
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<ClassDetail />} />
            {/* Protected route: User must be logged in */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            {/* Admin route: Only accessible to users with 'admin' role */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
