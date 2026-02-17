import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders initial loading state', () => {
  render(<App />);
  const loading = screen.getByText(/Cargando.../i);
  expect(loading).toBeInTheDocument();
});
