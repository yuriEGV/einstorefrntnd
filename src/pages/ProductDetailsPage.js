import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { addToCart, getCartKey } from '../utils/cart';
import Price from '../components/Price';
import { Star, ShoppingCart, ArrowLeft, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProductDetailsPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', title: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    const cartKey = useMemo(() => getCartKey(user), [user]);

    const fetchProduct = async () => {
        try {
            const data = await apiFetch(`/products/${id}`);
            setProduct(data.product);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(cartKey, product);
        // navigate('/cart');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to leave a review');
        setSubmittingReview(true);
        try {
            await apiFetch('/reviews', {
                method: 'POST',
                body: JSON.stringify({ ...reviewForm, product: id })
            });
            setReviewForm({ rating: 5, comment: '', title: '' });
            fetchProduct(); // Refresh to show new review
            alert('Review submitted successfully!');
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Product not found</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-indigo-600 mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t('checkout.go_back')}
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* Image Section */}
                        <div className="md:w-1/2">
                            <img src={product.image} alt={product.name} className="w-full h-[500px] object-cover" />
                        </div>

                        {/* Info Section */}
                        <div className="md:w-1/2 p-8 md:p-12">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                                    <p className="text-indigo-600 font-semibold text-lg">{product.company}</p>
                                </div>
                                <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                                    <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                                    <span className="font-bold text-indigo-700">{product.averageRating.toFixed(1)}</span>
                                    <span className="text-indigo-400 text-sm ml-1">({product.numOfReviews})</span>
                                </div>
                            </div>

                            <div className="text-3xl font-bold text-gray-900 mb-6">
                                <Price amount={product.price} />
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {product.description}
                            </p>

                            <div className="flex items-center space-x-4 mb-8">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Stock Disponible</p>
                                    <p className="font-bold text-gray-900 text-xl">{product.inventory} unidades</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Categoría</p>
                                    <p className="font-bold text-indigo-600 text-xl">{product.category}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="w-full flex items-center justify-center space-x-3 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                <span>Añadir al Carrito</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                        <MessageSquare className="w-8 h-8 mr-3 text-indigo-600" />
                        Reseñas del Producto
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Review Form */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
                                <h3 className="text-xl font-bold mb-4">Escribir una reseña</h3>
                                {user ? (
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                                            <select
                                                value={reviewForm.rating}
                                                onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                                className="w-full border-gray-200 rounded-lg p-2 focus:ring-indigo-500 border"
                                            >
                                                <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                                                <option value="4">⭐⭐⭐⭐ (Muy Bueno)</option>
                                                <option value="3">⭐⭐⭐ (Bueno)</option>
                                                <option value="2">⭐⭐ (Regular)</option>
                                                <option value="1">⭐ (Malo)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                            <input
                                                type="text"
                                                required
                                                value={reviewForm.title}
                                                onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                className="w-full border-gray-200 rounded-lg p-2 focus:ring-indigo-500 border"
                                                placeholder="Resume tu experiencia"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                                            <textarea
                                                required
                                                rows="4"
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                className="w-full border-gray-200 rounded-lg p-2 focus:ring-indigo-500 border"
                                                placeholder="¿Qué te pareció el producto?"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
                                        >
                                            {submittingReview ? 'Enviando...' : 'Publicar Reseña'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500 mb-4">Debes iniciar sesión para dejar una reseña.</p>
                                        <button onClick={() => navigate('/login')} className="bg-indigo-50 text-indigo-600 font-bold px-6 py-2 rounded-full hover:bg-indigo-100 transition">Iniciar Sesión</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="md:col-span-2 space-y-6">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((review) => (
                                    <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-lg">{review.title}</h4>
                                            </div>
                                            <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-600 mb-4 italic">"{review.comment}"</p>
                                        <div className="flex items-center text-sm">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mr-2 text-xs">
                                                {review.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-gray-700">{review.user?.name || 'Usuario'}</span>
                                            <span className="text-gray-300 mx-2">•</span>
                                            <span className="text-green-600 font-medium">Compra Verificada</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-400 italic">No hay reseñas para este producto aún. ¡Sé el primero en calificarlo!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
