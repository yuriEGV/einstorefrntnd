import React, { useEffect, useMemo, useState } from 'react';
import { getCartKey, readCart } from '../utils/cart';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard } from 'lucide-react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useTranslation } from 'react-i18next';

// Initialize MercadoPago with Public Key
initMercadoPago('TEST-1d5ef6c8-19a6-4abb-8c31-28b48cadbf98', { locale: 'es-CL' });

const CheckoutPage = ({ user }) => {
  const { t } = useTranslation();
  const cartKey = useMemo(() => getCartKey(user), [user]);
  const [cart, setCart] = useState(() => readCart(cartKey));
  const [status, setStatus] = useState('idle');
  const [preferenceId, setPreferenceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(readCart(cartKey));
  }, [cartKey]);

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = total * 0.19; // Example tax 19%
  const shipping = total > 500 ? 0 : 10; // Example shipping rule
  const finalTotal = total + tax + shipping;

  const handleCreateOrder = async () => {
    if (!cart.length) return alert(t('checkout.empty_cart'));
    setStatus('creating');
    try {
      const payloadItems = cart.map(i => ({ product: i._id, amount: i.qty }));

      const body = {
        items: payloadItems,
        tax: tax,
        shippingFee: shipping
      };

      // 1. Create Order in Backend
      const orderData = await apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) });

      // 2. Create MercadoPago Preference
      const mpData = await apiFetch('/payments/mercadopago/create-preference', {
        method: 'POST',
        body: JSON.stringify({ orderId: orderData.order._id })
      });

      setPreferenceId(mpData.id);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      console.error('Error creating order/preference:', err);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('checkout.empty_cart')}</h2>
          <button onClick={() => navigate('/products')} className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium">{t('checkout.go_back')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t('checkout.title')}</h1>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Order Summary Section */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">{t('checkout.summary')}</h2>
            <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item._id} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-center object-cover" />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-700 hover:text-gray-800">{item.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">{item.company}</p>
                        </div>
                      </div>
                      <div className="flex-1 pt-2 flex items-end justify-between">
                        <p className="mt-1 text-sm font-medium text-gray-900">${item.price}</p>
                        <p className="mt-1 text-sm text-gray-500">Qty {item.qty}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="border-t border-gray-200 py-6 px-4 space-y-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">{t('checkout.subtotal')}</dt>
                  <dd className="text-sm font-medium text-gray-900">${total.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">{t('checkout.shipping')}</dt>
                  <dd className="text-sm font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">{t('checkout.taxes')}</dt>
                  <dd className="text-sm font-medium text-gray-900">${tax.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-bold text-gray-900">{t('checkout.total')}</dt>
                  <dd className="text-base font-bold text-gray-900">${finalTotal.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.payment_details')}</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <ShieldCheck className="text-green-500 h-6 w-6 mr-2" />
                  <span className="text-sm text-gray-500">{t('checkout.secure_msg')}</span>
                </div>

                {status === 'idle' || status === 'error' ? (
                  <button
                    onClick={handleCreateOrder}
                    disabled={status === 'creating'}
                    className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    {status === 'creating' ? t('checkout.processing') : `${t('checkout.pay')} $${finalTotal.toFixed(2)}`}
                  </button>
                ) : null}

                {status === 'error' && (
                  <p className="mt-2 text-sm text-red-600">{t('checkout.error_msg')}</p>
                )}
              </div>

              {status === 'ready' && preferenceId && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 font-medium text-center mb-4">{t('checkout.mercadopago_msg')}</p>
                  <div className="flex justify-center">
                    <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">{t('checkout.redirect_msg')}</p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">{t('checkout.powered_mp')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
