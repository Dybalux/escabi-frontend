import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react';

export default function AdminNav() {
    const location = useLocation();

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Productos' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Pedidos' },
        { path: '/admin/users', icon: Users, label: 'Usuarios' },
    ];

    return (
        <nav className="bg-white shadow-md mb-6">
            <div className="container mx-auto px-4">
                <div className="flex gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${isActive
                                    ? 'border-purple-600 text-purple-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
