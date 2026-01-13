export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]';

    const variants = {
        primary: 'bg-[#0D4F4F] hover:bg-[#1E7E7A] text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-[#C29F4C] hover:bg-[#D4B366] text-white shadow-lg hover:shadow-xl',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
        outline: 'border-2 border-[#C29F4C] text-[#0D4F4F] hover:bg-[#F8F9FA] shadow-md hover:shadow-lg',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}