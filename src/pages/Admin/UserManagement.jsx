import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import { getAdminUsers } from '../../services/api';
import AdminNav from '../../components/Admin/AdminNav';
import toast from 'react-hot-toast';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [ageVerifiedFilter, setAgeVerifiedFilter] = useState('');

    useEffect(() => {
        loadUsers();
    }, [roleFilter, ageVerifiedFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (roleFilter) params.role = roleFilter;
            if (ageVerifiedFilter !== '') params.age_verified = ageVerifiedFilter === 'true';

            const response = await getAdminUsers(params);
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-600">
                        {users.length} usuarios registrados
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por usuario o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Todos los roles</option>
                            <option value="customer">Clientes</option>
                            <option value="admin">Administradores</option>
                        </select>
                        <select
                            value={ageVerifiedFilter}
                            onChange={(e) => setAgeVerifiedFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Todos (verificación)</option>
                            <option value="true">Verificados</option>
                            <option value="false">No verificados</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Edad Verificada
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha de Registro
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => {
                                    const key = user.id || user._id || index;
                                    if (!user.id && !user._id) console.warn('User missing id:', user);
                                    return (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <UsersIcon className="text-purple-600" size={20} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Mail size={16} className="mr-2 text-gray-400" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role === 'admin' && <Shield size={14} className="mr-1" />}
                                                    {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.age_verified ? (
                                                    <span className="flex items-center text-green-600">
                                                        <CheckCircle size={18} className="mr-1" />
                                                        Verificado
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600">
                                                        <XCircle size={18} className="mr-1" />
                                                        No verificado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="mr-2 text-gray-400" />
                                                    {new Date(user.created_at).toLocaleDateString('es-AR')}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <UsersIcon className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">No se encontraron usuarios</p>
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <UsersIcon className="text-purple-600" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Verificados</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {users.filter(u => u.age_verified).length}
                                </p>
                            </div>
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Administradores</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                            <Shield className="text-purple-600" size={32} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
