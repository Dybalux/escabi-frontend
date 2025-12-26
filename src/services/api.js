import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

console.log('🔧 API URL configurada:', API_URL);

if (!API_URL) {
    console.error('❌ VITE_API_URL no está definida en las variables de entorno');
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token automáticamente si está disponible
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Si no hay token, la petición continúa sin él (para endpoints públicos)
    return config;
});

// Variables para manejar el refresh de tokens
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor para manejar errores de respuesta y refresh automático
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Log del error
        console.error('❌ Error en la API:', error.message);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor');
        }

        // Si es un 401 y no es el endpoint de refresh ni de login
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh') &&
            !originalRequest.url.includes('/auth/token')) {

            // Si ya estamos refrescando, agregar a la cola
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                // No hay refresh token, logout
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Intentar refrescar el token
                const response = await api.post('/auth/refresh', {
                    refresh_token: refreshToken
                });

                const { access_token, refresh_token: newRefreshToken } = response.data;

                // Guardar los nuevos tokens
                localStorage.setItem('token', access_token);
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                // Actualizar el header de la petición original
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                // Procesar la cola de peticiones pendientes
                processQueue(null, access_token);

                isRefreshing = false;

                // Reintentar la petición original
                return api(originalRequest);
            } catch (refreshError) {
                // El refresh falló, hacer logout
                processQueue(refreshError, null);
                isRefreshing = false;

                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
};
export const getCurrentUser = () => api.get('/auth/me');
export const verifyAge = () => api.post('/age-verification/verify-age');

// Products
export const getProducts = (params = {}) => api.get('/products/', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Cart
export const getCart = () => api.get('/cart/');
export const addToCart = (productId, quantity) =>
    api.post('/cart/add', { product_id: productId, quantity });
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');

// Orders
export const createOrder = (orderData) => api.post('/orders/', orderData);
export const getMyOrders = () => api.get('/orders/me');
export const getOrder = (id) => api.get(`/orders/${id}`);

// Payments
export const createPaymentPreference = (orderId) =>
    api.post(`/payments/create-preference/${orderId}`);

// Admin - Statistics
export const getAdminStats = () => api.get('/admin/stats');

// Admin - Users
export const getAdminUsers = (params = {}) => api.get('/admin/users', { params });

// Admin - Orders
export const getAdminOrders = (params = {}) => api.get('/admin/orders', { params });
export const updateOrderStatus = (orderId, newStatus) =>
    api.put(`/orders/admin/${orderId}/status`, null, { params: { new_status: newStatus } });

// Admin - Products
export const createProduct = (productData) => api.post('/products/', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export default api;