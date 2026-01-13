export default function Input({ label, error, className = '', ...props }) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-gray-700 font-semibold mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#0D4F4F] focus:outline-none transition-colors ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}