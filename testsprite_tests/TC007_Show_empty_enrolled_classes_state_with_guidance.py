import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000/guru
        await page.goto("http://localhost:3000/guru")
        
        # -> Wait 2 seconds for the login to complete, then navigate to http://localhost:3000/siswa to check the student's enrolled-classes empty state and guidance to join a class.
        await page.goto("http://localhost:3000/siswa")
        
        # -> Navigate to /siswa (http://localhost:3000/siswa) and verify the student empty enrolled-classes state and guidance to join a class.
        await page.goto("http://localhost:3000/siswa")
        
        # -> Navigate to http://localhost:3000/siswa and verify the empty enrolled-classes state and guidance to join a class.
        await page.goto("http://localhost:3000/siswa")
        
        # -> Navigate to http://localhost:3000/siswa and inspect the page for the empty enrolled-classes state and guidance to join a class.
        await page.goto("http://localhost:3000/siswa")
        
        # -> Navigate to /siswa, wait for the page to render, and extract the visible text to verify an empty enrolled-classes state with guidance to join a class.
        await page.goto("http://localhost:3000/siswa")
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'Belum ada kelas yang diikuti')]").nth(0).is_visible(), "The student page should show guidance to join a class when there are no enrollments"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    