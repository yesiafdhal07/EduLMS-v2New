import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for EduLMS E2E Tests
 * 
 * Run tests:
 *   npx playwright test
 * 
 * Run with UI:
 *   npx playwright test --ui
 * 
 * Run specific file:
 *   npx playwright test e2e/auth.spec.ts
 */

export default defineConfig({
    testDir: './e2e',
    
    // Run tests in parallel
    fullyParallel: true,
    
    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,
    
    // Retry on CI only
    retries: process.env.CI ? 2 : 0,
    
    // Opt out of parallel tests on CI for stability
    workers: process.env.CI ? 1 : undefined,
    
    // Reporter to use
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],
    
    // Shared settings for all projects
    use: {
        // Base URL to use in tests
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        
        // Collect trace when retrying the failed test
        trace: 'on-first-retry',
        
        // Take screenshot on failure
        screenshot: 'only-on-failure',
        
        // Record video on failure
        video: 'on-first-retry',
    },
    
    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Mobile viewport
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
    
    // Run local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
