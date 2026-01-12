import { Building2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                {/* Payment Methods Section */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-center">Medios de Pago Aceptados</h3>
                    <div className="flex justify-center items-center gap-8 flex-wrap">
                        {/* Mercado Pago Logo */}
                        <div className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <svg width="120" height="30" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Mercado Pago Logo SVG */}
                                <path d="M20 5C20 7.76142 17.7614 10 15 10C12.2386 10 10 7.76142 10 5C10 2.23858 12.2386 0 15 0C17.7614 0 20 2.23858 20 5Z" fill="#009EE3" />
                                <path d="M30 15C30 17.7614 27.7614 20 25 20C22.2386 20 20 17.7614 20 15C20 12.2386 22.2386 10 25 10C27.7614 10 30 12.2386 30 15Z" fill="#FFD900" />
                                <text x="35" y="18" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#009EE3">Mercado</text>
                                <text x="78" y="18" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#FFD900">Pago</text>
                            </svg>
                        </div>

                        {/* Transferencia Bancaria */}
                        <div className="flex items-center gap-3 bg-purple-600 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <Building2 size={24} />
                            <span className="font-semibold text-lg">Transferencia Bancaria</span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        🔒 Pagos 100% seguros y protegidos
                    </p>
                </div>

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
