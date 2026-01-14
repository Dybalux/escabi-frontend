import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal({ onClose, onSuccess }) {
    const [mode, setMode] = useState('choice'); // 'choice', 'login', 'register'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        full_name: '',
        date_of_birth: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    console.log('AuthModal rendered, mode:', mode);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login({ email: formData.email, password: formData.password });

        if (result.success) {
            toast.success('¡Sesión iniciada exitosamente!');
            onSuccess();
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            toast.success('¡Cuenta creada exitosamente!');
            onSuccess();
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const renderChoice = () => (
        <div className="bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden border-t-8 border-[#0D4F4F] p-6 sm:p-8">
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-teal-50 p-3 sm:p-4 rounded-full">
                    <ShoppingCart className="text-[#0D4F4F]" size={32} />
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Necesitas una cuenta</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                        Para agregar productos al carrito y realizar compras
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => setMode('register')}
                    className="flex-1 bg-[#0D4F4F] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg hover:shadow-teal-900/20 transform hover:-translate-y-1 text-center text-sm sm:text-base"
                >
                    Registrarse
                </button>
                <button
                    onClick={() => setMode('login')}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-center text-sm sm:text-base"
                >
                    Iniciar Sesión
                </button>
            </div>
        </div>
    );

    const renderLogin = () => (
        <div className="bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden border-t-8 border-[#0D4F4F] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h3>
                <button
                    onClick={() => setMode('choice')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Volver
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email o Usuario
                    </label>
                    <input
                        type="text"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0D4F4F] text-white py-4 px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg disabled:opacity-50"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                <p className="text-center text-sm text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-[#0D4F4F] font-semibold hover:underline"
                    >
                        Regístrate
                    </button>
                </p>
            </form>
        </div>
    );

    const renderRegister = () => (
        <div className="bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden border-t-8 border-[#0D4F4F] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Crear Cuenta</h3>
                <button
                    onClick={() => setMode('choice')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Volver
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        placeholder="Juan Pérez"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario
                    </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        placeholder="juanperez"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento
                    </label>
                    <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D4F4F] focus:border-transparent"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0D4F4F] text-white py-4 px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg disabled:opacity-50"
                >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>

                <p className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#0D4F4F] font-semibold hover:underline"
                    >
                        Inicia sesión
                    </button>
                </p>
            </form>
        </div>
    );

    return createPortal(
        <div
            className="fixed inset-0 z-[10000] min-h-screen flex items-center justify-center p-0 sm:p-4 pointer-events-none overflow-x-hidden"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                display: 'flex'
            }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 pointer-events-auto"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    pointerEvents: 'auto'
                }}
            ></div>

            {/* Modal content */}
            <div
                className="w-full sm:w-auto sm:max-w-2xl pointer-events-auto relative z-10 mx-0 sm:mx-4"
                style={{
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'auto'
                }}
            >
                {mode === 'choice' && renderChoice()}
                {mode === 'login' && renderLogin()}
                {mode === 'register' && renderRegister()}
            </div>
        </div>,
        document.body
    );
}
