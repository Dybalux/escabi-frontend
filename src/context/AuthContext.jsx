import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser, verifyAge as apiVerifyAge } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await getCurrentUser();
            setUser(response.data);
        } catch (error) {
            console.error('Error loading user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await apiLogin(credentials);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setToken(access_token);
            await loadUser();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al iniciar sesión'
            };
        }
    };

    const register = async (userData) => {
        try {
            await apiRegister(userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error en el registro'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const verifyAge = async () => {
        try {
            await apiVerifyAge();

            // El token JWT actual no tiene age_verified actualizado
            // Necesitamos hacer re-login para obtener un nuevo token
            // Guardamos las credenciales temporalmente
            const currentToken = token;

            // Obtenemos los datos actualizados del usuario
            const userResponse = await getCurrentUser();
            const updatedUser = userResponse.data;

            // Actualizamos el estado del usuario
            setUser(updatedUser);

            // Nota: El token JWT no se actualiza automáticamente
            // El usuario necesitará cerrar sesión y volver a iniciar sesión
            // para que el carrito funcione correctamente, O el backend
            // debería devolver un nuevo token después de verificar la edad

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al verificar edad'
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        verifyAge,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};