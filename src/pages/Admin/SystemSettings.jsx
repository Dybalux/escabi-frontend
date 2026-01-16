import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import AdminNav from '../../components/Admin/AdminNav';
import { getSystemStatus, updateSystemStatus } from '../../services/api';
import toast from 'react-hot-toast';

export default function SystemSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        maintenance_mode: false,
        maintenance_message: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await getSystemStatus();
            setSettings({
                maintenance_mode: response.data.maintenance_mode || false,
                maintenance_message: response.data.message || ''
            });
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSystemStatus(settings.maintenance_mode, settings.maintenance_message);
            toast.success('Configuración del sistema actualizada');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0D4F4F]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración del Sistema</h1>
                    <p className="text-gray-600 mb-8">Gestión global de la plataforma y mantenimiento.</p>

                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#0D4F4F]">
                        <form onSubmit={handleSave}>
                            {/* Maintenance Mode Toggle */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <AlertTriangle className="text-amber-500" size={20} />
                                            Modo Mantenimiento
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Cuando está activo, solo los administradores pueden acceder al sitio.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.maintenance_mode}
                                            onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0D4F4F]"></div>
                                    </label>
                                </div>

                                {settings.maintenance_mode && (
                                    <div className="ml-0 md:ml-6 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mensaje para los usuarios
                                        </label>
                                        <textarea
                                            value={settings.maintenance_message}
                                            onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                            rows="3"
                                            placeholder="Estamos realizando tareas de mantenimiento..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-[#0D4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#0A3636] transition-colors disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
