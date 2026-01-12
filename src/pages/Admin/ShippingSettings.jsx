import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getShippingSettings, updateShippingSettings } from '../../services/api';
import AdminNav from '../../components/Admin/AdminNav';

export default function ShippingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [prices, setPrices] = useState({
        central_zone_price: 500,
        remote_zone_price: 1000
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getShippingSettings();
            setPrices({
                central_zone_price: response.data.central_zone_price,
                remote_zone_price: response.data.remote_zone_price
            });
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            toast.error('Error al cargar configuración de envíos');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validación
        if (prices.central_zone_price <= 0 || prices.remote_zone_price <= 0) {
            toast.error('Los precios deben ser mayores a 0');
            return;
        }

        setSaving(true);
        try {
            await updateShippingSettings(
                prices.central_zone_price,
                prices.remote_zone_price
            );
            toast.success('Precios actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar precios:', error);
            toast.error('Error al actualizar precios de envío');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ⚙️ Configuración de Envíos
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Zona Céntrica */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🏙️ Precio Zona Céntrica
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
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                min="0"
                                step="50"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Para entregas en zonas céntricas o cercanas
                        </p>
                    </div>

                    {/* Zonas Lejanas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🌄 Precio Zonas Lejanas
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
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                min="0"
                                step="50"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Para entregas en zonas alejadas o de difícil acceso
                        </p>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-800">
                            <strong>💡 Nota:</strong> Los cambios se aplicarán inmediatamente a todos los nuevos pedidos.
                            Los pedidos existentes mantendrán el precio de envío original.
                        </p>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
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
