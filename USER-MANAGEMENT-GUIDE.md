# User Management System

## Overview
Admins can now dynamically add and remove user emails for different roles without editing code!

## Access User Management

1. Sign in as admin (techride.trevor@gmail.com)
2. Go to `/admin` panel
3. Click **"👥 User Management"** button
4. Manage users by role

## Features

### Add Users
- **Add Teacher:** Enter email → Click "Add Teacher"
- **Add Student:** Enter email → Click "Add Student"
- Email validation and duplicate checking
- Changes take effect immediately system-wide

### Remove Users
- Click "Remove" button next to any user
- Confirmation dialog prevents accidents
- Safety protections:
  - Main admin cannot be removed
  - At least one admin must exist

### Real-time Sync
- All changes sync across all pages instantly
- Cloud Functions also use updated roles
- No page refresh needed

## Roles

### 🔴 Admin (Full Access)
- Generate quizzes with override capability
- View usage statistics
- Manage user roles
- Access all admin features

**Current Admins:**
- techride.trevor@gmail.com (protected, cannot be removed)

### 🟡 Teacher (Limited Admin Access)
- Generate quizzes (respects daily limit)
- Manage student assignments
- View student progress
- View student todos
- **Cannot** override usage limit
- **Cannot** see usage statistics
- **Cannot** manage users

**Current Teachers:**
- iyoko.bainter@gmail.com
- trevor.bainter@gmail.com

### 🟢 Student (Standard Access)
- Take quizzes
- View assignments
- Manage personal todos

**Current Students:**
- madmaxmadadax@gmail.com
- sakurasaurusjade@gmail.com

## Data Storage

Roles are stored in Firebase Realtime Database:

```
user-roles/
  admins: ["techride.trevor@gmail.com"]
  teachers: ["iyoko.bainter@gmail.com", "trevor.bainter@gmail.com"]
  students: ["madmaxmadadax@gmail.com", "sakurasaurusjade@gmail.com"]
```

## Initialization

The system automatically initializes with default users on first access if no roles exist in the database.

**Default users:**
- Admin: techride.trevor@gmail.com
- Teachers: iyoko.bainter@gmail.com, trevor.bainter@gmail.com
- Students: madmaxmadadax@gmail.com, sakurasaurusjade@gmail.com

## Adding a New Teacher

1. Go to `/admin/users`
2. Scroll to **Teacher** section
3. Enter email in the input field (e.g., `newteacher@gmail.com`)
4. Click **"+ Add Teacher"**
5. Teacher can now sign in immediately!

## Adding a New Student

1. Go to `/admin/users`
2. Scroll to **Student** section
3. Enter email in the input field (e.g., `newstudent@gmail.com`)
4. Click **"+ Add Student"**
5. Student can now sign in immediately!

## Removing a User

1. Find the user in their role section
2. Click the **"Remove"** button
3. Confirm the removal
4. User loses access immediately

## Important Notes

- **Teachers cannot access user management** - Only the main admin can manage users
- **Changes are immediate** - No need to redeploy or restart
- **Email must be exact** - Gmail addresses are case-insensitive but must match exactly
- **One role per email** - An email can only be in one role (Admin, Teacher, or Student)
- **Protected admin** - techride.trevor@gmail.com cannot be removed for security

## Troubleshooting

### "Access denied" after adding user
- Make sure the email is entered correctly (no typos)
- Email is case-insensitive but must be exact
- User must sign in with Google using that exact email

### Can't remove a user
- Check if it's the main admin (protected)
- Check if it's the only admin (at least one must exist)
- Refresh the page and try again

### Changes not taking effect
- Refresh the page
- Sign out and sign back in
- Check Firebase Console to verify the role was saved

## Security

- Only techride.trevor@gmail.com can access user management
- All role checks happen server-side (can't be bypassed)
- Cloud Functions verify roles on every request
- Fallback to safe defaults if database unavailable

## Future Enhancements

Potential additions:
- Bulk import users from CSV
- User invitation emails
- Role expiration dates
- Custom role permissions
- Activity logs for user management

---

**Questions?** The user management system is fully integrated with all existing features and requires no code changes to add/remove users!
