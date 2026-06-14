import api from './client';

export const createPaymentPreference = (orderId) =>
    api.post(`/payments/create-preference/${orderId}`, {}, {
        timeout: 30000 // 30 segundos para crear preferencia
    });

export const getPaymentSettings = () => api.get('/payment-settings');
