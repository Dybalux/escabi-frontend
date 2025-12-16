import { Link } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../UI/Button';

export default function AgeVerificationBanner() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 border-b-4 border-orange-600 shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="bg-white rounded-full p-3 shadow-md animate-pulse">
                            <ShieldAlert className="text-orange-600" size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-lg md:text-xl mb-1 drop-shadow-md">
                                ⚠️ Verificación de Edad Requerida
                            </h3>
                            <p className="text-white text-sm md:text-base drop-shadow">
                                Debes verificar que eres mayor de 18 años para poder comprar bebidas alcohólicas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/verify-age">
                            <Button
                                size="lg"
                                className="bg-white text-orange-600 hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                            >
                                Verificar Ahora
                            </Button>
                        </Link>
                        <button
                            onClick={() => setDismissed(true)}
                            className="text-white hover:text-gray-200 transition-colors p-2"
                            aria-label="Cerrar banner"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
