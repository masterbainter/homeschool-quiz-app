# AI Quiz Generation Setup

The admin panel now supports AI-powered quiz generation using Claude AI. This requires a simple backend setup.

## Option 1: Using Firebase Functions (Recommended)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Functions

```bash
cd /path/to/homeschool
firebase init functions
# Select JavaScript
# Install dependencies: Yes
```

### 3. Install Anthropic SDK

```bash
cd functions
npm install @anthropic-ai/sdk
```

### 4. Create the Function

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: functions.config().anthropic.key
});

exports.generateQuiz = functions.https.onCall(async (data, context) => {
  // Verify admin email
  if (!context.auth || context.auth.token.email !== 'techride.trevor@gmail.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can generate quizzes');
  }

  const { bookTitle, author, questionCount, difficulty, context: additionalContext } = data;

  const prompt = `Generate a ${difficulty} level quiz for the book "${bookTitle}"${author ? ` by ${author}` : ''} suitable for ages 10-11.

${additionalContext ? `Additional context: ${additionalContext}\n` : ''}
Create exactly ${questionCount} multiple-choice questions with 4 options each.

Format your response as valid JSON with this structure:
{
  "title": "${bookTitle}",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make questions engaging, age-appropriate, and test comprehension of key plot points, characters, and themes.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const quizData = JSON.parse(jsonMatch[0]);
      return quizData;
    } else {
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate quiz');
  }
});
```

### 5. Set API Key

```bash
firebase functions:config:set anthropic.key="YOUR_ANTHROPIC_API_KEY"
```

Get your API key from: https://console.anthropic.com/

### 6. Deploy

```bash
firebase deploy --only functions
```

### 7. Update Firebase Rules

In Firebase Console > Realtime Database > Rules, ensure admin can call functions.

## Option 2: Using Vercel Serverless Function

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Create `/api/generate-quiz.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://school.bainter.xyz');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookTitle, author, questionCount, difficulty, context, adminEmail } = req.body;

  // Verify admin
  if (adminEmail !== 'techride.trevor@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const prompt = `Generate a ${difficulty} level quiz for the book "${bookTitle}"${author ? ` by ${author}` : ''} suitable for ages 10-11.

${context ? `Additional context: ${context}\n` : ''}
Create exactly ${questionCount} multiple-choice questions with 4 options each.

Format your response as valid JSON with this structure:
{
  "title": "${bookTitle}",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make questions engaging, age-appropriate, and test comprehension of key plot points, characters, and themes.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const quizData = JSON.parse(jsonMatch[0]);
      return res.status(200).json(quizData);
    } else {
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
};
```

### 3. Deploy to Vercel

```bash
vercel
# Follow prompts
# Set environment variable: ANTHROPIC_API_KEY
```

### 4. Update admin.js

Set the API endpoint:
```javascript
const AI_API_ENDPOINT = 'https://your-project.vercel.app/api/generate-quiz';
```

## Option 3: Direct Client-Side (Not Recommended for Production)

For testing only, you can call Anthropic API directly from the client, but this exposes your API key.

## Current Implementation

The frontend code is ready in `admin.js`. You need to:

1. Choose an option above (Firebase Functions recommended)
2. Deploy the backend function
3. Update the API endpoint in `admin.js`
4. Test quiz generation

## Cost Estimate

Using Claude 3.5 Sonnet:
- ~$0.015 per quiz (depending on length)
- Very affordable for occasional use

## Security

- Admin email verification on backend
- API key stored securely in environment
- CORS configured for your domain only
- Rate limiting recommended for production
