const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, { method = 'GET', payload, withAuth = false } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(withAuth ? getAuthHeaders() : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export async function registerUser(payload) {
  return apiRequest('/api/auth/register', { method: 'POST', payload });
}

export async function loginUser(payload) {
  return apiRequest('/api/auth/login', { method: 'POST', payload });
}

export async function getProfile() {
  return apiRequest('/api/auth/me', { withAuth: true });
}

export async function getPublicCourses() {
  return apiRequest('/api/courses');
}

export async function getPublicCoursesFiltered({ search, page = 1, limit = 12, accessType, visibility } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  if (accessType) params.set('accessType', accessType);
  if (visibility) params.set('visibility', visibility);
  const qs = params.toString();
  return apiRequest(`/api/courses${qs ? `?${qs}` : ''}`);
}

export async function getCourseById(id) {
  return apiRequest(`/api/courses/${id}`);
}

export async function enrollInCourse(id) {
  return apiRequest(`/api/courses/${id}/enroll`, { method: 'POST', withAuth: true });
}

export async function getLearnerProgressReport() {
  return apiRequest('/api/reports/learner/progress-report', { withAuth: true });
}

export async function getInstructorDashboardReport() {
  return apiRequest('/api/reports/dashboard', { withAuth: true });
}

export async function getCourseAnalytics(courseId) {
  return apiRequest(`/api/reports/course/${courseId}`, { withAuth: true });
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function getLessonsByCourse(courseId) {
  return apiRequest(`/api/lessons/${courseId}`);
}

export async function getLessonById(id) {
  return apiRequest(`/api/lessons/lesson/${id}`);
}

export async function markLessonComplete(payload) {
  // payload: { lessonId, courseId }
  return apiRequest('/api/lessons/complete', { method: 'POST', payload, withAuth: true });
}

export async function createLesson(payload) {
  return apiRequest('/api/lessons', { method: 'POST', payload, withAuth: true });
}

export async function updateLesson(id, payload) {
  return apiRequest(`/api/lessons/${id}`, { method: 'PUT', payload, withAuth: true });
}

export async function deleteLesson(id) {
  return apiRequest(`/api/lessons/${id}`, { method: 'DELETE', withAuth: true });
}

export async function publishLesson(id, isPublished) {
  return apiRequest(`/api/lessons/${id}/publish`, { method: 'PATCH', payload: { isPublished }, withAuth: true });
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export async function getQuizByCourse(courseId) {
  return apiRequest(`/api/quiz/${courseId}`, { withAuth: true });
}

export async function submitQuiz(payload) {
  // payload: { courseId, answers }
  // answers: array indexed by question index, each value is array of selected option indices
  return apiRequest('/api/quiz/submit', { method: 'POST', payload, withAuth: true });
}

export async function getQuizResults(courseId) {
  return apiRequest(`/api/quiz/results/${courseId}`, { withAuth: true });
}

export async function createQuiz(payload) {
  return apiRequest('/api/quiz', { method: 'POST', payload, withAuth: true });
}

export async function updateQuiz(courseId, payload) {
  return apiRequest(`/api/quiz/${courseId}`, { method: 'PUT', payload, withAuth: true });
}

export async function publishQuiz(courseId, isPublished) {
  return apiRequest(`/api/quiz/${courseId}/publish`, { method: 'PATCH', payload: { isPublished }, withAuth: true });
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function getProgressStats() {
  return apiRequest('/api/progress/stats', { withAuth: true });
}

export async function getAllProgress(page = 1, limit = 10) {
  return apiRequest(`/api/progress?page=${page}&limit=${limit}`, { withAuth: true });
}

export async function getProgressByCourse(courseId) {
  return apiRequest(`/api/progress/${courseId}`, { withAuth: true });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function submitReview(payload) {
  return apiRequest('/api/reviews', { method: 'POST', payload, withAuth: true });
}

export async function updateReview(id, payload) {
  return apiRequest(`/api/reviews/${id}`, { method: 'PUT', payload, withAuth: true });
}

export async function getMyReviews(page = 1, limit = 10) {
  return apiRequest(`/api/reviews/learner/my-reviews?page=${page}&limit=${limit}`, { withAuth: true });
}

// ─── Instructor Courses ───────────────────────────────────────────────────────

export async function createCourse(payload) {
  return apiRequest('/api/courses', { method: 'POST', payload, withAuth: true });
}

export async function updateCourse(id, payload) {
  return apiRequest(`/api/courses/${id}`, { method: 'PUT', payload, withAuth: true });
}

export async function getInstructorCourses(page = 1, limit = 10) {
  return apiRequest(`/api/courses/instructor/my-courses?page=${page}&limit=${limit}`, { withAuth: true });
}

export async function deleteCourse(id) {
  return apiRequest(`/api/courses/${id}`, { method: 'DELETE', withAuth: true });
}

export async function publishCourse(id, isPublished) {
  return apiRequest(`/api/courses/${id}/publish`, { method: 'PATCH', payload: { isPublished }, withAuth: true });
}