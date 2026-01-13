import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShippingPrices } from '../../services/api';
import toast from 'react-hot-toast';

export default function ShippingAddressModal({ isOpen, onClose, onSubmit }) {
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

        // Solo validar dirección y teléfono si NO es retiro en persona
        if (selectedZone !== 'pickup') {
            if (!formData.street.trim()) {
                newErrors.street = 'La dirección es requerida';
            }
            if (!formData.phone.trim()) {
                newErrors.phone = 'El teléfono es requerido';
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
            // Calcular costo de envío según zona seleccionada
            let shippingCost = 0;
            if (selectedZone === 'central') {
                shippingCost = shippingPrices?.central?.price || 0;
            } else if (selectedZone === 'remote') {
                shippingCost = shippingPrices?.remote?.price || 0;
            } else if (selectedZone === 'pickup') {
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
                zone: selectedZone,
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
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.street ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'
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
                                    Método de Envío *
                                </label>
                                {loadingPrices ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : shippingPrices ? (
                                    <div className="space-y-2">
                                        {/* Opción Central */}
                                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-all ${selectedZone === 'central' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="zone"
                                                value="central"
                                                checked={selectedZone === 'central'}
                                                onChange={(e) => setSelectedZone(e.target.value)}
                                                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">
                                                    🏙️ {shippingPrices.central?.description || 'Zona Céntrica'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Costo: ${shippingPrices.central?.price?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>
                                        </label>

                                        {/* Opción Remote */}
                                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-all ${selectedZone === 'remote' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="zone"
                                                value="remote"
                                                checked={selectedZone === 'remote'}
                                                onChange={(e) => setSelectedZone(e.target.value)}
                                                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">
                                                    🌄 {shippingPrices.remote?.description || 'Zonas Lejanas'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Costo: ${shippingPrices.remote?.price?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>
                                        </label>

                                        {/* Opción Pickup - GRATIS */}
                                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-all ${selectedZone === 'pickup' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="zone"
                                                value="pickup"
                                                checked={selectedZone === 'pickup'}
                                                onChange={(e) => setSelectedZone(e.target.value)}
                                                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-800">
                                                        📦 {shippingPrices.pickup?.description || 'Retiro en Persona'}
                                                    </span>
                                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        GRATIS
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    📍 {shippingPrices.pickup?.address || 'Dirección no configurada'}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-sm">Error al cargar opciones de envío</p>
                                )}
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas adicionales (opcional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                                    placeholder="Ej: Casa de color blanco, portón negro"
                                />
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
            )}
        </AnimatePresence>
    );
}
