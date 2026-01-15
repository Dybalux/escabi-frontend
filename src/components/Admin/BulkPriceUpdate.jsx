import { useState } from 'react';
import { Percent, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { showConfirmToast } from '../UI/ConfirmToast';

export default function BulkPriceUpdate() {
    const [updateData, setUpdateData] = useState({
        percentage: 10, // Aumento del 10% por defecto
        based_on: 'price', // 'price' o 'net_price'
        target: 'all' // 'all' o el nombre de una categoría
    });
    const [loading, setLoading] = useState(false);

    const categories = [
        'Cerveza',
        'Vino Tinto',
        'Vino Blanco',
        'Vino Rosado',
        'Whisky',
        'Vodka',
        'Gin',
        'Ron',
        'Tequila',
        'Fernet',
        'Gaseosa',
        'Otro'
    ];

    const handleBulkUpdate = () => {
        showConfirmToast({
            title: '¿Confirmar actualización masiva?',
            message: `Vas a aplicar un ${updateData.percentage}% de ajuste a ${updateData.target === 'all' ? 'TODOS los productos' : `productos de la categoría "${updateData.target}"`}. Esta acción es permanente.`,
            confirmText: 'Sí, aplicar cambios',
            type: updateData.percentage < 0 ? 'danger' : 'success',
            icon: TrendingUp,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const response = await api.post('/admin/bulk-price-update', {
                        percentage: parseFloat(updateData.percentage) / 100, // Convertir a decimal
                        based_on: updateData.based_on,
                        target: updateData.target
                    });

                    toast.success(response.data.message || 'Precios actualizados exitosamente', {
                        icon: '📈',
                        duration: 3000
                    });
                    if (window.location.reload) {
                        // Opcional: recargar para ver cambios
                    }
                } catch (error) {
                    console.error('Error al actualizar precios:', error);
                    const errorMsg = error.response?.data?.detail || 'Error al actualizar precios';
                    toast.error(errorMsg);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-3 rounded-lg">
                    <TrendingUp className="text-amber-600" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Actualización Masiva de Precios</h2>
                    <p className="text-sm text-gray-600">Aplica aumentos o descuentos a múltiples productos</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">⚠️ Importante:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Esta acción afectará los precios de forma permanente</li>
                            <li>Se recomienda hacer una copia de seguridad antes de aplicar cambios masivos</li>
                            <li>Los porcentajes negativos aplicarán descuentos</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Basado en
                    </label>
                    <select
                        value={updateData.based_on}
                        onChange={(e) => setUpdateData({ ...updateData, based_on: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                    >
                        <option value="price">Precio de Venta Actual</option>
                        <option value="net_price">Precio de Costo (Neto)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        {updateData.based_on === 'price'
                            ? 'El aumento se calculará sobre el precio de venta actual'
                            : 'El nuevo precio se calculará desde el costo del producto'}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de Ajuste (%)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.1"
                            value={updateData.percentage}
                            onChange={(e) => setUpdateData({ ...updateData, percentage: parseFloat(e.target.value) })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                            placeholder="10"
                        />
                        <Percent className="text-gray-400" size={20} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Ejemplo: 10 = aumento del 10%, -5 = descuento del 5%
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aplicar a
                    </label>
                    <select
                        value={updateData.target}
                        onChange={(e) => setUpdateData({ ...updateData, target: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                    >
                        <option value="all">Todos los Productos</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Vista Previa del Cambio</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Ejemplo: Producto de $1000</span>
                            <span className="font-semibold text-[#10B981]">
                                → ${(1000 * (1 + updateData.percentage / 100)).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cambio:</span>
                            <span className={`font-semibold ${updateData.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {updateData.percentage >= 0 ? '+' : ''}{updateData.percentage}%
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleBulkUpdate}
                    disabled={loading}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Aplicando Cambios...
                        </>
                    ) : (
                        <>
                            <TrendingUp size={20} />
                            Aplicar Actualización Masiva
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
