import api from './client';

// Auth
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
};
export const getCurrentUser = () => api.get('/auth/me');
export const verifyAge = () => api.post('/age-verification/verify-age');
