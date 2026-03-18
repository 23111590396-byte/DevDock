import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import Messenger from './pages/Messenger';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';
import RepositoryPage from './pages/RepositoryPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
            <Route path="/repos/:repoId" element={<RepositoryPage />} />
            <Route path="/:username/:repoName" element={<RepositoryPage />} />
            <Route path="/:username" element={<UserProfile />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
