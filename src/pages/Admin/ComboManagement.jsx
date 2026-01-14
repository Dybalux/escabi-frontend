import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, Package } from 'lucide-react';
import { getAdminCombos, deleteCombo } from '../../services/api';
import Button from '../../components/UI/Button';
import ComboForm from '../../components/Admin/ComboForm';
import AdminNav from '../../components/Admin/AdminNav';
import toast from 'react-hot-toast';

export default function ComboManagement() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [includeInactive, setIncludeInactive] = useState(false);

    useEffect(() => {
        loadCombos();
    }, [includeInactive]);

    const loadCombos = async () => {
        try {
            setLoading(true);
            const response = await getAdminCombos(includeInactive);
            setCombos(response.data);
        } catch (error) {
            console.error('Error loading combos:', error);
            setError('Error al cargar los combos');
            setCombos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (comboId, comboName) => {
        const action = window.confirm(`¿Desactivar "${comboName}"? (No se eliminará permanentemente)`);
        if (!action) return;

        try {
            await deleteCombo(comboId, false); // soft delete
            toast.success('Combo desactivado exitosamente');
            loadCombos();
        } catch (error) {
            console.error('Error deleting combo:', error);
            const errorMessage = error.response?.data?.detail || 'Error al desactivar el combo';
            toast.error(errorMessage);
        }
    };

    const handleEdit = (combo) => {
        setEditingCombo(combo);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingCombo(null);
        loadCombos();
    };

    const filteredCombos = Array.isArray(combos) ? combos.filter(combo => {
        const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            combo.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }) : [];

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
                            Gestión de Combos
                        </h1>
                        <p className="text-gray-600">
                            {Array.isArray(combos) ? combos.length : 0} combos en total
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={20} className="mr-2" />
                        Nuevo Combo
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar combos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeInactive}
                                onChange={(e) => setIncludeInactive(e.target.checked)}
                                className="w-4 h-4 text-[#0D4F4F] focus:ring-[#0D4F4F] rounded"
                            />
                            <span className="text-sm text-gray-700">Mostrar combos inactivos</span>
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Combos Table - Desktop */}
                <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Combo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Productos Incluidos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Precio y Ahorro
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
                                {filteredCombos.map((combo) => {
                                    const comboId = combo.id || combo._id;
                                    return (
                                        <tr key={comboId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        {combo.image_url ? (
                                                            <img
                                                                className="h-16 w-16 rounded object-cover"
                                                                src={combo.image_url}
                                                                alt={combo.name}
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded bg-teal-50 flex items-center justify-center text-2xl">
                                                                📦
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{combo.name}</div>
                                                        <div className="text-sm text-gray-500 max-w-xs truncate">{combo.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {combo.items && combo.items.length > 0 ? (
                                                    <ul className="space-y-1">
                                                        {combo.items.map((item, idx) => (
                                                            <li key={idx} className="text-xs text-gray-600 flex items-center gap-1.5">
                                                                <span className="bg-teal-50 text-[#0D4F4F] font-bold px-1.5 py-0.5 rounded text-[10px]">
                                                                    {item.quantity}x
                                                                </span>
                                                                <span className="font-medium text-gray-800">
                                                                    {item.name || item.product_name || item.product?.name || 'Producto sin nombre'}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Sin productos</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-[#0D4F4F]">
                                                        ${combo.price?.toLocaleString('es-AR')}
                                                    </span>
                                                    {combo.savings > 0 && (
                                                        <div className="flex flex-col mt-1">
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ${combo.total_items_cost?.toLocaleString('es-AR')}
                                                            </span>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 self-start mt-0.5">
                                                                Ahorrás ${combo.savings?.toLocaleString('es-AR')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {!combo.active ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Inactivo
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Activo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(combo)}
                                                    className="text-[#0D4F4F] hover:text-[#1E7E7A] mr-4 transition-colors p-1 rounded hover:bg-teal-50"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comboId, combo.name)}
                                                    className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                                                    title="Eliminar/Desactivar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Combos Grid - Mobile & Tablet Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
                    {filteredCombos.map((combo) => {
                        const comboId = combo.id || combo._id;
                        return (
                            <div key={comboId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                                {/* Image & Header */}
                                <div className="relative h-48 bg-gradient-to-br from-teal-50 to-teal-100">
                                    {combo.image_url ? (
                                        <img
                                            src={combo.image_url}
                                            alt={combo.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">
                                            📦
                                        </div>
                                    )}
                                    {!combo.active && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                                            Inactivo
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-[#C29F4C] text-white text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                                        COMBO
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{combo.name}</h3>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-[#0D4F4F]">
                                                ${combo.price?.toLocaleString('es-AR')}
                                            </div>
                                            {combo.items && combo.items.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {combo.items.length} productos
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{combo.description}</p>

                                    {/* Products in Combo */}
                                    {combo.items && combo.items.length > 0 && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package size={14} className="text-[#0D4F4F]" />
                                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Incluye:</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {combo.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-xs border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                                                        {item.image_url && (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-8 h-8 rounded object-cover shadow-sm bg-white"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="bg-[#0D4F4F] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">{item.quantity}x</span>
                                                                <span className="text-gray-800 font-medium truncate">
                                                                    {item.name || item.product_name || item.product?.name || 'Producto'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Pricing Information */}
                                    {(combo.total_items_cost || (combo.savings && combo.savings > 0)) && (
                                        <div className="flex justify-between items-center mb-4 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                            {combo.total_items_cost && (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Precio Real</span>
                                                    <span className="text-sm text-gray-500 line-through font-medium">
                                                        ${combo.total_items_cost.toLocaleString('es-AR')}
                                                    </span>
                                                </div>
                                            )}

                                            {combo.savings && combo.savings > 0 && (
                                                <div className="text-right">
                                                    <span className="text-[10px] text-emerald-600 uppercase font-bold block">¡Ahorrás!</span>
                                                    <span className="text-sm font-bold text-emerald-700">
                                                        ${combo.savings.toLocaleString('es-AR')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEdit(combo)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D4F4F] text-white rounded-lg hover:bg-[#1E7E7A] transition-colors shadow-sm active:scale-95"
                                        >
                                            <Edit size={16} />
                                            <span className="text-sm font-bold">Editar</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comboId, combo.name)}
                                            className="flex items-center justify-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm active:scale-95"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredCombos.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No se encontraron combos</p>
                    </div>
                )}
            </div>

            {/* Combo Form Modal */}
            {showForm && (
                <ComboForm
                    combo={editingCombo}
                    onClose={handleFormClose}
                />
            )}
        </div>
    );
}
