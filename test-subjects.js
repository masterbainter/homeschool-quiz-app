#!/usr/bin/env node

/**
 * Selenium Test for Subjects Functionality
 *
 * This script tests the subjects page and navigation
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testSubjects() {
    console.log('🧪 Starting Selenium tests for subjects...\n');

    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    let driver;

    try {
        // Create WebDriver
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('✅ Chrome driver initialized\n');

        // Test 1: Load main page
        console.log('📋 Test 1: Loading homepage...');
        await driver.get('http://localhost:5050/');
        await driver.sleep(2000); // Wait for page load

        const title = await driver.getTitle();
        console.log(`   Page title: "${title}"`);
        console.log('   ✅ Homepage loaded\n');

        // Test 2: Check for subjects navigation link
        console.log('📋 Test 2: Checking for subjects navigation...');
        try {
            const subjectsLink = await driver.wait(
                until.elementLocated(By.css('a[href="/subjects"]')),
                5000
            );
            const linkText = await subjectsLink.getText();
            console.log(`   Found link: "${linkText}"`);
            console.log('   ✅ Subjects navigation found\n');
        } catch (error) {
            console.log('   ❌ Subjects navigation not found');
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 3: Navigate to subjects page
        console.log('📋 Test 3: Navigating to /subjects...');
        await driver.get('http://localhost:5050/subjects');
        await driver.sleep(2000);

        const subjectsPageTitle = await driver.getTitle();
        console.log(`   Page title: "${subjectsPageTitle}"`);

        // Get page source to check content
        const pageSource = await driver.getPageSource();

        // Check for loading section
        if (pageSource.includes('loading-section')) {
            console.log('   Found: Loading section');
        }

        // Check for subject section
        if (pageSource.includes('subject-section')) {
            console.log('   Found: Subject section');
        }

        console.log('   ✅ Subjects page loaded\n');

        // Test 4: Check for Firebase scripts
        console.log('📋 Test 4: Checking for Firebase initialization...');
        const scripts = await driver.findElements(By.css('script[src*="firebase"]'));
        console.log(`   Found ${scripts.length} Firebase script tags`);

        if (scripts.length > 0) {
            console.log('   ✅ Firebase scripts present\n');
        } else {
            console.log('   ⚠️  No Firebase scripts found\n');
        }

        // Test 5: Wait for content to load
        console.log('📋 Test 5: Waiting for subjects content...');
        await driver.sleep(3000); // Give time for Firebase to load

        // Take screenshot
        const screenshot = await driver.takeScreenshot();
        require('fs').writeFileSync('/home/masterbainter/1.projects/homeschool/test-screenshot.png', screenshot, 'base64');
        console.log('   📸 Screenshot saved: test-screenshot.png');

        // Check for subject cards or error messages
        const bodyText = await driver.findElement(By.css('body')).getText();
        console.log('\n   Page content preview:');
        console.log('   ' + bodyText.substring(0, 200).replace(/\n/g, '\n   '));

        // Check if any error messages
        if (bodyText.includes('Not Found') || bodyText.includes('Access Denied')) {
            console.log('\n   ⚠️  Warning: Page shows error state');
        }

        if (bodyText.includes('Loading')) {
            console.log('\n   ⚠️  Warning: Page stuck in loading state');
        }

        // Test 6: Check Firebase connection
        console.log('\n📋 Test 6: Checking browser console for errors...');
        const logs = await driver.manage().logs().get('browser');

        if (logs.length > 0) {
            console.log('   Browser console logs:');
            logs.forEach(log => {
                if (log.level.name === 'SEVERE' || log.level.name === 'WARNING') {
                    console.log(`   [${log.level.name}] ${log.message}`);
                }
            });
        } else {
            console.log('   ✅ No console errors\n');
        }

        // Test 7: Check subjects listing page
        console.log('📋 Test 7: Testing subjects listing page...');
        await driver.get('http://localhost:5050/subjects');
        await driver.sleep(3000);

        const listingPageText = await driver.findElement(By.css('body')).getText();
        if (listingPageText.includes('Browse Subjects') || listingPageText.includes('Mathematics')) {
            console.log('   ✅ Subjects listing page loaded');
        } else {
            console.log('   ⚠️  Subjects listing page did not load correctly');
            console.log('   Page content:', listingPageText.substring(0, 200));
        }

        // Test 8: Check subject detail page with parameters
        console.log('\n📋 Test 8: Testing subject detail page with parameters...');
        await driver.get('http://localhost:5050/subjects/detail.html?subject=mathematics');
        await driver.sleep(3000);

        const mathPageText = await driver.findElement(By.css('body')).getText();
        if (mathPageText.includes('Mathematics') && mathPageText.includes('section')) {
            console.log('   ✅ Mathematics subject detail page loaded');
        } else {
            console.log('   ⚠️  Mathematics subject detail page did not load correctly');
            console.log('   Page content:', mathPageText.substring(0, 200));
        }

        console.log('\n' + '='.repeat(60));
        console.log('🏁 Tests completed!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
    } finally {
        if (driver) {
            await driver.quit();
            console.log('\n✅ Browser closed');
        }
    }
}

// Run tests
testSubjects().catch(console.error);
