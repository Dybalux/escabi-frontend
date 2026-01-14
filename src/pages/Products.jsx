import { Helmet } from 'react-helmet-async';
import ProductList from '../components/Products/ProductList';

export default function Products() {
    return (
        <div>
            <Helmet>
                <title>Catálogo de Bebidas | Alto Trago</title>
                <meta name="description" content="Explorá nuestro catálogo completo de bebidas alcohólicas: cervezas, vinos, espirituosas y más. Precios especiales y envío a domicilio." />
                <link rel="canonical" href="https://altotrago.com/products" />
            </Helmet>
            <div className="bg-gradient-to-r from-[#0D4F4F] to-[#0A3636] text-white py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🍾 Nuestros Productos</h1>
                    <p className="text-teal-50 text-lg">
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