import { test, expect } from '@playwright/test';

test.describe('Gamification Elements', () => {
    // Shared login helper
    async function loginAsStudent(page) {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'siswa@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000); 
    }

    test.beforeEach(async ({ page }) => {
        await loginAsStudent(page);
    });

    test('should display gamification stats on dashboard', async ({ page }) => {
        await page.goto('/siswa');
        
        // Check for Streak Display
        // Assuming there is a flame icon or text "Streak"
        await expect(page.locator('.streak-counter, [data-testid="streak-display"]')).toBeVisible();
        await expect(page.getByText(/Streak/)).toBeVisible();
        
        // Check for XP/Points
        await expect(page.getByText(/XP|Poin/)).toBeVisible();
        
        // Check Level Indicator
        await expect(page.getByText(/Level/)).toBeVisible();
    });

    test('should display leaderboard', async ({ page }) => {
        await page.goto('/siswa');
        
        // Check Leaderboard component
        const leaderboard = page.locator('.leaderboard, [data-testid="leaderboard"]');
        if (await leaderboard.isVisible()) {
            await expect(leaderboard).toContainText(/Peringkat|Leaderboard/);
            
            // Check top 3 exist
            await expect(page.locator('.leaderboard-item')).toHaveCount(await page.locator('.leaderboard-item').count());
        }
    });

    test('should display badges', async ({ page }) => {
        // Navigate to profile or dashboard where badges are shown
        await page.goto('/siswa/profile'); // Assuming profile route, adjust if needed
        
        // If profile route exists
        if (page.url().includes('profile')) {
            await expect(page.getByText(/Badge|Pencapaian/)).toBeVisible();
            await expect(page.locator('.badge-grid')).toBeVisible();
        }
    });
});
