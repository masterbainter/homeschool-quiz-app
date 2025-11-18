# Test Users - Homeschool App

**Date**: November 18, 2025
**Status**: ✅ Users Created

---

## Test User Accounts

Three test users have been created in the Firebase Auth Emulator with different roles:

### 👨‍🎓 Student Account
```
Email:    student@test.com
Password: student123
Name:     Emma Student
Role:     Student (can view subjects, take quizzes, track progress)
```

### 👩‍🏫 Teacher Account
```
Email:    teacher@test.com
Password: teacher123
Name:     Mr. Johnson
Role:     Teacher (can manage curriculum, create quizzes, view student progress)
```

### 👨‍💼 Admin Account
```
Email:    admin@test.com
Password: admin123
Name:     Admin User
Role:     Admin (full access to all features and settings)
```

---

## How to Sign In

### Method 1: Direct Sign In (Recommended)

1. Navigate to `http://localhost:5050`
2. Click **"Sign in with Google"** button
3. The Firebase Auth Emulator popup will appear
4. Click **"Add new account"** or select an existing test user
5. Enter the email (e.g., `student@test.com`)
6. The emulator will auto-fill the rest
7. Click **"Sign in with Google Account"**

### Method 2: Via Emulator UI

1. Open Firebase Emulator UI: `http://localhost:4040`
2. Go to **Authentication** tab
3. View all created users
4. Copy credentials and use on the main app

---

## User Permissions

### Student (`student@test.com`)
- ✅ View subjects and sections
- ✅ Take quizzes and lessons
- ✅ Track personal progress
- ✅ Manage personal to-do list
- ❌ Cannot create/edit curriculum
- ❌ Cannot view other students' progress
- ❌ Cannot access teacher/admin panels

### Teacher (`teacher@test.com`)
- ✅ All student permissions
- ✅ Create and edit curriculum
- ✅ Create quizzes and assignments
- ✅ View all students' progress
- ✅ Access book library
- ✅ Manage student accounts
- ❌ Cannot access admin settings
- ❌ Cannot modify system configuration

### Admin (`admin@test.com`)
- ✅ All teacher permissions
- ✅ Full system access
- ✅ Manage user roles
- ✅ Access admin panel
- ✅ Configure system settings
- ✅ View all data and logs

---

## Testing Different Roles

To test role-specific features:

1. **Sign out** from current account
2. **Sign in** with a different test user
3. **Verify** that UI changes based on role:
   - Students see limited navigation
   - Teachers see curriculum management tools
   - Admins see full admin panel

---

## Roles Configuration

Roles are stored in Firebase Realtime Database at `/user-roles`:

```json
{
  "user-roles": {
    "students": ["student@test.com"],
    "teachers": ["teacher@test.com"],
    "admins": ["admin@test.com"]
  }
}
```

---

## Re-creating Test Users

If you need to recreate the test users (e.g., after restarting emulators):

```bash
node create-test-users.js
```

This script will:
1. Delete existing test users (if any)
2. Create fresh accounts with the same credentials
3. Set up proper roles in the database
4. Display login instructions

---

## Troubleshooting

### "Access Denied" Error
- Make sure you're using one of the test emails above
- Check that `user-roles` data exists in Firebase Database
- Verify emulators are running on correct ports

### User Not Found
- Run `node create-test-users.js` to recreate users
- Check Firebase Auth Emulator UI: `http://localhost:4040/auth`

### Sign In Loop
- Clear browser cache/cookies
- Try incognito/private browsing mode
- Restart Firebase emulators

---

## Avatar Images

Test users have auto-generated avatars using UI Avatars:
- **Emma Student**: Teal background (#4d9e93)
- **Mr. Johnson**: Orange background (#f97316)
- **Admin User**: Purple background (#8b5cf6)

Avatars display initials and match the app's color scheme.

---

## Next Steps

Now that you have test users:

1. **Test the subjects feature**:
   - Sign in as Emma Student
   - Browse subjects at `/subjects`
   - Click on Mathematics
   - Explore sections

2. **Test teacher features**:
   - Sign in as Mr. Johnson
   - Access teacher panel
   - Create/edit curriculum
   - View student progress

3. **Test admin features**:
   - Sign in as Admin User
   - Access admin panel
   - Manage user roles
   - Configure settings

---

## Security Notes

⚠️ **Important**: These are DEVELOPMENT-ONLY credentials for local testing with Firebase Emulator.

- Never use these in production
- Passwords are intentionally simple for testing
- Emulator data is wiped when emulators restart
- No real user data is stored

---

**Created by**: Claude (AI Assistant)
**Script**: `create-test-users.js`
**Date**: November 18, 2025
