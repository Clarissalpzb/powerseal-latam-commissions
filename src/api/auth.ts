import axios from 'axios';
import { User } from '@/types';

const API_BASE = '/api/v1';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    employee_id?: string;
  }) => {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    return response.data;
  },

  me: async (): Promise<User> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};