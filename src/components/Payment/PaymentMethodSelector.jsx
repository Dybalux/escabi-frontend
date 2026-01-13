import { CreditCard, Building2 } from 'lucide-react';

export default function PaymentMethodSelector({ selectedMethod, onMethodChange }) {
    const paymentMethods = [
        {
            id: 'Mercado Pago',
            name: 'Mercado Pago',
            description: 'Pagá con tarjeta, efectivo o débito',
            icon: CreditCard,
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'Transferencia Bancaria',
            name: 'Transferencia Bancaria',
            description: 'Transferí y enviá el comprobante',
            icon: Building2,
            color: 'from-[#0D4F4F] to-[#1E7E7A]'
        }
    ];

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                💳 Seleccioná tu método de pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <label
                            key={method.id}
                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                                ? 'border-[#0D4F4F] bg-teal-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-[#1E7E7A] hover:shadow-sm'
                                }`}
                        >
                            <input
                                type="radio"
                                name="payment-method"
                                value={method.id}
                                checked={isSelected}
                                onChange={(e) => onMethodChange(e.target.value)}
                                className="sr-only"
                            />
                            <div className="flex items-center w-full">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center mr-4`}>
                                    <Icon className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-semibold text-gray-900">
                                            {method.name}
                                        </h4>
                                        {isSelected && (
                                            <div className="flex-shrink-0 ml-2">
                                                <svg className="w-5 h-5 text-[#0D4F4F]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
