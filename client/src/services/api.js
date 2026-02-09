import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Shipments API
export const shipmentsAPI = {
  getAll: (params) => api.get('/shipments', { params }),
  getOne: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  updateStatus: (id, data) => api.put(`/shipments/${id}/status`, data),
  delete: (id) => api.delete(`/shipments/${id}`),
  bulkCreate: (shipments) => api.post('/shipments/bulk', { shipments }),
  generateLabel: (id) => api.post(`/shipments/${id}/label`),
  schedulePickup: (id, data) => api.post(`/shipments/${id}/pickup`, data)
};

// Couriers API
export const couriersAPI = {
  getAll: (active = true) => api.get('/couriers', { params: { active } }),
  getOne: (id) => api.get(`/couriers/${id}`),
  compare: (data) => api.post('/couriers/compare', data),
  recommend: (data) => api.post('/couriers/recommend', data),
  create: (data) => api.post('/couriers', data),
  update: (id, data) => api.put(`/couriers/${id}`, data),
  delete: (id) => api.delete(`/couriers/${id}`)
};

// Tracking API
export const trackingAPI = {
  track: (trackingId) => api.get(`/tracking/${trackingId}`),
  getTimeline: (trackingId) => api.get(`/tracking/${trackingId}/timeline`),
  simulate: (trackingId) => api.post(`/tracking/${trackingId}/simulate`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCourierPerformance: () => api.get('/analytics/courier-performance'),
  getMonthlyCosts: (months) => api.get('/analytics/monthly-costs', { params: { months } }),
  getSuccessRate: (months) => api.get('/analytics/success-rate', { params: { months } }),
  getDeliveryTime: () => api.get('/analytics/delivery-time')
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getAllShipments: (params) => api.get('/admin/shipments', { params })
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};
