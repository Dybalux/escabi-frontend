import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../UI/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartItem({ item }) {
    const { removeFromCart, updateQuantity } = useCart();
    const { product, quantity } = item;
    const [imageError, setImageError] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleRemove = async () => {
        await removeFromCart(product.id);
    };

    const handleIncrement = async () => {
        if (updating) return;

        // Verificar stock disponible
        if (quantity >= product.stock) {
            toast.error(`Stock máximo disponible: ${product.stock}`);
            return;
        }

        setUpdating(true);
        const result = await updateQuantity(product.id, quantity + 1);
        setUpdating(false);

        if (!result.success) {
            toast.error(result.error);
        }
    };

    const handleDecrement = async () => {
        if (updating) return;

        setUpdating(true);
        const result = await updateQuantity(product.id, quantity - 1);
        setUpdating(false);

        if (!result.success) {
            toast.error(result.error);
        }
    };

    const getImageUrl = () => {
        return product.image_url || product.imageUrl || product.image;
    };

    return (
        <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center overflow-hidden">
                {!imageError && getImageUrl() ? (
                    <img
                        src={getImageUrl()}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="text-3xl">🍺</span>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm text-gray-500">
                    ${product.price.toFixed(2)} c/u
                </p>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || updating}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title="Decrementar"
                >
                    <Minus size={16} className={quantity <= 1 ? 'text-gray-400' : 'text-gray-700'} />
                </button>

                <div className="w-12 text-center">
                    {updating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto"></div>
                    ) : (
                        <span className="font-semibold text-gray-800">{quantity}</span>
                    )}
                </div>

                <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock || updating}
                    className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title={quantity >= product.stock ? `Stock máximo: ${product.stock}` : 'Incrementar'}
                >
                    <Plus size={16} className="text-white" />
                </button>
            </div>

            <div className="text-right flex flex-col gap-2">
                <p className="text-xl font-bold text-purple-600">
                    ${(product.price * quantity).toFixed(2)}
                </p>
                <Button variant="danger" size="sm" onClick={handleRemove}>
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}
