import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { createProduct, updateProduct } from '../../services/api';

import Button from '../UI/Button';
import Input from '../UI/Input';
import toast from 'react-hot-toast';
import { openCloudinaryWidget } from '../../utils/cloudinary';

export default function ProductForm({ product, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        net_price: '',
        profit_percentage: '',
        category: '',
        stock: '',
        image_url: '',
        abv: '',
        volume_ml: '',
        origin: '',
        active: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pricingSettings, setPricingSettings] = useState(null);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await api.get('/admin/pricing-settings');
                if (response.data) setPricingSettings(response.data);
            } catch (err) {
                console.warn('No se pudo cargar la configuración de precios dinámicos');
            }
        };
        fetchPricing();
    }, []);

    useEffect(() => {
        if (product) {
            console.log('📦 Producto recibido para editar:', product); // Diagnóstico

            // Si el precio dinámico está activo, el precio que recibimos podría estar inflado
            let originalPrice = product.price;

            // Intentamos detectar si el precio está multiplicado (esto es aproximado, 
            // lo ideal es que el backend devuelva el precio base)
            const isDynamicActive = pricingSettings?.enabled;

            const net = (product.net_price !== undefined && product.net_price !== null) ? parseFloat(product.net_price) : 0;
            const price = parseFloat(originalPrice) || 0;

            // Calculamos el porcentaje de ganancia inicial
            let profit = 0;
            if (net > 0 && price > 0) {
                profit = ((price - net) / net) * 100;
            }

            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: price || '',
                net_price: net || '',
                profit_percentage: profit ? profit.toFixed(1) : '',
                category: product.category || '',
                stock: product.stock || '',
                image_url: product.image_url || '',
                abv: product.abv || '',
                volume_ml: product.volume_ml || '',
                origin: product.origin || '',
                active: product.active !== undefined ? product.active : true,
            });
        }
    }, [product, pricingSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Lógica de cálculo automático de precios
            if ((name === 'net_price' || name === 'profit_percentage') && value !== '') {
                const net = name === 'net_price' ? parseFloat(value) : parseFloat(prev.net_price);
                const profit = name === 'profit_percentage' ? parseFloat(value) : parseFloat(prev.profit_percentage);

                if (!isNaN(net) && !isNaN(profit) && net > 0) {
                    const calculatedPrice = net * (1 + profit / 100);
                    updated.price = calculatedPrice.toFixed(2);
                }
            }
            // Si cambia el precio final manualmente, recalculamos el porcentaje (opcional, para mantener consistencia)
            else if (name === 'price' && value !== '') {
                const price = parseFloat(value);
                const net = parseFloat(prev.net_price);
                if (!isNaN(price) && !isNaN(net) && net > 0) {
                    const calculatedProfit = ((price - net) / net) * 100;
                    updated.profit_percentage = calculatedProfit.toFixed(1);
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validar que no haya valores negativos
            if (parseFloat(formData.price) < 0) {
                setError('El precio no puede ser negativo');
                setLoading(false);
                return;
            }

            if (parseInt(formData.stock) < 0) {
                setError('El stock no puede ser negativo');
                setLoading(false);
                return;
            }

            if (formData.abv && (parseFloat(formData.abv) < 0 || parseFloat(formData.abv) > 100)) {
                setError('El contenido alcohólico debe estar entre 0% y 100%');
                setLoading(false);
                return;
            }

            if (formData.volume_ml && parseInt(formData.volume_ml) < 0) {
                setError('El volumen no puede ser negativo');
                setLoading(false);
                return;
            }

            // Convertir a números
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                net_price: (formData.net_price !== '' && formData.net_price !== null) ? parseFloat(formData.net_price) : 0,
                stock: parseInt(formData.stock),
                abv: formData.abv ? parseFloat(formData.abv) : undefined,
                volume_ml: formData.volume_ml ? parseInt(formData.volume_ml) : undefined,
                origin: formData.origin || undefined,
            };

            // Eliminamos profit_percentage para no ensuciar el payload si el backend no lo espera
            delete productData.profit_percentage;

            console.log('📤 Enviando datos del producto:', productData); // Diagnóstico

            if (product) {
                // Actualizar producto existente
                await updateProduct(product.id, productData);
                toast.success('Producto actualizado exitosamente');
            } else {
                // Crear nuevo producto
                await createProduct(productData);
                toast.success('Producto creado exitosamente');
            }

            onClose();
        } catch (error) {
            console.error('Error saving product:', error);

            // Manejar diferentes tipos de errores del backend
            let errorMessage = 'Error al guardar el producto';

            if (error.response?.data) {
                const errorData = error.response.data;

                // Si es un error de validación de Pydantic (array de errores)
                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail
                        .map(err => {
                            const field = err.loc?.[err.loc.length - 1] || 'campo';
                            return `${field}: ${err.msg}`;
                        })
                        .join(', ');
                }
                // Si es un string simple
                else if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                }
                // Si es un objeto con mensaje
                else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                label="Nombre del Producto"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Cerveza Quilmes 1L"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                placeholder="Descripción del producto..."
                            />
                        </div>

                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Gestión de Precios</h3>

                            {/* Alerta de Precios Dinámicos */}
                            {pricingSettings?.enabled && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <div className="text-amber-600 mt-0.5">⚠️</div>
                                    <div className="text-xs text-amber-800">
                                        <p className="font-bold">Precios Dinámicos Activos ({pricingSettings.multiplier}x)</p>
                                        <p>El precio que ves abajo podría incluir el aumento. Si es así, divídelo por el multiplicador para guardar el precio base correcto.</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const adjusted = (parseFloat(formData.price) / pricingSettings.multiplier).toFixed(2);
                                                setFormData(prev => ({ ...prev, price: adjusted }));
                                                toast.success('Precio ajustado a base (dividio por ' + pricingSettings.multiplier + ')');
                                            }}
                                            className="mt-2 text-amber-700 font-bold underline hover:text-amber-900"
                                        >
                                            Corregir: Quitar aumento ({pricingSettings.multiplier}x)
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Costo (Precio Neto)</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="net_price"
                                            step="0.01"
                                            min="0"
                                            value={formData.net_price}
                                            onChange={handleChange}
                                            className="flex-1 block w-full border-gray-300 rounded-none rounded-r-md focus:ring-[#0D4F4F] focus:border-[#0D4F4F] sm:text-sm h-10 px-3"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Precio que te cobra el proveedor</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">% de Ganancia</label>
                                    <input
                                        type="number"
                                        name="profit_percentage"
                                        step="0.1"
                                        value={formData.profit_percentage}
                                        onChange={handleChange}
                                        placeholder="Ej: 30"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#0D4F4F] focus:border-[#0D4F4F] text-[#0D4F4F] font-bold h-10 px-3"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Margen deseado</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Precio de Venta (Final)</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-green-50 text-green-600">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 block w-full border-gray-300 rounded-none rounded-r-md bg-green-50 font-bold text-green-700 h-10 px-3"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 md:text-right">Precio visible para el cliente</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Input
                                label="Stock"
                                name="stock"
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoría
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                            >
                                <option value="">Seleccionar categoría</option>
                                <option value="Cerveza">Cerveza</option>
                                <option value="Vino Tinto">Vino Tinto</option>
                                <option value="Vino Blanco">Vino Blanco</option>
                                <option value="Vino Rosado">Vino Rosado</option>
                                <option value="Whisky">Whisky</option>
                                <option value="Vodka">Vodka</option>
                                <option value="Gin">Gin</option>
                                <option value="Ron">Ron</option>
                                <option value="Tequila">Tequila</option>
                                <option value="Fernet">Fernet</option>
                                <option value="Gaseosa">Gaseosa</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                            />
                            <label htmlFor="active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                ✅ Producto Habilitado
                            </label>
                            <p className="text-[10px] text-gray-500 flex-1 text-right">
                                {formData.active ? 'Visible para clientes' : 'Oculto para clientes'}
                            </p>
                        </div>

                        <div>
                            <Input
                                label="Contenido Alcohólico (%)"
                                name="abv"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={formData.abv}
                                onChange={handleChange}
                                placeholder="5.0"
                            />
                        </div>

                        <div>
                            <Input
                                label="Volumen (ml)"
                                name="volume_ml"
                                type="number"
                                min="0"
                                value={formData.volume_ml}
                                onChange={handleChange}
                                placeholder="1000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Origen
                            </label>
                            <select
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                            >
                                <option value="">Seleccionar origen</option>
                                <option value="Nacional">Nacional</option>
                                <option value="Importado">Importado</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Input
                                label="URL de Imagen"
                                name="image_url"
                                type="url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => openCloudinaryWidget((url) => setFormData(prev => ({ ...prev, image_url: url })))}
                                className="w-full flex items-center justify-center gap-2 border-[#0D4F4F] text-[#0D4F4F] hover:bg-teal-50"
                            >
                                <Plus size={18} />
                                Subir Imagen a Cloudinary
                            </Button>
                        </div>

                        {formData.image_url && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vista Previa
                                </label>
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
