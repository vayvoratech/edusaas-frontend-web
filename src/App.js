import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import RoleRoute from './components/auth/RoleRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import StudentDashboard from './pages/StudentDashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SkillAssessment from './pages/assessments/SkillAssessment';
import GapReport from './pages/GapReport';
import LearningPath from './pages/LearningPath';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import JobDetails from "./pages/StudentViewJobs";
import JobApplication from "./pages/JobApplication";
import StudentJobApplications from './pages/StudentJobApplications';

// New student pages
import CoursesPage from './pages/CoursesPage';
import LearningModule from './pages/LearningModule';
import AchievementsPage from './pages/AchievementsPage';
import TasksPage from './pages/TasksPage';
import RecommendationsPage from './pages/RecommendationsPage';
import StudentSettings from './pages/StudentSettings';
import StudentInsights from './pages/StudentInsights';
import InitialAssessment from './pages/assessments/initial/InitialAssessment';
import FinalAssessment from './pages/assessments/final/FinalAssessment';

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
import Community from './pages/Community';

function RoleDashboard() {
  const { role } = useAuth();
  // Ensure we compare in lowercase as the backend returns lowercase roles like "educator", "student"
  switch (role?.toLowerCase()) {
    case 'educator': return <EducatorDashboard />;
    case 'employer': return <EmployerDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'student':
    default: return <StudentDashboard />;
  }
}

function StudentOrAdminSettings() {
  const { role } = useAuth();
  return role?.toLowerCase() === 'admin' ? <Settings /> : <StudentSettings />;
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />

           <Route path="/app" element={<AppLayout />}>
{/* Dashboard */}
<Route
  path="dashboard"
  element={<RoleDashboard />}
/>

{/* Job Details */}
<Route
  path="jobs/:id"
  element={<JobDetails />}
/>

<Route
  path="jobs/:id/apply"
  element={<JobApplication />}
/>


{/* /app → /app/dashboard */}
<Route
  index
  element={<Navigate to="dashboard" replace />}
/>
             
            {/* Shared */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<StudentOrAdminSettings />} />
            <Route path="community" element={<Community />} />

            {/* Student */}
            <Route element={<RoleRoute allowedRoles={["Student"]} />}>
              <Route path="courses" element={<CoursesPage />} />
              <Route path="learning" element={<CoursesPage />} />
              <Route path="learning/:courseId" element={<LearningModule />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="my-insights" element={<StudentInsights />} />
              <Route path="assessments" element={<SkillAssessment />} />
              <Route path="initial-assessment" element={<InitialAssessment />} />
              <Route path="final-assessment" element={<FinalAssessment />} />
              <Route path="gap-report" element={<GapReport />} />
              <Route path="learning-paths" element={<LearningPath />} />
              <Route path="job-applications" element={<StudentJobApplications />}
/>
            </Route>
           

            {/* Educator */}
            <Route element={<RoleRoute allowedRoles={["Educator"]} />}>
              <Route path="manage-courses" element={<ManageCourses />} />
              <Route path="learners" element={<ViewLearners />} />
              <Route path="insights" element={<EducatorInsights />} />
              <Route path="announcements" element={<SendAnnouncement />} />
            </Route>

            {/* Employer */}
            <Route element={<RoleRoute allowedRoles={["Employer"]} />}>
              <Route path="job-listings" element={<JobListings />} />
              <Route path="jobs" element={<Navigate to="/app/job-listings" replace />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="analytics" element={<EmployerAnalytics />} />
            </Route>

            {/* Admin */}
            <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />

              <Route
                path="marketplace"
                element={
                  <Placeholder
                    title="Marketplace"
                    description="Browse and purchase external courses and certifications from partner platforms."
                  />
                }
              />

              <Route
                path="curriculum"
                element={
                  <Placeholder
                    title="Curriculum Alignment"
                    description="Compare syllabus vs. industry skill needs."
                  />
                }
              />

              <Route
                path="workforce"
                element={
                  <Placeholder
                    title="Workforce Insights"
                    description="Team readiness and in-demand skills."
                  />
                }
              />

              <Route
                path="ai-insights"
                element={
                  <Placeholder
                    title="AI Insights Hub"
                    description="Predictive analytics for future skills."
                  />
                }
              />

              <Route
                path="subscriptions"
                element={
                  <Placeholder
                    title="Subscription Management"
                    description="Billing, integrations, and system health."
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
