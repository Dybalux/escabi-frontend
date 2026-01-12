import { useEffect, useState } from 'react';
import { getMyOrders } from '../services/api';
import { Package, CreditCard, Building2 } from 'lucide-react';

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

    const getPaymentMethodInfo = (method) => {
        if (method === 'Mercado Pago') {
            return {
                icon: CreditCard,
                color: 'bg-blue-100 text-blue-800',
                label: 'Mercado Pago'
            };
        } else if (method === 'Transferencia Bancaria') {
            return {
                icon: Building2,
                color: 'bg-purple-100 text-purple-800',
                label: 'Transferencia'
            };
        }
        return {
            icon: CreditCard,
            color: 'bg-gray-100 text-gray-800',
            label: method || 'No especificado'
        };
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
                {orders.map((order, index) => {
                    const paymentInfo = getPaymentMethodInfo(order.payment_method);
                    const PaymentIcon = paymentInfo.icon;

                    return (
                        <div key={order.id || order._id || index} className="bg-white rounded-lg shadow-md p-6">
                            {/* Número de Orden destacado */}
                            <div className="mb-4 pb-3 border-b-2 border-purple-100">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border-2 border-purple-200">
                                    <Package size={20} className="text-purple-600" />
                                    <span className="text-sm font-medium text-gray-600">Pedido</span>
                                    <span className="text-lg font-bold text-purple-700">
                                        #{order._id || order.id}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    📅 {new Date(order.created_at).toLocaleDateString('es-AR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">Estado:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {order.payment_method && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600">Método de pago:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${paymentInfo.color}`}>
                                                <PaymentIcon size={14} />
                                                {paymentInfo.label}
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                    );
                })}
            </div>
        </div>
    );
}