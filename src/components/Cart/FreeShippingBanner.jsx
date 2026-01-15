import React from 'react';
import { checkFreeShippingEligibility } from '../../helpers/shippingRules';
import { motion } from 'framer-motion';

const FreeShippingBanner = ({ cartItems }) => {
    const { isEligible, remainingItems, hasCombo } = checkFreeShippingEligibility(cartItems);

    if (isEligible) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 text-green-800 p-3 rounded-xl mb-4 text-center border border-green-200 shadow-sm"
            >
                🎉 <strong>¡Felicidades!</strong> Tenés <strong>ENVÍO GRATIS</strong> en zona céntrica.
                {hasCombo && <span className="block text-xs mt-1 font-medium text-green-700">(Por comprar un Pack Ahorro 📦)</span>}
            </motion.div>
        );
    }

    // Si no es elegible, mostramos cuánto falta (si no tiene combo)
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 text-yellow-800 p-3 rounded-xl mb-4 text-center border border-yellow-200 shadow-sm"
        >
            🚚 Agregá <strong>{remainingItems} producto{remainingItems > 1 ? 's' : ''} más</strong> para tener envío GRATIS en el centro.
        </motion.div>
    );
};

export default FreeShippingBanner;
