import { useEffect, useState } from 'react';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { getAdminStats } from '../../services/api';
import StatsCard from '../../components/Admin/StatsCard';
import AdminNav from '../../components/Admin/AdminNav';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await getAdminStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error loading stats:', error);
            setError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <AlertCircle className="text-red-600 mb-2" size={32} />
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Dashboard de Administración
                    </h1>
                    <p className="text-gray-600">
                        Resumen general del sistema
                    </p>
                </div>

                {/* Estadísticas de Usuarios */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Usuarios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            title="Total de Usuarios"
                            value={stats?.users?.total || 0}
                            icon={Users}
                            color="purple"
                        />
                        <StatsCard
                            title="Usuarios Verificados"
                            value={stats?.users?.verified || 0}
                            icon={Users}
                            color="green"
                            subtitle={`${Math.round((stats?.users?.verified / stats?.users?.total) * 100) || 0}% del total`}
                        />
                        <StatsCard
                            title="Sin Verificar"
                            value={stats?.users?.unverified || 0}
                            icon={AlertCircle}
                            color="orange"
                        />
                    </div>
                </div>

                {/* Estadísticas de Productos */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Productos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatsCard
                            title="Total de Productos"
                            value={stats?.products?.total || 0}
                            icon={Package}
                            color="blue"
                        />
                        <StatsCard
                            title="Stock Bajo"
                            value={stats?.products?.low_stock || 0}
                            icon={AlertCircle}
                            color="red"
                            subtitle="Productos con menos de 10 unidades"
                        />
                    </div>
                </div>

                {/* Estadísticas de Pedidos */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total de Pedidos"
                            value={stats?.orders?.total || 0}
                            icon={ShoppingBag}
                            color="purple"
                        />
                        <StatsCard
                            title="Pendientes"
                            value={stats?.orders?.pending || 0}
                            icon={AlertCircle}
                            color="orange"
                        />
                        <StatsCard
                            title="En Proceso"
                            value={stats?.orders?.processing || 0}
                            icon={TrendingUp}
                            color="blue"
                        />
                        <StatsCard
                            title="Completados"
                            value={stats?.orders?.completed || 0}
                            icon={ShoppingBag}
                            color="green"
                        />
                    </div>
                </div>

                {/* Estadísticas de Ingresos */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Ingresos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatsCard
                            title="Ingresos Totales"
                            value={`$${stats?.revenue?.total?.toLocaleString('es-AR') || 0}`}
                            icon={DollarSign}
                            color="green"
                        />
                        <StatsCard
                            title="Últimos 30 Días"
                            value={`$${stats?.revenue?.last_30_days?.toLocaleString('es-AR') || 0}`}
                            icon={TrendingUp}
                            color="blue"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
