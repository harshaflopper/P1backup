import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FacultyManagement from './pages/FacultyManagement';
import ExamAllotment from './pages/ExamAllotment';
import RoomAllotment from './pages/RoomAllotment';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FacultyManagement />} />
          <Route path="/exam-allotment" element={<ExamAllotment />} />
          <Route path="/room-allotment" element={<RoomAllotment />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
