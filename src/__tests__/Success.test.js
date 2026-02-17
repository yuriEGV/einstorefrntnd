import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('../utils/cart', () => ({
  getCartKey: jest.fn(() => 'cart:test'),
  writeCart: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import Success from '../pages/Success';

test('Success clears cart and provides navigation', () => {
  render(<Success user={{ userId: 'u1' }} />);

  // writeCart should be called on mount
  expect(require('../utils/cart').writeCart).toHaveBeenCalled();

  // buttons exist
  const homeBtn = screen.getByText(/Volver a la tienda/i);
  const dashBtn = screen.getByText(/Ir al dashboard/i);

  fireEvent.click(homeBtn);
  fireEvent.click(dashBtn);

  expect(mockNavigate).toHaveBeenCalledWith('/');
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
