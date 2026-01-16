import React from 'react';
import { RefreshCw } from 'lucide-react';

const MaintenanceScreen = ({ message }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg text-center border border-gray-100">
                <div className="text-6xl mb-6 animate-bounce">🚧</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Estamos en Mantenimiento</h1>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    {message || "Estamos realizando mejoras en nuestra plataforma para brindarte un mejor servicio. Por favor, vuelve a intentar en unos minutos."}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <RefreshCw size={20} />
                    Recargar Página
                </button>
            </div>
            <p className="mt-8 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Alto Trago. Todos los derechos reservados.
            </p>
        </div>
    );
};

export default MaintenanceScreen;
