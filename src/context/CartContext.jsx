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
            await apiAddToCart(productId, quantity);
            // Recargar el carrito para obtener datos enriquecidos
            await loadCart();
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
            await apiRemoveFromCart(productId);
            // Recargar el carrito para obtener datos enriquecidos
            await loadCart();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al eliminar del carrito'
            };
        }
    };


    const updateQuantity = async (productId, newQuantity) => {
        try {
            // Si la cantidad es 0 o negativa, eliminar del carrito
            if (newQuantity <= 0) {
                return await removeFromCart(productId);
            }

            // Obtener la cantidad actual del carrito
            const currentItem = cart?.items?.find(item => item.product_id === productId);
            const currentQuantity = currentItem?.quantity || 0;

            // Calcular la diferencia
            const difference = newQuantity - currentQuantity;

            if (difference === 0) {
                // No hay cambio
                return { success: true };
            }

            if (difference > 0) {
                // Incrementar: agregar la diferencia
                await apiAddToCart(productId, difference);
            } else {
                // Decrementar: necesitamos eliminar y volver a agregar
                // Primero eliminamos el producto
                await apiRemoveFromCart(productId);
                // Luego lo agregamos con la nueva cantidad
                await apiAddToCart(productId, newQuantity);
            }

            // Recargar el carrito para obtener datos enriquecidos
            await loadCart();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al actualizar cantidad'
            };
        }
    };

    const clearCart = async () => {
        try {
            await apiClearCart();
            // Recargar el carrito para obtener datos enriquecidos
            await loadCart();
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
        updateQuantity,
        clearCart,
        loadCart,
        getCartTotal,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};