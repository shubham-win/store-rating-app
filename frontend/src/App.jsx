
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth() || { user: null, loading: true };

  if (loading) {
    return (
      <div className="App">
        <Header />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading application...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />
          <Route path="/update-password" element={
            <ProtectedRoute>
              <UpdatePassword />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user" element={
            <ProtectedRoute roles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/store-owner" element={
            <ProtectedRoute roles={['store_owner']}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
