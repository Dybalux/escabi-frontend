import { Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../UI/Button';

export default function CartItem({ item }) {
    const { removeFromCart } = useCart();
    const { product, quantity } = item;

    const handleRemove = async () => {
        await removeFromCart(product.id);
    };

    return (
        <div className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🍺</span>
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm text-gray-500">
                    Cantidad: {quantity} x ${product.price.toFixed(2)}
                </p>
            </div>

            <div className="text-right">
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