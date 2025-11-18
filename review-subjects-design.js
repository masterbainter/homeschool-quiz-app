#!/usr/bin/env node

/**
 * Review Subjects Page Design
 * Compare with dashboard to identify improvements
 */

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function reviewDesign() {
    console.log('🎨 Reviewing subjects page design...\n');

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

        // Screenshot 1: Dashboard for comparison
        console.log('📸 Capturing dashboard...');
        await driver.get('http://localhost:5050/');
        await driver.sleep(3000);

        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/review-dashboard.png', screenshot, 'base64');
        console.log('   ✅ Saved: review-dashboard.png\n');

        // Screenshot 2: Current subjects page
        console.log('📸 Capturing subjects page...');
        await driver.get('http://localhost:5050/subjects/');
        await driver.sleep(6000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/review-subjects-current.png', screenshot, 'base64');
        console.log('   ✅ Saved: review-subjects-current.png\n');

        // Screenshot 3: Subjects page - scrolled down
        console.log('📸 Capturing subjects page (scrolled)...');
        await driver.executeScript('window.scrollTo(0, 500)');
        await driver.sleep(1000);

        screenshot = await driver.takeScreenshot();
        fs.writeFileSync('/home/masterbainter/1.projects/homeschool/review-subjects-scrolled.png', screenshot, 'base64');
        console.log('   ✅ Saved: review-subjects-scrolled.png\n');

        console.log('='.repeat(60));
        console.log('✅ Screenshots captured for design review');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

reviewDesign().catch(console.error);
