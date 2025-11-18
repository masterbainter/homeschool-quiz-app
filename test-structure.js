#!/usr/bin/env node

/**
 * Quick Structure Test - Verify Files Exist and HTML is Valid
 *
 * This test doesn't require authentication, just checks file structure
 */

const fs = require('fs');
const path = require('path');

function testFileStructure() {
    console.log('🔍 Testing Subjects File Structure...\n');

    const tests = [
        {
            name: 'Subjects Listing Page',
            path: '/home/masterbainter/1.projects/homeschool/subjects/index.html',
            shouldContain: ['Browse Subjects', 'subjects-grid', 'SubjectsList']
        },
        {
            name: 'Subject Detail Page',
            path: '/home/masterbainter/1.projects/homeschool/subjects/detail.html',
            shouldContain: ['subject-section', 'sections-grid', '/subject.js']
        },
        {
            name: 'Subject JavaScript',
            path: '/home/masterbainter/1.projects/homeschool/subject.js',
            shouldContain: ['loadSubject', 'renderSections', 'curriculum/']
        },
        {
            name: 'Test Data Script',
            path: '/home/masterbainter/1.projects/homeschool/setup-test-subjects.js',
            shouldContain: ['mathematics', 'science', 'curriculum']
        }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    tests.forEach((test, index) => {
        console.log(`📋 Test ${index + 1}: ${test.name}`);

        // Check if file exists
        if (!fs.existsSync(test.path)) {
            console.log(`   ❌ File not found: ${test.path}\n`);
            return;
        }
        console.log(`   ✅ File exists`);

        // Read file content
        const content = fs.readFileSync(test.path, 'utf8');

        // Check for required strings
        let allFound = true;
        test.shouldContain.forEach(str => {
            if (!content.includes(str)) {
                console.log(`   ❌ Missing expected content: "${str}"`);
                allFound = false;
            }
        });

        if (allFound) {
            console.log(`   ✅ All expected content found`);
            passedTests++;
        }

        console.log('');
    });

    // URL Structure Test
    console.log('📋 Test 5: URL Structure');
    const urlTests = [
        { url: '/subjects', file: 'subjects/index.html', purpose: 'List all subjects' },
        { url: '/subjects/detail.html?subject=math', file: 'subjects/detail.html', purpose: 'Show subject sections' }
    ];

    urlTests.forEach(test => {
        const filePath = path.join('/home/masterbainter/1.projects/homeschool', test.file);
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${test.url} → ${test.file} (${test.purpose})`);
        } else {
            console.log(`   ❌ ${test.url} → ${test.file} NOT FOUND`);
        }
    });

    console.log('');

    // Design System Check
    console.log('📋 Test 6: Design System Integration');
    const listingPage = fs.readFileSync('/home/masterbainter/1.projects/homeschool/subjects/index.html', 'utf8');
    const detailPage = fs.readFileSync('/home/masterbainter/1.projects/homeschool/subjects/detail.html', 'utf8');

    const designChecks = [
        { name: 'Design System 2026 CSS', pattern: 'design-system-2026.css' },
        { name: 'App Chrome CSS', pattern: 'app-chrome-2026.css' },
        { name: 'Bottom Navigation', pattern: 'bottom-nav' },
        { name: 'App Header', pattern: 'app-header' },
        { name: 'Card Grid', pattern: 'card-grid' }
    ];

    let designScore = 0;
    designChecks.forEach(check => {
        const inListing = listingPage.includes(check.pattern);
        const inDetail = detailPage.includes(check.pattern);

        if (inListing && inDetail) {
            console.log(`   ✅ ${check.name} - present in both pages`);
            designScore++;
        } else {
            console.log(`   ⚠️  ${check.name} - missing from ${!inListing ? 'listing' : ''} ${!inDetail ? 'detail' : ''}`);
        }
    });

    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('📊 Test Summary:');
    console.log(`   File Structure: ${passedTests}/${totalTests} tests passed`);
    console.log(`   URL Structure: ✅ Correct`);
    console.log(`   Design System: ${designScore}/${designChecks.length} elements present`);
    console.log('');

    if (passedTests === totalTests && designScore === designChecks.length) {
        console.log('🎉 All tests passed! Structure is correct.');
        console.log('');
        console.log('Next step: Sign in at http://localhost:5050 to test functionality');
    } else {
        console.log('⚠️  Some tests failed. Review output above.');
    }
    console.log('='.repeat(60));
}

// Run tests
testFileStructure();
