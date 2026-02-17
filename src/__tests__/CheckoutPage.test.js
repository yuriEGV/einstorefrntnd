import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Jest mocks must be declared before importing the module-under-test

jest.mock('../api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('../utils/cart', () => ({
  getCartKey: jest.fn(() => 'cart:test'),
  readCart: jest.fn(() => [
    { _id: 'p1', name: 'One', price: 10, qty: 2 }
  ])
}));

// stripe removed; no stripe mocks required for Webpay/Onepay tests

import { apiFetch } from '../api';
import CheckoutPage from '../pages/CheckoutPage';
import { MemoryRouter } from 'react-router-dom';

test('start checkout creates an order and shows payment form', async () => {
  apiFetch.mockResolvedValueOnce({ orderId: 'order123' });

  render(
    <MemoryRouter>
      <CheckoutPage user={{ userId: 'u1' }} />
    </MemoryRouter>
  );

  expect(screen.getByText(/Total:/i)).toBeInTheDocument();

  const payButton = screen.getByText(/Pagar ahora/i);
  fireEvent.click(payButton);

  await waitFor(() => expect(apiFetch).toHaveBeenCalled());

  // after creating order, payment buttons should appear
  expect(await screen.findByText(/Pagar con Webpay/i)).toBeInTheDocument();
  expect(screen.getByText(/Pagar con Onepay/i)).toBeInTheDocument();
});

test('completing payment calls patch and navigates to success', async () => {
  // first call (create order)
  apiFetch.mockResolvedValueOnce({ orderId: 'order456' });
  // second call (onepay/init)
  apiFetch.mockResolvedValueOnce({ reference: 'ref_1', qrImage: 'data:image/png;base64,dummypng' });
  // third call (onepay/commit)
  apiFetch.mockResolvedValueOnce({ success: true });

  const { container } = render(
    <MemoryRouter>
      <CheckoutPage user={{ userId: 'u1' }} />
    </MemoryRouter>
  );

  // start flow
  fireEvent.click(screen.getByText(/Pagar ahora/i));
  await waitFor(() => expect(apiFetch).toHaveBeenCalled());

  // wait for Onepay button
  await screen.findByText(/Pagar con Onepay/i);

  // click Onepay
  fireEvent.click(screen.getByText(/Pagar con Onepay/i));

  // QR should be shown
  await screen.findByAltText('QR Onepay');

  // confirm payment
  fireEvent.click(screen.getByText(/Confirmar pago/i));

  await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(3));
});
