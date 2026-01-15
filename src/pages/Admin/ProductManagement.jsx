import { useState, useEffect } from 'react';
import { Trash2, Search, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getProducts, deleteProduct, toggleProductActive } from '../../services/api';
import Button from '../../components/UI/Button';
import ProductForm from '../../components/Admin/ProductForm';
import BulkPriceUpdate from '../../components/Admin/BulkPriceUpdate';
import AdminNav from '../../components/Admin/AdminNav';
import toast from 'react-hot-toast';
import { showConfirmToast } from '../../components/UI/ConfirmToast';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts({
                include_out_of_stock: true,
                include_inactive: true
            });
            // El backend ahora devuelve { items: [...], total: X, page: Y, ... }
            const productsData = response.data.items || response.data;
            console.log('Productos cargados:', productsData); // Debug
            console.log('Tipo de datos:', Array.isArray(productsData) ? 'Array' : typeof productsData); // Debug
            console.log('Cantidad:', productsData?.length || 'N/A'); // Debug
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
            console.error('Error response:', error.response?.data); // Debug
            setError('Error al cargar los productos');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (productId, productName) => {
        showConfirmToast({
            title: '¿Eliminar producto?',
            message: `Estás por eliminar "${productName}". Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                try {
                    await deleteProduct(productId);
                    setProducts(products.filter(p => p.id !== productId));
                    toast.success('Producto eliminado exitosamente');
                } catch (error) {
                    console.error('Error deleting product:', error);
                    const errorMessage = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        'Error al eliminar el producto. Puede que tenga pedidos asociados.';
                    toast.error(errorMessage);
                }
            }
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleToggleActive = async (productId) => {
        try {
            await toggleProductActive(productId);
            // Actualizar localmente el estado para no recargar todo si es posible
            // Aunque loadProducts es más seguro
            setProducts(products.map(p =>
                p.id === productId ? { ...p, active: !p.active } : p
            ));
            toast.success('Estado del producto actualizado');
        } catch (error) {
            console.error('Error toggling product status:', error);
            toast.error('Error al cambiar el estado del producto');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingProduct(null);
        loadProducts();
    };

    const filteredProducts = Array.isArray(products) ? products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' ? product.active !== false : product.active === false);
        return matchesSearch && matchesCategory && matchesStatus;
    }) : [];

    const categories = Array.isArray(products) ? [...new Set(products.map(p => p.category))] : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0D4F4F]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Gestión de Productos
                        </h1>
                        <p className="text-gray-600">
                            {Array.isArray(products) ? products.length : 0} productos en total
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(true)}>
                        Nuevo Producto
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Solo Activos</option>
                            <option value="inactive">Solo Ocultos</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Price Update */}
                <div className="mb-6">
                    <BulkPriceUpdate onUpdate={loadProducts} />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Products Table - Desktop */}
                <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {product.image_url ? (
                                                        <img
                                                            className="h-10 w-10 rounded object-cover"
                                                            src={product.image_url}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded bg-teal-50 flex items-center justify-center text-xl">
                                                            🍺
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.description?.substring(0, 50)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-[#0D4F4F]">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${product.price.toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock < 10
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {product.stock} unidades
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.active !== false ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Oculto
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleToggleActive(product.id)}
                                                className={`${product.active !== false ? 'text-gray-400 hover:text-orange-500' : 'text-emerald-500 hover:text-emerald-700'} mr-4 transition-colors`}
                                                title={product.active !== false ? "Deshabilitar" : "Habilitar"}
                                            >
                                                {product.active !== false ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-[#0D4F4F] hover:text-[#1E7E7A] mr-4"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id, product.name)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron productos</p>
                        </div>
                    )}
                </div>

                {/* Products Cards - Mobile & Tablet */}
                <div className="block lg:hidden space-y-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="flex-shrink-0">
                                    {product.image_url ? (
                                        <img
                                            className="h-16 w-16 rounded object-cover"
                                            src={product.image_url}
                                            alt={product.name}
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded bg-teal-50 flex items-center justify-center text-2xl">
                                            🍺
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {product.description}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div>
                                    <span className="text-gray-500 block text-xs">Categoría</span>
                                    <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-teal-100 text-[#0D4F4F]">
                                        {product.category}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Precio</span>
                                    <span className="font-semibold text-gray-900">
                                        ${product.price.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <span className="text-gray-500 block text-xs">Stock</span>
                                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${product.stock < 10
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {product.stock} unidades
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <span className="text-gray-500 block text-xs">Estado</span>
                                    {product.active !== false ? (
                                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Oculto
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => handleToggleActive(product.id)}
                                    className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${product.active !== false ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}
                                    title={product.active !== false ? "Deshabilitar" : "Habilitar"}
                                >
                                    {product.active !== false ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D4F4F] text-white rounded-lg hover:bg-[#1E7E7A] transition-colors"
                                >
                                    <Edit size={16} />
                                    <span className="text-sm font-medium">Editar</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id, product.name)}
                                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg">
                            <p className="text-gray-500">No se encontraron productos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Form Modal */}
            {
                showForm && (
                    <ProductForm
                        product={editingProduct}
                        onClose={handleFormClose}
                    />
                )
            }
        </div >
    );
}
