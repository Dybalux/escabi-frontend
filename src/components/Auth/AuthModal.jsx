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
        <div className="bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden border-t-8 border-[#0D4F4F] p-6 sm:p-10">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6 mb-6 sm:mb-10">
                <div className="bg-teal-50 p-4 sm:p-6 rounded-full shadow-inner">
                    <ShoppingCart className="text-[#0D4F4F]" size={40} />
                </div>
                <div>
                    <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3">Necesitas una cuenta</h3>
                    <p className="text-gray-600 text-xs sm:text-base max-w-lg mx-auto">
                        Para agregar productos al carrito y realizar compras. Registrate gratis en segundos.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => setMode('register')}
                    className="flex-1 bg-[#0D4F4F] text-white py-4 sm:py-5 px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg hover:shadow-teal-900/20 transform hover:-translate-y-1 text-center text-sm sm:text-lg"
                >
                    Registrarse
                </button>
                <button
                    onClick={() => setMode('login')}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 sm:py-5 px-6 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-center text-sm sm:text-lg"
                >
                    Iniciar Sesión
                </button>
            </div>
        </div>
    );

    const renderLogin = () => (
        <div className="bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden border-t-8 border-[#0D4F4F] p-6 sm:p-12 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Iniciar Sesión</h3>
                <button
                    onClick={() => setMode('choice')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors sm:text-lg"
                >
                    Volver
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 text-base shadow-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-700 mb-3">
                        Email o Usuario
                    </label>
                    <input
                        type="text"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-700 mb-3">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0D4F4F] text-white py-5 px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg disabled:opacity-50 text-xl mt-4"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                <p className="text-center text-base sm:text-lg text-gray-600 mt-6">
                    ¿No tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-[#0D4F4F] font-bold hover:underline"
                    >
                        Regístrate
                    </button>
                </p>
            </form>
        </div>
    );

    const renderRegister = () => (
        <div className="bg-white shadow-2xl rounded-none sm:rounded-3xl overflow-hidden border-t-8 border-[#0D4F4F] p-6 sm:p-12 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Crear Cuenta</h3>
                <button
                    onClick={() => setMode('choice')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors sm:text-lg"
                >
                    Volver
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 text-base shadow-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                            placeholder="Juan Pérez"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                            placeholder="juanperez"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                            Fecha de Nacimiento
                        </label>
                        <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                            required
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#0D4F4F]/20 focus:border-[#0D4F4F] transition-all text-lg"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0D4F4F] text-white py-5 px-6 rounded-2xl font-bold hover:bg-[#1E7E7A] transition-all shadow-lg disabled:opacity-50 text-xl mt-4"
                >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>

                <p className="text-center text-base sm:text-lg text-gray-600 mt-6">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#0D4F4F] font-bold hover:underline"
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
                className="w-full sm:w-auto sm:max-w-3xl pointer-events-auto relative z-10 mx-0 sm:mx-4"
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
