// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
// Get these from Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully!');
} catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('The app will work locally without Firebase, but results won\'t be saved.');
}
