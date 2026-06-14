import api from './client';

// Combos - Public
export const getCombos = () => api.get('/combos/');
export const getCombo = (id) => api.get(`/combos/${id}`);

// Combos - Admin
export const getAdminCombos = (includeInactive = false) =>
    api.get('/combos/admin/all', { params: { include_inactive: includeInactive } });
export const createCombo = (comboData) => api.post('/combos/admin', comboData);
export const updateCombo = (id, comboData) => api.put(`/combos/admin/${id}`, comboData);
export const deleteCombo = (id, permanent = false) =>
    api.delete(`/combos/admin/${id}`, { params: { permanent } });
