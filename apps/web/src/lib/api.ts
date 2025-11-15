import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config).then((response) => response.data),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => api.post(url, data, config).then((response) => response.data),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => api.put(url, data, config).then((response) => response.data),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    api.patch(url, data, config).then((response) => response.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then((response) => response.data),
};

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  register: (userData: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) => apiClient.post('/auth/register', userData),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: () => apiClient.post('/auth/refresh'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }),
};

// User API
export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),

  updateProfile: (data: any) => apiClient.put('/users/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getStats: () => apiClient.get('/users/stats'),

  getAchievements: () => apiClient.get('/users/achievements'),

  updateSettings: (settings: any) =>
    apiClient.put('/users/settings', settings),
};

// Workout API
export const workoutApi = {
  getWorkouts: (params?: any) => apiClient.get('/workouts', { params }),

  getWorkout: (id: string) => apiClient.get(`/workouts/${id}`),

  createWorkout: (data: any) => apiClient.post('/workouts', data),

  updateWorkout: (id: string, data: any) =>
    apiClient.put(`/workouts/${id}`, data),

  deleteWorkout: (id: string) => apiClient.delete(`/workouts/${id}`),

  startWorkout: (id: string) => apiClient.post(`/workouts/${id}/start`),

  completeWorkout: (id: string, data: any) =>
    apiClient.post(`/workouts/${id}/complete`, data),

  getWorkoutHistory: (params?: any) =>
    apiClient.get('/workouts/history', { params }),
};

// Exercise API
export const exerciseApi = {
  getExercises: (params?: any) => apiClient.get('/exercises', { params }),

  getExercise: (id: string) => apiClient.get(`/exercises/${id}`),

  createExercise: (data: any) => apiClient.post('/exercises', data),

  updateExercise: (id: string, data: any) =>
    apiClient.put(`/exercises/${id}`, data),

  deleteExercise: (id: string) => apiClient.delete(`/exercises/${id}`),

  getExerciseCategories: () => apiClient.get('/exercises/categories'),

  searchExercises: (query: string) =>
    apiClient.get('/exercises/search', { params: { q: query } }),
};

// Progress API
export const progressApi = {
  getProgress: (params?: any) => apiClient.get('/progress', { params }),

  logProgress: (data: any) => apiClient.post('/progress', data),

  getProgressStats: (timeframe?: string) =>
    apiClient.get('/progress/stats', { params: { timeframe } }),

  getProgressChart: (exerciseId: string, timeframe?: string) =>
    apiClient.get(`/progress/chart/${exerciseId}`, {
      params: { timeframe },
    }),
};

// Goal API
export const goalApi = {
  getGoals: () => apiClient.get('/goals'),

  createGoal: (data: any) => apiClient.post('/goals', data),

  updateGoal: (id: string, data: any) => apiClient.put(`/goals/${id}`, data),

  deleteGoal: (id: string) => apiClient.delete(`/goals/${id}`),

  completeGoal: (id: string) => apiClient.post(`/goals/${id}/complete`),
};

// Course API
export const courseApi = {
  getCourses: (params?: any) => apiClient.get('/courses', { params }),

  getCourse: (id: string) => apiClient.get(`/courses/${id}`),

  enrollCourse: (id: string) => apiClient.post(`/courses/${id}/enroll`),

  getEnrolledCourses: () => apiClient.get('/courses/enrolled'),

  getCourseProgress: (id: string) => apiClient.get(`/courses/${id}/progress`),

  completeLesson: (courseId: string, lessonId: string) =>
    apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
};

// Community API
export const communityApi = {
  getPosts: (params?: any) => apiClient.get('/community/posts', { params }),

  getPost: (id: string) => apiClient.get(`/community/posts/${id}`),

  createPost: (data: any) => apiClient.post('/community/posts', data),

  updatePost: (id: string, data: any) =>
    apiClient.put(`/community/posts/${id}`, data),

  deletePost: (id: string) => apiClient.delete(`/community/posts/${id}`),

  likePost: (id: string) => apiClient.post(`/community/posts/${id}/like`),

  unlikePost: (id: string) => apiClient.delete(`/community/posts/${id}/like`),

  getComments: (postId: string) =>
    apiClient.get(`/community/posts/${postId}/comments`),

  createComment: (postId: string, data: any) =>
    apiClient.post(`/community/posts/${postId}/comments`, data),

  updateComment: (postId: string, commentId: string, data: any) =>
    apiClient.put(`/community/posts/${postId}/comments/${commentId}`, data),

  deleteComment: (postId: string, commentId: string) =>
    apiClient.delete(`/community/posts/${postId}/comments/${commentId}`),
};

export default api;