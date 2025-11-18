// @ts-check
const { test } = require('@playwright/test');

/**
 * Interactive UI Development Tests
 *
 * Run with: npx playwright test tests/ui-dev.spec.js --headed --debug
 *
 * This opens a browser you can interact with while developing UI/UX.
 * Use this to test interactions, styling, and responsive behavior.
 */

test.describe('Interactive UI Development', () => {

  test('explore student dashboard', async ({ page }) => {
    await page.goto('http://localhost:5050');

    // Pause for manual interaction
    // You can now interact with the page in the browser
    await page.pause();
  });

  test('explore admin panel', async ({ page }) => {
    await page.goto('http://localhost:5050/admin');

    // Add some helpful logging
    console.log('📍 Admin Panel loaded');
    console.log('💡 Use the Playwright Inspector to interact with elements');

    await page.pause();
  });

  test('explore teacher panel', async ({ page }) => {
    await page.goto('http://localhost:5050/teacher');

    console.log('📍 Teacher Panel loaded');

    await page.pause();
  });

  test('test responsive - mobile', async ({ page }) => {
    // Set to iPhone size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5050');

    console.log('📱 Mobile viewport (375x667)');

    await page.pause();
  });

  test('test responsive - tablet', async ({ page }) => {
    // Set to iPad size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5050/admin');

    console.log('📱 Tablet viewport (768x1024)');

    await page.pause();
  });

  test('test all viewports', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      console.log(`\n📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:5050');
      await page.waitForLoadState('networkidle');

      // Pause to review this viewport
      await page.pause();
    }
  });
});
