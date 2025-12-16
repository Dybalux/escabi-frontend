import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
    const types = {
        success: {
            bg: 'bg-green-100',
            border: 'border-green-400',
            text: 'text-green-800',
            icon: CheckCircle,
        },
        error: {
            bg: 'bg-red-100',
            border: 'border-red-400',
            text: 'text-red-800',
            icon: AlertCircle,
        },
        info: {
            bg: 'bg-blue-100',
            border: 'border-blue-400',
            text: 'text-blue-800',
            icon: Info,
        },
    };

    const config = types[type];
    const Icon = config.icon;

    return (
        <div className={`${config.bg} border-2 ${config.border} ${config.text} px-4 py-3 rounded-lg flex items-center justify-between mb-4`}>
            <div className="flex items-center gap-3">
                <Icon size={20} />
                <span>{message}</span>
            </div>
            {onClose && (
                <button onClick={onClose} className="hover:opacity-70">
                    <X size={20} />
                </button>
            )}
        </div>
    );
}