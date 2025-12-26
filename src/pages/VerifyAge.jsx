import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import Alert from '../components/UI/Alert';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyAge() {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const { verifyAge, logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            // Cerrar sesión y redirigir
            logout();
            navigate('/login');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, logout, navigate]);

    const handleVerify = async () => {
        setLoading(true);
        const result = await verifyAge();

        if (result.success) {
            setAlert({
                type: 'success',
                message: '¡Edad verificada correctamente! Cerrando sesión para actualizar tus permisos...'
            });

            // Iniciar countdown
            setCountdown(5);

            // Toast con countdown
            const toastId = toast.loading('Preparando tu sesión...', {
                duration: 5000,
            });

            // Actualizar el toast cada segundo
            let secondsLeft = 5;
            const interval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    toast.loading(
                        `Cerrando sesión en ${secondsLeft} segundo${secondsLeft !== 1 ? 's' : ''}... Por favor, vuelve a iniciar sesión para completar la verificación.`,
                        { id: toastId }
                    );
                } else {
                    toast.success('Redirigiendo al login...', { id: toastId });
                    clearInterval(interval);
                }
            }, 1000);

        } else {
            setAlert({ type: 'error', message: result.error });
        }

        setLoading(false);
    };

    if (user?.age_verified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900 px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
                    <ShieldCheck className="mx-auto text-green-600 mb-4" size={64} />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Ya estás verificado
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Tu edad ya ha sido verificada. Puedes comprar sin restricciones.
                    </p>
                    <Button onClick={() => navigate('/products')}>
                        Ver Productos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
                <div className="text-center mb-6">
                    <ShieldCheck className="mx-auto text-purple-600 mb-4" size={64} />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Verificación de Edad
                    </h1>
                    <p className="text-gray-600">
                        Para poder comprar bebidas alcohólicas, necesitamos verificar que eres mayor de 18 años.
                    </p>
                </div>

                {alert && (
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {countdown !== null && (
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center">
                        <p className="text-yellow-800 font-semibold text-lg mb-2">
                            Cerrando sesión en {countdown}...
                        </p>
                        <p className="text-yellow-700 text-sm">
                            Deberás iniciar sesión nuevamente para que los cambios tengan efecto.
                        </p>
                    </div>
                )}

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-purple-800 text-sm">
                        ℹ️ La verificación se realiza según la fecha de nacimiento que proporcionaste al registrarte.
                    </p>
                </div>

                <Button
                    onClick={handleVerify}
                    className="w-full"
                    disabled={loading || countdown !== null}
                >
                    {loading ? 'Verificando...' : 'Verificar mi Edad'}
                </Button>

                {countdown === null && (
                    <p className="text-gray-500 text-xs text-center mt-4">
                        Nota: Después de verificar tu edad, deberás iniciar sesión nuevamente.
                    </p>
                )}
            </div>
        </div>
    );
}
