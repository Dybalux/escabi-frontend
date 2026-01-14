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

    // Combos Carousel State
    const [currentComboSlide, setCurrentComboSlide] = useState(0);
    const comboCarouselRef = useRef(null);

    useEffect(() => {
        loadCombos();
        loadProducts();
    }, []);

    const loadCombos = async () => {
        try {
            // Cargar combos y productos en paralelo
            const [combosResponse, productsResponse] = await Promise.all([
                getCombos(),
                getProducts({ include_out_of_stock: true, include_inactive: true })
            ]);

            const combosData = combosResponse.data;
            const productsData = productsResponse.data.items || productsResponse.data;

            // Crear mapa de productos
            const productsMap = {};
            if (Array.isArray(productsData)) {
                productsData.forEach(p => {
                    productsMap[p.id || p._id] = p;
                });
            }

            // Enriquecer combos con datos de productos
            const enrichedCombos = combosData.map(combo => {
                let totalCost = 0;

                const enrichedItems = combo.items?.map(item => {
                    const productId = item.product_id || item.id;
                    const product = productsMap[productId];

                    if (product) {
                        const quantity = item.quantity || 1;
                        totalCost += (product.price || 0) * quantity;

                        return {
                            ...item,
                            name: product.name,
                            image_url: product.image_url,
                            price: product.price,
                            product_name: product.name
                        };
                    }
                    return item;
                }) || [];

                const price = combo.price || 0;
                const savings = totalCost > price ? totalCost - price : 0;

                return {
                    ...combo,
                    items: enrichedItems,
                    total_items_cost: combo.total_items_cost || totalCost,
                    savings: combo.savings || savings
                };
            });

            setCombos(enrichedCombos);
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

    // Responsive carousel logic
    const [itemsPerView, setItemsPerView] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setItemsPerView(1.5); // Mobile partially shows next
            else if (window.innerWidth < 1024) setItemsPerView(2);
            else setItemsPerView(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-scroll del carrusel de Productos
    useEffect(() => {
        if (products.length <= itemsPerView) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => {
                const maxSlide = products.length - Math.floor(itemsPerView);
                return prev >= maxSlide ? 0 : prev + 1;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [products.length, itemsPerView]);

    const nextSlide = () => {
        const maxSlide = products.length - Math.floor(itemsPerView);
        setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    };

    const prevSlide = () => {
        const maxSlide = products.length - Math.floor(itemsPerView);
        setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
    };

    // Auto-scroll del carrusel de Combos
    useEffect(() => {
        if (combos.length <= itemsPerView) return;

        const interval = setInterval(() => {
            setCurrentComboSlide((prev) => {
                const maxSlide = combos.length - Math.floor(itemsPerView);
                return prev >= maxSlide ? 0 : prev + 1;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [combos.length, itemsPerView]);

    const nextComboSlide = () => {
        const maxSlide = combos.length - Math.floor(itemsPerView);
        setCurrentComboSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    };

    const prevComboSlide = () => {
        const maxSlide = combos.length - Math.floor(itemsPerView);
        setCurrentComboSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#0D4F4F] to-[#0A3636] text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Bienvenido a Alto Trago
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-teal-50">
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

                        <div className="relative">
                            {/* Navigation Buttons - Combos */}
                            {combos.length > itemsPerView && (
                                <>
                                    <button
                                        onClick={prevComboSlide}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Anterior Combo"
                                    >
                                        <ChevronLeft size={24} className="text-[#0D4F4F]" />
                                    </button>
                                    <button
                                        onClick={nextComboSlide}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Siguiente Combo"
                                    >
                                        <ChevronRight size={24} className="text-[#0D4F4F]" />
                                    </button>
                                </>
                            )}

                            {/* Carousel Container - Combos */}
                            <div className="overflow-hidden" ref={comboCarouselRef}>
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${currentComboSlide * (itemsPerView === 1.5 ? 66.66 : (100 / itemsPerView))}%)` }}
                                >
                                    {combos.map((combo) => {
                                        const comboId = combo.id || combo._id;
                                        return (
                                            <div key={comboId} className="w-[66.66%] md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 md:px-4">
                                                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-[#C29F4C]/20 h-full">
                                                    {/* Image */}
                                                    <div className="relative h-48 bg-gradient-to-br from-teal-50 to-teal-100">
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
                                                        <div className="absolute top-2 left-2 bg-[#C29F4C] text-white text-xs px-3 py-1 rounded-full font-bold">
                                                            COMBO
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-6">
                                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{combo.name}</h3>
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{combo.description}</p>

                                                        {/* Productos del combo */}
                                                        {combo.items && combo.items.length > 0 && (
                                                            <div className="mb-4 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                                                                <p className="text-xs font-semibold text-[#0D4F4F] mb-2">Incluye:</p>
                                                                <ul className="space-y-1">
                                                                    {combo.items.map((item, idx) => (
                                                                        <li key={idx} className="text-xs text-gray-700 flex items-center gap-1">
                                                                            <span className="text-[#C29F4C] font-bold">{item.quantity}x</span>
                                                                            <span>{item.name || 'Producto'}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col gap-3 mt-auto">
                                                            {/* Pricing with Savings */}
                                                            {combo.savings && combo.savings > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-sm text-gray-500 line-through">
                                                                        ${combo.total_items_cost?.toLocaleString('es-AR')}
                                                                    </div>
                                                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                                                                        ¡Ahorrás ${combo.savings.toLocaleString('es-AR')}!
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="text-3xl font-bold text-[#0D4F4F]">
                                                                ${combo.price?.toLocaleString('es-AR')}
                                                            </div>
                                                            {isAuthenticated && (
                                                                <button
                                                                    onClick={() => handleAddToCart(comboId, combo.name)}
                                                                    className="w-full bg-[#0D4F4F] text-white px-4 py-3 rounded-xl hover:bg-[#1E7E7A] transition-colors flex items-center justify-center gap-2 font-bold shadow-md active:scale-95"
                                                                >
                                                                    Agregar al Carrito
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dots Indicator - Combos */}
                            {combos.length > itemsPerView && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {Array.from({ length: Math.max(1, combos.length - Math.floor(itemsPerView) + 1) }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentComboSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${currentComboSlide === index ? 'bg-[#C29F4C]' : 'bg-gray-300'
                                                }`}
                                            aria-label={`Ir a slide combo ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
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
                            {products.length > itemsPerView && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Anterior"
                                    >
                                        <ChevronLeft size={24} className="text-[#0D4F4F]" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Siguiente"
                                    >
                                        <ChevronRight size={24} className="text-[#0D4F4F]" />
                                    </button>
                                </>
                            )}

                            {/* Carousel Container */}
                            <div className="overflow-hidden" ref={carouselRef}>
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${currentSlide * (itemsPerView === 1.5 ? 66.66 : (100 / itemsPerView))}%)` }}
                                >
                                    {products.map((product) => {
                                        const productId = product.id || product._id;
                                        return (
                                            <div key={productId} className="w-[66.66%] md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 md:px-4">
                                                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full">
                                                    {/* Image */}
                                                    <div className="relative h-48 bg-gradient-to-br from-teal-50 to-teal-100">
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

                                                        <div className="flex flex-col gap-3 mt-4">
                                                            <div className="text-2xl font-bold text-[#0D4F4F]">
                                                                ${product.price?.toLocaleString('es-AR')}
                                                            </div>
                                                            {isAuthenticated && product.stock > 0 && (
                                                                <button
                                                                    onClick={() => handleAddProductToCart(productId, product.name)}
                                                                    className="w-full bg-[#0D4F4F] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E7E7A] transition-colors flex items-center justify-center gap-2 font-semibold shadow-sm active:scale-95"
                                                                >
                                                                    Agregar
                                                                </button>
                                                            )}
                                                            {product.stock === 0 && (
                                                                <span className="text-red-600 text-sm font-bold bg-red-50 text-center py-2 rounded-lg border border-red-100 italic">
                                                                    Agotado
                                                                </span>
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
                            {products.length > itemsPerView && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {Array.from({ length: Math.max(1, products.length - Math.floor(itemsPerView) + 1) }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-[#C29F4C]' : 'bg-gray-300'
                                                }`}
                                            aria-label={`Ir a slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
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
                            <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Beer className="text-[#0D4F4F]" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Gran Variedad</h3>
                            <p className="text-gray-600">
                                Cervezas, vinos, licores y más
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="text-[#C29F4C]" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Fácil de Comprar</h3>
                            <p className="text-gray-600">
                                Proceso simple y rápido
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="text-[#1E7E7A]" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Compra Segura</h3>
                            <p className="text-gray-600">
                                Pagos protegidos con Mercado Pago
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="text-[#C29F4C]" size={32} />
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
            <section className="bg-gradient-to-br from-[#0D4F4F] to-[#0A3636] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        ¿Listo para tu primera compra?
                    </h2>
                    <p className="text-xl mb-8 text-teal-50">
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
