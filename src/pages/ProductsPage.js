import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import { getCartKey, addToCart } from '../utils/cart';
import ProductCard from '../components/ProductCard';
import { useLocation } from 'react-router-dom';

const ProductsPage = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const cartKey = useMemo(() => getCartKey(user), [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');

    // In a real app with backend filtering: apiFetch(`/products?category=${category}`)
    // Since we might fetch all and filter client side if backend doesn't support it yet:
    apiFetch('/products')
      .then(data => {
        let filtered = data.products;
        if (category) {
          filtered = filtered.filter(p => p.category === category);
        }
        setProducts(filtered);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [location.search]);

  const handleAdd = (product) => {
    addToCart(cartKey, product);
    // Optional: Show a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Latest Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center text-lg">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
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

export default ProductsPage;
