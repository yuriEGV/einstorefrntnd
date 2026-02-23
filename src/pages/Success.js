import React, { useEffect } from 'react';
import { getCartKey, writeCart } from '../utils/cart';
import { useNavigate, useLocation } from 'react-router-dom';

const Success = ({ user }) => {
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderIdFromQuery = params.get('orderId');

  useEffect(() => {
    // Clear the user's cart after a successful payment
    try {
      const key = getCartKey(user);
      writeCart(key, []);
      // notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartKey: key } }));
    } catch (err) {
      // ignore
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¡Pago Completado!</h2>
        <p className="text-gray-600 mb-8">Gracias por tu compra. Tu pedido está siendo procesado.</p>

        {orderIdFromQuery && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <span className="text-sm text-gray-500 block uppercase tracking-wide font-semibold">Orden ID</span>
            <span className="text-lg font-mono font-bold text-indigo-600">#{orderIdFromQuery.slice(-8).toUpperCase()}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Ir al Panel de Control
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
