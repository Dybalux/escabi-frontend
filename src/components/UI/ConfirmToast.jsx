import React from 'react';
import toast from 'react-hot-toast';
import { Trash2, AlertCircle } from 'lucide-react';

export const showConfirmToast = ({
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Sí, vaciar',
    cancelText = 'Cancelar',
    onConfirm,
    icon: Icon = Trash2,
    type = 'danger'
}) => {
    toast.custom((t) => (
        <div
            className={`${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-gray-100 overflow-hidden transition-all duration-300 ease-out z-[9999]`}
        >
            <div className="p-6 flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-4 ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-[#0D4F4F]'}`}>
                    <Icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>

                <div className="flex w-full gap-3">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            if (onConfirm) onConfirm();
                        }}
                        className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-[#0D4F4F] hover:bg-[#1E7E7A] shadow-teal-100'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    ), {
        duration: Infinity,
        position: 'top-center',
    });
};
