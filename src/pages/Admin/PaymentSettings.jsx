import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { getAdminPaymentSettings, updatePaymentSettings } from '../../services/api';
import AdminNav from '../../components/Admin/AdminNav';
import toast from 'react-hot-toast';

export default function PaymentSettings() {
    const [settings, setSettings] = useState(null);
    const [alias, setAlias] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await getAdminPaymentSettings();
            setSettings(response.data);
            setAlias(response.data.transfer_alias || '');
            setWhatsapp(response.data.transfer_whatsapp || '');
            setInstagram(response.data.instagram_url || '');
            setFacebook(response.data.facebook_url || '');
            setEmail(response.data.email || '');
        } catch (error) {
            console.error('Error loading payment settings:', error);
            toast.error('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!alias || alias.trim().length < 3 || alias.trim().length > 100) {
            newErrors.alias = 'El alias debe tener entre 3 y 100 caracteres';
        }

        const phonePattern = /^\+?[0-9]{10,15}$/;
        if (!whatsapp || !phonePattern.test(whatsapp.replace(/\s/g, ''))) {
            newErrors.whatsapp = 'El WhatsApp debe tener entre 10 y 15 dígitos (puede empezar con +)';
        }

        if (instagram && !/^https?:\/\/(www\.)?instagram\.com/.test(instagram)) {
            newErrors.instagram = 'La URL de Instagram debe ser válida (ej: https://instagram.com/usuario)';
        }

        if (facebook && !/^https?:\/\/(www\.)?facebook\.com/.test(facebook)) {
            newErrors.facebook = 'La URL de Facebook debe ser válida (ej: https://facebook.com/pagina)';
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'El email debe ser válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        setSaving(true);
        try {
            await updatePaymentSettings({
                transfer_alias: alias.trim(),
                transfer_whatsapp: whatsapp.trim(),
                instagram_url: instagram.trim(),
                facebook_url: facebook.trim(),
                email: email.trim()
            });

            toast.success('Configuración actualizada exitosamente');
            fetchSettings(); // Recargar para obtener updated_at y updated_by
        } catch (error) {
            console.error('Error updating payment settings:', error);
            const errorMessage = error.response?.data?.detail || 'Error al guardar la configuración';
            toast.error(errorMessage);
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
            <div className="container mx-auto px-4 py-8 flex flex-col items-center">
                {/* Header */}
                <div className="mb-8 w-full max-w-2xl text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                        <Settings className="text-[#0D4F4F]" size={36} />
                        Configuración de Pagos
                    </h1>
                    <p className="text-gray-600">
                        Administrá los datos para pagos por transferencia bancaria
                    </p>
                </div>

                {/* Form */}
                <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Transferencia Bancaria
                    </h2>

                    {/* Alias/CVU */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alias/CVU <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent ${errors.alias ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="ESCABI.API.MP"
                            minLength={3}
                            maxLength={100}
                        />
                        {errors.alias && (
                            <p className="mt-1 text-sm text-red-500">{errors.alias}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Este alias se mostrará a los clientes para realizar la transferencia
                        </p>
                    </div>

                    {/* WhatsApp */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp para Comprobantes <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="+5491112345678"
                            pattern="^\+?[0-9]{10,15}$"
                        />
                        {errors.whatsapp && (
                            <p className="mt-1 text-sm text-red-500">{errors.whatsapp}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Los clientes enviarán el comprobante a este número
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-t pt-6">
                        Redes Sociales y Contacto
                    </h2>

                    {/* Instagram */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram URL
                        </label>
                        <input
                            type="url"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent ${errors.instagram ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="https://instagram.com/tu_tienda"
                        />
                        {errors.instagram && (
                            <p className="mt-1 text-sm text-red-500">{errors.instagram}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Enlace a tu perfil de Instagram (aparecerá en el footer)
                        </p>
                    </div>

                    {/* Facebook */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook URL
                        </label>
                        <input
                            type="url"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent ${errors.facebook ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="https://facebook.com/tu_pagina"
                        />
                        {errors.facebook && (
                            <p className="mt-1 text-sm text-red-500">{errors.facebook}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Enlace a tu página de Facebook (aparecerá en el footer)
                        </p>
                    </div>

                    {/* Email */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email de Contacto
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="contacto@tutienda.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Email visible en el footer para consultas de clientes
                        </p>
                    </div>

                    {/* Last Updated Info */}
                    {settings?.updated_at && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">
                                <strong>Última actualización:</strong>{' '}
                                {new Date(settings.updated_at).toLocaleString('es-AR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                            {settings.updated_by && (
                                <p className="text-sm text-gray-600 mt-1">
                                    <strong>Por:</strong> {settings.updated_by}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-[#0D4F4F] to-[#1E7E7A] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Info Box */}
                <div className="max-w-2xl mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                        <li>Los clientes verán estos datos cuando seleccionen "Transferencia Bancaria"</li>
                        <li>Las órdenes con transferencia quedan en estado "Pendiente" hasta confirmación manual</li>
                        <li>Recordá verificar los comprobantes en WhatsApp y actualizar el estado de las órdenes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
