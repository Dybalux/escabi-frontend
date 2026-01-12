import { CreditCard, Building2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4">
                {/* Payment Methods Section */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-center">Medios de Pago Aceptados</h3>
                    <div className="flex justify-center items-center gap-6 flex-wrap">
                        {/* Mercado Pago */}
                        <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
                            <CreditCard size={20} />
                            <span className="font-semibold">Mercado Pago</span>
                        </div>

                        {/* Transferencia Bancaria */}
                        <div className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg">
                            <Building2 size={20} />
                            <span className="font-semibold">Transferencia Bancaria</span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-3">
                        Pagos 100% seguros y protegidos
                    </p>
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Alto Trago. Todos los derechos reservados.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        Venta de bebidas alcohólicas prohibida a menores de 18 años
                    </p>
                </div>
            </div>
        </footer>
    );
}
