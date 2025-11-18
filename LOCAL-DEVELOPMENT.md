# Local Development Guide

This guide explains how to run the Homeschool Quiz App locally without affecting production data or requiring Cloudflare cache purges.

## Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project access

## Quick Start

### 1. Start Local Development Server

```bash
npm run dev
```

This will start:
- **Hosting**: http://localhost:5050 (your app)
- **Emulator UI**: http://localhost:4040 (Firebase Emulator dashboard)
- **Database**: localhost:9000
- **Functions**: localhost:5001
- **Auth**: localhost:9099

### 2. Set Up Test Users (First Time Only)

```bash
npm run setup-dev
```

This creates test users with different roles:
- **Admin**: `admin@test.com` (full access)
- **Teacher**: `teacher@test.com` (manage quizzes)
- **Student**: `student@test.com` (take quizzes)

### 3. Create Authentication Accounts

1. Open **http://localhost:4040** (Emulator UI)
2. Click **"Authentication"** tab
3. Click **"Add User"**
4. Enter one of the test emails (e.g., `admin@test.com`)
5. Enter any password (e.g., `password123`)
6. Click **"Save"**

### 4. Sign In to the App

1. Open **http://localhost:5050**
2. Click **"Sign in with Google"**
3. Select the test account you created
4. You're in! The app will recognize your role (admin/teacher/student)

## Available npm Scripts

```bash
# Start emulators (basic)
npm run dev

# Set up test users (run once after starting emulators)
npm run setup-dev

# Start emulators with data import/export
npm run dev:ui

# Run only hosting (lightweight, no emulators)
npm run dev:hosting

# Deploy to production
npm run deploy

# Deploy everything (hosting + functions)
npm run deploy:full

# Deploy only functions
npm run deploy:functions

# Export emulator data (save current state)
npm run export:data

# Import emulator data (load saved state)
npm run import:data
```

## How It Works

### Emulators vs Production

**Local Development (Emulators)**
- URL: http://localhost:5000
- Data: Isolated local database (completely separate from production)
- Functions: Run locally
- Auth: Local authentication (test accounts only)
- No cache issues
- Instant refresh on file changes
- Visual indicator: 🔧 **DEV MODE** badge (purple)

**Production**
- URL: https://school.bainter.xyz
- Data: Firebase production database (real data)
- Functions: Cloud Functions
- Auth: Firebase Auth (real accounts)
- Cloudflare caching
- Requires deployment
- Visual indicator: 🌐 **PRODUCTION** badge (pink)

### 🔒 Data Isolation Guarantee

**Your local development environment is 100% isolated from production:**

1. **Automatic Detection**: The app automatically detects when running on `localhost`
2. **Emulator Connection**: Connects to local emulators instead of Firebase Cloud
3. **Separate Databases**: Local data is stored in emulator memory, never touches production
4. **Visual Confirmation**: Environment badge always shows which mode you're in
5. **Console Logging**: Check browser console for connection details

**To verify you're isolated:**
1. Open http://localhost:5000
2. Check bottom-right corner for 🔧 **DEV MODE** badge
3. Open browser console (F12)
4. Look for: `🔧 DEVELOPMENT MODE: Connecting to Firebase Emulators`
5. You'll see connections to `localhost:9000`, `localhost:9099`, etc.

**In production (school.bainter.xyz):**
1. Badge shows: 🌐 **PRODUCTION**
2. Console shows: `🌐 PRODUCTION MODE: Connected to Firebase Cloud`

### Firebase Configuration

The emulators are configured in `firebase.json`:

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "database": { "port": 9000 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

## Development Workflow

### Making Changes

1. **Start the emulators**:
   ```bash
   npm run dev
   ```

2. **Make your changes** to HTML/CSS/JS files

3. **Refresh browser** (Ctrl+R or Cmd+R)
   - Changes are instant, no deployment needed!
   - No cache purging required

4. **Test thoroughly** in local environment

5. **Deploy to production** when ready:
   ```bash
   npm run deploy
   ```

### Working with Data

**Option 1: Start Fresh (Default)**
- Each time you start emulators, you get a clean database
- Good for testing from scratch

**Option 2: Save & Restore Data**

Save your current emulator state:
```bash
npm run export:data
```

Start with saved data:
```bash
npm run dev:ui
```

This creates an `emulator-data/` folder with your test data.

### Testing Firebase Functions Locally

The emulators run your Cloud Functions locally at `http://localhost:5001`.

To test the AI quiz generation:
1. Functions run in `functions/index.js`
2. They connect to local database emulator
3. All API calls work the same as production
4. Check logs in the Emulator UI

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Kill processes on specific ports
kill -9 $(lsof -t -i:5000)  # Hosting
kill -9 $(lsof -t -i:4000)  # UI
kill -9 $(lsof -t -i:9000)  # Database
kill -9 $(lsof -t -i:5001)  # Functions
kill -9 $(lsof -t -i:9099)  # Auth
```

Or change ports in `firebase.json`.

### Emulators Won't Start

Make sure Firebase CLI is up to date:
```bash
npm install -g firebase-tools
```

### Data Not Persisting

Use the import/export scripts:
```bash
# Save data
npm run export:data

# Start with saved data
npm run dev:ui
```

### Functions Not Working

Check that functions dependencies are installed:
```bash
cd functions
npm install
cd ..
npm run dev
```

## Best Practices

### ✅ DO:
- Use local emulators for all development
- Test changes thoroughly locally before deploying
- Save test data with export/import if needed
- Commit code changes to git

### ❌ DON'T:
- Test directly on production (school.bainter.xyz)
- Deploy without testing locally first
- Commit the `emulator-data/` folder to git
- Purge Cloudflare cache for every small change

## Remote Access via Tailscale

The emulators are configured to bind to `0.0.0.0`, making them accessible from any device on your Tailscale network:

**Access from other devices:**
1. Open your browser on any device connected to your Tailscale network
2. Navigate to: **http://omarchy:5050**
3. You'll see the 🔧 **DEV MODE** badge showing `omarchy:5050`
4. All emulator services work remotely:
   - App interface: http://omarchy:5050
   - Emulator dashboard: http://omarchy:4040
   - Firebase Auth, Database, and Functions all connect automatically

**How it works:**
- The app automatically detects the hostname (`omarchy`) and connects to emulators on that host
- All Firebase services (Auth, Database, Functions) use the same hostname
- Data remains completely isolated from production
- Perfect for testing on mobile devices or tablets

## Production Deployment Checklist

Before deploying to production:

- [ ] Test all changes in local emulators
- [ ] Verify quiz generation works
- [ ] Check student/teacher workflows
- [ ] Test on mobile viewport (DevTools)
- [ ] Run `npm run deploy` to deploy
- [ ] Test on production URL
- [ ] Only purge Cloudflare cache if absolutely necessary

## URLs Reference

### Local Development (on the machine)
- App: http://localhost:5050
- Emulator UI: http://localhost:4040
- Database: localhost:9000
- Functions: localhost:5001

### Remote Access via Tailscale
- App: http://omarchy:5050
- Emulator UI: http://omarchy:4040
- Database: omarchy:9000
- Functions: omarchy:5001

### Production
- Main: https://school.bainter.xyz
- Firebase: https://homeschool-quiz-app.web.app
- Console: https://console.firebase.google.com/project/homeschool-quiz-app

## Need Help?

- Check Firebase Emulator docs: https://firebase.google.com/docs/emulator-suite
- View logs in Emulator UI at http://localhost:4000
- Check browser console (F12) for errors
