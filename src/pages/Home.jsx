import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Beer, ShoppingCart, Shield, Zap, Package, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { getCombos, addComboToCart, getProducts, addToCart } from '../services/api';
import toast from 'react-hot-toast';

export default function Home() {
    const { isAuthenticated, user } = useAuth();
    const [combos, setCombos] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(true);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        loadCombos();
        loadProducts();
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

    const loadProducts = async () => {
        try {
            const response = await getProducts({ limit: 12 });
            const productsList = response.data?.items || response.data || [];
            setProducts(productsList);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleAddToCart = async (comboId, comboName) => {
        if (!isAuthenticated) {
            toast.error('Debes iniciar sesión para agregar al carrito');
            return;
        }

        try {
            await addComboToCart(comboId, 1);
            toast.success(`${comboName} agregado al carrito`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            const errorMsg = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'Error al agregar al carrito';
            toast.error(errorMsg);
        }
    };

    const handleAddProductToCart = async (productId, productName) => {
        if (!isAuthenticated) {
            toast.error('Debes iniciar sesión para agregar al carrito');
            return;
        }

        try {
            await addToCart(productId, 1);
            toast.success(`${productName} agregado al carrito`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            const errorMsg = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'Error al agregar al carrito';
            toast.error(errorMsg);
        }
    };

    // Auto-scroll del carrusel
    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Math.max(1, products.length - 2));
        }, 4000); // Cambiar cada 4 segundos

        return () => clearInterval(interval);
    }, [products.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.max(1, products.length - 2));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + Math.max(1, products.length - 2)) % Math.max(1, products.length - 2));
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

            {/* Products Carousel */}
            {products.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">🍺 Nuestros Productos</h2>
                            <p className="text-gray-600">Descubrí nuestra selección de bebidas</p>
                        </div>

                        <div className="relative">
                            {/* Navigation Buttons */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                aria-label="Anterior"
                            >
                                <ChevronLeft size={24} className="text-purple-600" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                aria-label="Siguiente"
                            >
                                <ChevronRight size={24} className="text-purple-600" />
                            </button>

                            {/* Carousel Container */}
                            <div className="overflow-hidden" ref={carouselRef}>
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
                                >
                                    {products.map((product) => {
                                        const productId = product.id || product._id;
                                        return (
                                            <div key={productId} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4">
                                                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full">
                                                    {/* Image */}
                                                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                                🍺
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description || 'Producto de calidad'}</p>

                                                        <div className="flex items-center justify-between">
                                                            <div className="text-2xl font-bold text-blue-600">
                                                                ${product.price?.toLocaleString('es-AR')}
                                                            </div>
                                                            {isAuthenticated && product.stock > 0 && (
                                                                <button
                                                                    onClick={() => handleAddProductToCart(productId, product.name)}
                                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                                >
                                                                    <Plus size={18} />
                                                                    Agregar
                                                                </button>
                                                            )}
                                                            {product.stock === 0 && (
                                                                <span className="text-red-600 text-sm font-semibold">Sin stock</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dots Indicator */}
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: Math.max(1, products.length - 2) }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                        aria-label={`Ir a slide ${index + 1}`}
                                    />
                                ))}
                            </div>
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
