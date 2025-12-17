import { useEffect, useState } from 'react';
import { getProducts } from '../../services/api';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', search: '' });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts({ limit: 50 });
            // El backend ahora devuelve { items: [...], total: X, page: Y, ... }
            const productsData = response.data.items || response.data;
            setProducts(productsData);
            setFilteredProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(search) ||
                (p.description && p.description.toLowerCase().includes(search))
            );
        }

        setFilteredProducts(filtered);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div>
            <ProductFilters filters={filters} setFilters={setFilters} />

            {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-600 text-xl">No se encontraron productos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}