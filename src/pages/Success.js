import React, { useEffect, useState } from 'react';
import { getCartKey, writeCart, clearCart } from '../utils/cart';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../api';
import Price from '../components/Price';
import { CheckCircle, Truck, Package, MessageSquare, ArrowRight } from 'lucide-react';

const Success = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderIdFromQuery = params.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderIdFromQuery);

  useEffect(() => {
    // Clear ALL carts (guest and current user)
    clearCart(user);

    const collectionStatus = params.get('collection_status');
    const status = params.get('status');

    if (orderIdFromQuery) {
      const verifyAndFetchOrder = async () => {
        try {
          // If the URL indicates success but the DB might still be pending (e.g. webhook delay)
          // we force an update if we see 'approved' status in local params
          if (collectionStatus === 'approved' || status === 'approved') {
            await apiFetch(`/ orders / ${orderIdFromQuery} `, {
              method: 'PATCH',
              body: JSON.stringify({ paymentIntentId: 'MERCADOPAGO_APPROVED_FALLBACK' })
              // Sending a dummy paymentIntentId triggers the 'paid' logic in backend
            });
          }

          const data = await apiFetch(`/ orders / ${orderIdFromQuery} `);
          setOrder(data.order);
          setLoading(false);
        } catch (err) {
          console.error('Error verifying/fetching order:', err);
          setLoading(false);
        }
      };

      verifyAndFetchOrder();
    }
  }, [user, orderIdFromQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2">¡Pago Completado!</h2>
          <p className="text-indigo-100">Gracias por tu compra. Tu pedido está siendo procesado por el vendedor.</p>
        </div>

        <div className="p-8">
          {order && (
            <div className="space-y-6">
              {/* Software Activation Alert */}
              {order.orderItems.some(item =>
                item.name.toLowerCase().includes('soft') ||
                item.name.toLowerCase().includes('ein') ||
                item.name.toLowerCase().includes('activation')
              ) && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageSquare className="w-6 h-6 text-amber-600" />
                      <h3 className="text-lg font-bold text-amber-900">Instrucciones de Activación</h3>
                    </div>
                    <p className="text-amber-800 text-sm">
                      Has comprado un producto digital. Por favor, <strong>revisa el chat</strong> con el vendedor para recibir tus claves de activación e instrucciones de instalación de inmediato.
                    </p>
                  </motion.div>
                )}

              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Orden ID</span>
                    <p className="text-lg font-mono font-bold text-indigo-600">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Pagado</span>
                    <p className="text-xl font-bold text-gray-900"><Price amount={order.total} /></p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex items-start space-x-3">
                  {order.deliveryMethod === 'pickup' ? (
                    <>
                      <Package className="w-5 h-5 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900">Método: Retiro en Tienda</p>
                        <p className="text-sm text-gray-600">Coordina el retiro con el vendedor a través del chat.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Truck className="w-5 h-5 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900">Método: Envío a Domicilio</p>
                        <p className="text-sm text-gray-600 italic">"{order.shippingAddress || 'Dirección no proporcionada'}"</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Resumen de Productos</h3>
                <div className="space-y-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.amount}</p>
                      </div>
                      <p className="text-sm font-bold"><Price amount={item.price * item.amount} /></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-14 flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Contactar al Vendedor / Ver mi Pedido</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full h-14 flex items-center justify-center space-x-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition active:scale-95"
            >
              <span>Seguir Comprando</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center mt-6 text-xs text-gray-400 italic">
            Tu transacción está protegida por Einstore P2P. No compartas datos personales fuera del chat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
