import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getShippingSettings, updateShippingSettings } from '../../services/api';
import AdminNav from '../../components/Admin/AdminNav';

export default function ShippingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [prices, setPrices] = useState({
        central_zone_price: 500,
        central_zone_description: '',
        central_zone_enabled: true,
        remote_zone_price: 1000,
        remote_zone_description: '',
        remote_zone_enabled: true,
        pickup_address: '',
        pickup_description: '',
        pickup_enabled: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getShippingSettings();
            setPrices({
                central_zone_price: response.data.central_zone_price,
                central_zone_description: response.data.central_zone_description || '',
                central_zone_enabled: response.data.central_zone_enabled !== false,
                remote_zone_price: response.data.remote_zone_price,
                remote_zone_description: response.data.remote_zone_description || '',
                remote_zone_enabled: response.data.remote_zone_enabled !== false,
                pickup_address: response.data.pickup_address || '',
                pickup_description: response.data.pickup_description || '',
                pickup_enabled: response.data.pickup_enabled !== false
            });
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            toast.error('Error al cargar configuración de envíos');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validación solo para opciones habilitadas
        if (prices.central_zone_enabled) {
            if (prices.central_zone_price < 0) {
                toast.error('El precio de zona céntrica no puede ser negativo');
                return;
            }
            if (!prices.central_zone_description.trim()) {
                toast.error('La descripción de zona céntrica es requerida');
                return;
            }
        }

        if (prices.remote_zone_enabled) {
            if (prices.remote_zone_price <= 0) {
                toast.error('El precio de zona remota debe ser mayor a 0');
                return;
            }
            if (!prices.remote_zone_description.trim()) {
                toast.error('La descripción de zona remota es requerida');
                return;
            }
        }

        if (prices.pickup_enabled) {
            if (!prices.pickup_address.trim()) {
                toast.error('La dirección de retiro es requerida');
                return;
            }
            if (!prices.pickup_description.trim()) {
                toast.error('La descripción de retiro es requerida');
                return;
            }
        }

        // Al menos una opción debe estar habilitada
        if (!prices.central_zone_enabled && !prices.remote_zone_enabled && !prices.pickup_enabled) {
            toast.error('Debe habilitar al menos una opción de envío');
            return;
        }

        setSaving(true);
        try {
            await updateShippingSettings(prices);
            toast.success('Configuración actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            toast.error('Error al actualizar configuración de envíos');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D4F4F]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#0D4F4F] to-[#C29F4C] bg-clip-text text-transparent">
                    ⚙️ Configuración de Envíos
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Zona Céntrica */}
                    <div className={`border rounded-lg p-4 transition-all ${prices.central_zone_enabled ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#0D4F4F]">🏙️ Zona Céntrica</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm font-medium text-gray-700">
                                    {prices.central_zone_enabled ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={prices.central_zone_enabled}
                                        onChange={(e) => setPrices({
                                            ...prices,
                                            central_zone_enabled: e.target.checked
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </div>
                            </label>
                        </div>

                        <div className={`space-y-4 ${!prices.central_zone_enabled && 'pointer-events-none opacity-50'}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-700">$</span>
                                    <input
                                        type="number"
                                        value={prices.central_zone_price}
                                        onChange={(e) => setPrices({
                                            ...prices,
                                            central_zone_price: parseFloat(e.target.value) || 0
                                        })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all"
                                        min="0"
                                        step="50"
                                        disabled={!prices.central_zone_enabled}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={prices.central_zone_description}
                                    onChange={(e) => setPrices({
                                        ...prices,
                                        central_zone_description: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all"
                                    placeholder="Ej: Envío a zona céntrica"
                                    disabled={!prices.central_zone_enabled}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Esta descripción se mostrará a los clientes durante el checkout
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Zonas Lejanas */}
                    <div className={`border rounded-lg p-4 transition-all ${prices.remote_zone_enabled ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#1E7E7A]">🌄 Zonas Lejanas</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm font-medium text-gray-700">
                                    {prices.remote_zone_enabled ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={prices.remote_zone_enabled}
                                        onChange={(e) => setPrices({
                                            ...prices,
                                            remote_zone_enabled: e.target.checked
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </div>
                            </label>
                        </div>

                        <div className={`space-y-4 ${!prices.remote_zone_enabled && 'pointer-events-none opacity-50'}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-700">$</span>
                                    <input
                                        type="number"
                                        value={prices.remote_zone_price}
                                        onChange={(e) => setPrices({
                                            ...prices,
                                            remote_zone_price: parseFloat(e.target.value) || 0
                                        })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all"
                                        min="0"
                                        step="50"
                                        disabled={!prices.remote_zone_enabled}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={prices.remote_zone_description}
                                    onChange={(e) => setPrices({
                                        ...prices,
                                        remote_zone_description: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all"
                                    placeholder="Ej: Envío a zonas lejanas"
                                    disabled={!prices.remote_zone_enabled}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Esta descripción se mostrará a los clientes durante el checkout
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Retiro en Persona */}
                    <div className={`border rounded-lg p-4 transition-all ${prices.pickup_enabled ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-amber-800">📦 Retiro en Persona</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm font-medium text-gray-700">
                                    {prices.pickup_enabled ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={prices.pickup_enabled}
                                        onChange={(e) => setPrices({
                                            ...prices,
                                            pickup_enabled: e.target.checked
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </div>
                            </label>
                        </div>

                        <div className={`space-y-4 ${!prices.pickup_enabled && 'pointer-events-none opacity-50'}`}>
                            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
                                <p className="text-sm text-amber-800 font-medium">
                                    ✨ El retiro en persona siempre es GRATIS ($0)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección de Retiro
                                </label>
                                <input
                                    type="text"
                                    value={prices.pickup_address}
                                    onChange={(e) => setPrices({
                                        ...prices,
                                        pickup_address: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all"
                                    placeholder="Ej: Calle Principal 123, Santa María"
                                    disabled={!prices.pickup_enabled}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Dirección donde los clientes pueden retirar sus pedidos
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={prices.pickup_description}
                                    onChange={(e) => setPrices({
                                        ...prices,
                                        pickup_description: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent transition-all"
                                    placeholder="Ej: Retiro en persona"
                                    disabled={!prices.pickup_enabled}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Esta descripción se mostrará a los clientes durante el checkout
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <p className="text-sm text-[#0D4F4F]">
                            <strong>💡 Nota:</strong> Los cambios se aplicarán inmediatamente a todos los nuevos pedidos.
                            Los pedidos existentes mantendrán el precio de envío original.
                        </p>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-[#0D4F4F] text-white py-3 rounded-lg hover:bg-[#1E7E7A] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </span>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
