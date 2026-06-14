import api from './client';

export const getShippingPrices = () => api.get('/orders/shipping-prices');
