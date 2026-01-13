import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { validateOrder } from '../services/api';
import { useCart } from '../context/CartContext';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        validatePayment();
    }, [orderId]);

    const validatePayment = async () => {
        // Validar que existe order_id
        if (!orderId) {
            setError('No se proporcionó un ID de orden');
            setLoading(false);
            setTimeout(() => navigate('/orders'), 3000);
            return;
        }

        try {
            // Validar que la orden pertenece al usuario
            const validation = await validateOrder(orderId);

            if (!validation.valid) {
                setError(validation.error);
                setLoading(false);
                setTimeout(() => navigate('/orders'), 3000);
                return;
            }

            setOrderData(validation.order);

            // Limpiar carrito después de pago exitoso
            await clearCart();

            // Limpiar información de pago pendiente
            localStorage.removeItem('pending_payment');

            setLoading(false);
        } catch (err) {
            console.error('Error validating payment:', err);
            setError('Error al validar el pago');
            setLoading(false);
            setTimeout(() => navigate('/orders'), 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0D4F4F] mx-auto mb-4"></div>
                    <p className="text-gray-600">Validando pago...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={80} />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-gray-500 text-sm">Redirigiendo a tus pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={80} />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        ¡Pago exitoso! 🎉
                    </h1>
                </div>

                <div className="mb-8">
                    <p className="text-gray-600 mb-4">
                        Tu orden <strong className="text-[#0D4F4F]">#{orderId}</strong> ha sido confirmada.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Recibirás un email con los detalles de tu compra.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/orders"
                        className="block w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        Ver mis pedidos
                    </Link>
                    <Link
                        to="/products"
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </div>
    );
}
