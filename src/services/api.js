import api from './client';

export { register, login, getCurrentUser, verifyAge } from './auth';
export { getProducts, getProduct } from './products';

// Cart
export const getCart = () => api.get('/cart/');
export const addToCart = (productId, quantity) =>
    api.post('/cart/add', { product_id: productId, quantity });
export const addComboToCart = (comboId, quantity) =>
    api.post('/cart/add', { product_id: comboId, quantity }); // Backend usa product_id para combos también
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');

// Orders
export const createOrder = (orderData, paymentMethod = 'Mercado Pago') =>
    api.post('/orders/', orderData, {
        params: { payment_method: paymentMethod }
    });
export const getMyOrders = () => api.get('/orders/me');
export const getOrder = (id) => api.get(`/orders/${id}`);

// Payments
export const createPaymentPreference = (orderId) =>
    api.post(`/payments/create-preference/${orderId}`, {}, {
        timeout: 30000 // 30 segundos para crear preferencia
    });

// Payment Settings
export const getPaymentSettings = () => api.get('/payment-settings');

// Orders - Select Payment Method
export const selectPaymentMethod = (orderId, paymentMethod) =>
    api.post(`/orders/${orderId}/select-payment-method`, null, {
        params: { payment_method: paymentMethod }
    });

// Validate Order Ownership
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

// Admin - Statistics
export const getAdminStats = () => api.get('/admin/stats');

// Admin - Users
export const getAdminUsers = (params = {}) => api.get('/admin/users', { params });
export const updateUserRole = (userId, newRole) =>
    api.put(`/admin/users/${userId}/role`, null, { params: { new_role: newRole } });

// Admin - Orders
export const getAdminOrders = (params = {}) => api.get('/admin/orders', { params });
export const updateOrderStatus = (orderId, newStatus) =>
    api.put(`/orders/admin/${orderId}/status`, null, { params: { new_status: newStatus } });

// Admin - Products
export const createProduct = (productData) => api.post('/products/', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleProductActive = (id) => api.patch(`/products/${id}/toggle-active`);

// Admin - Payment Settings
export const getAdminPaymentSettings = () => api.get('/admin/payment-settings');
export const updatePaymentSettings = (settings) => api.put('/admin/payment-settings', settings);

// Admin - Shipping Settings
export const getShippingSettings = () => api.get('/admin/shipping-settings');
export const updateShippingSettings = (settings) =>
    api.put('/admin/shipping-settings', null, {
        params: {
            central_zone_price: settings.central_zone_price,
            central_zone_description: settings.central_zone_description,
            central_zone_enabled: settings.central_zone_enabled,
            remote_zone_price: settings.remote_zone_price,
            remote_zone_description: settings.remote_zone_description,
            remote_zone_enabled: settings.remote_zone_enabled,
            pickup_address: settings.pickup_address,
            pickup_description: settings.pickup_description,
            pickup_enabled: settings.pickup_enabled
        }
    });

// Public - Shipping Prices
export const getShippingPrices = () => api.get('/orders/shipping-prices');

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

// System Status
export const getSystemStatus = () => api.get('/system-status');
export const getAdminSystemSettings = () => api.get('/admin/system-settings');
export const updateSystemStatus = (enabled, message) =>
    api.put('/admin/system-settings', null, {
        params: {
            maintenance_mode: enabled,
            maintenance_message: message
        }
    });

export default api;