import { useState } from 'react';
import { CheckCircle, Copy, MessageCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BankTransferConfirmation({ order, paymentSettings }) {
    const [aliasCopied, setAliasCopied] = useState(false);

    // Validar que tenemos los datos necesarios
    if (!order || !paymentSettings) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
                <div className="text-center">
                    <p className="text-gray-600">Cargando información de pago...</p>
                </div>
            </div>
        );
    }

    const orderId = order.id || order._id || 'N/A';
    const orderIdShort = orderId !== 'N/A' ? orderId.substring(0, 8) : orderId;

    const handleCopyAlias = async () => {
        try {
            await navigator.clipboard.writeText(paymentSettings.transfer_alias);
            setAliasCopied(true);
            toast.success('Alias copiado al portapapeles');
            setTimeout(() => setAliasCopied(false), 3000);
        } catch (error) {
            toast.error('Error al copiar el alias');
        }
    };

    const handleOpenWhatsApp = () => {
        const phone = paymentSettings.transfer_whatsapp.replace(/\D/g, '');
        const message = encodeURIComponent(
            `Hola! Adjunto comprobante de transferencia para la orden #${orderId}. Total: $${order.total_amount?.toFixed(2) || '0.00'}`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        ✅ Orden Creada
                    </h1>
                    <p className="text-gray-600">
                        Orden <strong className="text-purple-600">#{orderIdShort}</strong>
                    </p>
                </div>

                {/* Order Status */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estado:</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                            Pendiente de Pago
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-2xl font-bold text-purple-600">
                            ${order.total_amount?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>

                <div className="border-t-2 border-gray-200 my-6"></div>

                {/* Transfer Details */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        📋 Datos para Transferencia
                    </h2>

                    {/* Alias/CVU */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alias/CVU:
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg font-semibold text-gray-900">
                                {paymentSettings.transfer_alias}
                            </div>
                            <button
                                onClick={handleCopyAlias}
                                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${aliasCopied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                    }`}
                            >
                                <Copy size={20} />
                                {aliasCopied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            💬 Enviá el comprobante por WhatsApp:
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg font-semibold text-gray-900">
                                {paymentSettings.transfer_whatsapp}
                            </div>
                            <button
                                onClick={handleOpenWhatsApp}
                                className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                            >
                                <MessageCircle size={20} />
                                Abrir
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-gray-200 my-6"></div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                        ℹ️ Instrucciones:
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Transferí el monto exacto: <strong>${order.total_amount?.toFixed(2) || '0.00'}</strong></li>
                        <li>Enviá el comprobante por WhatsApp al número indicado</li>
                        <li>Incluí el número de orden: <strong>#{orderIdShort}</strong></li>
                        <li>Confirmaremos tu pago lo mas pronto posible !!!</li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/orders"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-center flex items-center justify-center gap-2"
                    >
                        <Package size={20} />
                        Ver Mis Órdenes
                    </Link>
                    <Link
                        to="/products"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
                    >
                        Seguir Comprando
                    </Link>
                </div>
            </div>
        </div>
    );
}
