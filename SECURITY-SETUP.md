# Security Setup Guide

## Overview

Your homeschool app has multiple layers of security to protect student data. Most security is **already configured**, but here are the important pieces you should understand and verify.

## ✅ Already Configured (No Action Needed)

### 1. Database Security Rules
**Status**: ✅ Deployed and Active

The Firebase Realtime Database security rules are already set up and deployed. These rules ensure:
- Students can only see their own data
- Students cannot modify other students' work
- Only admins/teachers can assign quizzes and books
- All writes are validated server-side

**Location**: `database.rules.json`

**Verification**:
```bash
# Check current rules in Firebase Console
firebase database:get /.settings/rules --project homeschool-quiz-app
```

### 2. User Role Management
**Status**: ✅ Configured in Firebase

User roles are stored in Firebase Realtime Database at `/user-roles`:
- **Admins**: Full access to everything
- **Teachers**: Can manage curriculum, quizzes, books, assignments
- **Students**: Can only access their own data

**Current Users**:
- Admin: `techride.trevor@gmail.com`
- Teachers: `iyoko.bainter@gmail.com`, `trevor.bainter@gmail.com`
- Students: `madmaxmadadax@gmail.com`, `sakurasaurusjade@gmail.com`, `linux.trevor@gmail.com`

**To Add New Users**:
```bash
# 1. Create a JSON file with updated roles
cat > roles-update.json << 'EOF'
{
  "admins": ["techride.trevor@gmail.com"],
  "teachers": ["iyoko.bainter@gmail.com", "trevor.bainter@gmail.com"],
  "students": ["student1@gmail.com", "student2@gmail.com", "new.student@gmail.com"]
}
EOF

# 2. Update Firebase
firebase database:set /user-roles roles-update.json --project homeschool-quiz-app -f

# 3. Verify
firebase database:get /user-roles --project homeschool-quiz-app
```

### 3. Email Whitelist
**Status**: ✅ Active

Only users in the roles list can sign in. Unauthorized emails are rejected automatically.

**How It Works**:
1. User signs in with Google
2. App checks their email against Firebase `/user-roles`
3. If not found → Access denied, forced to sign out
4. If found → Access granted based on role (admin/teacher/student)

## 🔒 Security Features Explained

### Database Path Protection

| Path | Students Can Read | Students Can Write | Notes |
|------|------------------|-------------------|-------|
| `/curriculum` | ✅ All | ❌ None | Read-only educational content |
| `/quizzes` | ✅ All | ❌ None | Read-only quiz questions |
| `/quiz-results` | ✅ Own only | ✅ Own only | Can create/view own results |
| `/users/{userId}` | ✅ Own only | ✅ Own only | Profile data isolation |
| `/assignments/{userId}` | ✅ Own only | ❌ None | Read-only assignments |
| `/reading-assignments/{userId}` | ✅ Own only | ✅ Status/Chapter only | Can update progress, not delete |
| `/todos/{userId}` | ✅ Own only | ✅ Own only | Personal todo lists |
| `/books-cache` | ✅ All | ❌ None | Shared book metadata |
| `/user-roles` | ✅ All | ❌ None | Students can see roles but not modify |
| `/ai-usage-logs` | ❌ None | ❌ None | Admin-only audit logs |

### Authentication Flow

```
1. User clicks "Sign in with Google"
2. Google authenticates user
3. Firebase creates auth.uid (unique user ID)
4. App loads /user-roles from database
5. App checks if email is in roles list
   ├─ Not found → Alert + Force sign out
   ├─ Found in students → Student access
   ├─ Found in teachers → Teacher access
   └─ Found in admins → Admin access
6. Database rules enforce permissions based on auth.uid
```

## 🛡️ What Students CANNOT Do

Even if a student:
- Inspects browser developer tools
- Modifies JavaScript code
- Uses REST API directly
- Knows another student's user ID

They **CANNOT**:
- View other students' quiz results
- View other students' reading lists
- Modify other students' data
- Delete their own assignments
- Change quiz questions
- Modify the curriculum
- Grant themselves admin access
- See admin/teacher features in the UI

**Why?** All security rules run on Google's servers, not in the browser.

## 🔧 Optional: Verify Security Rules

If you want to manually check that security rules are deployed:

### Method 1: Firebase Console (Visual)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `homeschool-quiz-app`
3. Click "Realtime Database" in left sidebar
4. Click "Rules" tab
5. Verify rules match `database.rules.json` in your repo

### Method 2: Firebase CLI (Command Line)
```bash
# View current rules
firebase database:get /.settings/rules --project homeschool-quiz-app

# Deploy rules from local file (if you made changes)
firebase deploy --only database --project homeschool-quiz-app
```

## 🚨 Security Incident Response

### If a Student Reports Access to Others' Data

1. **Immediate Action**:
   ```bash
   # Disable database writes temporarily
   firebase database:update /.settings/rules '{"rules":{".read":"auth != null",".write":false}}' -f
   ```

2. **Investigate**:
   - Check Firebase Console → Database tab → View actual data
   - Check Firebase Console → Authentication tab → Recent sign-ins
   - Review security rules in `database.rules.json`

3. **Fix & Redeploy**:
   ```bash
   # After fixing rules
   firebase deploy --only database --project homeschool-quiz-app
   ```

### If Unauthorized Email Tries to Access

The system will:
1. Allow Google sign-in (can't prevent)
2. Check email against `/user-roles`
3. Show alert: "Access denied. This account is not authorized."
4. Force sign out immediately
5. No data is exposed

**No action needed** - this is expected behavior.

## 📊 Monitoring (Admin Only)

### View AI Usage Logs
```bash
firebase database:get /ai-usage-logs --project homeschool-quiz-app
```

Shows:
- Who generated quizzes
- When they generated them
- How many requests per day

### View All User Profiles
```bash
firebase database:get /users --project homeschool-quiz-app
```

### View All Quiz Results
```bash
firebase database:get /quiz-results --project homeschool-quiz-app
```

## 🔐 API Keys & Secrets

### Google Books API Key
**Location**: `google-books-config.js`
**Visibility**: Public (in browser source code)
**Risk Level**: Low
**Why It's OK**:
- Books API is read-only
- Free tier: 1,000 requests/day
- Domain restrictions can be set in Google Cloud Console
- Easy to regenerate if abused

**Recommendation**: Set domain restriction to `school.bainter.xyz` in [Google Cloud Console](https://console.cloud.google.com)

### Firebase Config
**Location**: `firebase-config.js`
**Visibility**: Public (in browser source code)
**Risk Level**: Low
**Why It's OK**:
- Firebase config is meant to be public
- Security enforced by database rules, not config
- Authentication required for all access
- Rules validate every database operation

**No action needed** - this is standard Firebase setup.

### Claude AI API Key
**Location**: Firebase Functions environment
**Visibility**: Private (server-side only)
**Risk Level**: Secure
**Storage**: Set via Firebase Functions config
**Access**: Only Cloud Functions can use it

**Check current config**:
```bash
cd functions
cat .env
```

## ✅ Security Checklist

- [x] Database security rules deployed
- [x] User roles configured in Firebase
- [x] Email whitelist active
- [x] Student data isolation verified
- [x] Quiz results protected
- [x] Reading assignments protected
- [x] Profile data isolated
- [ ] (Optional) Google Books API domain restriction set
- [ ] (Optional) Monitor AI usage logs periodically

## 📚 Additional Resources

- **Security Audit**: See `SECURITY-AUDIT.md` for detailed security analysis
- **Firebase Security Rules Docs**: https://firebase.google.com/docs/database/security
- **Firebase Console**: https://console.firebase.google.com/project/homeschool-quiz-app

---

## Summary

**Your app is already secure.** All critical security measures are active:
- Database rules enforce data isolation
- Email whitelist prevents unauthorized access
- Students cannot interfere with each other's work
- Admin/teacher roles properly separated

**No immediate action required** unless you want to:
1. Add more students/teachers to the whitelist
2. Set domain restrictions on Google Books API
3. Review security rules for custom modifications

**Questions?** Check `SECURITY-AUDIT.md` for technical details or test security by trying to access another student's data (it will fail with "Permission denied").
