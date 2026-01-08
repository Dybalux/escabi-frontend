import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getProducts, createOrder, createPaymentPreference, getPaymentSettings } from '../../services/api';
import CartItem from './CartItem';
import Button from '../UI/Button';
import Alert from '../UI/Alert';
import PaymentMethodSelector from '../Payment/PaymentMethodSelector';
import BankTransferConfirmation from '../Payment/BankTransferConfirmation';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
    const { cart, loadCart, clearCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Mercado Pago');
    const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'payment-selection', 'transfer-confirmation'
    const [createdOrder, setCreatedOrder] = useState(null);
    const [paymentSettings, setPaymentSettings] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cartResponse, productsResponse] = await Promise.all([
                loadCart(),
                getProducts({ limit: 100 })
            ]);
            // El API devuelve { items: [...], total: ..., page: ... }
            const productsList = productsResponse.data?.items || productsResponse.data || [];
            setProducts(productsList);
        } catch (error) {
            console.error('Error loading data:', error);
            setProducts([]); // Asegurar que products sea un array vacío en caso de error
        } finally {
            setLoading(false);
        }
    };

    const getCartItems = () => {
        if (!cart || !cart.items) return [];
        return cart.items.map(item => ({
            ...item,
            product: products.find(p => p.id === item.product_id)
        })).filter(item => item.product);
    };

    const getTotal = () => {
        return getCartItems().reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
    };

    const handleClearCart = async () => {
        if (!confirm('¿Seguro que quieres vaciar el carrito?')) return;

        const result = await clearCart();
        if (result.success) {
            setAlert({ type: 'info', message: 'Carrito vaciado' });
        }
    };

    const handleProceedToPayment = () => {
        setCheckoutStep('payment-selection');
    };

    const handleCreateOrder = async () => {
        setLoading(true);

        const orderData = {
            items: cart.items,
            shipping_address: {
                street: "Av. San Martín 1234",
                city: "San Miguel de Tucumán",
                state: "Tucumán",
                zip_code: "4000",
                country: "Argentina"
            }
        };

        try {
            // 1. Crear la orden con el método de pago seleccionado
            toast.loading('Creando orden...', { id: 'payment-process' });
            const orderResponse = await createOrder(orderData, paymentMethod);

            const order = orderResponse.data;

            if (!order?.id && !order?._id) {
                throw new Error('La orden no tiene un ID válido');
            }

            const orderId = order.id || order._id;
            setCreatedOrder(order);

            // 2. Flujo según método de pago
            if (paymentMethod === 'Mercado Pago') {
                // Flujo existente de Mercado Pago
                localStorage.setItem('pending_payment', JSON.stringify({
                    orderId,
                    timestamp: Date.now(),
                    items: cart.items
                }));

                toast.loading('Creando preferencia de pago...', { id: 'payment-process' });

                const paymentResponse = await Promise.race([
                    createPaymentPreference(orderId),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout al crear preferencia de pago')), 30000)
                    )
                ]);

                const { init_point } = paymentResponse.data;

                if (!init_point) {
                    throw new Error('No se recibió el link de pago');
                }

                toast.success('Redirigiendo a Mercado Pago...', { id: 'payment-process' });

                setTimeout(() => {
                    window.location.href = init_point;
                }, 500);

            } else if (paymentMethod === 'Transferencia Bancaria') {
                // Nuevo flujo de Transferencia Bancaria
                toast.loading('Obteniendo datos de transferencia...', { id: 'payment-process' });

                const settingsResponse = await getPaymentSettings();
                setPaymentSettings(settingsResponse.data);

                toast.success('Orden creada exitosamente', { id: 'payment-process' });

                // Mostrar pantalla de confirmación de transferencia
                setCheckoutStep('transfer-confirmation');
            }

        } catch (error) {
            console.error('Error al procesar el pago:', error);

            localStorage.removeItem('pending_payment');

            let errorMessage = 'Hubo un error al procesar tu pago. Intenta nuevamente.';

            if (error.message === 'Timeout al crear preferencia de pago') {
                errorMessage = 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Datos de orden inválidos. Verifica tu carrito.';
            } else if (error.response?.status === 404) {
                errorMessage = 'No se pudo encontrar la orden. Intenta nuevamente.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (!navigator.onLine) {
                errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
            }

            toast.error(errorMessage, { id: 'payment-process', duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const cartItems = getCartItems();

    // Mostrar confirmación de transferencia bancaria
    if (checkoutStep === 'transfer-confirmation' && createdOrder && paymentSettings) {
        return <BankTransferConfirmation order={createdOrder} paymentSettings={paymentSettings} />;
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                <Button onClick={() => navigate('/products')}>Ver Productos</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 Mi Carrito</h1>

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="space-y-4">
                    {cartItems.map(item => (
                        <CartItem key={item.product_id} item={item} />
                    ))}
                </div>

                <div className="border-t-2 mt-6 pt-6">
                    <div className="flex justify-between items-center text-2xl font-bold mb-6">
                        <span>Total:</span>
                        <span className="text-purple-600">${getTotal().toFixed(2)}</span>
                    </div>

                    {/* Mostrar selector de método de pago si estamos en ese paso */}
                    {checkoutStep === 'payment-selection' && (
                        <PaymentMethodSelector
                            selectedMethod={paymentMethod}
                            onMethodChange={setPaymentMethod}
                        />
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        {checkoutStep === 'cart' ? (
                            <button
                                onClick={handleProceedToPayment}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                            >
                                <ShoppingBag size={24} />
                                <span>Continuar al Pago</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setCheckoutStep('cart')}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-lg transition-all duration-200"
                                >
                                    ← Volver
                                </button>
                                <button
                                    onClick={handleCreateOrder}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Procesando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag size={24} />
                                            <span>Finalizar Compra</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        <Button variant="danger" onClick={handleClearCart} className="sm:w-auto">
                            Vaciar Carrito
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}