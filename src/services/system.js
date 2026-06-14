import api from './client';

export const getSystemStatus = () => api.get('/system-status');
export const getAdminSystemSettings = () => api.get('/admin/system-settings');
export const updateSystemStatus = (enabled, message) =>
    api.put('/admin/system-settings', null, {
        params: {
            maintenance_mode: enabled,
            maintenance_message: message
        }
    });
