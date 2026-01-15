import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShippingPrices } from '../../services/api';
import toast from 'react-hot-toast';
import CoverageMap from './CoverageMap';
import InteractiveShippingMap from './InteractiveShippingMap';
import FreeShippingBanner from './FreeShippingBanner';
import { checkFreeShippingEligibility } from '../../helpers/shippingRules';
import { useCart } from '../../context/CartContext';

export default function ShippingAddressModal({ isOpen, onClose, onSubmit }) {
    const { cart } = useCart();
    const { isEligible: isFreeShippingEligible } = checkFreeShippingEligibility(cart?.items || []);
    const [formData, setFormData] = useState({
        street: '',
        phone: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [selectedZone, setSelectedZone] = useState('central');
    const [shippingPrices, setShippingPrices] = useState(null);
    const [loadingPrices, setLoadingPrices] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchShippingPrices();
        }
    }, [isOpen]);

    const fetchShippingPrices = async () => {
        try {
            const response = await getShippingPrices();
            setShippingPrices(response.data);
        } catch (error) {
            console.error('Error al cargar precios de envío:', error);
            toast.error('Error al cargar precios de envío');
            // Mantener precios por defecto en caso de error
        } finally {
            setLoadingPrices(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Verificar que se haya seleccionado una zona
        if (!selectedZone) {
            newErrors.zone = 'Debes seleccionar una zona de envío';
        }

        // Verificar que la zona seleccionada esté disponible
        if (selectedZone && shippingPrices) {
            const isZoneAvailable = shippingPrices[selectedZone];
            if (!isZoneAvailable) {
                newErrors.zone = 'La zona de envío seleccionada no está disponible. Por favor, selecciona otra opción.';
                setSelectedZone(''); // Reset selection
            }
        }

        // Solo validar dirección y teléfono si NO es retiro en persona
        if (selectedZone !== 'pickup') {
            if (!formData.street.trim()) {
                newErrors.street = 'La dirección es requerida';
            }
            if (!formData.phone.trim()) {
                newErrors.phone = 'El teléfono es requerido';
            }
            if (!formData.notes.trim()) {
                newErrors.notes = 'Las referencias son requeridas';
            }
        } else {
            // Para pickup, solo validamos el teléfono
            if (!formData.phone.trim()) {
                newErrors.phone = 'El teléfono es requerido';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            // Mapear zonas visuales del mapa a zonas del backend
            // este, oeste, norte, sur -> remote
            // central -> central
            // pickup -> pickup
            let backendZone = selectedZone;
            if (['este', 'oeste', 'norte', 'sur'].includes(selectedZone)) {
                backendZone = 'remote';
            }

            // Calcular costo de envío según zona seleccionada
            let shippingCost = 0;
            if (backendZone === 'central') {
                shippingCost = shippingPrices?.central?.price || 0;
            } else if (backendZone === 'remote') {
                shippingCost = shippingPrices?.remote?.price || 0;
            } else if (backendZone === 'pickup') {
                shippingCost = 0; // Siempre gratis
            }

            // Formatear dirección - para pickup, usar la dirección de retiro
            const addressData = selectedZone === 'pickup' ? {
                street: shippingPrices?.pickup?.address || 'Retiro en persona',
                city: "Santa María",
                state: "Catamarca",
                zip_code: "4139",
                country: "Argentina",
                phone: formData.phone.trim(),
                notes: formData.notes.trim() || undefined
            } : {
                street: formData.street.trim(),
                city: "Santa María",
                state: "Catamarca",
                zip_code: "4139",
                country: "Argentina",
                phone: formData.phone.trim(),
                notes: formData.notes.trim() || undefined
            };

            // Enviar datos incluyendo zona y costo
            onSubmit({
                address: addressData,
                zone: backendZone,
                cost: shippingCost
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">
                            📦 Información de Envío
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            📍 Envío a Santa María, Catamarca
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Dirección/Calle - Solo mostrar si NO es pickup */}
                            {selectedZone !== 'pickup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dirección *
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all ${errors.street ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Ej: Av. 9 de Julio 1234"
                                    />
                                    {errors.street && (
                                        <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                                    )}
                                </div>
                            )}

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono de Contacto *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: 3838 123456"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Zona de Envío */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccione la zona de envío en donde esté su dirección *
                                </label>
                                {loadingPrices ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0D4F4F]"></div>
                                    </div>
                                ) : shippingPrices ? (
                                    <>
                                        {/* Verificar si hay al menos una opción disponible */}
                                        {Object.keys(shippingPrices).length === 0 ? (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                                <p className="text-red-700 font-medium">
                                                    ⚠️ No hay opciones de envío disponibles en este momento
                                                </p>
                                                <p className="text-red-600 text-sm mt-2">
                                                    Por favor, intenta más tarde o contáctanos
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-4">
                                                    <FreeShippingBanner cartItems={cart?.items || []} />
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Zona de Envío
                                                    </label>
                                                    <select
                                                        name="shipping_zone"
                                                        value={selectedZone}
                                                        onChange={(e) => setSelectedZone(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all text-gray-700 font-medium"
                                                    >
                                                        <option value="">Selecciona tu zona de envío</option>

                                                        {/* Solo mostrar opciones habilitadas */}
                                                        {shippingPrices.central && (
                                                            <option value="central">
                                                                🎁 Zona Céntrica - {(shippingPrices.central?.price === 0 || isFreeShippingEligible) ? 'GRATIS' : `$${shippingPrices.central?.price?.toFixed(0)}`}
                                                            </option>
                                                        )}

                                                        {shippingPrices.remote && (
                                                            <option value="remote">
                                                                🚛 Zona Alejada - {shippingPrices.remote?.price === 0 ? 'GRATIS' : `$${shippingPrices.remote?.price?.toFixed(0)}`}
                                                            </option>
                                                        )}

                                                        {shippingPrices.pickup && (
                                                            <option value="pickup">
                                                                🏪 Retiro en Local - GRATIS
                                                            </option>
                                                        )}
                                                    </select>
                                                </div>

                                                {/* Mapa Interactivo de Zonas */}
                                                <div className="mt-4">
                                                    <InteractiveShippingMap
                                                        onZoneSelect={(zone) => setSelectedZone(zone)}
                                                        selectedZone={selectedZone}
                                                        shippingPrices={
                                                            isFreeShippingEligible && shippingPrices.central
                                                                ? { ...shippingPrices, central: { ...shippingPrices.central, price: 0 } }
                                                                : shippingPrices
                                                        }
                                                    />
                                                </div>
                                            </>
                                        )}




                                        {/* Mensaje para retiro en persona */}
                                        {selectedZone === 'pickup' && shippingPrices.pickup && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-3 mt-3"
                                            >
                                                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                                                    <strong>📍 Retiro en:</strong> {shippingPrices.pickup?.address || 'Dirección no configurada'}
                                                </div>
                                                <div className="rounded-lg overflow-hidden border border-amber-200 shadow-sm">
                                                    <div className="bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 border-b border-amber-200">
                                                        🗺️ Ubicación de Retiro
                                                    </div>
                                                    <CoverageMap center={[-26.691, -66.049]} radius={100} />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Error de validación de zona */}
                                        {errors.zone && (
                                            <p className="text-red-500 text-sm mt-2">{errors.zone}</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-red-500 text-sm">Error al cargar opciones de envío</p>
                                )}
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referencias para ubicar el domicilio o info de contacto *
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent resize-none transition-all ${errors.notes ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: Portón negro, casa de dos pisos, o llamar al timbre azul"
                                />
                                {errors.notes && (
                                    <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingPrices}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continuar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    );
}
