import api from './client';

export const createOrder = (orderData, paymentMethod = 'Mercado Pago') =>
    api.post('/orders/', orderData, {
        params: { payment_method: paymentMethod }
    });

export const getMyOrders = () => api.get('/orders/me');

export const getOrder = (id) => api.get(`/orders/${id}`);

export const selectPaymentMethod = (orderId, paymentMethod) =>
    api.post(`/orders/${orderId}/select-payment-method`, null, {
        params: { payment_method: paymentMethod }
    });

export const validateOrder = async (orderId) => {
    try {
        const response = await getOrder(orderId);
        return { valid: true, order: response.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { valid: false, error: 'Orden no encontrada' };
        }
        if (error.response?.status === 403) {
            return { valid: false, error: 'No tienes permiso para ver esta orden' };
        }
        return { valid: false, error: 'Error al validar la orden' };
    }
};
