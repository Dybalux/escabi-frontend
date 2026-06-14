import api from '../client';

export const createProduct = (productData) => api.post('/products/', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleProductActive = (id) => api.patch(`/products/${id}/toggle-active`);
