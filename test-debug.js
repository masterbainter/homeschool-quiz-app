#!/usr/bin/env node

/**
 * Debug Test - Check what's happening with Firebase loading
 */

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function debugTest() {
    console.log('🔍 Debugging subjects page Firebase loading...\n');

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

        console.log('✅ Driver initialized\n');

        await driver.get('http://localhost:5050/subjects');
        console.log('📋 Navigated to /subjects\n');

        await driver.sleep(5000);

        // Get all console logs
        const logs = await driver.manage().logs().get('browser');
        console.log('📋 Browser Console Logs:');
        console.log('='.repeat(60));

        logs.forEach(log => {
            console.log(`[${log.level.name}] ${log.message}`);
        });

        console.log('='.repeat(60));
        console.log('');

        // Get page text
        const bodyText = await driver.findElement(By.css('body')).getText();
        console.log('📋 Page Content:');
        console.log('='.repeat(60));
        console.log(bodyText);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

debugTest().catch(console.error);
