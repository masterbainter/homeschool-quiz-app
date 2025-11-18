// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual UI Tests for Homeschool Quiz App
 *
 * These tests capture screenshots of all major pages
 * for visual regression testing and UI review.
 */

// Helper function to create a test user in Firebase Auth Emulator
async function createTestUser(page, email, password = 'password123') {
  // Go to emulator UI
  await page.goto('http://localhost:4040/auth');

  // Add user via emulator UI
  // Note: This is a simplified version - you may need to adjust based on emulator UI
  await page.click('text=Add User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Save")');
}

// Helper function to sign in
async function signIn(page, email) {
  await page.goto('http://localhost:5050');

  // Wait for and click sign in button
  await page.click('text=Sign in with Google');

  // In emulator mode, select the test account
  // This may need adjustment based on your auth flow
  await page.waitForTimeout(1000);
}

test.describe('Student Dashboard', () => {
  test('should display student dashboard correctly', async ({ page }) => {
    await page.goto('http://localhost:5050');

    // Take screenshot of login page
    await page.screenshot({ path: 'tests/screenshots/01-login-page.png', fullPage: true });

    // Note: For full testing, you'd sign in here
    // For now, just capturing the initial state
  });
});

test.describe('Admin Panel', () => {
  test('should display admin panel layout', async ({ page }) => {
    await page.goto('http://localhost:5050/admin');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/02-admin-panel.png', fullPage: true });
  });

  test('should display user management page', async ({ page }) => {
    await page.goto('http://localhost:5050/admin/users');

    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/03-user-management.png', fullPage: true });
  });
});

test.describe('Teacher Panel', () => {
  test('should display teacher panel layout', async ({ page }) => {
    await page.goto('http://localhost:5050/teacher');

    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/04-teacher-panel.png', fullPage: true });
  });

  test('should display books page', async ({ page }) => {
    await page.goto('http://localhost:5050/teacher/books');

    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/05-teacher-books.png', fullPage: true });
  });

  test('should display students page', async ({ page }) => {
    await page.goto('http://localhost:5050/teacher/students');

    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/06-teacher-students.png', fullPage: true });
  });
});

test.describe('Responsive Design', () => {
  test('mobile viewport - dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('http://localhost:5050');

    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/07-mobile-dashboard.png', fullPage: true });
  });

  test('tablet viewport - admin panel', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('http://localhost:5050/admin');

    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/08-tablet-admin.png', fullPage: true });
  });
});

test.describe('Environment Indicator', () => {
  test('should show DEV MODE badge on localhost', async ({ page }) => {
    await page.goto('http://localhost:5050');

    // Wait for environment indicator to load
    await page.waitForTimeout(500);

    // Check for DEV MODE badge
    const badge = await page.locator('#env-indicator').textContent();
    expect(badge).toContain('DEV MODE');

    await page.screenshot({ path: 'tests/screenshots/09-dev-badge.png' });
  });
});
