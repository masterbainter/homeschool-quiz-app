#!/usr/bin/env node

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function captureNewDesign() {
    console.log('📸 Capturing redesigned subjects page...\n');

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

        // Desktop view
        console.log('📋 Desktop view (1920x1080)...');
        await driver.get('http://localhost:5050/subjects/');
        await driver.sleep(6000);

        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/subjects-redesign-desktop.png', screenshot, 'base64');
        console.log('   ✅ Saved: subjects-redesign-desktop.png\n');

        // Mobile view
        console.log('📋 Mobile view (375x812)...');
        await driver.manage().window().setRect({ width: 375, height: 812 });
        await driver.get('http://localhost:5050/subjects/');
        await driver.sleep(6000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/subjects-redesign-mobile.png', screenshot, 'base64');
        console.log('   ✅ Saved: subjects-redesign-mobile.png\n');

        // Tablet view
        console.log('📋 Tablet view (768x1024)...');
        await driver.manage().window().setRect({ width: 768, height: 1024 });
        await driver.get('http://localhost:5050/subjects/');
        await driver.sleep(6000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/subjects-redesign-tablet.png', screenshot, 'base64');
        console.log('   ✅ Saved: subjects-redesign-tablet.png\n');

        console.log('='.repeat(60));
        console.log('✅ All screenshots captured!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

captureNewDesign().catch(console.error);
