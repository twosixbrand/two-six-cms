import { test, expect } from '@playwright/test';

test.describe('Accounting Budget Flow', () => {

    test('should navigate to budget and check comparison views', async ({ page }) => {
        test.skip(!process.env.VITE_TEST_EMAIL || !process.env.VITE_TEST_PASSWORD, 'Test credentials not found in .env');

        // 1. Login
        await page.goto('/login');
        await page.getByPlaceholder(/Correo|Email/i, { exact: false }).fill(process.env.VITE_TEST_EMAIL as string);
        await page.getByRole('button', { name: /Send Code/i }).click();
        await page.getByPlaceholder('123456').fill('999999');
        await page.getByRole('button', { name: /Verify & Login/i }).click();

        // 2. Navigate to Accounting -> Budget
        await page.getByText('Contabilidad').first().click();
        await page.getByRole('link', { name: 'Presupuesto', exact: true }).first().click();

        // 3. Check title
        await expect(page.getByText('Presupuesto')).toBeVisible();

        // 4. Click Comparison
        await page.getByRole('button', { name: /Ver Comparativo/i }).click();
        await expect(page.getByText(/Comparativo Presupuesto vs Ejecución MENSUAL/i)).toBeVisible();

        // 5. Switch to Annual
        await page.getByRole('button', { name: /Ver Vista Anual/i }).click();
        await expect(page.getByText(/Comparativo Presupuesto vs Ejecución ANUAL/i)).toBeVisible();

        // 6. Check Excel Export button
        await expect(page.getByRole('button', { name: /Exportar Excel/i })).toBeVisible();
    });

});
