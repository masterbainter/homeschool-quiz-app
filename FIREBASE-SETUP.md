# Firebase Setup Guide for Homeschool Quiz App

Complete guide to setting up Firebase with Google Authentication and admin access.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `homeschool-quiz-app` (or your preferred name)
4. Disable Google Analytics (optional for simplicity)
5. Click **"Create project"**
6. Wait for project creation to complete

## Step 2: Enable Google Authentication

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Click on **"Google"**
5. Toggle **"Enable"**
6. Select a support email (your email)
7. Click **"Save"**

### Add Authorized Domain

1. Still in Authentication > Sign-in method
2. Scroll down to **"Authorized domains"**
3. Add your custom domain: `school.bainter.xyz`
4. GitHub Pages domain is already authorized: `masterbainter.github.io`

## Step 3: Create Realtime Database

1. Click **"Realtime Database"** in the left sidebar
2. Click **"Create Database"**
3. Choose location closest to you (e.g., `us-central1`)
4. Start in **"Test mode"** for now (we'll secure it later)
5. Click **"Enable"**

## Step 4: Set Up Database Security Rules

1. In Realtime Database, click the **"Rules"** tab
2. Replace the existing rules with:

```json
{
  "rules": {
    "quizzes": {
      ".read": "auth != null",
      ".write": "auth.token.email === 'techride.trevor@gmail.com'",
      "$quizId": {
        ".validate": "newData.hasChildren(['title', 'questions'])"
      }
    },
    "quiz-results": {
      ".read": "auth.token.email === 'techride.trevor@gmail.com'",
      ".write": "auth != null",
      "$resultId": {
        ".validate": "newData.hasChildren(['userId', 'userName', 'quiz', 'score', 'total', 'percentage', 'timestamp'])"
      }
    },
    "todos": {
      ".read": "auth != null && (root.child('todos').child(auth.uid).exists() || auth.token.email === 'techride.trevor@gmail.com')",
      "$userId": {
        ".read": "auth.uid === $userId || auth.token.email === 'techride.trevor@gmail.com'",
        ".write": "auth.uid === $userId",
        "$todoId": {
          ".validate": "newData.hasChildren(['text', 'completed', 'createdAt', 'userId'])"
        }
      }
    }
  }
}
```

3. Click **"Publish"**

### What These Rules Do:

- **quizzes**: Anyone logged in can read, only techride.trevor@gmail.com can write/edit
- **quiz-results**: Only techride.trevor@gmail.com can read all results, anyone can write their own
- **todos**: Users can only read/write their own todos, admin can see all todos

**Note:** Admin access is hardcoded to the email `techride.trevor@gmail.com` in both the client code and database rules. No need to manually add admins to the database.

## Step 5: Get Firebase Configuration

1. Click the gear icon ⚙️ next to **"Project Overview"**
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the web icon **`</>`** (looks like `</>`)
5. Enter app nickname: `Quiz App`
6. **Do NOT** check "Set up Firebase Hosting"
7. Click **"Register app"**
8. Copy the `firebaseConfig` object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 6: Update Your Code

1. Open `firebase-config.js` in your project
2. Replace the placeholder config with your actual Firebase config
3. Save the file

## Step 7: Admin Access

Admin access is automatically granted to `techride.trevor@gmail.com`.

When you sign in with this email:
- The **Admin Panel** button will appear
- You can access `/admin` to manage quizzes
- You can view all quiz results in Firebase Console

**No database setup needed** - the email is hardcoded in the application for security.

## Step 8: Deploy Updated Code

```bash
# Add changes
git add .

# Commit
git commit -m "Add Google authentication and admin panel"

# Push to GitHub
git push

# Wait 1-2 minutes for GitHub Pages to update
```

## Step 9: Test Everything

1. **Test Login:**
   - Go to https://school.bainter.xyz (or `/`)
   - Click "Sign in with Google"
   - Verify you can sign in

2. **Test Admin Access (with techride.trevor@gmail.com):**
   - After signing in, look for "Admin Panel" button
   - Click it or go to `/admin`
   - Verify you can access the admin panel

3. **Test Quiz Creation:**
   - In admin panel (`/admin`), click "Add New Quiz"
   - Create a test quiz
   - Save it
   - Go back to main app (`/`) and verify it appears

## Troubleshooting

### "Error: Firebase not configured"

- Make sure you updated `firebase-config.js` with your actual config
- Verify all values are correct (no placeholder text)
- Push changes to GitHub and wait for deployment

### "Sign in failed"

- Check that Google authentication is enabled in Firebase Console
- Verify `school.bainter.xyz` is in authorized domains
- Check browser console for specific error messages

### "Admin Panel button doesn't appear"

- Verify you're signed in with `techride.trevor@gmail.com`
- Try signing out and back in
- Check browser console for errors
- Other emails will not have admin access

### "Access Denied in Admin Panel"

- Only `techride.trevor@gmail.com` can access the admin panel
- Sign in with the correct Google account
- Check browser console: `firebase.auth().currentUser.email` should show the admin email

### Database permission errors

- Verify you published the security rules correctly
- Check that rules don't have syntax errors
- Try accessing with authentication first

## Security Best Practices

1. **Keep your Firebase config public:** It's safe to commit to GitHub - it's designed to be public
2. **Security rules protect your data:** The rules ensure only admins can modify quizzes
3. **Never add sensitive data:** Don't put passwords or secrets in the database
4. **Regular backups:** Export your database periodically from Firebase Console
5. **Monitor usage:** Check Authentication and Database tabs for unusual activity

## Database Structure

Your Firebase Realtime Database will have this structure:

```
root
├── quizzes
│   └── [quizId]
│       ├── title: "Book Title"
│       ├── description: "Description"
│       ├── questions: [...]
│       ├── createdAt: "2024-01-01T00:00:00Z"
│       ├── createdBy: "userId"
│       ├── updatedAt: "2024-01-01T00:00:00Z"
│       └── updatedBy: "userId"
└── quiz-results
    └── [resultId]
        ├── userId: "user123"
        ├── userName: "John Doe"
        ├── userEmail: "john@example.com"
        ├── quiz: "Charlotte's Web"
        ├── quizId: "charlottes-web"
        ├── score: 8
        ├── total: 10
        ├── percentage: 80
        └── timestamp: "2024-01-01T00:00:00Z"
```

## Adding More Admins

To add additional admin users, you need to modify the code:

1. Edit `app.js` and `admin.js`
2. Find the line: `const ADMIN_EMAIL = 'techride.trevor@gmail.com';`
3. Change or add additional email checks
4. Update Firebase security rules to include the new email
5. Commit and push to GitHub

## Next Steps

- Start creating quizzes for the books your kids are reading!
- Check quiz results in Firebase Console under `quiz-results`
- Customize the app styling if desired
- Add more subjects (math, science, etc.)

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify Firebase configuration
3. Check database security rules
4. Review this guide step by step
