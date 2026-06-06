import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "edu_token";
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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(err);
  }
);

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
};

// Auth
export const loginUser = (credentials) =>
  api.post("/api/auth/login", credentials).then((r) => r.data);
export const registerUser = (data) =>
  api.post("/api/auth/register", data).then((r) => r.data);

// Users
export const getUserProfile = (id) => api.get(`/api/users/${id}`).then((r) => r.data);

// Assessments
export const submitAssessment = (data) =>
  api.post("/api/assessments", data).then((r) => r.data);
export const getAssessmentResults = (id) =>
  api.get(`/api/assessments/${id}/results`).then((r) => r.data);

// Gap report
export const fetchGapReport = (userId) =>
  api.get(`/api/gap-report/${userId}`).then((r) => r.data);

// Courses
export const getCourses = () => api.get("/api/courses").then((r) => r.data);

// Enrollments
export const enrollCourse = (courseId) =>
  api.post("/api/enrollments", { course_id: courseId }).then((r) => r.data);
export const getMyEnrollments = () => api.get("/api/enrollments").then((r) => r.data);

// Jobs
export const getJobs = () => api.get("/api/jobs").then((r) => r.data);
export const applyJob = (jobId) =>
  api.post(`/api/jobs/${jobId}/apply`).then((r) => r.data);

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

export default api;
