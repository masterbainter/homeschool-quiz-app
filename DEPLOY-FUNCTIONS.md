# Deploying Firebase Functions

Your Firebase Functions are ready to deploy! Follow these steps:

## Prerequisites

✅ Firebase CLI installed
✅ Functions code created
✅ Dependencies installed
✅ API key configured in `.env`

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

This will open a browser for authentication.

### 2. Set the API Key in Firebase Config

```bash
firebase functions:config:set anthropic.key="YOUR_ANTHROPIC_API_KEY_HERE"
```

Replace `YOUR_ANTHROPIC_API_KEY_HERE` with your actual Anthropic API key.

This stores the API key securely in Firebase (not in your code).

### 3. Deploy Functions

```bash
firebase deploy --only functions
```

This will:
- Upload your function code
- Install dependencies on Firebase servers
- Make the function available at a Firebase URL

### 4. Verify Deployment

After deployment, you'll see output like:

```
✔  functions[generateQuiz(us-central1)] Successful create operation.
Function URL: https://us-central1-homeschool-quiz-app.cloudfunctions.net/generateQuiz
```

### 5. Test the Function

1. Go to https://school.bainter.xyz/admin
2. Click "Add New Quiz"
3. Enter a book title (e.g., "Charlotte's Web")
4. Click "Generate Quiz"
5. Wait 15-30 seconds
6. Review and edit the generated questions
7. Save the quiz!

## Troubleshooting

### "Firebase login required"

Run: `firebase login`

### "Permission denied"

Make sure you're logged in with the Google account that owns the Firebase project.

### "Function deployment failed"

Check the error message. Common issues:
- Node version mismatch (ignore the warning, it's fine)
- API key not set
- Network issues

### "API key error" when generating quiz

The API key might not be set. Run:

```bash
firebase functions:config:get
```

Should show:
```json
{
  "anthropic": {
    "key": "sk-ant-api03-..."
  }
}
```

If not, run the config:set command again from step 2.

### Function takes too long

First quiz generation might take 30-60 seconds. Subsequent ones are faster.

## Local Testing (Optional)

To test locally before deploying:

```bash
cd functions
npm run serve
```

This starts a local emulator. The admin panel won't work with it directly without code changes.

## Cost

- Firebase Functions: Free tier includes 2M invocations/month
- Claude API: ~$0.015 per quiz
- Total: Nearly free for personal use

## Updating the Function

After making changes to `functions/index.js`:

```bash
firebase deploy --only functions
```

## Monitoring

View function logs:

```bash
firebase functions:log
```

Or check the Firebase Console:
https://console.firebase.google.com/project/homeschool-quiz-app/functions

## Security

✅ API key stored securely in Firebase config
✅ Admin-only access via email verification
✅ HTTPS-only function calls
✅ Authentication required

Your API key is never exposed to the client!
