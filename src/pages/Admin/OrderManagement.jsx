import { useState, useEffect } from 'react';
import { Package, Search, Filter, Calendar } from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '../../services/api';
import AdminNav from '../../components/Admin/AdminNav';
import toast from 'react-hot-toast';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status_filter = statusFilter;

            const response = await getAdminOrders(params);
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Error al cargar los pedidos');
            toast.error('Error al cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            toast.success('Estado actualizado exitosamente');
            loadOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar el estado');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.user_info?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user_info?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (status) => {
        const colors = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'En Proceso': 'bg-blue-100 text-blue-800',
            'Enviado': 'bg-indigo-100 text-indigo-800',
            'Entregado': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800',
            'Reembolsado': 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Gestión de Pedidos
                    </h1>
                    <p className="text-gray-600">
                        {orders.length} pedidos en total
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por usuario, email o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="Reembolsado">Reembolsado</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID Pedido
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Productos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {order.id?.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.user_info?.username || 'Usuario desconocido'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.user_info?.email || 'Sin email'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {order.items?.length || 0} producto(s)
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                                                {order.items?.length > 2 && '...'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${order.total_amount?.toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)} border-0 cursor-pointer`}
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="En Proceso">En Proceso</option>
                                                <option value="Enviado">Enviado</option>
                                                <option value="Entregado">Entregado</option>
                                                <option value="Cancelado">Cancelado</option>
                                                <option value="Reembolsado">Reembolsado</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('es-AR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">No se encontraron pedidos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
