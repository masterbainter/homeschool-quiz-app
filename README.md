# Homeschool Quiz App

A kid-friendly quiz application for testing knowledge on books and other subjects. Built with vanilla JavaScript, Firebase, and deployed on GitHub Pages.

## Features

- Multiple book quizzes with instant feedback
- Score tracking and progress monitoring
- Firebase integration for storing quiz results
- Clean, colorful, kid-friendly interface
- Mobile responsive design
- No ads, secure, and simple to use

## Setup Instructions

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name it `homeschool-quiz-app` (or any name you prefer)
4. Make it **Public** (required for GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have files)
6. Click "Create repository"

### 2. Push Your Code to GitHub

Run these commands in your terminal from the project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Homeschool quiz app"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/homeschool-quiz-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "homeschool-quiz-app")
4. Disable Google Analytics (optional, but recommended for simplicity)
5. Click "Create project"

#### Create Realtime Database

1. In Firebase Console, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (select the one closest to you)
4. Start in **Test mode** (we'll secure it later)
5. Click "Enable"

#### Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview" and select "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Enter app nickname (e.g., "Quiz App")
5. **Check** "Also set up Firebase Hosting" (optional but useful)
6. Click "Register app"
7. Copy the `firebaseConfig` object

#### Update Your Code

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

3. Save the file and commit the changes:

```bash
git add firebase-config.js
git commit -m "Add Firebase configuration"
git push
```

### 4. Deploy to GitHub Pages

1. Go to your GitHub repository in your browser
2. Click "Settings" tab
3. Scroll down and click "Pages" in the left sidebar
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait 1-2 minutes for deployment
7. Your site will be available at: `https://YOUR_USERNAME.github.io/homeschool-quiz-app/`

### 5. Secure Your Firebase Database (Important!)

After testing, secure your database with proper rules:

1. Go to Firebase Console > Realtime Database
2. Click "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    "quiz-results": {
      ".read": false,
      ".write": true,
      "$result": {
        ".validate": "newData.hasChildren(['user', 'quiz', 'score', 'total', 'percentage', 'timestamp'])"
      }
    }
  }
}
```

4. Click "Publish"

This allows writing quiz results but prevents reading (for privacy).

## Adding New Quizzes

To add new book quizzes, edit `quizzes/quiz-data.js`:

```javascript
const quizzes = [
    // ... existing quizzes ...
    {
        title: "Your Book Title",
        description: "A short description",
        questions: [
            {
                question: "Your question here?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0  // Index of correct answer (0 = first option)
            },
            // Add more questions...
        ]
    }
];
```

After adding quizzes:

```bash
git add quizzes/quiz-data.js
git commit -m "Add new quiz for [Book Name]"
git push
```

GitHub Pages will auto-update in 1-2 minutes.

## Project Structure

```
homeschool/
├── index.html           # Main HTML page
├── styles.css           # All styling
├── app.js               # Main application logic
├── firebase-config.js   # Firebase configuration
├── quizzes/
│   └── quiz-data.js     # Quiz questions and answers
└── README.md            # This file
```

## Testing Locally

Simply open `index.html` in your web browser. The app will work without Firebase, but results won't be saved until you configure Firebase.

## Viewing Quiz Results

To view saved quiz results:

1. Go to Firebase Console
2. Click "Realtime Database"
3. You'll see all quiz attempts under "quiz-results"
4. Each entry shows: user, quiz name, score, percentage, and timestamp

## Future Enhancements

- Add quizzes for math, science, history
- Create user accounts with Firebase Authentication
- Add a dashboard showing quiz history and progress
- Create different difficulty levels
- Add timer option for challenges
- Export results to CSV for record keeping

## Troubleshooting

**App doesn't save results:**
- Check that Firebase config is correct in `firebase-config.js`
- Check browser console (F12) for errors
- Verify Firebase Realtime Database is created and rules allow writing

**GitHub Pages not updating:**
- Wait 2-3 minutes after pushing
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check Settings > Pages to confirm deployment status

**Quiz not loading:**
- Check browser console for JavaScript errors
- Ensure all files are pushed to GitHub
- Verify file names match exactly (case-sensitive)

## About GitHub Speckit

GitHub Speckit is a tool for managing project specifications. For this project:

1. Create a `specs/` directory in your repository
2. Add specification files for features (e.g., `quiz-feature.md`)
3. Use Speckit to track requirements and implementation status

To learn more about Speckit, visit: [GitHub Speckit Documentation](https://github.com/github/speckit)

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Review browser console for errors (Press F12)
3. Verify all setup steps were completed

## License

This project is free to use and modify for personal and educational purposes.
