import { test, expect } from '@playwright/test';

test.describe('Quiz Assessment Flow', () => {
    // Shared login helper
    async function loginAsStudent(page) {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'siswa@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000); // Allow auth state to settle
    }

    test.beforeEach(async ({ page }) => {
        await loginAsStudent(page);
    });

    test('should allow student to take a quiz', async ({ page }) => {
        // Navigate to student dashboard
        await page.goto('/siswa');
        
        // Click on a class (assuming at least one class exists)
        await page.locator('.card-class, .class-card').first().click();
        
        // Navigate to Assignments/Quiz tab
        await page.getByText(/Tugas|Kuis/i).click();
        
        // Click on a "Start Quiz" button
        // Looking for a button that says "Mulai" or "Kerjakan"
        const startButton = page.locator('button:has-text("Mulai"), button:has-text("Kerjakan")').first();
        
        if (await startButton.isVisible()) {
            await startButton.click();
            
            // Verify we are in quiz player
            await expect(page).toHaveURL(/quiz/);
            await expect(page.locator('.quiz-timer')).toBeVisible();
            await expect(page.locator('.progress-bar')).toBeVisible(); // Check new progress bar
            
            // Answer questions
            // Select first option for multiple choice
            const options = page.locator('.option-radio, input[type="radio"]');
            if (await options.count() > 0) {
                await options.first().click();
            }
            
            // Navigate next if exists
            const nextButton = page.locator('button:has-text("Selanjutnya")');
            if (await nextButton.isVisible()) {
                await nextButton.click();
            }
            
            // Submit quiz
            await page.getByText('Kumpulkan').click();
            
            // Confirm submission modal
            await page.getByText('Ya, Kumpulkan').click();
            
            // Verify results
            await expect(page.getByText(/Nilai|Skor/)).toBeVisible();
        } else {
            console.log('No active quiz found to test');
        }
    });

    test('should prevent double submission', async ({ page }) => {
        // Navigate directly to a quiz if ID was known, otherwise skip
        // This test mocks the scenario or relies on specific setup
        test.skip('Requires specific quiz ID setup');
    });
});
