import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Beer, ShoppingCart, Shield, Zap, Package, Plus } from 'lucide-react';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { getCombos, addComboToCart } from '../services/api';
import toast from 'react-hot-toast';

export default function Home() {
    const { isAuthenticated, user } = useAuth();
    const [combos, setCombos] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(true);

    useEffect(() => {
        loadCombos();
    }, []);

    const loadCombos = async () => {
        try {
            const response = await getCombos();
            setCombos(response.data.slice(0, 3)); // Mostrar solo los primeros 3
        } catch (error) {
            console.error('Error loading combos:', error);
        } finally {
            setLoadingCombos(false);
        }
    };

    const handleAddToCart = async (comboId, comboName) => {
        if (!isAuthenticated) {
            toast.error('Debes iniciar sesión para agregar al carrito');
            return;
        }

        console.log('Adding combo to cart:', { comboId, comboName });

        try {
            await addComboToCart(comboId, 1);
            toast.success(`${comboName} agregado al carrito`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'Error al agregar al carrito';
            toast.error(errorMsg);
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-600 to-purple-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Bienvenido a Alto Trago
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
                                <Button size="lg">
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

            {/* Combos Section */}
            {combos.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">🎁 Combos Especiales</h2>
                            <p className="text-gray-600">Aprovechá nuestros packs con precios increíbles</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {combos.map((combo) => {
                                const comboId = combo.id || combo._id;
                                return (
                                    <div key={comboId} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-purple-100">
                                        {/* Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                                            {combo.image_url ? (
                                                <img
                                                    src={combo.image_url}
                                                    alt={combo.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                                    📦
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                                                COMBO
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{combo.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{combo.description}</p>

                                            {/* Productos del combo */}
                                            {combo.items && combo.items.length > 0 && (
                                                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                    <p className="text-xs font-semibold text-purple-700 mb-2">Incluye:</p>
                                                    <ul className="space-y-1">
                                                        {combo.items.map((item, idx) => (
                                                            <li key={idx} className="text-xs text-gray-700 flex items-center gap-1">
                                                                <span className="text-purple-600 font-bold">{item.quantity}x</span>
                                                                <span>{item.name || 'Producto'}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="text-3xl font-bold text-purple-600">
                                                    ${combo.price?.toLocaleString('es-AR')}
                                                </div>
                                                {isAuthenticated && (
                                                    <button
                                                        onClick={() => handleAddToCart(comboId, combo.name)}
                                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Plus size={18} />
                                                        Agregar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
