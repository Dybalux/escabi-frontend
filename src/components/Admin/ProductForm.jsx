import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createProduct, updateProduct } from '../../services/api';
import Button from '../UI/Button';
import Input from '../UI/Input';

export default function ProductForm({ product, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image_url: '',
        alcohol_content: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                category: product.category || '',
                stock: product.stock || '',
                image_url: product.image_url || '',
                alcohol_content: product.alcohol_content || '',
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

            if (formData.alcohol_content && parseFloat(formData.alcohol_content) < 0) {
                setError('El contenido alcohólico no puede ser negativo');
                setLoading(false);
                return;
            }

            if (formData.alcohol_content && parseFloat(formData.alcohol_content) > 100) {
                setError('El contenido alcohólico no puede ser mayor a 100%');
                setLoading(false);
                return;
            }

            // Convertir a números
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                alcohol_content: formData.alcohol_content ? parseFloat(formData.alcohol_content) : undefined,
            };

            if (product) {
                // Actualizar producto existente
                await updateProduct(product._id, productData);
                alert('Producto actualizado exitosamente');
            } else {
                // Crear nuevo producto
                await createProduct(productData);
                alert('Producto creado exitosamente');
            }

            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            setError(error.response?.data?.detail || 'Error al guardar el producto');
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Descripción del producto..."
                            />
                        </div>

                        <div>
                            <Input
                                label="Precio"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                            />
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                        <div>
                            <Input
                                label="Contenido Alcohólico (%)"
                                name="alcohol_content"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={formData.alcohol_content}
                                onChange={handleChange}
                                placeholder="5.0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                label="URL de Imagen"
                                name="image_url"
                                type="url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
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
