import { useState, useEffect } from 'react';
import { Building2, Instagram, MessageCircle, Mail } from 'lucide-react';
import { getPaymentSettings } from '../../services/api';

export default function Footer() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        getPaymentSettings()
            .then(res => setSettings(res.data))
            .catch(err => console.error('Error loading footer settings:', err));
    }, []);

    return (
        <footer className="bg-gray-900 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                {/* Payment Methods Section */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-center">Medios de Pago Aceptados</h3>
                    <div className="flex justify-center items-center gap-8 flex-wrap">
                        {/* Mercado Pago Logo */}
                        <div className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/9/98/Mercado_Pago.svg"
                                alt="Mercado Pago"
                                className="h-8"
                            />
                        </div>

                        {/* Transferencia Bancaria */}
                        <div className="flex items-center gap-3 bg-[#0D4F4F] px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <Building2 size={24} />
                            <span className="font-semibold text-lg">Transferencia Bancaria</span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        🔒 Pagos 100% seguros y protegidos
                    </p>
                </div>

                {/* Social Media & Contact */}
                {(settings?.instagram_url || settings?.facebook_url || settings?.transfer_whatsapp || settings?.email) && (
                    <div className="mb-6 pb-6 border-b border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-center">Contactanos</h3>
                        <div className="flex justify-center items-center gap-6 flex-wrap">
                            {settings.instagram_url && (
                                <a
                                    href={settings.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
                                        alt="Instagram"
                                        className="w-6 h-6"
                                    />
                                    <span>Instagram</span>
                                </a>
                            )}

                            {settings.facebook_url && (
                                <a
                                    href={settings.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                                        alt="Facebook"
                                        className="w-6 h-6"
                                    />
                                    <span>Facebook</span>
                                </a>
                            )}

                            {settings.transfer_whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.transfer_whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                        alt="WhatsApp"
                                        className="w-6 h-6"
                                    />
                                    <span>WhatsApp</span>
                                </a>
                            )}

                            {settings.email && (
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                                >
                                    <Mail size={24} />
                                    <span>Email</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Alto Trago. Todos los derechos reservados.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        ⚠️ Venta de bebidas alcohólicas prohibida a menores de 18 años
                    </p>
                </div>
            </div>
        </footer>
    );
}
