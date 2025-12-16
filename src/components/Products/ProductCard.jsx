import { ShoppingCart } from 'lucide-react';
import Button from '../UI/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import Alert from '../UI/Alert';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAddToCart = async () => {
        if (!user?.age_verified) {
            setAlert({ type: 'error', message: 'Debes verificar tu mayoría de edad primero' });
            return;
        }

        setLoading(true);
        const result = await addToCart(product.id, 1);

        if (result.success) {
            setAlert({ type: 'success', message: 'Producto agregado al carrito' });
        } else {
            setAlert({ type: 'error', message: result.error });
        }

        setLoading(false);
        setTimeout(() => setAlert(null), 3000);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            {alert && (
                <div className="p-2">
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                </div>
            )}

            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-6xl">🍺</span>';
                        }}
                    />
                ) : (
                    <span className="text-6xl">🍺</span>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'Sin descripción'}
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-semibold text-purple-600">{product.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock:</span>
                        <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock} unidades
                        </span>
                    </div>
                    {product.abv && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Alcohol:</span>
                            <span className="font-semibold">{product.abv}%</span>
                        </div>
                    )}
                    {product.volume_ml && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Volumen:</span>
                            <span className="font-semibold">{product.volume_ml}ml</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-3xl font-bold text-purple-600">
                        ${product.price.toFixed(2)}
                    </span>
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || loading}
                        size="sm"
                    >
                        <ShoppingCart size={16} className="mr-1" />
                        {loading ? 'Agregando...' : product.stock === 0 ? 'Sin Stock' : 'Agregar'}
                    </Button>
                </div>
            </div>
        </div>
    );
}