import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Beer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../UI/Button';
import MobileMenu from './MobileMenu';

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { getCartTotal } = useCart();

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-purple-600">
                        <Beer size={32} />
                        EscabiAPI
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                            Inicio
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-purple-600 transition-colors">
                            Productos
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/orders" className="text-gray-700 hover:text-purple-600 transition-colors">
                                    Mis Pedidos
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-purple-600 hover:text-purple-700 transition-colors font-semibold">
                                        Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/cart" className="relative">
                                        <ShoppingCart className="text-gray-700 hover:text-purple-600" size={24} />
                                        {getCartTotal() > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {getCartTotal()}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <User size={20} className="text-gray-700" />
                                        <span className="text-gray-700 font-medium">{user?.username}</span>
                                        {user?.role === 'admin' && (
                                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </div>

                                    <Button variant="outline" size="sm" onClick={logout}>
                                        <LogOut size={16} className="mr-1" />
                                        Salir
                                    </Button>
                                </>
                            ) : (
                                <Link to="/login">
                                    <Button size="sm">Iniciar Sesión</Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <MobileMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}