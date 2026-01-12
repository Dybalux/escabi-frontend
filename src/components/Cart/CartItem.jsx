import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../UI/Button';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartItem({ item }) {
    const { removeFromCart, updateQuantity } = useCart();

    // Validación de seguridad: si el item no tiene los datos necesarios, no renderizar
    if (!item || !item.name || typeof item.price !== 'number' || !item.product_id) {
        return null;
    }

    const { quantity, name, price, image_url, stock, item_type, combo_items, product_id } = item;
    const [imageError, setImageError] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [inputValue, setInputValue] = useState(quantity.toString());
    const [isEditing, setIsEditing] = useState(false);

    // Sincronizar inputValue cuando quantity cambia desde el servidor
    useEffect(() => {
        if (!isEditing) {
            setInputValue(quantity.toString());
        }
    }, [quantity, isEditing]);

    const handleRemove = async () => {
        await removeFromCart(product_id);
    };

    const getImageUrl = () => {
        return image_url;
    };

    const handleIncrement = async () => {
        if (updating) return;

        // Verificar stock disponible (solo para productos, no combos)
        if (item_type === 'product' && stock && quantity >= stock) {
            toast.error(`Stock máximo disponible: ${stock}`);
            return;
        }

        setUpdating(true);
        const result = await updateQuantity(product_id, quantity + 1);
        setUpdating(false);

        if (!result.success) {
            toast.error(result.error);
        }
    };

    const handleDecrement = async () => {
        if (updating) return;

        setUpdating(true);
        const result = await updateQuantity(product_id, quantity - 1);
        setUpdating(false);

        if (!result.success) {
            toast.error(result.error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Permitir solo números
        if (value === '' || /^\d+$/.test(value)) {
            setInputValue(value);
        }
    };

    const handleInputBlur = async () => {
        setIsEditing(false);
        await updateQuantityFromInput();
    };

    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Esto activará handleInputBlur
        } else if (e.key === 'Escape') {
            // Revertir al valor original
            setInputValue(quantity.toString());
            setIsEditing(false);
        }
    };

    const updateQuantityFromInput = async () => {
        const newQuantity = parseInt(inputValue) || 1;

        // Validar rango
        if (newQuantity < 1) {
            toast.error('La cantidad mínima es 1');
            setInputValue(quantity.toString());
            return;
        }

        if (item_type === 'product' && stock && newQuantity > stock) {
            toast.error(`Stock máximo disponible: ${stock}`);
            setInputValue(quantity.toString());
            return;
        }

        // Si no cambió, no hacer nada
        if (newQuantity === quantity) {
            return;
        }

        setUpdating(true);
        const result = await updateQuantity(product_id, newQuantity);
        setUpdating(false);

        if (!result.success) {
            toast.error(result.error);
            // Revertir al valor anterior
            setInputValue(quantity.toString());
        }
    };

    return (
        <motion.div
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center overflow-hidden">
                {!imageError && getImageUrl() ? (
                    <img
                        src={getImageUrl()}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="text-3xl">{item_type === 'combo' ? '📦' : '🍺'}</span>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{name}</h3>
                    {item_type === 'combo' && (
                        <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">COMBO</span>
                    )}
                </div>
                {item_type === 'combo' && combo_items && combo_items.length > 0 && (
                    <div className="mt-1">
                        <p className="text-xs text-gray-500">Incluye:</p>
                        <ul className="text-xs text-gray-600 ml-2">
                            {combo_items.map((comboItem, idx) => (
                                <li key={idx}>{comboItem.quantity}x {comboItem.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                    ${price.toFixed(2)} c/u
                </p>
            </div>

            {/* Controles de cantidad con animaciones */}
            <div className="flex items-center gap-2">
                <motion.button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || updating}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title="Decrementar"
                    whileHover={{ scale: quantity > 1 && !updating ? 1.1 : 1 }}
                    whileTap={{ scale: quantity > 1 && !updating ? 0.9 : 1 }}
                >
                    <Minus size={16} className={quantity <= 1 ? 'text-gray-400' : 'text-gray-700'} />
                </motion.button>

                <div className="w-16 text-center">
                    {updating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto"></div>
                    ) : (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            onFocus={() => setIsEditing(true)}
                            disabled={updating}
                            className="w-full text-center font-semibold text-gray-800 bg-transparent border-2 border-transparent hover:border-purple-200 focus:border-purple-400 focus:outline-none rounded px-1 py-1 transition-colors"
                            style={{
                                appearance: 'textfield',
                                MozAppearance: 'textfield',
                            }}
                        />
                    )}
                </div>

                <motion.button
                    onClick={handleIncrement}
                    disabled={(item_type === 'product' && stock && quantity >= stock) || updating}
                    className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title={(item_type === 'product' && stock && quantity >= stock) ? `Stock máximo: ${stock}` : 'Incrementar'}
                    whileHover={{ scale: (item_type === 'combo' || (stock && quantity < stock)) && !updating ? 1.1 : 1 }}
                    whileTap={{ scale: (item_type === 'combo' || (stock && quantity < stock)) && !updating ? 0.9 : 1 }}
                >
                    <Plus size={16} className="text-white" />
                </motion.button>
            </div>

            <div className="text-right flex flex-col gap-2">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={quantity}
                        className="text-xl font-bold text-purple-600"
                        initial={{ scale: 1.2, color: '#10b981' }}
                        animate={{ scale: 1, color: '#9333ea' }}
                        transition={{ duration: 0.3 }}
                    >
                        ${(price * quantity).toFixed(2)}
                    </motion.p>
                </AnimatePresence>
                <Button variant="danger" size="sm" onClick={handleRemove}>
                    <Trash2 size={16} />
                </Button>
            </div>
        </motion.div>
    );
}
