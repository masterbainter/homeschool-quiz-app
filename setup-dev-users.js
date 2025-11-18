#!/usr/bin/env node

/**
 * Development Environment User Setup
 *
 * This script sets up test users in the Firebase Emulator for local development.
 * Run this after starting the emulators to quickly populate test data.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK to connect to emulators
admin.initializeApp({
    projectId: 'homeschool-quiz-app',
    databaseURL: 'http://localhost:9000?ns=homeschool-quiz-app-default-rtdb'
});

// Connect to Database Emulator
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';

const db = admin.database();

async function setupTestUsers() {
    console.log('🔧 Setting up test users in Firebase Emulator...\n');

    try {
        // Define test roles
        const roles = {
            admins: [
                'admin@test.com',
                'techride.trevor@gmail.com'
            ],
            teachers: [
                'teacher@test.com',
                'iyoko.bainter@gmail.com'
            ],
            students: [
                'student@test.com',
                'student2@test.com'
            ]
        };

        // Write to database
        await db.ref('user-roles').set(roles);
        console.log('✅ User roles created successfully!\n');

        // Display the roles
        console.log('📋 Test Users Created:');
        console.log('━'.repeat(60));

        console.log('\n👨‍💼 ADMINS (full access):');
        roles.admins.forEach(email => console.log(`   • ${email}`));

        console.log('\n👩‍🏫 TEACHERS (can manage quizzes and students):');
        roles.teachers.forEach(email => console.log(`   • ${email}`));

        console.log('\n👨‍🎓 STUDENTS (can take quizzes):');
        roles.students.forEach(email => console.log(`   • ${email}`));

        console.log('\n' + '━'.repeat(60));
        console.log('\n📝 Next Steps:');
        console.log('1. Open http://localhost:4040 (Emulator UI)');
        console.log('2. Go to Authentication tab');
        console.log('3. Click "Add User" and create an account with one of the emails above');
        console.log('4. Use any password (e.g., "password123")');
        console.log('5. Go to http://localhost:5050 and sign in!');
        console.log('\n✨ All done! Your test users are ready.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up test users:', error);
        process.exit(1);
    }
}

// Run the setup
setupTestUsers();
