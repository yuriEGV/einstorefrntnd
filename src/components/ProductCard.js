import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import Price from './Price';

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 border border-gray-100 flex flex-col h-full"
        >
            <div className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative h-64">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.target.onerror = null;
                            // Use a simple gray SVG placeholder directly to avoid network issues
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect fill='%23e2e8f0' width='300' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                            onClick={() => onAddToCart(product)}
                            className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2 shadow-lg"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                    {product.category && (
                        <span className="text-xs uppercase tracking-wide font-semibold text-indigo-600 mb-2 block">
                            {product.category}
                        </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight hover:text-indigo-600 cursor-pointer truncate">
                        {product.name}
                    </h3>
                    <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < (product.rating || 4) ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">({product.numReviews || 12} reviews)</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-gray-900">
                        <Price amount={product.price} />
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
