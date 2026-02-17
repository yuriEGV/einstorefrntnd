const { test, expect } = require('@playwright/test');

test('Add product to cart and proceed to checkout (mock order)', async ({ page }) => {
  // Mock products list to ensure consistent data
  await page.route('**/api/v1/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ products: [{ _id: 'p1', name: 'Mock product', price: 100, image: '', description: 'x' }] }),
    });
  });

  // Mock creating order response
  await page.route('**/api/v1/orders', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ orderId: 'order_e2e_1', clientSecret: 'cs_e2e_1', publishableKey: 'pk_test' }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  await page.waitForSelector('text=Agregar al carrito');
  await page.click('text=Agregar al carrito');

  // go to cart
  await page.click('text=Carrito');
  await page.waitForSelector('text=Comprar');
  await page.click('text=Comprar');

  // start checkout
  await page.waitForSelector('text=Pagar ahora');
  await page.click('text=Pagar ahora');

  // after creating order, clientSecret should be shown (CheckoutPage shows order id)
  await page.waitForSelector('text=Orden creada — ID: order_e2e_1');
  expect(await page.isVisible('text=Orden creada — ID: order_e2e_1')).toBe(true);
});
