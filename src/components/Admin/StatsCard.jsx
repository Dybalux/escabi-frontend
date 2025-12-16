export default function StatsCard({ title, value, icon: Icon, color = 'purple', subtitle }) {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`${colorClasses[color]} p-3 rounded-lg`}>
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {subtitle && (
                <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            )}
        </div>
    );
}
