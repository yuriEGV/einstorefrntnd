jest.mock('../utils/cart', () => ({
  getCartKey: jest.fn(() => 'cart:test'),
  readCart: jest.fn(() => [
    { _id: 'p1', name: 'One', price: 10, qty: 2 }
  ]),
  writeCart: jest.fn(),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '../pages/CartPage';

test('CartPage renders items and allows empty cart', () => {
  const { getByText } = render(<CartPage user={{ userId: 'u1' }} />);

  expect(getByText(/Carrito/i)).toBeInTheDocument();
  expect(getByText(/One x 2/i)).toBeInTheDocument();

  // mock confirm
  const originalConfirm = global.confirm;
  global.confirm = () => true;

  fireEvent.click(getByText(/Vaciar carrito/i));

  expect(require('../utils/cart').writeCart).toHaveBeenCalledWith('cart:test', []);

  global.confirm = originalConfirm;
});
