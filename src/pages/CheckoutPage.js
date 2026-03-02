import React, { useEffect, useMemo, useState } from 'react';
import { getCartKey, readCart } from '../utils/cart';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard } from 'lucide-react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';
import Price from '../components/Price';

// Initialize Stripe - requires REACT_APP_STRIPE_PUBLIC_KEY in Vercel env vars
const stripePromise = process.env.REACT_APP_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
  : null;

// Initialize MercadoPago with Public Key from Env
const mpPublicKey = process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || 'TEST-1d5ef6c8-19a6-4abb-8c31-28b48cadbf98';
initMercadoPago(mpPublicKey, { locale: 'es-CL' });

const CheckoutPage = ({ user }) => {
  const { t } = useTranslation();
  const cartKey = useMemo(() => getCartKey(user), [user]);
  const [cart, setCart] = useState(() => readCart(cartKey));
  const [status, setStatus] = useState('idle');
  const [preferenceId, setPreferenceId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'
  const [currency, setCurrency] = useState(localStorage.getItem('einstore_currency') || 'CLP');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCurrency = () => setCurrency(localStorage.getItem('einstore_currency') || 'CLP');
    window.addEventListener('currencyChanged', handleCurrency);
    return () => window.removeEventListener('currencyChanged', handleCurrency);
  }, []);

  useEffect(() => {
    setCart(readCart(cartKey));
  }, [cartKey]);

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const serviceFee = total * 0.10; // 10% Platform / Transaction fee
  const finalTotal = total + serviceFee;

  const handleCreateOrder = async () => {
    if (!cart.length) return alert(t('checkout.empty_cart'));
    if (!address.trim()) return alert(t('checkout.address_required')); // Added validation
    setStatus('creating');
    try {
      const payloadItems = cart.map(i => ({ product: i._id, amount: i.qty }));

      const body = {
        items: payloadItems,
        tax: 0,
        shippingFee: serviceFee,
        shippingAddress: address,
        deliveryMethod: deliveryMethod, // Added delivery method
        currency: currency, // Pass currency to backend
        paymentMethod: currency === 'CAD' ? 'stripe' : 'mercadopago'
      };

      // 1. Create Order in Backend (Now includes Preference/Intent creation)
      const data = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      setOrderDetails(data.order);

      if (currency === 'CAD') {
        setClientSecret(data.order.clientSecret);
      } else {
        setPreferenceId(data.order.preferenceId);
      }

      setStatus('ready');
    } catch (err) {
      setStatus('error');
      console.error('Error creating order/payment:', err);
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
                        <p className="mt-1 text-sm font-medium text-gray-900"><Price amount={item.price} /></p>
                        <p className="mt-1 text-sm text-gray-500">Qty {item.qty}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="border-t border-gray-200 py-6 px-4 space-y-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">{t('checkout.subtotal')}</dt>
                  <dd className="text-sm font-medium text-gray-900"><Price amount={total} /></dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Comisión de Gestión (Platform Fee)</dt>
                  <dd className="text-sm font-medium text-gray-900"><Price amount={serviceFee} /></dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-bold text-gray-900">{t('checkout.total')}</dt>
                  <dd className="text-base font-bold text-gray-900"><Price amount={finalTotal} /></dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.payment_details')}</h2>
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-4 mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" />
                Transacción Protegida (P2P)
              </h2>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${deliveryMethod === 'delivery' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Envío a Domicilio
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${deliveryMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Retiro en Tienda
                </button>
              </div>

              <textarea
                required
                placeholder={deliveryMethod === 'delivery' ? "Ingresa tu dirección para coordinar con el vendedor..." : "Escribe un comentario o coordina el retiro..."}
                className="w-full border-gray-200 rounded-xl p-3 focus:ring-indigo-500 resize-none h-24 border"
                value={address}
                onChange={e => setAddress(e.target.value)}
              ></textarea>
              <p className="text-xs text-gray-500 italic">
                {deliveryMethod === 'delivery'
                  ? "Nota: Einstore no gestiona la logística de envío. El vendedor se contactará contigo para coordinar la entrega."
                  : "Nota: Deberás coordinar el lugar y horario de retiro con el vendedor a través del chat."
                }
              </p>
            </div>

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
                    {status === 'creating' ? t('checkout.processing') : `${t('checkout.pay')} ${currency === 'CLP' ? 'CLP' : 'CAD'}`}
                  </button>
                ) : null}

                {status === 'error' && (
                  <p className="mt-2 text-sm text-red-600">{t('checkout.error_msg')}</p>
                )}
              </div>

              {status === 'ready' && currency === 'CLP' && preferenceId && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 font-medium text-center mb-4">{t('checkout.mercadopago_msg')}</p>
                  <div className="flex justify-center">
                    <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">{t('checkout.redirect_msg')}</p>
                </div>
              )}

              {status === 'ready' && currency === 'CAD' && clientSecret && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 font-medium text-center mb-4">Complete your payment using Stripe</p>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      orderId={orderDetails?._id}
                      total={finalTotal}
                    />
                  </Elements>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">{currency === 'CLP' ? t('checkout.powered_mp') : 'Powered by Stripe'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
