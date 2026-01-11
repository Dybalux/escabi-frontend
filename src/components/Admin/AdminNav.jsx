import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, Truck } from 'lucide-react';

export default function AdminNav() {
    const location = useLocation();

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Productos' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Pedidos' },
        { path: '/admin/users', icon: Users, label: 'Usuarios' },
        { path: '/admin/shipping-settings', icon: Truck, label: 'Envíos' },
        { path: '/admin/payment-settings', icon: Settings, label: 'Pagos' },
    ];

    return (
        <nav className="bg-white shadow-md mb-6">
            <div className="container mx-auto px-2 sm:px-4">
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap min-w-fit ${isActive
                                    ? 'border-purple-600 text-purple-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
