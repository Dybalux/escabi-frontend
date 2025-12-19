import { Link } from 'react-router-dom';
import { Beer, ShoppingCart, Shield, Zap } from 'lucide-react';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-600 to-purple-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        🍺 Bienvenido a EscabiAPI
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-purple-100">
                        Tu tienda online de bebidas con las mejores marcas
                    </p>
                    {!isAuthenticated ? (
                        <div className="flex gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg">Crear Cuenta</Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Link to="/products">
                            <Button size="lg">Ver Productos</Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* Age Verification Banner */}
            {isAuthenticated && !user?.age_verified && (
                <section className="bg-yellow-100 border-2 border-yellow-400 py-4">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-yellow-800 font-semibold mb-2">
                            ⚠️ Debes verificar tu mayoría de edad para poder comprar
                        </p>
                        <Link to="/verify-age">
                            <Button size="sm" variant="secondary">
                                Verificar Edad
                            </Button>
                        </Link>
                    </div>
                </section>
            )}

            {/* Features */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Beer className="text-purple-600" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Gran Variedad</h3>
                            <p className="text-gray-600">
                                Cervezas, vinos, licores y más
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="text-green-600" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Fácil de Comprar</h3>
                            <p className="text-gray-600">
                                Proceso simple y rápido
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="text-blue-600" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Compra Segura</h3>
                            <p className="text-gray-600">
                                Pagos protegidos con Mercado Pago
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="text-orange-600" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Envío Rápido</h3>
                            <p className="text-gray-600">
                                Recibí tu pedido en poco tiempo
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-purple-600 to-purple-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        ¿Listo para tu primera compra?
                    </h2>
                    <p className="text-xl mb-8 text-purple-100">
                        Explora nuestro catálogo y encuentra tus bebidas favoritas
                    </p>
                    <Link to="/products">
                        <Button size="lg">
                            Explorar Productos
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}