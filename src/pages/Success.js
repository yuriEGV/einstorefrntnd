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
    <div style={{ padding: 20 }}>
      <h2>Pago completado ✅</h2>
      <p>Gracias por tu compra. Esta página se muestra una vez que el pago se confirmó.</p>
      {orderIdFromQuery && (
        <div style={{ marginTop: 8 }}>
          <strong>Orden:</strong> {orderIdFromQuery}
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate('/')}>Volver a la tienda</button>
        <button style={{ marginLeft: 8 }} onClick={() => navigate('/dashboard')}>Ir al dashboard</button>
      </div>
    </div>
  );
};

export default Success;
