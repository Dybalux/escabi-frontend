import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

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
                        Tu orden <strong className="text-purple-600">#{orderId}</strong> ha sido confirmada.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Recibirás un email con los detalles de tu compra.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/orders"
                        className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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
