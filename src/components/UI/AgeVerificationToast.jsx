import React from 'react';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

export const showAgeVerificationToast = () => {
    toast.custom((t) => (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-300`}
        >
            <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col p-8 border-t-8 border-[#0D4F4F] transform transition-all duration-300 scale-100">
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                    <div className="bg-teal-50 p-4 rounded-full">
                        <ShieldAlert className="text-[#0D4F4F]" size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Contenido Restringido</h3>
                        <p className="text-gray-600 text-sm">
                            Debes ser mayor de 18 años para ingresar a Alto Trago.
                        </p>
                    </div>
                </div>

                <p className="text-xl font-semibold text-center text-gray-800 mb-8 px-4">
                    ¿Confirmas que eres mayor de 18 años?
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => {
                            localStorage.setItem('ageVerified', 'true');
                            toast.dismiss(t.id);
                            toast.success('¡Bienvenido! Que disfrutes tu visita.', {
                                icon: '🥂',
                                duration: 4000
                            });
                        }}
                        className="flex-1 bg-[#0D4F4F] text-white py-4 px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg hover:shadow-teal-900/20 transform hover:-translate-y-1"
                    >
                        Sí, soy mayor
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            window.location.href = 'https://www.google.com';
                        }}
                        className="flex-1 bg-gray-100 text-gray-500 py-4 px-6 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        No, salir
                    </button>
                </div>
            </div>
        </div>
    ), {
        duration: Infinity,
        position: 'top-center', // Aunque usamos fixed inset-0, esto ayuda al Toaster a manejarlo
    });
};
