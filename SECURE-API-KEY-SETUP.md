# Secure Google Books API Key Setup

## Why This Approach?

Instead of storing the Google Books API key in your code (where it's visible in git history), we store it in **Firebase Realtime Database**. This keeps it:
- ✅ Out of your git repository
- ✅ Secured by Firebase security rules
- ✅ Easy to rotate/change without code deployment

## Important Note

⚠️ **The API key is still visible in the browser** (Network tab) because the Google Books API is called client-side. This is acceptable because:
- Books API is read-only (can't modify data)
- We set domain restrictions in Google Cloud Console
- Free tier is generous (1,000 requests/day)

If you need true server-side security, you'd need a backend proxy (see Option 2 below).

## Setup Instructions

### Step 1: Get Your Google Books API Key

Follow the standard process:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project "Homeschool Quiz App"
3. Enable "Books API"
4. Create API key (Credentials → Create Credentials → API Key)
5. Restrict key:
   - API restrictions: Books API only
   - Website restrictions: `school.bainter.xyz/*`

**Copy the API key** - you'll need it in Step 3.

### Step 2: Deploy Security Rules

```bash
# Deploy updated database rules (adds /config path)
firebase deploy --only database --project homeschool-quiz-app
```

This allows:
- ✅ All authenticated users can READ config
- ✅ Only admins can WRITE config
- ❌ Unauthenticated users cannot access config

### Step 3: Store API Key in Firebase

```bash
# Create a temporary file with your API key
echo "YOUR_ACTUAL_API_KEY_HERE" > temp-api-key.txt

# Upload to Firebase
firebase database:set /config/googleBooksApiKey "$(cat temp-api-key.txt)" --project homeschool-quiz-app -f

# Delete the temporary file
rm temp-api-key.txt
```

**Or use Firebase Console**:
1. Go to https://console.firebase.google.com/project/homeschool-quiz-app/database
2. Click "Data" tab
3. Click "+" next to root
4. Add path: `config/googleBooksApiKey`
5. Set value: Your API key
6. Click "Add"

### Step 4: Update Your Code

Replace the old `google-books-config.js` with the secure version:

```bash
# Backup old version
mv google-books-config.js google-books-config.js.backup

# Use secure version
mv google-books-config-secure.js google-books-config.js

# Commit changes
git add google-books-config.js database.rules.json
git commit -m "Use Firebase for Google Books API key storage"
git push
```

### Step 5: Verify It Works

1. Go to https://school.bainter.xyz/teacher/books
2. Search for "Charlotte's Web"
3. Should see results (may take 1-2 seconds on first load as key is fetched)

Check browser console - should NOT see any errors about API key.

## How It Works

### Before (Insecure)
```javascript
const GOOGLE_BOOKS_CONFIG = {
    apiKey: 'AIzaSyABCDEFG...',  // Hardcoded in git
    baseUrl: 'https://www.googleapis.com/books/v1'
};
```

### After (Secure)
```javascript
const GOOGLE_BOOKS_CONFIG = {
    apiKey: null,  // Will be loaded from Firebase

    async loadApiKey() {
        const database = firebase.database();
        const snapshot = await database.ref('config/googleBooksApiKey').once('value');
        this.apiKey = snapshot.val();
        return this.apiKey;
    }
};
```

On first API call, the key is loaded from Firebase and cached in memory for subsequent calls.

## Rotating the API Key

If you need to change the API key:

```bash
# Set new key in Firebase
firebase database:set /config/googleBooksApiKey "NEW_API_KEY_HERE" --project homeschool-quiz-app -f
```

**No code changes or git commits needed!** Users will get the new key on next page load.

## Security Considerations

### What's Protected
- ✅ API key not in git history
- ✅ API key not in GitHub repository
- ✅ Only authenticated users can read key
- ✅ Only admins can change key
- ✅ Domain restrictions prevent external use

### What's NOT Protected
- ❌ API key visible in browser Network tab (any authenticated user)
- ❌ API key visible if user opens DevTools during API call

**Why this is acceptable**:
- Google Books API is read-only
- Cannot modify or delete data
- Cannot access other Google services
- Quota limits prevent abuse (1,000/day)
- Easy to regenerate if compromised

### True Server-Side Security (Advanced)

If you need the API key completely hidden, use Option 2.

## Option 2: Server-Side Proxy (Advanced)

For maximum security, create a Firebase Function that proxies Google Books requests:

### Benefits
- ✅ API key never sent to client
- ✅ Can add rate limiting
- ✅ Can log all requests
- ✅ Can add custom caching

### Trade-offs
- ❌ Costs money (Cloud Functions usage)
- ❌ More complex to maintain
- ❌ Slower (extra network hop)

### Implementation Sketch

```javascript
// functions/index.js
exports.searchBooks = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const { query, maxResults } = data;
    const apiKey = functions.config().google.books.api_key;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;

    const response = await fetch(url);
    return await response.json();
});

// Client side
const result = await firebase.functions().httpsCallable('searchBooks')({
    query: 'Charlotte\'s Web',
    maxResults: 20
});
```

**Setup**:
```bash
firebase functions:config:set google.books.api_key="YOUR_API_KEY"
```

## Comparison

| Approach | Security | Cost | Complexity | Recommended For |
|----------|----------|------|------------|----------------|
| **Hardcoded** | ⚠️ Low | Free | ⭐ Simple | Development only |
| **Firebase Config** | ✅ Medium | Free | ⭐⭐ Easy | Most projects |
| **Server Proxy** | ✅✅ High | $$$ | ⭐⭐⭐ Complex | Enterprise |

## Recommended: Firebase Config

For your homeschool app, **Firebase Config (Option 1)** is the sweet spot:
- Keeps key out of git ✅
- Free ✅
- Easy to maintain ✅
- Sufficient security for Books API ✅

## Monitoring

Check API key usage:

```bash
# View current key (admin only)
firebase database:get /config/googleBooksApiKey --project homeschool-quiz-app
```

Check Google Cloud Console for usage stats:
1. Go to https://console.cloud.google.com/
2. Select project
3. APIs & Services → Dashboard
4. Click "Books API"
5. View quotas and usage

## Troubleshooting

### API Key Not Loading

Check browser console:
```javascript
// Test if key loads
firebase.database().ref('config/googleBooksApiKey').once('value')
    .then(snap => console.log('API Key:', snap.val()))
    .catch(err => console.error('Error:', err));
```

### Permission Denied

Ensure database rules are deployed:
```bash
firebase deploy --only database --project homeschool-quiz-app
```

### Key Still in Git History

Remove from git history:
```bash
# Use BFG Repo-Cleaner or git-filter-repo
# See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

Or simply:
1. Regenerate API key in Google Cloud Console
2. Update Firebase with new key
3. Old key in git history is now useless

---

**Recommended Setup**: Firebase Config (Option 1)
**Implementation Time**: 10 minutes
**Maintenance**: Minimal (set and forget)
