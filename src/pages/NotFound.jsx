import { Link } from 'react-router-dom';
import { Home, Search, ShoppingCart } from 'lucide-react';
import Button from '../components/UI/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-white opacity-20 select-none">
                        404
                    </h1>
                    <div className="-mt-20">
                        <span className="text-8xl">🍺</span>
                    </div>
                </div>

                {/* Message */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        ¡Ups! Página no encontrada
                    </h2>
                    <p className="text-xl text-purple-100 mb-2">
                        Parece que esta página se tomó unas vacaciones
                    </p>
                    <p className="text-lg text-purple-200">
                        La URL que buscas no existe o fue movida
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/">
                        <Button size="lg" className="w-full sm:w-auto">
                            <Home size={20} className="mr-2" />
                            Volver al Inicio
                        </Button>
                    </Link>
                    <Link to="/products">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white hover:bg-white/20">
                            <ShoppingCart size={20} className="mr-2" />
                            Ver Productos
                        </Button>
                    </Link>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-white/20">
                    <p className="text-purple-100 mb-4">¿Necesitas ayuda?</p>
                    <div className="flex flex-wrap gap-4 justify-center text-sm">
                        <Link to="/" className="text-white hover:text-purple-200 transition-colors">
                            Inicio
                        </Link>
                        <span className="text-purple-300">•</span>
                        <Link to="/products" className="text-white hover:text-purple-200 transition-colors">
                            Productos
                        </Link>
                        <span className="text-purple-300">•</span>
                        <Link to="/cart" className="text-white hover:text-purple-200 transition-colors">
                            Carrito
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
