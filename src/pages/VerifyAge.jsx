import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import Alert from '../components/UI/Alert';
import { ShieldCheck } from 'lucide-react';

export default function VerifyAge() {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const { verifyAge, user } = useAuth();
    const navigate = useNavigate();

    const handleVerify = async () => {
        setLoading(true);
        const result = await verifyAge();

        if (result.success) {
            setAlert({ type: 'success', message: '¡Edad verificada correctamente!' });
            setTimeout(() => navigate('/products'), 2000);
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

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-purple-800 text-sm">
                        ℹ️ La verificación se realiza según la fecha de nacimiento que proporcionaste al registrarte.
                    </p>
                </div>

                <Button
                    onClick={handleVerify}
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'Verificando...' : 'Verificar mi Edad'}
                </Button>
            </div>
        </div>
    );
}