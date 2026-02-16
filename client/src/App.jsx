import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FacultyManagement from './pages/FacultyManagement';
import ExamAllotment from './pages/ExamAllotment';
import RoomAllotment from './pages/RoomAllotment';
import Settings from './pages/Settings';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <FacultyManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/exam-allotment" element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <ExamAllotment />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/room-allotment" element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <RoomAllotment />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
