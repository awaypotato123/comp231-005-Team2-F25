import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './pages/Home';
import Classes from './pages/Classes';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
// import Browse from './pages/Browse';
import SkillDetail from './pages/SkillDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import EditClass from './components/EditClass';
import CreateClass from './components/CreateClass';
import Classroom from './components/Classroom';
import EnterClass from './components/EnterClass';
import ManageClass from './components/ManageClass';
import PublicProfile from './components/ViewProfile';
import BrowseUnified from './pages/BrowseUnified';
import Feedback from './components/Feedback';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  
  return user ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  
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
<Route path="/browse" element={<BrowseUnified />} />
            <Route path="/skills/:id" element={<SkillDetail />} />
            <Route path="/classes" element={<Classes />} />
            {/* Protected route: User must be logged in */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            {/* Admin route: Only accessible to users with 'admin' role */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/create-class" element={<CreateClass />} />
            <Route path="/edit-class/:classId" element={<EditClass />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/enter-class/:classId" element={<EnterClass />} />
            <Route path="/manage-class/:classId" element={<ManageClass />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/feedback/:classId" element={<Feedback />} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}