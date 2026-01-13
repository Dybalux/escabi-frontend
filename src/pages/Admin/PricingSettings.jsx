import { useState, useEffect } from 'react';
import { Percent, Clock, Calendar, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AdminNav from '../../components/Admin/AdminNav';

export default function PricingSettings() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        enabled: false,
        multiplier: 1.0,
        start_day: 1,
        end_day: 7,
        start_hour: 0,
        end_hour: 23
    });

    const daysOfWeek = [
        { value: 1, label: 'Lunes' },
        { value: 2, label: 'Martes' },
        { value: 3, label: 'Miércoles' },
        { value: 4, label: 'Jueves' },
        { value: 5, label: 'Viernes' },
        { value: 6, label: 'Sábado' },
        { value: 7, label: 'Domingo' }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/pricing-settings');
            if (response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            toast.error('Error al cargar la configuración de precios');
        }
    };

    const handleSave = async () => {
        // Validaciones
        if (settings.multiplier <= 0) {
            toast.error('El multiplicador debe ser mayor a 0');
            return;
        }

        if (settings.start_day < 1 || settings.start_day > 7 || settings.end_day < 1 || settings.end_day > 7) {
            toast.error('Los días deben estar entre 1 (Lunes) y 7 (Domingo)');
            return;
        }

        if (settings.start_hour < 0 || settings.start_hour > 23 || settings.end_hour < 0 || settings.end_hour > 23) {
            toast.error('Las horas deben estar entre 0 y 23');
            return;
        }

        setLoading(true);
        try {
            await api.put('/admin/pricing-settings', settings);
            toast.success('Configuración guardada exitosamente');
            fetchSettings();
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            toast.error(error.response?.data?.detail || 'Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const getDiscountPercentage = () => {
        return ((settings.multiplier - 1) * 100).toFixed(0);
    };

    const getDayLabel = (dayNum) => {
        return daysOfWeek.find(d => d.value === dayNum)?.label || dayNum;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Percent className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Configuración de Precios Dinámicos</h1>
                                <p className="text-sm text-gray-600">Ajusta precios según día y horario</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-2">
                                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">ℹ️ Cómo funciona:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Multiplicador 1.2 = +20% de aumento</li>
                                        <li>Multiplicador 0.9 = -10% de descuento</li>
                                        <li>Multiplicador 1.0 = sin cambios</li>
                                        <li>Los precios se aplican automáticamente según día/hora configurados</li>
                                        <li>Soporta horarios nocturnos (ej: 20hs a 6hs del día siguiente)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Toggle de activación */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Estado de Precios Dinámicos</h3>
                                    <p className="text-sm text-gray-600">Activa o desactiva el sistema de precios dinámicos</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                            {settings.enabled && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                    <p className="text-sm text-green-800 font-medium">
                                        ✅ Sistema activo: {getDayLabel(settings.start_day)} a {getDayLabel(settings.end_day)}, {settings.start_hour}:00 - {settings.end_hour}:00
                                        ({getDiscountPercentage() >= 0 ? '+' : ''}{getDiscountPercentage()}%)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Configuración de días */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                <Calendar className="inline mr-2" size={20} />
                                Rango de Días
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Día de inicio
                                    </label>
                                    <select
                                        value={settings.start_day}
                                        onChange={(e) => setSettings({ ...settings, start_day: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                    >
                                        {daysOfWeek.map(day => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Día de fin
                                    </label>
                                    <select
                                        value={settings.end_day}
                                        onChange={(e) => setSettings({ ...settings, end_day: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                    >
                                        {daysOfWeek.map(day => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Ejemplo: Viernes (5) a Domingo (7) = aplica desde viernes hasta domingo inclusive
                            </p>
                        </div>

                        {/* Configuración de horas */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                <Clock className="inline mr-2" size={20} />
                                Rango de Horas (Formato 24hs)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hora de inicio (0-23)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={settings.start_hour}
                                        onChange={(e) => setSettings({ ...settings, start_hour: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hora de fin (0-23)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={settings.end_hour}
                                        onChange={(e) => setSettings({ ...settings, end_hour: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Soporta horarios nocturnos: 20 a 6 = desde las 20:00 hasta las 05:59 del día siguiente
                            </p>
                        </div>

                        {/* Multiplicador */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                <Percent className="inline mr-2" size={20} />
                                Multiplicador de Precio
                            </h3>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    max="5"
                                    value={settings.multiplier}
                                    onChange={(e) => setSettings({ ...settings, multiplier: parseFloat(e.target.value) })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent text-lg font-semibold"
                                />
                                <span className={`text-2xl font-bold ${settings.multiplier > 1 ? 'text-green-600' : settings.multiplier < 1 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    {getDiscountPercentage() >= 0 ? '+' : ''}{getDiscountPercentage()}%
                                </span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => setSettings({ ...settings, multiplier: 0.9 })}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                >
                                    -10% (0.9)
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, multiplier: 1.0 })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Normal (1.0)
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, multiplier: 1.1 })}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                                >
                                    +10% (1.1)
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, multiplier: 1.2 })}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                                >
                                    +20% (1.2)
                                </button>
                            </div>
                        </div>

                        {/* Vista previa */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Vista Previa del Cambio</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Producto de $1000</span>
                                    <span className="font-semibold text-[#0D4F4F]">
                                        → ${(1000 * settings.multiplier).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cambio:</span>
                                    <span className={`font-semibold ${settings.multiplier >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                                        {getDiscountPercentage() >= 0 ? '+' : ''}{getDiscountPercentage()}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botón guardar */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-[#0D4F4F] hover:bg-[#1E7E7A] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
