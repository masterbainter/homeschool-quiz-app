# User Profiles System

## Overview
User profiles are now automatically created when anyone signs in to the system for the first time.

## How It Works

### Automatic Profile Creation

**When a student (or admin) signs in:**
1. They authenticate with Google
2. System checks if profile exists in `users/{uid}`
3. If **new user** → Profile is created with:
   - `uid` - Firebase user ID
   - `email` - Google account email
   - `displayName` - From Google account or email username
   - `photoURL` - Google profile photo
   - `createdAt` - Timestamp of first login
   - `lastLogin` - Current timestamp
   - `isAdmin` - True if admin email, false otherwise
4. If **existing user** → Profile is updated with:
   - Latest `displayName` and `photoURL`
   - Updated `lastLogin` timestamp
   - Current `isAdmin` status

### Benefits

**For You (Admin):**
- ✅ Can assign quizzes immediately after student signs in
- ✅ Don't need to wait for students to take a quiz first
- ✅ See student profiles in admin panel right away
- ✅ Better tracking of when students last logged in

**For Students:**
- ✅ Profile created automatically on first login
- ✅ Display name and photo from Google account
- ✅ Ready to receive quiz assignments immediately

## Data Structure

### Firebase Database Path
```
users/
  {userId}/
    uid: "abc123..."
    email: "student@gmail.com"
    displayName: "Student Name"
    photoURL: "https://..."
    createdAt: 1699876543210
    lastLogin: 1699876543210
    isAdmin: false
```

### Example Profile
```json
{
  "uid": "Xy9aB2cD3eF4gH5iJ6kL7m",
  "email": "madmaxmadadax@gmail.com",
  "displayName": "Mad Max",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "createdAt": 1699876543210,
  "lastLogin": 1699976543210,
  "isAdmin": false
}
```

## Workflow Changes

### Before (Old Way)
1. Student signs in
2. No profile created yet
3. Admin tries to assign quiz → **Error!**
4. Student must take at least one quiz
5. Profile created from quiz result
6. Now admin can assign quizzes

### After (New Way)
1. Student signs in
2. ✅ Profile created automatically
3. Admin can assign quizzes immediately
4. Student sees assignments on homepage
5. Student takes quizzes

## Admin Panel Integration

### Student Progress Page (`/admin/students`)

**Now shows:**
- All configured student emails
- ✅ Students who have signed in (have userId)
- ⏳ Students who haven't signed in yet (pending-{email})

**Assignment capability:**
- ✅ Can assign to students who have signed in
- ❌ Cannot assign until student signs in once

**Visual indicator:**
If a student hasn't signed in yet, when you try to assign:
```
Alert: "Student Name hasn't signed in yet.
Ask them to sign in to school.bainter.xyz first,
then you can assign quizzes."
```

## Student Emails Configured

- **madmaxmadadax@gmail.com**
- **sakurasaurusjade@gmail.com**

Both will get profiles automatically when they first sign in!

## Profile Updates

### What Gets Updated on Each Login
- `displayName` - If changed in Google account
- `photoURL` - If changed in Google account
- `lastLogin` - Always updated
- `isAdmin` - Recalculated based on email

### What Stays the Same
- `uid` - Never changes
- `email` - Never changes (tied to Google account)
- `createdAt` - Set once, never changed

## Admin vs Student Profiles

### Admin Profile
```json
{
  "uid": "Xy9aB2cD3eF4gH5iJ6kL7m",
  "email": "techride.trevor@gmail.com",
  "displayName": "Trevor",
  "isAdmin": true,
  "createdAt": 1699876543210,
  "lastLogin": 1699976543210
}
```

### Student Profile
```json
{
  "uid": "Abc123def456ghi789jkl012",
  "email": "madmaxmadadax@gmail.com",
  "displayName": "Mad Max",
  "isAdmin": false,
  "createdAt": 1699876543210,
  "lastLogin": 1699976543210
}
```

## Testing the Profile Creation

### Test Steps
1. Have a student visit school.bainter.xyz
2. They click "Sign in with Google"
3. They authenticate with their Google account
4. **Profile is created automatically!**
5. Go to `/admin/students`
6. You should see the student in the list
7. Click their card
8. You can now assign quizzes immediately

### Verification
Check Firebase Database:
1. Go to Firebase Console
2. Navigate to Realtime Database
3. Look under `users/`
4. You should see entries for each student who signed in

## Privacy & Security

### What's Stored
- ✅ Basic profile info from Google (name, email, photo)
- ✅ Login timestamps
- ✅ Admin status

### What's NOT Stored
- ❌ Passwords (handled by Firebase Auth)
- ❌ Personal information beyond what Google provides
- ❌ Any data students don't want to share

### Access Control
- All profile data requires authentication
- Only authenticated users can read their own profile
- Admin can view all student profiles
- Students cannot see other students' profiles

## Future Enhancements

Possible future additions to profiles:
- Grade level
- Preferred subjects
- Learning goals
- Parent/guardian contact info
- Custom avatars
- Badges/achievements
- Study streaks

## Technical Notes

### Profile Creation Timing
- Happens in `dashboard.js` during `onAuthStateChanged`
- Called via `createUserProfile()` function
- Runs after authentication check
- Before loading curriculum

### Error Handling
- If profile creation fails, logged to console
- User can still use the app
- Will retry on next login

### Performance
- Profile check/update is fast (single database read/write)
- Uses Firebase's `once('value')` for one-time read
- Doesn't impact login speed noticeably

## Summary

**Key Improvement:**
Students now get profiles automatically when they sign in, so you can assign quizzes to them immediately without waiting for them to take a quiz first!

**Old flow:** Sign in → Take quiz → Get profile → Can receive assignments
**New flow:** Sign in → Get profile → Can receive assignments → Take quizzes

Much simpler! 🎉
