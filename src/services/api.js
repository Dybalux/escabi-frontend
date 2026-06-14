import api from './client';

export { register, login, getCurrentUser, verifyAge } from './auth';
export { getProducts, getProduct } from './products';
export { getCart, addToCart, addComboToCart, removeFromCart, clearCart } from './cart';

export { createOrder, getMyOrders, getOrder, selectPaymentMethod, validateOrder } from './orders';

export { createPaymentPreference, getPaymentSettings } from './payments';

// Admin - Statistics
export const getAdminStats = () => api.get('/admin/stats');

export { getAdminUsers, updateUserRole } from './admin/adminUsers';

export { getAdminOrders, updateOrderStatus } from './admin/adminOrders';

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

export { getShippingPrices } from './shipping';
export { getCombos, getCombo, getAdminCombos, createCombo, updateCombo, deleteCombo } from './combos';
export { getSystemStatus, getAdminSystemSettings, updateSystemStatus } from './system';

export default api;