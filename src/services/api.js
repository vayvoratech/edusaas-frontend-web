import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "edu_token";
const REFRESH_KEY = "edu_refresh";
const USER_KEY = "edu_user";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Token refresh handling ----
// When a request comes back 401, try once to swap the refresh token for a new
// access token, then retry the original request. If refresh itself 401s, the
// user is fully logged out.
let refreshPromise = null;

async function attemptRefresh() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("no refresh token");
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE}/api/auth/refresh`, { refreshToken })
      .then((res) => {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        if (res.data.refreshToken) {
          localStorage.setItem(REFRESH_KEY, res.data.refreshToken);
        }
        if (res.data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
        return res.data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;
    // Don't refresh on the refresh/login endpoints themselves; that just loops.
    const url = original?.url || "";
    const isAuthEndpoint = url.includes("/api/auth/");

    if (status === 401 && !original._retried && !isAuthEndpoint) {
      try {
        const newToken = await attemptRefresh();
        original._retried = true;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (_) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    return Promise.reject(err);
  }
);

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const refreshStore = {
  get: () => localStorage.getItem(REFRESH_KEY),
  set: (t) => localStorage.setItem(REFRESH_KEY, t),
};

export const userStore = {
  get: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(USER_KEY),
};

// Auth
export const loginUser = (credentials) =>
  api.post("/api/auth/login", credentials).then((r) => r.data);
export const registerUser = (data) =>
  api.post("/api/auth/register", data).then((r) => r.data);
export const fetchMe = () => api.get("/api/auth/me").then((r) => r.data);

// Users
export const getUserProfile = (id) => api.get(`/api/users/${id}`).then((r) => r.data);
export const saveUserProfile = (id, data) =>
  api.put(`/api/users/${id}/profile`, data).then((r) => r.data);
export const getStudentCandidates = () =>
  api.get("/api/users/students/candidates").then((r) => r.data);

// Assessments
export const submitAssessment = (data) =>
  api.post("/api/assessments", data).then((r) => r.data);
export const getAssessmentResults = (id) =>
  api.get(`/api/assessments/${id}/results`).then((r) => r.data);

// Gap report
export const fetchGapReport = (userId) =>
  api.get(`/api/gap-report/${userId}`).then((r) => r.data);

// Courses
export const getCourses = (params = {}) =>
  api.get("/api/courses", { params }).then((r) => r.data);
export const getCourse = (id) => api.get(`/api/courses/${id}`).then((r) => r.data);
export const createCourse = (data) => api.post("/api/courses", data).then((r) => r.data);
export const updateCourse = (id, data) =>
  api.patch(`/api/courses/${id}`, data).then((r) => r.data);
export const deleteCourse = (id) => api.delete(`/api/courses/${id}`).then((r) => r.data);

// Lessons
export const getLessonsForCourse = (courseId) =>
  api.get(`/api/courses/${courseId}/lessons`).then((r) => r.data);
export const createLesson = (courseId, data) =>
  api.post(`/api/courses/${courseId}/lessons`, data).then((r) => r.data);
export const getLesson = (lessonId) =>
  api.get(`/api/lessons/lesson/${lessonId}`).then((r) => r.data);

// Progress
export const getMyProgress = () => api.get("/api/progress").then((r) => r.data);
export const updateProgress = (lessonId, patch) =>
  api.patch(`/api/progress/${lessonId}`, patch).then((r) => r.data);

// Enrollments
export const enrollCourse = (courseId) =>
  api.post("/api/enrollments", { course_id: courseId }).then((r) => r.data);
export const getMyEnrollments = () => api.get("/api/enrollments").then((r) => r.data);

// Jobs
export const getJobs = (params = {}) => api.get("/api/jobs", { params }).then((r) => r.data);
export const createJob = (data) => api.post("/api/jobs", data).then((r) => r.data);
export const updateJob = (id, data) =>
  api.patch(`/api/jobs/${id}`, data).then((r) => r.data);
export const deleteJob = (id) => api.delete(`/api/jobs/${id}`).then((r) => r.data);
export const applyJob = (jobId) =>
  api.post(`/api/jobs/${jobId}/apply`).then((r) => r.data);
export const inviteCandidate = (jobId, studentId, message) =>
  api.post(`/api/jobs/${jobId}/invite`, { student_id: studentId, message }).then((r) => r.data);

// Course assignments (educator → student)
export const assignCourse = (courseId, { student_ids, due_date, note }) =>
  api.post(`/api/courses/${courseId}/assign`, { student_ids, due_date, note }).then((r) => r.data);
export const getMyAssignments = () =>
  api.get('/api/me/assignments').then((r) => r.data);
export const getCourseAssignments = (courseId) =>
  api.get(`/api/courses/${courseId}/assignments`).then((r) => r.data);
export const cancelAssignment = (assignmentId) =>
  api.post(`/api/assignments/${assignmentId}/cancel`).then((r) => r.data);
export const getJobApplications = (jobId) =>
  api.get(`/api/jobs/${jobId}/applications`).then((r) => r.data);

// Notifications
export const getNotifications = () => api.get("/api/notifications").then((r) => r.data);

// Admin
export const getAllUsers = (params = {}) =>
  api.get("/api/admin/users", { params }).then((r) => r.data);
export const updateUser = (id, data) =>
  api.patch(`/api/admin/users/${id}`, data).then((r) => r.data);
export const deleteUser = (id) =>
  api.delete(`/api/admin/users/${id}`).then((r) => r.data);
export const getInsights = () => api.get("/api/admin/insights").then((r) => r.data);

// Reports
export const getReportsSummary = () => api.get("/api/reports/summary").then((r) => r.data);
export const getTopReports = () => api.get("/api/reports").then((r) => r.data);
export const getExportHistory = () => api.get("/api/reports/exports").then((r) => r.data);

// Settings
export const getSettings = () => api.get("/api/settings").then((r) => r.data);
export const updateSettings = (patch) =>
  api.patch("/api/settings", patch).then((r) => r.data);

// Subscriptions
export const updateSubscription = (data) =>
  api.post("/api/subscriptions", data).then((r) => r.data);
export const getMySubscription = () => api.get("/api/subscriptions").then((r) => r.data);

// Tasks
export const getMyTasks = (params = {}) =>
  api.get("/api/tasks", { params }).then((r) => r.data);
export const createTask = (data) => api.post("/api/tasks", data).then((r) => r.data);
export const updateTask = (id, data) =>
  api.patch(`/api/tasks/${id}`, data).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`).then((r) => r.data);

// Achievements
export const getMyAchievements = () => api.get("/api/achievements").then((r) => r.data);

// Certificates
export const getMyCertificates = () => api.get("/api/certificates").then((r) => r.data);

// Recommendations
export const getMyRecommendations = () =>
  api.get("/api/recommendations").then((r) => r.data);

// Announcements
export const getAnnouncements = () => api.get("/api/announcements").then((r) => r.data);
export const sendAnnouncement = (data) =>
  api.post("/api/announcements", data).then((r) => r.data);

// Dashboards
export const getStudentDashboard = () =>
  api.get("/api/dashboard/student").then((r) => r.data);
export const getEducatorDashboard = () =>
  api.get("/api/dashboard/educator").then((r) => r.data);
export const getEmployerDashboard = () =>
  api.get("/api/dashboard/employer").then((r) => r.data);

export default api;
