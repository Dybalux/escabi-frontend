import axios from 'axios';
import { parseApiError } from '../utils/errors';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new TypeError(
        'VITE_API_URL is not defined. Set it in your .env file.'
    );
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

        // Si es un 503 (Service Unavailable - Modo Mantenimiento)
        // App.jsx se encargará de mostrar la pantalla
        if (error.response?.status === 503) {
            return Promise.reject(error);
        }

        // Log del error
        console.error('❌ Error en la API:', error.message);
        if (error.response) {
            console.error('❌ API error:', parseApiError(error));
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

export default api;
