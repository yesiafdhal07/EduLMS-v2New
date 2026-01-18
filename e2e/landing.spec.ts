import { test, expect } from '@playwright/test';

/**
 * Landing Page E2E Tests
 * Tests public pages and navigation
 */

test.describe('Landing Page', () => {
    test('should load landing page', async ({ page }) => {
        await page.goto('/');
        
        // Page should load without errors
        await expect(page).toHaveTitle(/EduLMS/i);
    });

    test('should have navigation elements', async ({ page }) => {
        await page.goto('/');
        
        // Check for navigation
        const nav = page.locator('nav, header');
        await expect(nav.first()).toBeVisible();
    });

    test('should have login/register CTAs', async ({ page }) => {
        await page.goto('/');
        
        // Look for login or register buttons/links
        const loginLink = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Masuk")');
        
        // At least one should exist
        const count = await loginLink.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should navigate to login from landing', async ({ page }) => {
        await page.goto('/');
        
        // Click login link
        const loginLink = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Masuk")').first();
        
        if (await loginLink.isVisible()) {
            await loginLink.click();
            await expect(page).toHaveURL(/login/);
        }
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        
        // Check mobile menu exists or content is visible
        await expect(page.locator('body')).toBeVisible();
        
        // No horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
    });
});

test.describe('Page Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;
        
        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('should have no console errors on landing', async ({ page }) => {
        const errors: string[] = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.goto('/');
        await page.waitForTimeout(2000);
        
        // Filter out known acceptable errors
        const realErrors = errors.filter(e => 
            !e.includes('favicon') && 
            !e.includes('Failed to load resource')
        );
        
        expect(realErrors.length).toBe(0);
    });
});
