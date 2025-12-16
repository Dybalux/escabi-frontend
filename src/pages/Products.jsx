import ProductList from '../components/Products/ProductList';

export default function Products() {
    return (
        <div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🍾 Nuestros Productos</h1>
                    <p className="text-purple-100 text-lg">
                        Explora nuestra selección de bebidas premium
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <ProductList />
            </div>
        </div>
    );
}