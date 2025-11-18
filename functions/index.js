const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Anthropic with API key from environment
const anthropic = new Anthropic({
  apiKey: functions.config().anthropic?.key || process.env.ANTHROPIC_API_KEY
});

/**
 * Load user roles from Firebase Realtime Database
 */
async function loadUserRoles() {
  try {
    const rolesSnapshot = await admin.database().ref('user-roles').once('value');
    const rolesData = rolesSnapshot.val();

    if (rolesData) {
      return {
        admins: rolesData.admins || ['techride.trevor@gmail.com'],
        teachers: rolesData.teachers || [],
        students: rolesData.students || []
      };
    }

    // Fallback to defaults
    return {
      admins: ['techride.trevor@gmail.com'],
      teachers: ['iyoko.bainter@gmail.com', 'trevor.bainter@gmail.com'],
      students: ['madmaxmadadax@gmail.com', 'sakurasaurusjade@gmail.com']
    };
  } catch (error) {
    console.error('Error loading roles:', error);
    // Return safe defaults on error
    return {
      admins: ['techride.trevor@gmail.com'],
      teachers: [],
      students: []
    };
  }
}

/**
 * Test function to check available models
 */
exports.listModels = functions.https.onCall(async (data, context) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': functions.config().anthropic?.key || process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
    const models = await response.json();
    return { models };
  } catch (error) {
    console.error('Error listing models:', error);
    return { error: error.message };
  }
});

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

  // Load roles from database
  const roles = await loadUserRoles();

  const userEmail = context.auth.token.email;
  const isAdmin = roles.admins.includes(userEmail);
  const isTeacher = roles.teachers.includes(userEmail);

  // Verify user is admin or teacher
  if (!isAdmin && !isTeacher) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admin and teachers can generate quizzes'
    );
  }

  // Extract parameters
  const {
    bookTitle,
    author,
    questionCount = 8,
    difficulty = 'medium',
    chapters,
    context: additionalContext,
    overrideLimit = false
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

  // Check daily rate limit (5 quizzes per 24 hours)
  const DAILY_LIMIT = 5;
  const TEACHER_WARNING_THRESHOLD = 2;
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  try {
    // Get usage logs from last 24 hours
    const logsSnapshot = await admin.database()
      .ref('ai-usage-logs')
      .orderByChild('timestamp')
      .startAt(oneDayAgo)
      .once('value');

    const recentLogs = logsSnapshot.val();
    const recentCount = recentLogs ? Object.keys(recentLogs).length : 0;

    // Teachers cannot override the limit
    if (isTeacher && overrideLimit) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Teachers cannot override the daily limit. Please contact techride.trevor@gmail.com if you need more quizzes today.'
      );
    }

    // Warning for teachers at 2 quizzes
    if (isTeacher && recentCount >= TEACHER_WARNING_THRESHOLD) {
      console.log(`Teacher warning: ${userEmail} has generated ${recentCount}/${DAILY_LIMIT} quizzes today`);
      // Return a warning object that the client can display
      // We'll include this in the success response
    }

    // If limit exceeded and no override, block request
    if (recentCount >= DAILY_LIMIT && !overrideLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Daily limit of ${DAILY_LIMIT} quiz generations reached (${recentCount} generated in last 24 hours). ${isAdmin ? 'Admin approval required to continue.' : 'Please contact techride.trevor@gmail.com to generate more quizzes today.'}`
      );
    }

    console.log(`Rate limit check: ${recentCount}/${DAILY_LIMIT} quizzes in last 24h${overrideLimit ? ' (OVERRIDE ACTIVE)' : ''}${isTeacher ? ' (TEACHER)' : ''}`);
  } catch (error) {
    // If it's our rate limit error, re-throw it
    if (error.code === 'resource-exhausted' || error.code === 'permission-denied') {
      throw error;
    }
    // Otherwise log and continue (don't block on rate limit check failure)
    console.error('Rate limit check failed:', error);
  }

  // Build prompt for Claude
  const chapterInfo = chapters ? `\n\nFOCUS ON CHAPTERS: ${chapters}\nOnly create questions about content from these specific chapters.` : '';

  const prompt = `Generate a ${difficulty} level quiz for the book "${bookTitle}"${author ? ` by ${author}` : ''} suitable for ages 10-11.${chapterInfo}

${additionalContext ? `Additional context: ${additionalContext}\n\n` : ''}Create exactly ${questionCount} multiple-choice questions with 4 options each.

Requirements:
- Questions should test comprehension of key plot points, characters, and themes${chapters ? ` from chapters ${chapters}` : ''}
- Make questions engaging and age-appropriate
- Ensure each question has exactly 4 options
- Mark the correct answer by its index (0-3)
- Include a brief, kid-friendly description${chapters ? `\n- Only include content from the specified chapters: ${chapters}` : ''}

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
      model: 'claude-sonnet-4-5-20250929',
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
      model: 'claude-sonnet-4-5-20250929'
    };

    // Save to database (don't await to avoid slowing response)
    admin.database().ref('ai-usage-logs').push(usageLog).catch(err => {
      console.error('Failed to log usage:', err);
    });

    // Get updated count for teacher warning
    const logsSnapshot = await admin.database()
      .ref('ai-usage-logs')
      .orderByChild('timestamp')
      .startAt(oneDayAgo)
      .once('value');
    const updatedCount = logsSnapshot.val() ? Object.keys(logsSnapshot.val()).length : 0;

    // Return quiz data with optional teacher warning
    const response = {
      success: true,
      quiz: quizData,
      usage: {
        inputTokens: message.usage?.input_tokens || 0,
        outputTokens: message.usage?.output_tokens || 0
      }
    };

    // Add warning for teachers at or above threshold
    if (isTeacher && updatedCount >= TEACHER_WARNING_THRESHOLD) {
      response.warning = {
        message: `You have generated ${updatedCount} out of ${DAILY_LIMIT} quizzes today. Please contact techride.trevor@gmail.com if you need to generate more than ${DAILY_LIMIT} quizzes in a 24-hour period.`,
        count: updatedCount,
        limit: DAILY_LIMIT
      };
    }

    return response;

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

/**
 * Database-triggered quiz generation
 * Listens for new quiz requests and processes them
 */
exports.processQuizRequest = functions.database
  .ref('/ai-quiz-requests/{requestId}')
  .onCreate(async (snapshot, context) => {
    const requestId = context.params.requestId;
    const requestData = snapshot.val();

    console.log(`Processing quiz request ${requestId}:`, requestData);

    try {
      // Build prompt for Claude
      const prompt = `Generate a ${requestData.difficulty} level quiz for the book "${requestData.bookTitle}"${requestData.bookAuthor ? ` by ${requestData.bookAuthor}` : ''} suitable for ages 10-11.

FOCUS ON: ${requestData.chapter}
Only create questions about content from this specific chapter or section.

Create exactly ${requestData.numQuestions} multiple-choice questions with 4 options each.

Requirements:
- Questions should test comprehension of key plot points, characters, and themes from ${requestData.chapter}
- Make questions engaging and age-appropriate for 10-11 year olds
- Ensure each question has exactly 4 options
- Mark the correct answer by its index (0-3)
- Only include content from ${requestData.chapter}

Format your response as valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "What happened in this chapter?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

CRITICAL INSTRUCTIONS:
- You MUST return ONLY valid JSON
- Do NOT include any explanatory text before or after the JSON
- Do NOT wrap the JSON in markdown code blocks
- Do NOT include any commentary
- Start your response with { and end with }
- Include exactly ${requestData.numQuestions} questions`;

      // Call Claude API
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
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
      console.log('AI Response preview:', responseText.substring(0, 500));

      // Try to extract JSON from response (handle code blocks, markdown, etc.)
      let quizData;
      let cleanedText = responseText;

      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Try to find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          quizData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Failed JSON text:', jsonMatch[0].substring(0, 500));
          throw new Error('Failed to parse AI response as JSON');
        }
      } else {
        console.error('Full AI response:', responseText);
        throw new Error('No JSON found in AI response');
      }

      // Validate quiz data structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
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

      // Save result to database
      await admin.database().ref(`ai-quiz-results/${requestId}`).set({
        status: 'completed',
        quiz: quizData,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        usage: {
          inputTokens: message.usage?.input_tokens || 0,
          outputTokens: message.usage?.output_tokens || 0
        }
      });

      // Log usage
      await admin.database().ref('ai-usage-logs').push({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        userId: requestData.userId,
        userEmail: requestData.userName,
        bookTitle: requestData.bookTitle,
        author: requestData.bookAuthor || null,
        chapter: requestData.chapter,
        questionCount: quizData.questions.length,
        difficulty: requestData.difficulty,
        inputTokens: message.usage?.input_tokens || 0,
        outputTokens: message.usage?.output_tokens || 0,
        model: 'claude-sonnet-4-5-20250929',
        type: 'student-generated'
      });

      console.log(`Quiz request ${requestId} completed successfully`);

    } catch (error) {
      console.error(`Error processing quiz request ${requestId}:`, error);

      // Save error to database
      await admin.database().ref(`ai-quiz-results/${requestId}`).set({
        status: 'error',
        error: error.message,
        timestamp: admin.database.ServerValue.TIMESTAMP
      });
    }
  });
