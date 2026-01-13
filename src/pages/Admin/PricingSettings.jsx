import { useState, useEffect } from 'react';
import { Calendar, Clock, Percent, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function PricingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        enabled: false,
        multiplier: 1.0,
        start_day: 5, // Viernes
        end_day: 7,   // Domingo
        start_hour: 20,
        end_hour: 0
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
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/admin/pricing-settings');
            if (response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Error loading pricing settings:', error);
            toast.error('Error al cargar la configuración de precios');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/pricing-settings', settings);
            toast.success('Configuración guardada exitosamente');
        } catch (error) {
            console.error('Error saving pricing settings:', error);
            toast.error('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const calculateDiscountPercentage = () => {
        return ((1 - settings.multiplier) * 100).toFixed(0);
    };

    const calculateIncreasePercentage = () => {
        return ((settings.multiplier - 1) * 100).toFixed(0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D4F4F]"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#0D4F4F] to-[#C29F4C] bg-clip-text text-transparent">
                    ⚡ Configuración de Precios Dinámicos
                </h1>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {/* Toggle Principal */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Activar Precios Dinámicos</h3>
                            <p className="text-sm text-gray-600">Ajusta automáticamente los precios según día y hora</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                    </div>

                    {/* Multiplicador de Precio */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-[#0D4F4F]">
                            <Percent size={20} />
                            Ajuste de Precio
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Multiplicador
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    max="2.0"
                                    value={settings.multiplier}
                                    onChange={(e) => setSettings({ ...settings, multiplier: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Ejemplo: 0.9 = 10% descuento, 1.1 = 10% aumento
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className={`text-center p-4 rounded-lg ${settings.multiplier < 1 ? 'bg-green-50' : settings.multiplier > 1 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                                    <p className="text-sm text-gray-600">Efecto</p>
                                    <p className={`text-3xl font-bold ${settings.multiplier < 1 ? 'text-green-600' : settings.multiplier > 1 ? 'text-orange-600' : 'text-gray-600'}`}>
                                        {settings.multiplier < 1 ? `-${calculateDiscountPercentage()}%` : settings.multiplier > 1 ? `+${calculateIncreasePercentage()}%` : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rango de Días */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-[#0D4F4F]">
                            <Calendar size={20} />
                            Días de la Semana
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Día de Inicio
                                </label>
                                <select
                                    value={settings.start_day}
                                    onChange={(e) => setSettings({ ...settings, start_day: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day.value} value={day.value}>{day.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Día de Fin
                                </label>
                                <select
                                    value={settings.end_day}
                                    onChange={(e) => setSettings({ ...settings, end_day: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day.value} value={day.value}>{day.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Rango de Horas */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-[#0D4F4F]">
                            <Clock size={20} />
                            Horario
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hora de Inicio
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={settings.start_hour}
                                    onChange={(e) => setSettings({ ...settings, start_hour: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formato 24 horas (0-23)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hora de Fin
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={settings.end_hour}
                                    onChange={(e) => setSettings({ ...settings, end_hour: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    0 = medianoche
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ejemplo Visual */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Configuración Actual</h4>
                                <p className="text-sm text-blue-800">
                                    {settings.enabled ? (
                                        <>
                                            Los precios se ajustarán <strong>{settings.multiplier < 1 ? `con ${calculateDiscountPercentage()}% de descuento` : settings.multiplier > 1 ? `con ${calculateIncreasePercentage()}% de aumento` : 'sin cambios'}</strong> desde el <strong>{daysOfWeek.find(d => d.value === settings.start_day)?.label}</strong> a las <strong>{settings.start_hour}:00</strong> hasta el <strong>{daysOfWeek.find(d => d.value === settings.end_day)?.label}</strong> a las <strong>{settings.end_hour === 0 ? '00:00 (medianoche)' : `${settings.end_hour}:00`}</strong>.
                                        </>
                                    ) : (
                                        'Los precios dinámicos están desactivados. Los productos se mostrarán a precio normal.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
}
