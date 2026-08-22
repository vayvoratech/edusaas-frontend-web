import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import RoleRoute from './components/auth/RoleRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SkillAssessment from './pages/SkillAssessment';
import GapReport from './pages/GapReport';
import { getStudentDashboard } from './services/api';
import LearningPath from './pages/LearningPath';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import JobDetails from "./pages/StudentViewJobs";
import JobApplication from "./pages/JobApplication";

// New student pages
import CoursesPage from './pages/CoursesPage';
import LearningModule from './pages/LearningModule';
import AchievementsPage from './pages/AchievementsPage';
import TasksPage from './pages/TasksPage';
import RecommendationsPage from './pages/RecommendationsPage';
import StudentSettings from './pages/StudentSettings';
import StudentInsights from './pages/StudentInsights';
import InitialAssessment from './pages/InitialAssessment';

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


function StudentAssessmentGuard({ children }) {
  const { role } = useAuth();

  const [checking, setChecking] = React.useState(true);
  const [assessmentCompleted, setAssessmentCompleted] = React.useState(false);

  React.useEffect(() => {
    if (role !== "Student") {
      setChecking(false);
      return;
    }

    getStudentDashboard()
      .then((data) => {
        console.log(
          "GUARD ASSESSMENT STATUS:",
          data?.assessmentCompleted
        );

        setAssessmentCompleted(
          data?.assessmentCompleted === true
        );
      })
      .catch((err) => {
        console.error("Assessment status check failed:", err);
        setAssessmentCompleted(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [role]);

  if (role !== "Student") {
    return children;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">
          Checking assessment status...
        </div>
      </div>
    );
  }

  if (assessmentCompleted) {
    return children;
  }

  return (
    <Navigate
      to="/app/initial-assessment"
      replace
    />
  );
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
            {/* Student */}
           <Route element={<RoleRoute allowedRoles={["Student"]} />}>
  
  {/* Assessment is always accessible */}
  <Route
    path="assessments"
    element={<SkillAssessment />}
  />

  <Route
    path="initial-assessment"
    element={<InitialAssessment />}
  />

  {/* Everything below requires completed assessment */}
  <Route
    path="courses"
    element={
      <StudentAssessmentGuard>
        <CoursesPage />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="learning"
    element={
      <StudentAssessmentGuard>
        <CoursesPage />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="learning/:courseId"
    element={
      <StudentAssessmentGuard>
        <LearningModule />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="achievements"
    element={
      <StudentAssessmentGuard>
        <AchievementsPage />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="tasks"
    element={
      <StudentAssessmentGuard>
        <TasksPage />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="recommendations"
    element={
      <StudentAssessmentGuard>
        <RecommendationsPage />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="my-insights"
    element={
      <StudentAssessmentGuard>
        <StudentInsights />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="gap-report"
    element={
      <StudentAssessmentGuard>
        <GapReport />
      </StudentAssessmentGuard>
    }
  />

  <Route
    path="learning-paths"
    element={
      <StudentAssessmentGuard>
        <LearningPath />
      </StudentAssessmentGuard>

    }
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
