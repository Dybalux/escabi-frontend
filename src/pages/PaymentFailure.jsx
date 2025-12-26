import { useSearchParams, Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <XCircle className="mx-auto text-red-500 mb-4" size={80} />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Pago rechazado ❌
                    </h1>
                </div>

                <div className="mb-8">
                    <p className="text-gray-600 mb-2">
                        Hubo un problema al procesar tu pago.
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                        Orden: <strong className="text-gray-700">#{orderId}</strong>
                    </p>
                    <p className="text-gray-500 text-sm">
                        Por favor, intenta nuevamente o utiliza otro método de pago.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/cart"
                        className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        Volver al carrito
                    </Link>
                    <Link
                        to="/orders"
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                        Ver mis pedidos
                    </Link>
                </div>
            </div>
        </div>
    );
}
