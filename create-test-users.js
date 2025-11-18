#!/usr/bin/env node

/**
 * Create Test Users in Firebase Auth Emulator
 *
 * Creates actual user accounts with authentication credentials
 * for testing the homeschool app locally.
 */

const admin = require('firebase-admin');

// Connect to emulators (set before init)
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';

// Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: 'homeschool-quiz-app',
    databaseURL: 'http://localhost:9000?ns=homeschool-quiz-app-default-rtdb'
});

const auth = admin.auth();
const db = admin.database();

// Test users configuration
const testUsers = [
    {
        email: 'student@test.com',
        password: 'student123',
        displayName: 'Emma Student',
        role: 'student',
        photoURL: 'https://ui-avatars.com/api/?name=Emma+Student&background=4d9e93&color=fff'
    },
    {
        email: 'teacher@test.com',
        password: 'teacher123',
        displayName: 'Mr. Johnson',
        role: 'teacher',
        photoURL: 'https://ui-avatars.com/api/?name=Mr+Johnson&background=f97316&color=fff'
    },
    {
        email: 'admin@test.com',
        password: 'admin123',
        displayName: 'Admin User',
        role: 'admin',
        photoURL: 'https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff'
    }
];

async function createTestUsers() {
    console.log('🔧 Creating test users in Firebase Auth Emulator...\n');

    const roles = {
        admins: [],
        teachers: [],
        students: []
    };

    try {
        for (const user of testUsers) {
            console.log(`📝 Creating ${user.role}: ${user.email}...`);

            // Delete user if already exists
            try {
                const existingUser = await auth.getUserByEmail(user.email);
                await auth.deleteUser(existingUser.uid);
                console.log(`   ♻️  Deleted existing user`);
            } catch (error) {
                // User doesn't exist, that's fine
            }

            // Create the user
            const userRecord = await auth.createUser({
                email: user.email,
                password: user.password,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: true
            });

            console.log(`   ✅ Created user with UID: ${userRecord.uid}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔑 Password: ${user.password}`);
            console.log(`   👤 Name: ${user.displayName}\n`);

            // Add to roles
            if (user.role === 'admin') {
                roles.admins.push(user.email);
            } else if (user.role === 'teacher') {
                roles.teachers.push(user.email);
            } else if (user.role === 'student') {
                roles.students.push(user.email);
            }
        }

        // Write roles to database
        console.log('📊 Setting up user roles in database...');
        await db.ref('user-roles').set(roles);
        console.log('✅ Roles configured successfully!\n');

        // Summary
        console.log('='.repeat(70));
        console.log('🎉 TEST USERS CREATED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('\n📋 Login Credentials:\n');

        console.log('👨‍🎓 STUDENT:');
        console.log('   Email:    student@test.com');
        console.log('   Password: student123');
        console.log('   Name:     Emma Student\n');

        console.log('👩‍🏫 TEACHER:');
        console.log('   Email:    teacher@test.com');
        console.log('   Password: teacher123');
        console.log('   Name:     Mr. Johnson\n');

        console.log('👨‍💼 ADMIN:');
        console.log('   Email:    admin@test.com');
        console.log('   Password: admin123');
        console.log('   Name:     Admin User\n');

        console.log('='.repeat(70));
        console.log('\n🚀 Quick Start:\n');
        console.log('1. Go to http://localhost:5050');
        console.log('2. Click "Sign in with Google"');
        console.log('3. In the emulator popup, click "Add new account"');
        console.log('4. Enter one of the emails above (e.g., student@test.com)');
        console.log('5. Click "Auto-generate user info" or fill in manually');
        console.log('6. Click "Sign in with Google Account"\n');

        console.log('💡 Tip: The emulator auto-fills passwords, so you can sign in');
        console.log('         with just the email address!\n');

        console.log('🔍 View Users:');
        console.log('   Emulator UI: http://localhost:4040/auth\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating test users:', error);
        process.exit(1);
    }
}

// Run the setup
createTestUsers();
