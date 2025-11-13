## Google Books API Setup Guide

### Quick Setup (5 minutes)

The Book Library feature requires a free Google Books API key. Follow these steps:

#### Step 1: Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing:
   - Click project dropdown at top
   - Click "New Project"
   - Name it "Homeschool Quiz App"
   - Click "Create"

#### Step 2: Enable Books API

1. In the search bar, type "Books API"
2. Click on "Books API" result
3. Click the blue "Enable" button
4. Wait for it to enable (~10 seconds)

#### Step 3: Create API Key

1. Click "Credentials" in the left sidebar
2. Click "+ CREATE CREDENTIALS" at top
3. Select "API key"
4. Your API key will be created and shown
5. Click "RESTRICT KEY" (recommended)

#### Step 4: Restrict Your Key (Recommended)

1. Under "API restrictions":
   - Select "Restrict key"
   - Check "Books API"
   - Click "Save"

2. Under "Website restrictions" (optional but recommended):
   - Select "HTTP referrers"
   - Click "+ ADD AN ITEM"
   - Enter your website URL (e.g., `school.bainter.xyz/*`)
   - Click "Done"
   - Click "Save"

#### Step 5: Add Key to Your App

1. Open `google-books-config.js` file
2. Find this line:
   ```javascript
   apiKey: 'YOUR_GOOGLE_BOOKS_API_KEY_HERE',
   ```
3. Replace `YOUR_GOOGLE_BOOKS_API_KEY_HERE` with your actual API key:
   ```javascript
   apiKey: 'AIzaSyABCDEFGHIJKLMNOP...',
   ```
4. Save the file

#### Step 6: Deploy

```bash
git add google-books-config.js
git commit -m "Add Google Books API key"
git push
```

**Important:** The `google-books-config.js` file is currently public in your repo. If you want to keep the API key private, consider moving it to Firebase Remote Config or environment variables.

### Free Tier Limits

- **1,000 requests per day** - Free!
- **Typical usage:** 20-50 requests per day (easily within limit)
- **Each search** = 1 request
- **Cost if exceeded:** $0.50 per 1,000 additional requests

### Test Your Setup

1. Go to `/admin/books`
2. Search for "Charlotte's Web"
3. You should see book results with covers!

### Troubleshooting

**"API not configured" warning:**
- Check that you replaced `YOUR_GOOGLE_BOOKS_API_KEY_HERE` with real key
- Make sure there are no extra spaces or quotes

**"API key not valid" error:**
- Verify Books API is enabled in Google Cloud Console
- Check API restrictions allow Books API
- Wait 5 minutes after creating key (propagation time)

**No search results:**
- Check browser console for error messages
- Verify API key is correct
- Check quotas in Google Cloud Console

### Security Notes

The API key in `google-books-config.js` is currently client-side (public). This is generally okay for Books API because:

1. ✅ Books API is read-only (can't modify data)
2. ✅ Domain restrictions prevent abuse
3. ✅ Free tier is generous (1,000/day)
4. ✅ Easy to regenerate if needed

**If you prefer more security:**
- Set up domain restrictions (Step 4)
- Monitor usage in Google Cloud Console
- Regenerate key if you see suspicious activity

### Alternative: Open Library (No API Key)

If you don't want to use Google Books API, you can switch to Open Library:

1. Edit `google-books-config.js`
2. Change the API endpoints to use Open Library
3. No API key required!
4. Trade-off: Slightly slower, less polished results

### Next Steps

Once your API key is configured:
1. Search for books in `/admin/books`
2. Assign books to students
3. Create quizzes from assigned books
4. Track student reading progress

🎉 **You're all set!** The book library will make quiz creation much easier.
