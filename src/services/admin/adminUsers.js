import api from '../client';

export const getAdminUsers = (params = {}) => api.get('/admin/users', { params });
export const updateUserRole = (userId, newRole) =>
    api.put(`/admin/users/${userId}/role`, null, { params: { new_role: newRole } });
