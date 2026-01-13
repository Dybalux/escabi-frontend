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
            className="flex flex-col sm:flex-row items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 sm:border-none"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-4 w-full sm:flex-1">
                {/* Imagen del producto */}
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {!imageError && getImageUrl() ? (
                        <img
                            src={getImageUrl()}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span className="text-2xl sm:text-3xl">{item_type === 'combo' ? '📦' : '🍺'}</span>
                    )}
                </div>

                {/* Info del producto */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 leading-tight">{name}</h3>
                        {item_type === 'combo' && (
                            <span className="bg-[#C29F4C] text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold">COMBO</span>
                        )}
                    </div>
                    {item_type === 'combo' && combo_items && combo_items.length > 0 && (
                        <div className="mt-1">
                            <ul className="text-[10px] sm:text-xs text-gray-600 line-clamp-1">
                                {combo_items.map((comboItem, idx) => (
                                    <span key={idx}>{idx > 0 && ', '}{comboItem.quantity}x {comboItem.name}</span>
                                ))}
                            </ul>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        ${price.toFixed(2)} c/u
                    </p>
                </div>

                {/* Botón eliminar para móvil */}
                <div className="sm:hidden">
                    <button
                        onClick={handleRemove}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Controles y Precio Total */}
            <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                {/* Controles de cantidad */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <motion.button
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || updating}
                        className="w-8 h-8 rounded-full bg-white sm:bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm sm:shadow-none"
                        whileHover={{ scale: quantity > 1 && !updating ? 1.1 : 1 }}
                        whileTap={{ scale: quantity > 1 && !updating ? 0.9 : 1 }}
                    >
                        <Minus size={14} className={quantity <= 1 ? 'text-gray-400' : 'text-gray-700'} />
                    </motion.button>

                    <div className="w-12 sm:w-16 text-center">
                        {updating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0D4F4F] mx-auto"></div>
                        ) : (
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                onFocus={() => setIsEditing(true)}
                                disabled={updating}
                                className="w-full text-center font-bold text-gray-800 bg-transparent border-none focus:outline-none rounded text-sm sm:text-base"
                            />
                        )}
                    </div>

                    <motion.button
                        onClick={handleIncrement}
                        disabled={(item_type === 'product' && stock && quantity >= stock) || updating}
                        className="w-8 h-8 rounded-full bg-[#0D4F4F] hover:bg-[#1E7E7A] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm sm:shadow-none"
                        whileHover={{ scale: (item_type === 'combo' || (stock && quantity < stock)) && !updating ? 1.1 : 1 }}
                        whileTap={{ scale: (item_type === 'combo' || (stock && quantity < stock)) && !updating ? 0.9 : 1 }}
                    >
                        <Plus size={14} className="text-white" />
                    </motion.button>
                </div>

                {/* Precio Total y Eliminar Desktop */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={quantity}
                                className="text-lg sm:text-xl font-bold text-[#0D4F4F]"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                ${(price * quantity).toFixed(2)}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <div className="hidden sm:block">
                        <Button variant="danger" size="sm" onClick={handleRemove}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
