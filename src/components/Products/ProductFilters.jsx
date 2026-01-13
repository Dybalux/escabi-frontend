import { Search } from 'lucide-react';

export default function ProductFilters({ filters, setFilters }) {
    const categories = [
        'Cerveza',
        'Vino Tinto',
        'Vino Blanco',
        'Vino Rosado',
        'Whisky',
        'Vodka',
        'Gin',
        'Ron',
        'Tequila',
        'Fernet',
        'Gaseosa',
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        Categoría
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#0D4F4F] focus:outline-none"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        Buscar
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#0D4F4F] focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}