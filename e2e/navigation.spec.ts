import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {

    // We skip this until we have valid test credentials or handle auth setup
    test('should navigate via sidebar successfully', async ({ page }) => {
        test.skip(!process.env.VITE_TEST_EMAIL || !process.env.VITE_TEST_PASSWORD, 'Test credentials not found in .env');

        // 1. Perform Login
        await page.goto('/login');

        // Step 1: Send Code
        await page.getByPlaceholder(/Correo|Email/i, { exact: false }).fill(process.env.VITE_TEST_EMAIL as string);
        await page.getByRole('button', { name: /Send Code/i }).click();

        // Step 2: Verify Code
        await expect(page.getByRole('button', { name: /Verify & Login/i })).toBeVisible();
        await page.getByPlaceholder('123456').fill('999999');
        await page.getByRole('button', { name: /Verify & Login/i }).click();

        // 2. Click "Admin Prendas" and "Product"
        await page.getByText('Admin Prendas').first().click();
        await page.getByRole('link', { name: 'Product', exact: true }).first().click();

        // Expect URL to change and page header to update
        await expect(page).toHaveURL(/.*\/product/);
        await expect(page.locator('h1').or(page.locator('.page-title')).last()).toContainText(/Product/i);

        // 3. Click "Ventas" and "Órdenes"
        await page.getByText('Ventas').first().click();
        await page.getByRole('link', { name: 'Pedidos', exact: true }).first().click();

        await expect(page).toHaveURL(/.*\/order/);
        await expect(page.locator('h1').or(page.locator('.page-title')).last()).toContainText(/Order|Pedido/i);
    });

});
