import { test, expect } from '@playwright/test';

test.describe('Inventory CRUD Flow', () => {

    // We skip this until we have valid test credentials or handle auth setup
    test('should create a new category', async ({ page }) => {
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

        // 2. Navigate to Categories
        await page.getByText('Admin Prendas').first().click();
        await page.getByRole('link', { name: 'Category', exact: true }).first().click();

        // 3. Fill form (Form is always visible in the layout)
        const testCategoryName = `Test Category ${Date.now()}`;
        await page.getByRole('textbox', { name: /Name/i }).fill(testCategoryName);

        // 4. Submit
        await page.getByRole('button', { name: /Save/i }).click();

        // 5. Assert it appears in the list
        await expect(page.getByText(testCategoryName)).toBeVisible();
    });

});
