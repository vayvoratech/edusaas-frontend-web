import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SkillAssessment from './pages/SkillAssessment';
import GapReport from './pages/GapReport';
import LearningPath from './pages/LearningPath';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// New student pages
import CoursesPage from './pages/CoursesPage';
import LearningModule from './pages/LearningModule';
import AchievementsPage from './pages/AchievementsPage';
import TasksPage from './pages/TasksPage';
import RecommendationsPage from './pages/RecommendationsPage';
import StudentSettings from './pages/StudentSettings';
import StudentInsights from './pages/StudentInsights';

// New educator pages
import ManageCourses from './pages/ManageCourses';
import ViewLearners from './pages/ViewLearners';
import EducatorInsights from './pages/EducatorInsights';
import SendAnnouncement from './pages/SendAnnouncement';

// New employer pages
import JobListings from './pages/JobListings';
import Candidates from './pages/Candidates';
import EmployerAnalytics from './pages/EmployerAnalytics';

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

function StudentOrAdminSettings() {
  const { role } = useAuth();
  return role === 'Admin' ? <Settings /> : <StudentSettings />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleDashboard />} />

            {/* Shared */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<StudentOrAdminSettings />} />

            {/* Student */}
            <Route path="courses" element={<CoursesPage />} />
            <Route path="learning" element={<CoursesPage />} />
            <Route path="learning/:courseId" element={<LearningModule />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="my-insights" element={<StudentInsights />} />
            <Route path="assessments" element={<SkillAssessment />} />
            <Route path="gap-report" element={<GapReport />} />
            <Route path="learning-paths" element={<LearningPath />} />

            {/* Educator */}
            <Route path="manage-courses" element={<ManageCourses />} />
            <Route path="learners" element={<ViewLearners />} />
            <Route path="insights" element={<EducatorInsights />} />
            <Route path="announcements" element={<SendAnnouncement />} />

            {/* Employer */}
            <Route path="job-listings" element={<JobListings />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="analytics" element={<EmployerAnalytics />} />

            {/* Admin */}
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<Reports />} />

            {/* Legacy placeholders kept for sidebar links not yet replaced */}
            <Route path="marketplace" element={<Placeholder title="Marketplace" description="Browse and purchase external courses and certifications from partner platforms." />} />
            <Route path="curriculum" element={<Placeholder title="Curriculum Alignment" description="Compare syllabus vs. industry skill needs." />} />
            <Route path="workforce" element={<Placeholder title="Workforce Insights" description="Team readiness and in-demand skills." />} />
            <Route path="ai-insights" element={<Placeholder title="AI Insights Hub" description="Predictive analytics for future skills." />} />
            <Route path="subscriptions" element={<Placeholder title="Subscription Management" description="Billing, integrations, and system health." />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
