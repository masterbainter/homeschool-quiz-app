const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Anthropic with API key from environment
const anthropic = new Anthropic({
  apiKey: functions.config().anthropic?.key || process.env.ANTHROPIC_API_KEY
});

// Admin email for authorization
const ADMIN_EMAIL = 'techride.trevor@gmail.com';

/**
 * Cloud Function to generate quiz questions using Claude AI
 * Callable from client-side with proper authentication
 */
exports.generateQuiz = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate quizzes'
    );
  }

  // Verify user is admin
  if (context.auth.token.email !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admin can generate quizzes'
    );
  }

  // Extract parameters
  const {
    bookTitle,
    author,
    questionCount = 8,
    difficulty = 'medium',
    context: additionalContext
  } = data;

  // Validate required fields
  if (!bookTitle) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Book title is required'
    );
  }

  // Validate question count
  if (questionCount < 3 || questionCount > 20) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Question count must be between 3 and 20'
    );
  }

  // Build prompt for Claude
  const prompt = `Generate a ${difficulty} level quiz for the book "${bookTitle}"${author ? ` by ${author}` : ''} suitable for ages 10-11.

${additionalContext ? `Additional context: ${additionalContext}\n\n` : ''}Create exactly ${questionCount} multiple-choice questions with 4 options each.

Requirements:
- Questions should test comprehension of key plot points, characters, and themes
- Make questions engaging and age-appropriate
- Ensure each question has exactly 4 options
- Mark the correct answer by its index (0-3)
- Include a brief, kid-friendly description

Format your response as valid JSON with this exact structure:
{
  "title": "${bookTitle}",
  "description": "Test your knowledge of [brief description]",
  "questions": [
    {
      "question": "What is the name of the main character?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no other text
- Ensure the JSON is valid and properly formatted
- Include exactly ${questionCount} questions`;

  try {
    console.log(`Generating quiz for: ${bookTitle}${author ? ` by ${author}` : ''}`);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract response text
    const responseText = message.content[0].text;
    console.log('AI Response received, length:', responseText.length);

    // Try to extract JSON from response
    let quizData;

    // First, try to find JSON block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        quizData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      throw new Error('No JSON found in AI response');
    }

    // Validate quiz data structure
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz data structure');
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${i}`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correctAnswer at index ${i}`);
      }
    }

    console.log(`Successfully generated ${quizData.questions.length} questions`);

    // Log usage stats to Firebase for tracking
    const usageLog = {
      timestamp: admin.database.ServerValue.TIMESTAMP,
      userId: context.auth.uid,
      userEmail: context.auth.token.email,
      bookTitle: bookTitle,
      author: author || null,
      questionCount: quizData.questions.length,
      difficulty: difficulty,
      inputTokens: message.usage?.input_tokens || 0,
      outputTokens: message.usage?.output_tokens || 0,
      model: 'claude-3-5-sonnet-20241022'
    };

    // Save to database (don't await to avoid slowing response)
    admin.database().ref('ai-usage-logs').push(usageLog).catch(err => {
      console.error('Failed to log usage:', err);
    });

    // Return quiz data
    return {
      success: true,
      quiz: quizData,
      usage: {
        inputTokens: message.usage?.input_tokens || 0,
        outputTokens: message.usage?.output_tokens || 0
      }
    };

  } catch (error) {
    console.error('Error generating quiz:', error);

    // Provide helpful error messages
    if (error.message?.includes('API key')) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'API key configuration error. Please contact administrator.'
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      `Failed to generate quiz: ${error.message}`
    );
  }
});
