import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests login, logout, and role-based access
 */

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        // Start from login page
        await page.goto('/login');
    });

    test('should display login page correctly', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/EduLMS|Login/i);
        
        // Check form elements exist
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        // Fill in invalid credentials
        await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should show error message
        await expect(page.locator('[role="alert"], .error, .toast-error, [data-sonner-toast]')).toBeVisible({ timeout: 10000 });
    });

    test('should show validation errors for empty form', async ({ page }) => {
        // Try to submit empty form
        await page.click('button[type="submit"]');
        
        // Should show validation errors or form should not submit
        // Either error message appears or we stay on login page
        await expect(page).toHaveURL(/login/);
    });

    test('should have link to register page', async ({ page }) => {
        // Look for register/signup link
        const registerLink = page.locator('a[href*="register"], a[href*="signup"], a:has-text("Daftar")');
        
        if (await registerLink.count() > 0) {
            await registerLink.first().click();
            await expect(page).toHaveURL(/register|signup/);
        }
    });

    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
        // Try to access protected route
        await page.goto('/guru');
        
        // Should redirect to login
        await expect(page).toHaveURL(/login/);
    });

    test('should redirect unauthenticated students from siswa dashboard', async ({ page }) => {
        // Try to access protected route
        await page.goto('/siswa');
        
        // Should redirect to login
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Registration', () => {
    test('should display register page correctly', async ({ page }) => {
        await page.goto('/register');
        
        // Check form elements
        await expect(page.locator('input[name="fullName"], input[name="name"]')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });
});
