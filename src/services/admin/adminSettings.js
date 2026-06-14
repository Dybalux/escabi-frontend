import api from '../client.js';

// Admin Statistics
export const getAdminStats = () => api.get('/admin/stats');

// Admin Payment Settings
export const getAdminPaymentSettings = () => api.get('/admin/payment-settings');
export const updatePaymentSettings = (settings) => api.put('/admin/payment-settings', settings);

// Admin Shipping Settings
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

// Admin Pricing Settings (NEW — no existing code to move)
export const getPricingSettings = () => api.get('/admin/pricing-settings');
export const updatePricingSettings = (settings) => api.put('/admin/pricing-settings', settings);

// Admin Bulk Price Update (NEW — no existing code to move)
export const bulkUpdatePrices = (data) => api.post('/admin/bulk-price-update', data);
