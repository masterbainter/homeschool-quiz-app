# UI/UX Development with Playwright

This guide shows you how to use Playwright for interactive UI/UX development and testing.

## Quick Start

### 1. Make sure emulators are running

```bash
npm run dev
```

### 2. Set up test users (if not done already)

```bash
npm run setup-dev
```

### 3. Launch interactive UI explorer

```bash
npm run ui:explore
```

This opens a browser with Playwright Inspector where you can:
- ✅ Interact with your app in real-time
- ✅ Inspect elements and their properties
- ✅ Test responsive design at different viewports
- ✅ Take screenshots
- ✅ Record user interactions

## Available Commands

### Interactive Development

```bash
# Open interactive browser to explore UI
npm run ui:explore

# Test mobile viewport (iPhone)
npm run ui:mobile

# Run visual tests with browser visible
npm run test:ui:headed

# Debug mode with step-by-step controls
npm run test:ui:debug
```

### Screenshot Generation

```bash
# Generate screenshots of all pages
npm run test:screenshots

# Run all UI tests (headless)
npm run test:ui

# View test results report
npm run ui:report
```

## How to Use Playwright for UI Development

### Method 1: Interactive Explorer (Recommended)

1. **Start the explorer:**
   ```bash
   npm run ui:explore
   ```

2. **Choose a test to run:**
   - "explore student dashboard" - View the main student interface
   - "explore admin panel" - Work on admin UI
   - "explore teacher panel" - Test teacher interface
   - "test responsive - mobile" - See mobile view
   - "test responsive - tablet" - See tablet view
   - "test all viewports" - Cycle through all screen sizes

3. **Use the Playwright Inspector:**
   - **Play button (▶)**: Run the test step by step
   - **Step over**: Execute current action and pause
   - **Pause**: Stop at current state for manual testing
   - **Pick locator**: Click to select elements on the page
   - **Console**: View page logs and errors

4. **Interact with the app:**
   - Click around, test features
   - Resize the browser window
   - Open DevTools (F12) to inspect CSS
   - Make changes to your code and refresh to see them

### Method 2: Screenshot Comparison

Generate screenshots to compare before/after changes:

```bash
npm run test:screenshots
```

Screenshots are saved to `tests/screenshots/`:
- `01-login-page.png`
- `02-admin-panel.png`
- `03-user-management.png`
- `04-teacher-panel.png`
- `05-teacher-books.png`
- `06-teacher-students.png`
- `07-mobile-dashboard.png`
- `08-tablet-admin.png`
- `09-dev-badge.png`

### Method 3: Responsive Testing

Test different device sizes:

```bash
# Mobile
npm run ui:mobile

# Or use the "test all viewports" test
npm run ui:explore
# Then select: "test all viewports"
```

Viewports tested:
- **Mobile**: 375x667 (iPhone)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1280x720
- **Large Desktop**: 1920x1080

## Common UI Development Workflow

### 1. Identify UI issues

Run the explorer and navigate to problem areas:
```bash
npm run ui:explore
```

### 2. Take baseline screenshots

Before making changes:
```bash
npm run test:screenshots
```

### 3. Make your changes

Edit CSS, HTML, or JS files in your editor.

### 4. Test changes interactively

Refresh the Playwright browser to see changes, or run:
```bash
npm run ui:explore
```

### 5. Compare screenshots

After changes, run screenshots again and compare:
```bash
npm run test:screenshots
```

### 6. Test on multiple devices

Use the viewports test to ensure responsive design works:
```bash
npm run ui:explore
# Select "test all viewports"
```

## Playwright Inspector Features

When running `npm run ui:explore`, you get:

### 🎯 Element Picker
Click the crosshair icon to select any element on the page. You'll see:
- Element selector
- CSS properties
- Computed styles
- Box model

### 📝 Action Recorder
Click "Record" to record your interactions:
- Clicks
- Form fills
- Navigation
- Generates test code automatically

### 🔍 Locator Testing
Test CSS selectors and XPath expressions to find elements.

### 📸 Screenshot Tool
Take screenshots of specific elements or full page.

### 🐛 Console Access
View all console logs, warnings, and errors from the page.

## Tips for UI/UX Development

### Check Multiple Browsers

The config includes Chrome, Firefox, Safari, and mobile browsers:

```bash
# Run on all browsers
npm run test:ui

# Or specify one
npx playwright test --project=firefox
npx playwright test --project="Mobile Safari"
```

### Test Dark Mode

Add to your browser while in Playwright Inspector:
```javascript
// In browser console:
document.documentElement.classList.add('dark-mode');
```

### Accessibility Testing

Check color contrast and accessibility in DevTools:
1. Open Playwright Inspector
2. Press F12 to open DevTools
3. Go to "Lighthouse" tab
4. Run accessibility audit

### Performance Testing

Use DevTools Performance panel:
1. Open Playwright Inspector
2. Press F12
3. Go to "Performance" tab
4. Record page load or interaction

## Troubleshooting

### Emulator not running

Make sure Firebase emulators are running on port 5050:
```bash
npm run dev
```

### Port conflicts

If port 5050 is in use, Playwright will fail. Check `firebase.json` and ensure hosting is on 5050.

### Browser not opening

Some systems may need additional dependencies. Try:
```bash
npx playwright install --with-deps chromium
```

### Screenshots look wrong

Make sure to wait for the page to fully load:
```javascript
await page.waitForLoadState('networkidle');
```

## Next Steps

1. **Review current UI** - Use `npm run test:screenshots` to capture current state
2. **Identify improvements** - Note spacing, colors, typography issues
3. **Make changes** - Edit design-system.css or component styles
4. **Test changes** - Use `npm run ui:explore` to verify
5. **Compare** - Run screenshots again to see differences

## Advanced: Custom Tests

Create your own UI tests in `tests/` directory:

```javascript
// tests/my-custom-test.spec.js
const { test, expect } = require('@playwright/test');

test('my custom UI test', async ({ page }) => {
  await page.goto('http://localhost:5050/admin');

  // Test specific elements
  await expect(page.locator('h1')).toContainText('Admin Panel');

  // Take screenshot
  await page.screenshot({ path: 'my-screenshot.png' });

  // Pause for manual inspection
  await page.pause();
});
```

Run it:
```bash
npx playwright test tests/my-custom-test.spec.js --headed --debug
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Inspector Guide](https://playwright.dev/docs/debug#playwright-inspector)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)
