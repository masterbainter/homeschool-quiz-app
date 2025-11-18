// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
// Get these from Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet

const firebaseConfig = {
    apiKey: "AIzaSyDwjdhtou4EfG1xXTsNBAE-LXpjmiabUHg",
    authDomain: "homeschool-quiz-app.firebaseapp.com",
    databaseURL: "https://homeschool-quiz-app-default-rtdb.firebaseio.com",
    projectId: "homeschool-quiz-app",
    storageBucket: "homeschool-quiz-app.firebasestorage.app",
    messagingSenderId: "766668921569",
    appId: "1:766668921569:web:374935fa8d27a6478eb5a0"
};

// Detect if running on localhost or Tailscale (development environment)
const isLocalDev = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost') ||
                   window.location.hostname === 'omarchy';

// Get the current hostname for emulator connections
const emulatorHost = window.location.hostname;

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);

    // Connect to Firebase Emulators when running locally or via Tailscale
    if (isLocalDev) {
        console.log('🔧 DEVELOPMENT MODE: Connecting to Firebase Emulators');
        console.log('   → Host:', emulatorHost);
        console.log('   → Database:', `${emulatorHost}:9000`);
        console.log('   → Auth:', `${emulatorHost}:9099`);
        console.log('   → Functions:', `${emulatorHost}:5001`);
        console.log('   ⚠️  Local data will NOT affect production!');

        // Connect to emulators using the current hostname
        firebase.database().useEmulator(emulatorHost, 9000);
        firebase.auth().useEmulator(`http://${emulatorHost}:9099`);
        firebase.functions().useEmulator(emulatorHost, 5001);
    } else {
        console.log('🌐 PRODUCTION MODE: Connected to Firebase Cloud');
        console.log('   → Environment:', window.location.hostname);
    }

    console.log('Firebase initialized successfully!');
} catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('The app will work locally without Firebase, but results won\'t be saved.');
}
