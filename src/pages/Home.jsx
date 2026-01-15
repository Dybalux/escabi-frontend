import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Beer, ShoppingCart, Shield, Zap, Package, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { getCombos, addComboToCart, getProducts, addToCart, getShippingPrices } from '../services/api';
import toast from 'react-hot-toast';
import AuthModal from '../components/Auth/AuthModal';
import { motion } from 'framer-motion';
import InteractiveShippingMap from '../components/Cart/InteractiveShippingMap';

export default function Home() {
    const { isAuthenticated, user } = useAuth();
    const [combos, setCombos] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(true);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef(null);
    const [showCoverageMap, setShowCoverageMap] = useState(false);

    // Combos Carousel State
    const [currentComboSlide, setCurrentComboSlide] = useState(0);
    const comboCarouselRef = useRef(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [shippingPrices, setShippingPrices] = useState(null);

    useEffect(() => {
        loadCombos();
        loadProducts();
        loadShippingPrices();
    }, []);

    const loadCombos = async () => {
        try {
            const response = await getCombos();
            setCombos(response.data);
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

    const loadShippingPrices = async () => {
        try {
            const response = await getShippingPrices();
            setShippingPrices(response.data);
        } catch (error) {
            console.error('Error loading shipping prices:', error);
        }
    };

    const handleAddToCart = async (comboId, comboName) => {
        if (!isAuthenticated) {
            setPendingAction({ type: 'combo', id: comboId, name: comboName });
            setShowAuthModal(true);

            // Lock scroll and add blur to page
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.style.filter = 'blur(8px)';
            }
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
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
            // Store pending action and show auth modal
            setPendingAction({ type: 'product', id: productId, name: productName });
            setShowAuthModal(true);

            // Lock scroll and add blur to page
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.style.filter = 'blur(8px)';
            }
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
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

    const handleAuthSuccess = async () => {
        // Close modal and restore page
        setShowAuthModal(false);
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.style.filter = '';
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';

        // Execute pending action
        if (pendingAction) {
            try {
                if (pendingAction.type === 'combo') {
                    await addComboToCart(pendingAction.id, 1);
                    toast.success(`${pendingAction.name} agregado al carrito`);
                } else if (pendingAction.type === 'product') {
                    await addToCart(pendingAction.id, 1);
                    toast.success(`${pendingAction.name} agregado al carrito`);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                toast.error('Error al agregar al carrito');
            }
            setPendingAction(null);
        }
    };

    const handleAuthClose = () => {
        setShowAuthModal(false);
        setPendingAction(null);

        // Restore page
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.style.filter = '';
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
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
        <>
            <Helmet>
                <title>Alto Trago | Tu Tienda Online de Bebidas</title>
                <meta name="description" content="Descubrí la mejor selección de bebidas alcohólicas, promociones exclusivas y combos especiales en Alto Trago. Envíos rápidos y seguros." />
                <meta name="keywords" content="bebidas, alcohol, fernet, cerveza, combos, ofertas, delivery bebidas, alto trago" />
                <link rel="canonical" href="https://altotrago.com/" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://altotrago.com/" />
                <meta property="og:title" content="Alto Trago | Tu Tienda Online de Bebidas" />
                <meta property="og:description" content="Descubrí la mejor selección de bebidas alcohólicas, promociones exclusivas y combos especiales en Alto Trago." />
                <meta property="og:image" content="https://altotrago.com/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://altotrago.com/" />
                <meta property="twitter:title" content="Alto Trago | Tu Tienda Online de Bebidas" />
                <meta property="twitter:description" content="Descubrí la mejor selección de bebidas alcohólicas, promociones exclusivas y combos especiales en Alto Trago." />
                <meta property="twitter:image" content="https://altotrago.com/og-image.jpg" />

                <script type="application/ld+json">
                    {`
                        {
                            "@context": "https://schema.org",
                            "@type": "LiquorStore",
                            "name": "Alto Trago",
                            "image": "https://altotrago.com/logo.png",
                            "@id": "https://altotrago.com",
                            "url": "https://altotrago.com",
                            "telephone": "+541112345678",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Av. Corrientes 1234",
                                "addressLocality": "Buenos Aires",
                                "postalCode": "C1043",
                                "addressCountry": "AR"
                            },
                            "priceRange": "$$",
                            "openingHoursSpecification": {
                                "@type": "OpeningHoursSpecification",
                                "dayOfWeek": [
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday"
                                ],
                                "opens": "10:00",
                                "closes": "22:00"
                            },
                            "sameAs": [
                                "https://www.facebook.com/altotrago",
                                "https://www.instagram.com/altotrago"
                            ]
                        }
                    `}
                </script>
            </Helmet>
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

                {/* Marketing Banner - Free Shipping Promotion */}
                <section className="market-banner-section py-8 bg-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="market-banner-container"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="market-banner-content">
                                <div className="market-banner-text">
                                    <motion.h2
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        🚛 ¡ENVÍO GRATIS EN EL CENTRO!
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        Llevando <strong>1 Combo</strong> o <strong>2 Productos</strong>, tu envío a Zona Céntrica es <strong>BONIFICADO</strong>. 🎁
                                    </motion.p>
                                </div>
                                <motion.div
                                    className="market-banner-badge"
                                    initial={{ opacity: 0, rotate: -15, scale: 0.5 }}
                                    whileInView={{ opacity: 1, rotate: 3, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                >
                                    <span className="badge-main">ENVÍO</span>
                                    <span className="badge-sub">¡GRATIS!</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Promo Banner - Free Shipping Information */}
                <section className="bg-white py-6">
                    <div className="container mx-auto px-4">
                        <div className="promo-banner">
                            <div className="promo-icon">🗺️</div>
                            <div className="promo-content flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3>Zonas de Envío Disponibles</h3>
                                        <p>Consultá las zonas de cobertura y sus costos</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCoverageMap(!showCoverageMap)}
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/30 flex items-center gap-2 w-fit"
                                    >
                                        <Package size={16} />
                                        {showCoverageMap ? 'Ocultar Mapa' : 'Ver Zonas de Envío'}
                                    </button>
                                </div>

                                {showCoverageMap && shippingPrices && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 rounded-xl overflow-hidden border border-white/20 shadow-lg bg-white p-4"
                                    >
                                        <InteractiveShippingMap
                                            shippingPrices={shippingPrices}
                                            selectedZone="central"
                                            onZoneSelect={() => { }}
                                            readOnly={true}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Combos Section */}
                {
                    combos.length > 0 && (
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
                                                                        loading="lazy"
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
                                                                    <button
                                                                        onClick={() => handleAddToCart(comboId, combo.name)}
                                                                        className="w-full bg-[#0D4F4F] text-white px-4 py-3 rounded-xl hover:bg-[#1E7E7A] transition-colors flex items-center justify-center gap-2 font-bold shadow-md active:scale-95"
                                                                    >
                                                                        Agregar al Carrito
                                                                    </button>
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
                    )
                }

                {/* Products Carousel */}
                {
                    products.length > 0 && (
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
                                                                        loading="lazy"
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
                                                                    {product.stock > 0 ? (
                                                                        <button
                                                                            onClick={() => handleAddProductToCart(productId, product.name)}
                                                                            className="w-full bg-[#0D4F4F] text-white px-4 py-2.5 rounded-xl hover:bg-[#1E7E7A] transition-colors flex items-center justify-center gap-2 font-semibold shadow-sm active:scale-95"
                                                                        >
                                                                            Agregar
                                                                        </button>
                                                                    ) : (
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
                    )
                }

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
            </div >

            {/* Auth Modal */}
            {
                showAuthModal && (
                    <AuthModal
                        onClose={handleAuthClose}
                        onSuccess={handleAuthSuccess}
                    />
                )
            }
        </>
    );
}
