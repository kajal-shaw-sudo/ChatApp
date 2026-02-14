import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  timeout: 10000 
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  signup: p => API.post('/auth/signup', p),
  login: p => API.post('/auth/login', p),
  logout: () => API.post('/auth/logout'),
  getUsers: () => API.get('/auth/users'),
  getConversation: (u1, u2) => API.get(`/messages/conversation/${u1}/${u2}`),
  uploadProfilePicture: formData => API.post('/auth/upload-profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProfile: p => API.put('/auth/update-profile', p),
  changePassword: p => API.put('/auth/change-password', p),
  uploadFile: formData => API.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMessage: id => API.delete(`/messages/${id}`),
  searchMessages: (query, userId) => API.get('/messages/search', { params: { query, userId } }),
  markAsRead: id => API.put(`/messages/${id}/read`),
  addReaction: (messageId, emoji) => API.post(`/reactions/${messageId}/react`, { emoji }) // ✅ ADD THIS LINE
};