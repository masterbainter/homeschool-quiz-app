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

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully!');
} catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('The app will work locally without Firebase, but results won\'t be saved.');
}
