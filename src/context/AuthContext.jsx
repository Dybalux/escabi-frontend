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
        const accessToken = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh_token');

        // Si hay access token pero no refresh token, estado inválido - limpiar
        if (accessToken && !refreshToken) {
            localStorage.removeItem('token');
            setToken(null);
            setLoading(false);
            return;
        }

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
            return response.data; // Retornar los datos del usuario
        } catch (error) {
            console.error('Error loading user:', error);
            logout();
            return null;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await apiLogin(credentials);
            const { access_token, refresh_token } = response.data;

            // Guardar ambos tokens
            localStorage.setItem('token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            setToken(access_token);
            const userData = await loadUser();
            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al iniciar sesión'
            };
        }
    };

    // Función auxiliar para calcular edad
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const register = async (userData) => {
        try {
            // 1. Registrar usuario
            await apiRegister(userData);

            // 2. Iniciar sesión automáticamente
            const loginResult = await login({
                email: userData.email,
                password: userData.password
            });

            if (!loginResult.success) {
                return { success: true, message: 'Registro exitoso. Por favor inicia sesión.' };
            }

            // 3. Verificar edad automáticamente si es mayor de 18
            const age = calculateAge(userData.birth_date);
            if (age >= 18) {
                try {
                    await apiVerifyAge();
                    // Recargar usuario para obtener age_verified actualizado
                    await loadUser();
                } catch (verifyError) {
                    console.error('Error al verificar edad automáticamente:', verifyError);
                    // Continuar aunque falle la verificación automática
                }
            }

            return { success: true, autoLogin: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error en el registro'
            };
        }
    };

    const logout = () => {
        // Limpiar ambos tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
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