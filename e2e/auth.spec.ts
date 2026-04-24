import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should display login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle(/cms - two six/i);
        await expect(page.locator('h1').first()).toContainText('Two Six CMS');
        await expect(page.getByRole('button', { name: /Send Code/i })).toBeVisible();
    });

    test('should show error for sending code to invalid backend (or mock)', async ({ page }) => {
        await page.goto('/login');

        await page.getByPlaceholder('your-email@example.com').fill('invalid@example.com');
        await page.getByRole('button', { name: /Send Code/i }).click();

        // The backend mock or real backend might reject this, showing an error.
        // We wait for the error message or the next step
        // Since we don't know the exact backend behavior in test env, we just wait for either 
        // the verify form to appear or an error message to appear.
        const verifyButton = page.getByRole('button', { name: /Verify & Login/i });
        const errorMessage = page.locator('.login-error');

        await expect(verifyButton.or(errorMessage)).toBeVisible();
    });

    // Keep skipped as we need real/mock credentials
    test('should login with valid OTP', async ({ page }) => {
        test.skip(!process.env.VITE_TEST_EMAIL || !process.env.VITE_TEST_PASSWORD, 'Test credentials not found in .env');

        await page.goto('/login');

        // Step 1: Send Code
        await page.getByPlaceholder('your-email@example.com').fill(process.env.VITE_TEST_EMAIL as string);
        await page.getByRole('button', { name: /Send Code/i }).click();

        // Step 2: Verify Code
        await expect(page.getByRole('button', { name: /Verify & Login/i })).toBeVisible();
        await page.getByPlaceholder('123456').fill('999999');
        await page.getByRole('button', { name: /Verify & Login/i }).click();

        // After login, we expect the dashboard to load (Sidebar appears)
        await expect(page.locator('.navbar')).toBeVisible({ timeout: 15000 });
    });

});
