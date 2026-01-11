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
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeInactive}
                                onChange={(e) => setIncludeInactive(e.target.checked)}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
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

                {/* Combos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCombos.map((combo) => (
                        <div key={combo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Image */}
                            <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
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
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        Inactivo
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    COMBO
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{combo.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{combo.description}</p>

                                <div className="flex items-center gap-2 mb-3">
                                    <Package size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {combo.items?.length || 0} productos
                                    </span>
                                </div>

                                <div className="text-2xl font-bold text-purple-600 mb-4">
                                    ${combo.price?.toLocaleString('es-AR')}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(combo)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        <Edit size={16} />
                                        <span className="text-sm font-medium">Editar</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(combo.id, combo.name)}
                                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
