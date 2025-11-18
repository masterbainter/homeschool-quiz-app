#!/usr/bin/env node

/**
 * Take Screenshots of Subjects Pages for Design Review
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function takeScreenshots() {
    console.log('📸 Taking screenshots of subjects pages...\n');

    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    let driver;

    try {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('✅ Chrome driver initialized\n');

        // Screenshot 1: Subjects Listing Page (Desktop)
        console.log('📋 Screenshot 1: Subjects Listing - Desktop View');
        await driver.get('http://localhost:5050/subjects');
        await driver.sleep(6000); // Wait for Firebase to load

        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/screenshot-subjects-list-desktop.png', screenshot, 'base64');
        console.log('   ✅ Saved: screenshot-subjects-list-desktop.png\n');

        // Screenshot 2: Subjects Listing Page (Mobile)
        console.log('📋 Screenshot 2: Subjects Listing - Mobile View');
        await driver.manage().window().setRect({ width: 375, height: 812 });
        await driver.get('http://localhost:5050/subjects');
        await driver.sleep(6000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/screenshot-subjects-list-mobile.png', screenshot, 'base64');
        console.log('   ✅ Saved: screenshot-subjects-list-mobile.png\n');

        // Screenshot 3: Subject Detail Page - Mathematics (Desktop)
        console.log('📋 Screenshot 3: Mathematics Detail - Desktop View');
        await driver.manage().window().setRect({ width: 1920, height: 1080 });
        await driver.get('http://localhost:5050/subjects/detail.html?subject=mathematics');
        await driver.sleep(6000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/screenshot-subject-detail-desktop.png', screenshot, 'base64');
        console.log('   ✅ Saved: screenshot-subject-detail-desktop.png\n');

        // Screenshot 4: Subject Detail Page - Mathematics (Mobile)
        console.log('📋 Screenshot 4: Mathematics Detail - Mobile View');
        await driver.manage().window().setRect({ width: 375, height: 812 });
        await driver.get('http://localhost:5050/subjects/detail.html?subject=mathematics');
        await driver.sleep(6000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/screenshot-subject-detail-mobile.png', screenshot, 'base64');
        console.log('   ✅ Saved: screenshot-subject-detail-mobile.png\n');

        // Get page content for verification
        console.log('📋 Verifying Content...');
        await driver.manage().window().setRect({ width: 1920, height: 1080 });
        await driver.get('http://localhost:5050/subjects');
        await driver.sleep(6000);

        const bodyText = await driver.findElement(By.css('body')).getText();

        if (bodyText.includes('Mathematics') && bodyText.includes('Science')) {
            console.log('   ✅ Subjects listing showing test data\n');
        } else {
            console.log('   ⚠️  Subjects may not be loading correctly\n');
            console.log('   Content preview:', bodyText.substring(0, 300));
        }

        console.log('='.repeat(60));
        console.log('🎉 All screenshots captured!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        if (driver) {
            await driver.quit();
            console.log('\n✅ Browser closed');
        }
    }
}

takeScreenshots().catch(console.error);
