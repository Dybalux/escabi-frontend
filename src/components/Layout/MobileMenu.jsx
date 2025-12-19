import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu,
    X,
    Home,
    Package,
    ShoppingBag,
    ShoppingCart,
    User,
    LogOut,
    LayoutDashboard,
    Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../UI/Button';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { getCartTotal } = useCart();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleMenu}
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-purple-600">Menú</h2>
                        <button
                            onClick={toggleMenu}
                            className="p-2 text-gray-700 hover:text-purple-600 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* User Info */}
                    {isAuthenticated && (
                        <div className="p-4 bg-purple-50 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{user?.username}</p>
                                    {isAdmin && (
                                        <span className="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {/* Regular User Links */}
                            <Link
                                to="/"
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            >
                                <Home size={20} />
                                <span className="font-medium">Inicio</span>
                            </Link>

                            <Link
                                to="/products"
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            >
                                <Package size={20} />
                                <span className="font-medium">Productos</span>
                            </Link>

                            {isAuthenticated && (
                                <>
                                    <Link
                                        to="/orders"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                    >
                                        <ShoppingBag size={20} />
                                        <span className="font-medium">Mis Pedidos</span>
                                    </Link>

                                    <Link
                                        to="/cart"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors relative"
                                    >
                                        <ShoppingCart size={20} />
                                        <span className="font-medium">Carrito</span>
                                        {getCartTotal() > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                {getCartTotal()}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}

                            {/* Admin Links */}
                            {isAdmin && (
                                <>
                                    <div className="border-t border-gray-200 my-4 pt-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                                            Administración
                                        </p>
                                    </div>

                                    <Link
                                        to="/admin"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 p-3 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors font-semibold"
                                    >
                                        <LayoutDashboard size={20} />
                                        <span>Dashboard</span>
                                    </Link>

                                    <Link
                                        to="/admin/products"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 p-3 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        <Package size={20} />
                                        <span className="font-medium">Gestión de Productos</span>
                                    </Link>

                                    <Link
                                        to="/admin/orders"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 p-3 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        <ShoppingBag size={20} />
                                        <span className="font-medium">Gestión de Pedidos</span>
                                    </Link>

                                    <Link
                                        to="/admin/users"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 p-3 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        <Users size={20} />
                                        <span className="font-medium">Gestión de Usuarios</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-200">
                        {isAuthenticated ? (
                            <Button
                                variant="outline"
                                className="w-full justify-center flex items-center"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} className="mr-2" />
                                Cerrar Sesión
                            </Button>
                        ) : (
                            <Link to="/login" onClick={handleLinkClick}>
                                <Button className="w-full justify-center">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
