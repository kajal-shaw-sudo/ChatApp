import axios from 'axios';
const API = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000
});

export default {
  login: (payload) => API.post('/auth/login', payload),
  logout: () => API.post('/auth/logout'),
  getUsers: () => API.get('/auth/users'),
  getConversation: (u1, u2) => API.get(`/messages/conversation/${u1}/${u2}`)
};