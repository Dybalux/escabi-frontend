export const checkFreeShippingEligibility = (cartItems) => {
    if (!cartItems || !Array.isArray(cartItems)) {
        return {
            isEligible: false,
            remainingItems: 2,
            hasCombo: false
        };
    }

    // 1. Calcular cantidad total de productos
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // 2. Verificar si hay combos
    const hasCombo = cartItems.some(item =>
        item.item_type === 'combo'
    );

    // 3. Regla: 2+ items O incluye combo
    const isEligible = totalItems >= 2 || hasCombo;

    return {
        isEligible,
        remainingItems: Math.max(0, 2 - totalItems),
        hasCombo
    };
};
