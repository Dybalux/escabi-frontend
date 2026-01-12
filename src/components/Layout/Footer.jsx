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
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/9/98/Mercado_Pago.svg"
                                alt="Mercado Pago"
                                className="h-8"
                            />
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
