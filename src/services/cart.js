import api from './client';

export const getCart = () => api.get('/cart/');
export const addToCart = (productId, quantity) =>
    api.post('/cart/add', { product_id: productId, quantity });
export const addComboToCart = (comboId, quantity) =>
    api.post('/cart/add', { product_id: comboId, quantity }); // Backend usa product_id para combos también
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');
