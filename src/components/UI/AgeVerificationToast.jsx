import React from 'react';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

export const showAgeVerificationToast = (onVerify) => {
    // Prevent body scroll and overflow more aggressively
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.maxWidth = '100vw';

    toast.custom((t) => (
        <div className="fixed inset-0 z-[10000] min-h-screen flex items-center justify-start sm:justify-center p-0 sm:p-4 pointer-events-none overflow-x-hidden">
            <div className="w-screen sm:w-auto sm:max-w-md pointer-events-auto -ml-4 sm:ml-0">
                <div className="w-full bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8 border-t-8 border-[#0D4F4F]">
                    <div className="flex flex-col items-center text-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-teal-50 p-3 sm:p-4 rounded-full">
                            <ShieldAlert className="text-[#0D4F4F]" size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Contenido Restringido</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                Debes ser mayor de 18 años para ingresar a Alto Trago.
                            </p>
                        </div>
                    </div>

                    <p className="text-lg sm:text-xl font-semibold text-center text-gray-800 mb-6 sm:mb-8 px-2 sm:px-4">
                        ¿Confirmas que eres mayor de 18 años?
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                            onClick={() => {
                                localStorage.setItem('ageVerified', 'true');
                                toast.dismiss(t.id);
                                if (onVerify) onVerify();
                                // Restore all styles
                                document.documentElement.style.overflow = '';
                                document.documentElement.style.overflowX = '';
                                document.body.style.overflow = '';
                                document.body.style.overflowX = '';
                                document.body.style.position = '';
                                document.body.style.width = '';
                                document.body.style.maxWidth = '';
                                toast.success('¡Bienvenido! Que disfrutes tu visita.', {
                                    icon: '🥂',
                                    duration: 2000
                                });
                            }}
                            className="flex-1 bg-[#0D4F4F] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg hover:shadow-teal-900/20 transform hover:-translate-y-1 text-sm sm:text-base"
                        >
                            Sí, soy mayor
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                // Restore all styles
                                document.documentElement.style.overflow = '';
                                document.documentElement.style.overflowX = '';
                                document.body.style.overflow = '';
                                document.body.style.overflowX = '';
                                document.body.style.position = '';
                                document.body.style.width = '';
                                document.body.style.maxWidth = '';
                                window.location.href = 'https://www.google.com';
                            }}
                            className="flex-1 bg-gray-100 text-gray-500 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                        >
                            No, salir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ), {
        duration: Infinity,
        id: 'age-verification',
    });
};
