import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../utils/cart', () => ({ getCartKey: jest.fn(() => 'cart:test'), writeCart: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import Dashboard from '../pages/Dashboard';
import { apiFetch } from '../api';

test('Dashboard loads orders and reorders', async () => {
  const orders = [
    { _id: 'o1', total: 200, paymentStatus: 'paid', createdAt: new Date().toISOString(), items: [{ productId: 'p1', name: 'One', price: 100, quantity: 2 }] }
  ];
  apiFetch.mockResolvedValueOnce({ orders });

  render(<Dashboard user={{ userId: 'u1' }} />);

  await waitFor(() => expect(apiFetch).toHaveBeenCalled());

  // the order should be rendered
  expect(await screen.findByText(/Orden:/i)).toBeInTheDocument();

  const reorderBtn = screen.getByText(/Reordenar/i);
  fireEvent.click(reorderBtn);

  expect(require('../utils/cart').writeCart).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/cart');
});
