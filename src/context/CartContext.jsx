import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user?.age_verified) {
            loadCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated, user?.age_verified]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const response = await apiAddToCart(productId, quantity);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al agregar al carrito'
            };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await apiRemoveFromCart(productId);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al eliminar del carrito'
            };
        }
    };

    const clearCart = async () => {
        try {
            const response = await apiClearCart();
            setCart(response.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al vaciar carrito'
            };
        }
    };

    const getCartTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.length;
    };

    const value = {
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        loadCart,
        getCartTotal,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};