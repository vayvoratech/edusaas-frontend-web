import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SkillAssessment from './pages/SkillAssessment';
import GapReport from './pages/GapReport';
import LearningPath from './pages/LearningPath';
import Profile from './pages/Profile';
import Placeholder from './pages/Placeholder';

function RoleDashboard() {
  const { role } = useAuth();
  switch (role) {
    case 'Educator': return <EducatorDashboard />;
    case 'Employer': return <EmployerDashboard />;
    case 'Admin': return <AdminDashboard />;
    case 'Student':
    default: return <StudentDashboard />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleDashboard />} />
            <Route path="assessments" element={<SkillAssessment />} />
            <Route path="gap-report" element={<GapReport />} />
            <Route path="learning-paths" element={<LearningPath />} />
            <Route path="profile" element={<Profile />} />

            <Route path="marketplace" element={<Placeholder title="Marketplace" description="Browse and purchase external courses and certifications from partner platforms." />} />
            <Route path="analytics" element={<Placeholder title="Batch Analytics" description="Readiness charts by batch and year." />} />
            <Route path="curriculum" element={<Placeholder title="Curriculum Alignment" description="Compare syllabus vs. industry skill needs." />} />
            <Route path="candidates" element={<Placeholder title="Candidate Matching" description="Skill match percentages and assessment invitations." />} />
            <Route path="workforce" element={<Placeholder title="Workforce Insights" description="Team readiness and in-demand skills." />} />
            <Route path="users" element={<Placeholder title="User Management" description="Roles, permissions, and platform usage." />} />
            <Route path="ai-insights" element={<Placeholder title="AI Insights Hub" description="Predictive analytics for future skills." />} />
            <Route path="subscriptions" element={<Placeholder title="Subscription Management" description="Billing, integrations, and system health." />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
