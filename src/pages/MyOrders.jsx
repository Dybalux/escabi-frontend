import { useEffect, useState } from 'react';
import { getMyOrders } from '../services/api';
import { Package } from 'lucide-react';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await getMyOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'En Proceso': 'bg-blue-100 text-blue-800',
            'Enviado': 'bg-purple-100 text-purple-800',
            'Entregado': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes pedidos aún</h2>
                <p className="text-gray-600">Realiza tu primera compra para ver tus pedidos aquí</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">📦 Mis Pedidos</h1>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Pedido #{order.id}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Productos:</h3>
                            <ul className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span className="font-semibold">
                                            ${(item.price_at_purchase * item.quantity).toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t mt-4 pt-4 flex justify-between items-center">
                            <span className="font-semibold">Total:</span>
                            <span className="text-2xl font-bold text-purple-600">
                                ${order.total_amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}