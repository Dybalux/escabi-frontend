import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Mail, Calendar, Shield, CheckCircle, XCircle, UserPlus, UserMinus } from 'lucide-react';
import { getAdminUsers, updateUserRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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

    const { user: currentUser } = useAuth();

    const handleRoleChange = async (userId, currentRole, username) => {
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        const action = newRole === 'admin' ? 'promover a administrador' : 'degradar a cliente';

        // Prevenir auto-degradación
        if (currentUser?.id === userId && newRole === 'customer') {
            toast.error('No podés quitarte tus propios permisos de administrador');
            return;
        }

        if (!confirm(`¿Estás seguro de ${action} a ${username}?`)) {
            return;
        }

        try {
            await updateUserRole(userId, newRole);
            toast.success(`Usuario ${username} ${newRole === 'admin' ? 'promovido a administrador' : 'degradado a cliente'} exitosamente`);
            loadUsers(); // Recargar lista
        } catch (error) {
            console.error('Error changing user role:', error);
            const errorMessage = error.response?.data?.detail || 'Error al cambiar el rol del usuario';
            toast.error(errorMessage);
        }
    };

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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        >
                            <option value="">Todos los roles</option>
                            <option value="customer">Clientes</option>
                            <option value="admin">Administradores</option>
                        </select>
                        <select
                            value={ageVerifiedFilter}
                            onChange={(e) => setAgeVerifiedFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        >
                            <option value="">Todos (verificación)</option>
                            <option value="true">Verificados</option>
                            <option value="false">No verificados</option>
                        </select>
                    </div>
                </div>

                {/* Users Table - Desktop */}
                <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
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
                                                    <div className="flex-shrink-0 h-10 w-10 bg-teal-50 rounded-full flex items-center justify-center">
                                                        <UsersIcon className="text-[#0D4F4F]" size={20} />
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
                                                    ? 'bg-teal-100 text-[#0D4F4F]'
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {user.role === 'customer' ? (
                                                    <button
                                                        onClick={() => handleRoleChange(user.id || user._id, user.role, user.username)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D4F4F] hover:bg-[#1E7E7A] text-white rounded-lg font-semibold transition-colors duration-200"
                                                        title="Promover a administrador"
                                                    >
                                                        <UserPlus size={16} />
                                                        Hacer Admin
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleChange(user.id || user._id, user.role, user.username)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
                                                        title="Degradar a cliente"
                                                        disabled={currentUser?.id === (user.id || user._id)}
                                                    >
                                                        <UserMinus size={16} />
                                                        Quitar Admin
                                                    </button>
                                                )}
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

                {/* Users Cards - Mobile & Tablet */}
                <div className="block lg:hidden space-y-4">
                    {filteredUsers.map((user, index) => {
                        const key = user.id || user._id || index;
                        return (
                            <div key={key} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex-shrink-0 h-14 w-14 bg-teal-50 rounded-full flex items-center justify-center">
                                        <UsersIcon className="text-[#0D4F4F]" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                                            {user.username}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Mail size={14} className="mr-1" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-2">Rol</span>
                                        <span className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${user.role === 'admin'
                                            ? 'bg-teal-100 text-[#0D4F4F]'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role === 'admin' && <Shield size={14} className="mr-1" />}
                                            {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-2">Verificación</span>
                                        {user.age_verified ? (
                                            <span className="flex items-center text-sm text-green-600">
                                                <CheckCircle size={16} className="mr-1" />
                                                Verificado
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-sm text-red-600">
                                                <XCircle size={16} className="mr-1" />
                                                No verificado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <Calendar size={16} className="mr-2" />
                                        <span className="text-xs">Registrado el </span>
                                        <span className="ml-1 font-medium text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString('es-AR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    {user.role === 'customer' ? (
                                        <button
                                            onClick={() => handleRoleChange(user.id || user._id, user.role, user.username)}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0D4F4F] hover:bg-[#1E7E7A] text-white rounded-lg font-semibold transition-colors duration-200"
                                        >
                                            <UserPlus size={18} />
                                            Promover a Administrador
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRoleChange(user.id || user._id, user.role, user.username)}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={currentUser?.id === (user.id || user._id)}
                                        >
                                            <UserMinus size={18} />
                                            Degradar a Cliente
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg">
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
                            <UsersIcon className="text-[#0D4F4F]" size={32} />
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
                                <p className="text-2xl font-bold text-[#0D4F4F]">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                            <Shield className="text-[#0D4F4F]" size={32} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
