


import axios from "axios";

// ---------------------------------------------------------
// Environment & Constants
// ---------------------------------------------------------
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "edu_token";
const REFRESH_KEY = "edu_refresh";
const USER_KEY = "edu_user";

// ---------------------------------------------------------
// Axios Configuration & Interceptors
// ---------------------------------------------------------
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

async function attemptRefresh() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("no refresh token");

  if (!refreshPromise) {
    const token = localStorage.getItem(TOKEN_KEY);
    refreshPromise = axios
      .post(
        `${API_BASE}/api/auth/refresh`,
        { refreshToken },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        localStorage.setItem(TOKEN_KEY, res.data.accessToken);
        if (res.data.refreshToken) {
          localStorage.setItem(REFRESH_KEY, res.data.refreshToken);
        }
        if (res.data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
        return res.data.accessToken;
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

// ---------------------------------------------------------
// Storage Helpers
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// Authentication API
// ---------------------------------------------------------
export const loginUser = (credentials) => api.post("/api/auth/login", credentials).then((r) => r.data);
export const registerUser = (data) => api.post("/api/auth/register", data).then((r) => r.data);
export const fetchMe = () => api.get("/api/auth/me").then((r) => r.data);
export const forgotPassword = (email) => api.post("/api/auth/forgot-password", { email }).then((r) => r.data);
export const verifyOtp = (data) => api.post("/api/auth/verify-otp", data).then((r) => r.data);
export const resetPassword = (data) => api.post("/api/auth/reset-password", data).then((r) => r.data);

// ---------------------------------------------------------
// User & Role API
// ---------------------------------------------------------
export const getDomainRoles = async () => {
  const res = await api.get("/api/domain-roles");
  return res.data.data;
};
export const getUserProfile = (id) => api.get(`/api/users/${id}`).then((r) => r.data);
export const updateUserName = (id, name) =>
  api.patch(`/api/users/${id}`, { name }).then((r) => r.data);
export const saveUserProfile = (id, data) =>
  api.put(`/api/users/${id}/profile`, data).then((r) => r.data);

export const uploadProfileAvatar = (id, imageFile) => {
  const formData = new FormData();
  formData.append("avatar", imageFile);
  return api
    .post(`/api/users/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const deleteProfileAvatar = (id) =>
  api.delete(`/api/users/${id}/avatar`).then((r) => r.data);

export const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const uploadProfileResume = (id, resumeFile) => {
  const formData = new FormData();

  formData.append("resume", resumeFile);

  return api
    .post(`/api/users/${id}/profile/resume`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => r.data);
};
export const getStudentCandidates = () =>
  api.get("/api/users/students/candidates").then((r) => r.data);

// ---------------------------------------------------------
// Assessments & Gap Report API
// ---------------------------------------------------------
export const submitAssessment = (data) => api.post("/api/assessments", data).then((r) => r.data);
export const getAssessmentResults = (id) => api.get(`/api/assessments/${id}/results`).then((r) => r.data);
export const getAssessmentOverview = () =>
  api.get("/api/assessments/overview").then((r) => r.data);

export const fetchGapReport = (userId) =>
  api.get(`/api/gap-report/${userId}`).then((r) => r.data);


// Initial Adaptive Skill Assessment
export const startInitialQuiz = () => api.post("/api/assessments/initial-quiz/start").then((r) => r.data);
export const submitInitialQuizAnswer = ({ sessionId, questionId, answer }) =>
  api.post("/api/assessments/initial-quiz/answer", { session_id: sessionId, question_id: questionId, answer }).then((r) => r.data);
export const activateInitialQuiz = (sessionId) =>
  api.post("/api/assessments/initial-quiz/activate", { session_id: sessionId }).then((r) => r.data);
export const heartbeatInitialQuiz = (sessionId) =>
  api.post("/api/assessments/initial-quiz/heartbeat", { session_id: sessionId }).then((r) => r.data);
export const pauseInitialQuiz = (sessionId) =>
  api.post("/api/assessments/initial-quiz/pause", { session_id: sessionId }).then((r) => r.data);

export const pauseInitialQuizOnUnload = (sessionId) => {
  if (!sessionId) return;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  fetch(`${API_BASE}/api/assessments/initial-quiz/pause`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
    keepalive: true,
  }).catch(() => { });
};

// Initial Coding Assessment
export const startInitialCodingAssessment = (sessionId) =>
  api.post("/api/assessments/initial-coding/start", { session_id: sessionId }).then((r) => r.data);
export const runInitialCodingCode = (data) => api.post("/api/assessments/initial-coding/run", data).then((r) => r.data);
export const submitInitialCodingAnswer = (data) => api.post("/api/assessments/initial-coding/submit", data).then((r) => r.data);
export const completeInitialCodingAssessment = (sessionId) =>
  api.post("/api/assessments/initial-coding/complete", { session_id: sessionId }).then((r) => r.data);
export const activateInitialCodingAssessment = (sessionId) =>
  api.post("/api/assessments/initial-coding/activate", { session_id: sessionId }).then((r) => r.data);
export const heartbeatInitialCodingAssessment = (sessionId) =>
  api.post("/api/assessments/initial-coding/heartbeat", { session_id: sessionId }).then((r) => r.data);
export const pauseInitialCodingAssessment = (sessionId) =>
  api.post("/api/assessments/initial-coding/pause", { session_id: sessionId }).then((r) => r.data);

export const pauseInitialCodingAssessmentOnUnload = (sessionId) => {
  if (!sessionId) return;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  fetch(`${API_BASE}/api/assessments/initial-coding/pause`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
    keepalive: true,
  }).catch(() => { });
};

// Final Adaptive Skill Assessment
export const startFinalQuiz = () => api.post("/api/assessments/final-quiz/start").then((r) => r.data);
export const submitFinalQuizAnswer = ({ sessionId, questionId, answer }) =>
  api.post("/api/assessments/final-quiz/answer", { session_id: sessionId, question_id: questionId, answer }).then((r) => r.data);
export const activateFinalQuiz = (sessionId) =>
  api.post("/api/assessments/final-quiz/activate", { session_id: sessionId }).then((r) => r.data);
export const heartbeatFinalQuiz = (sessionId) =>
  api.post("/api/assessments/final-quiz/heartbeat", { session_id: sessionId }).then((r) => r.data);
export const pauseFinalQuiz = (sessionId) =>
  api.post("/api/assessments/final-quiz/pause", { session_id: sessionId }).then((r) => r.data);

export const pauseFinalQuizOnUnload = (sessionId) => {
  if (!sessionId) return;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  fetch(`${API_BASE}/api/assessments/final-quiz/pause`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
    keepalive: true,
  }).catch(() => { });
};

// ---------------------------------------------------------
// Courses & Lessons API
// ---------------------------------------------------------
export const getCourses = (params = {}) => api.get("/api/courses", { params }).then((r) => r.data);
export const getCourse = (id) => api.get(`/api/courses/${id}`).then((r) => r.data);
export const createCourse = (data) => api.post("/api/courses", data).then((r) => r.data);
export const updateCourse = (id, data) => api.patch(`/api/courses/${id}`, data).then((r) => r.data);
export const deleteCourse = (id) => api.delete(`/api/courses/${id}`).then((r) => r.data);

// Lessons
export const getLessonsForCourse = (courseId) =>
  api.get(`/api/courses/${courseId}/lessons`).then((r) => r.data);
export const createLesson = (courseId, data) =>
  api.post(`/api/courses/${courseId}/lessons`, data).then((r) => r.data);
export const updateLesson = (id, data) =>
  api.patch(`/api/lessons/lesson/${id}`, data).then((r) => r.data);
export const getLesson = (lessonId) =>
  api.get(`/api/lessons/lesson/${lessonId}`).then((r) => r.data);
export const deleteLesson = (lessonId) =>
  api.delete(`/api/lessons/lesson/${lessonId}`).then((r) => r.data);



// ---------------------------------------------------------
// Progress & Enrollments API
// ---------------------------------------------------------
export const getMyProgress = () => api.get("/api/progress").then((r) => r.data);
export const updateProgress = (lessonId, patch) =>
  api.patch(`/api/progress/${lessonId}`, patch).then((r) => r.data);
export const submitQuiz = (lessonId, answers) =>
  api.post(`/api/progress/${lessonId}/submit-quiz`, { answers }).then((r) => r.data);

// Enrollments
export const enrollCourse = (courseId) =>
  api.post("/api/enrollments", { course_id: courseId }).then((r) => r.data);
export const getMyEnrollments = () => api.get("/api/enrollments").then((r) => r.data);

// ---------------------------------------------------------
// Jobs & Assignments API
// ---------------------------------------------------------
export const getJobs = (params = {}) => api.get("/api/jobs", { params }).then((r) => r.data);

export const getJobById = (id) =>
  api.get(`/api/jobs/${id}`).then((r) => r.data);

export const createJob = (data) => api.post("/api/jobs", data).then((r) => r.data);

export const updateJob = (id, data) =>
  api.patch(`/api/jobs/${id}`, data).then((r) => r.data);

export const deleteJob = (id) => api.delete(`/api/jobs/${id}`).then((r) => r.data);

export const getApplicationVideoUrl = (jobId, applicationId) =>
  api
    .get(`/api/jobs/${jobId}/applications/${applicationId}/video`)
    .then((r) => r.data);


export const getApplicationVideoUploadUrl = (
  jobId,
  fileName,
  fileType,
  fileSize
) =>
  api
    .post(`/api/jobs/${jobId}/application-video-upload-url`, {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
 })
.then((r) => r.data);    

export const applyJob = (
  jobId,
  applicationData,
  resumeFile
) => {
  const formData = new FormData();

  formData.append(
    "application_data",
    JSON.stringify(applicationData)
  );

  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  return api
    .post(`/api/jobs/${jobId}/apply`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => r.data);
};

export const inviteCandidate = (jobId, studentId, message) =>
  api.post(`/api/jobs/${jobId}/invite`, { candidate_id: studentId, message }).then((r) => r.data);

// Course assignments (educator → student)
export const assignCourse = (courseId,{userId,due_date,note,}) =>
    api.post(`/api/courses/${courseId}/assign`, {userId,due_date,note,}).then((r) => r.data);
export const getMyAssignments = () =>
  api.get('/api/me/assignments').then((r) => r.data);

export const getCourseAssignments = (courseId) =>
  api.get(`/api/courses/${courseId}/assignments`).then((r) => r.data);

export const cancelAssignment = (assignmentId) =>
  api.post(`/api/assignments/${assignmentId}/cancel`).then((r) => r.data);

export const getJobApplications = (jobId) =>
  api.get(`/api/jobs/${jobId}/applications`).then((r) => r.data);

export const getMyJobApplications = () =>
  api.get("/api/jobs/my-applications").then((r) => r.data);


export const updateApplicationStatus = (
  jobId,
  applicationId,
  status
) =>
  api
    .patch(
      `/api/jobs/${jobId}/applications/${applicationId}/status`,
      { status }
    )
    .then((r) => r.data);


export async function scheduleInterview(
  jobId,
  applicationId,
  interviewData
) {
  const response = await api.post(
    `/api/jobs/${jobId}/applications/${applicationId}/interview`,
    interviewData
  );

  return response.data;
}


export async function getInterview(
  jobId,
  applicationId
) {
  const response = await api.get(
    `/api/jobs/${jobId}/applications/${applicationId}/interview`
  );

  return response.data;
}

export async function getMyInterview(jobId) {
  const response = await api.get(
    `/api/jobs/${jobId}/my-interview`
  );

  return response.data;
}


export async function updateInterview(
  jobId,
  applicationId,
  interviewData
) {
  const response = await api.put(
    `/api/jobs/${jobId}/applications/${applicationId}/interview`,
    interviewData
  );

  return response.data;
}

export async function cancelInterview(
  jobId,
  applicationId
) {
  const response = await api.delete(
    `/api/jobs/${jobId}/applications/${applicationId}/interview`
  );

  return response.data;
}


export async function sendApplicantEmail(
  jobId,
  applicationId,
  emailData
) {
  const response = await api.post(
    `/api/jobs/${jobId}/applications/${applicationId}/email`,
    emailData
  );

  return response.data;
}


export const getEligibleStudents = (jobId) =>
  api.get(`/api/jobs/${jobId}/eligible-students`).then((r) => r.data);

// Notifications
export const getNotifications = () => api.get("/api/notifications").then((r) => r.data);
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read`).then((r) => r.data);
export const markAllNotificationsRead = () => api.patch("/api/notifications/read-all").then((r) => r.data);

// Admin
export const getAllUsers = (params = {}) =>
  api.get("/api/admin/users", { params }).then((r) => r.data);
export const updateUser = (id, data) =>
  api.patch(`/api/admin/users/${id}`, data).then((r) => r.data);
export const deleteUser = (id) =>
  api.delete(`/api/admin/users/${id}`).then((r) => r.data);
export const getInsights = () => api.get("/api/admin/insights").then((r) => r.data);

export const getReportsSummary = () => api.get("/api/reports/summary").then((r) => r.data);
export const getTopReports = () => api.get("/api/reports").then((r) => r.data);
export const getExportHistory = () => api.get("/api/reports/exports").then((r) => r.data);

export const getSettings = () => api.get("/api/settings").then((r) => r.data);
export const updateSettings = (patch) => api.patch("/api/settings", patch).then((r) => r.data);

// ---------------------------------------------------------
// Platform Services API
// ---------------------------------------------------------

export const updateSubscription = (data) => api.post("/api/subscriptions", data).then((r) => r.data);
export const getMySubscription = () => api.get("/api/subscriptions").then((r) => r.data);

export const getMyTasks = (params = {}) => api.get("/api/tasks", { params }).then((r) => r.data);
export const createTask = (data) => api.post("/api/tasks", data).then((r) => r.data);
export const updateTask = (id, data) => api.patch(`/api/tasks/${id}`, data).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`).then((r) => r.data);

export const getMyAchievements = () => api.get("/api/achievements").then((r) => r.data);
export const getMyCertificates = () => api.get("/api/certificates").then((r) => r.data);
export const getMyRecommendations = () => api.get("/api/recommendations").then((r) => r.data);

export const getAnnouncements = () => api.get("/api/announcements").then((r) => r.data);
export const sendAnnouncement = (data) => api.post("/api/announcements", data).then((r) => r.data);

// ---------------------------------------------------------
// Dashboards API
// ---------------------------------------------------------
export const getStudentDashboard = () => api.get("/api/dashboard/student").then((r) => r.data);
export const getEducatorDashboard = (params = {}) => api.get("/api/dashboard/educator", { params }).then((r) => r.data);
export const getEmployerDashboard = () => api.get("/api/dashboard/employer").then((r) => r.data);

// Community
export const getCommunityFeed = (params = {}) =>
  api.get("/api/community/feed", { params }).then((r) => r.data);
export const createCommunityPost = (data) =>
  api.post("/api/community/posts", data).then((r) => r.data);
export const toggleCommunityPostBookmark = (postId) =>
  api.post(`/api/community/posts/${postId}/bookmark`).then((r) => r.data);

// Connections & Users
export const searchUsers = (q) => api.get(`/api/users/search?q=${q}`).then((r) => r.data);
export const getMyConnections = () => api.get("/api/connections").then((r) => r.data);
export const getPendingConnections = () => api.get("/api/connections/pending").then((r) => r.data);
export const sendConnectionRequest = (userId) => api.post(`/api/connections/request/${userId}`).then((r) => r.data);
export const acceptConnectionRequest = (connectionId) => api.post(`/api/connections/accept/${connectionId}`).then((r) => r.data);
export const rejectConnectionRequest = (connectionId) => api.post(`/api/connections/reject/${connectionId}`).then((r) => r.data);
export const removeConnection = (connectionId) => api.delete(`/api/connections/${connectionId}`).then((r) => r.data);

export const getRecommendedJobs = () =>
  api.get("/api/jobs/recommended").then((r) => r.data);

export default api;
