import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { createCombo, updateCombo, getProducts } from '../../services/api';
import Button from '../UI/Button';
import Input from '../UI/Input';
import toast from 'react-hot-toast';
import { openCloudinaryWidget } from '../../utils/cloudinary';

export default function ComboForm({ combo, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        active: true,
        items: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        loadProducts();
        if (combo) {
            setFormData({
                name: combo.name || '',
                description: combo.description || '',
                price: combo.price || '',
                image_url: combo.image_url || '',
                active: combo.active !== undefined ? combo.active : true,
                items: combo.items || []
            });
        }
    }, [combo]);

    const loadProducts = async () => {
        try {
            const response = await getProducts({ include_out_of_stock: true });
            const productsData = response.data.items || response.data;
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddProduct = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1 }]
        }));
    };

    const handleRemoveProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleProductChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validaciones
            if (parseFloat(formData.price) < 0) {
                setError('El precio no puede ser negativo');
                setLoading(false);
                return;
            }

            if (formData.items.length === 0) {
                setError('Debes agregar al menos un producto al combo');
                setLoading(false);
                return;
            }

            // Validar que todos los items tengan producto y cantidad
            for (let item of formData.items) {
                if (!item.product_id) {
                    setError('Todos los productos deben estar seleccionados');
                    setLoading(false);
                    return;
                }
                if (!item.quantity || item.quantity < 1) {
                    setError('La cantidad debe ser al menos 1');
                    setLoading(false);
                    return;
                }
            }

            // Preparar datos
            const comboData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                image_url: formData.image_url || undefined,
                active: formData.active,
                items: formData.items.map(item => ({
                    product_id: item.product_id,
                    quantity: parseInt(item.quantity)
                }))
            };

            if (combo) {
                // Actualizar combo existente
                const comboId = combo.id || combo._id;
                if (!comboId) {
                    setError('Error: ID de combo no válido');
                    setLoading(false);
                    return;
                }
                await updateCombo(comboId, comboData);
                toast.success('Combo actualizado exitosamente');
            } else {
                // Crear nuevo combo
                await createCombo(comboData);
                toast.success('Combo creado exitosamente');
            }

            onClose();
        } catch (error) {
            console.error('Error saving combo:', error);
            setError(error.response?.data?.detail || 'Error al guardar el combo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {combo ? 'Editar Combo' : 'Nuevo Combo'}
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

                    <div className="space-y-4">
                        {/* Nombre */}
                        <Input
                            label="Nombre del Combo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Pack Previa"
                        />

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                                placeholder="Descripción del combo..."
                            />
                        </div>

                        {/* Precio */}
                        <Input
                            label="Precio del Combo"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                        />

                        {/* URL de Imagen */}
                        <div className="space-y-2">
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

                        {/* Preview de imagen */}
                        {formData.image_url && (
                            <div>
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

                        {/* Activo */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="w-4 h-4 text-[#0D4F4F] focus:ring-[#0D4F4F] rounded"
                            />
                            <span className="text-sm text-gray-700">Combo activo (visible para clientes)</span>
                        </label>

                        {/* Productos del Combo */}
                        <div className="border-t border-gray-200 pt-4 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Productos del Combo</h3>
                                <Button
                                    type="button"
                                    onClick={handleAddProduct}
                                    size="sm"
                                    disabled={loadingProducts}
                                >
                                    <Plus size={16} className="mr-1" />
                                    Agregar Producto
                                </Button>
                            </div>

                            {loadingProducts ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D4F4F] mx-auto"></div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Producto
                                                </label>
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent text-sm"
                                                    required
                                                >
                                                    <option value="">Seleccionar producto</option>
                                                    {products.map((product) => (
                                                        <option key={`product-${product.id}`} value={product.id}>
                                                            {product.name} (Stock: {product.stock})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent text-sm"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(index)}
                                                className="mt-6 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.items.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
                            disabled={loading || loadingProducts}
                        >
                            {loading ? 'Guardando...' : (combo ? 'Actualizar' : 'Crear')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
