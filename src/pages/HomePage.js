import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import { apiFetch } from '../api';
import ProductCard from '../components/ProductCard';
import { getCartKey, addToCart } from '../utils/cart';

const HomePage = ({ user }) => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Determine user status for cart key
        const currentKey = getCartKey(user);

        // Fetch products and take top 4
        apiFetch('/products')
            .then(data => {
                if (data.products) {
                    setFeaturedProducts(data.products.slice(0, 4));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user]);

    const handleAdd = (product) => {
        const key = getCartKey(user);
        addToCart(key, product);
        // Ideally emit event or show toast
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartKey: key } }));
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <Hero user={user} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Featured Products</h2>

                {loading ? (
                    <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAdd}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
