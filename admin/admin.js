// Admin Panel Logic
const admin = {
    currentUser: null,
    isAdmin: false,
    quizzes: [],
    editingQuizId: null,

    // Initialize admin panel
    init() {
        this.setupAuthListener();
    },

    // Firebase Authentication Listener
    setupAuthListener() {
        if (!firebase.apps.length) {
            this.showUnauthorized('Firebase not configured');
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.checkAdminStatus();
            } else {
                // Not logged in, redirect to main app
                window.location.href = '/';
            }
        });
    },

    // List of admin emails
    ADMIN_EMAILS: [
        'techride.trevor@gmail.com',
        'iyoko.bainter@gmail.com',
        'trevor.bainter@gmail.com'
    ],

    // Check if user has admin privileges
    checkAdminStatus() {
        if (this.ADMIN_EMAILS.includes(this.currentUser.email)) {
            this.isAdmin = true;
            this.showAdminPanel();
            this.loadQuizzes();
        } else {
            this.showUnauthorized('You do not have admin access. Only authorized administrators can access this panel.');
        }
    },

    showAdminPanel() {
        document.getElementById('auth-check').style.display = 'none';
        document.getElementById('unauthorized').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';

        // Update user display
        document.getElementById('admin-user-name').textContent = this.currentUser.displayName || 'Admin';
        const userPhoto = document.getElementById('admin-user-photo');
        if (this.currentUser.photoURL) {
            userPhoto.src = this.currentUser.photoURL;
        }

        // Load daily usage stats
        this.loadDailyUsage();
    },

    // Load and display daily AI usage
    async loadDailyUsage() {
        try {
            const database = firebase.database();
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);

            const snapshot = await database.ref('ai-usage-logs')
                .orderByChild('timestamp')
                .startAt(oneDayAgo)
                .once('value');

            const logs = snapshot.val();
            const count = logs ? Object.keys(logs).length : 0;
            const limit = 5;

            // Create or update usage badge
            let usageBadge = document.getElementById('daily-usage-badge');
            if (!usageBadge) {
                usageBadge = document.createElement('div');
                usageBadge.id = 'daily-usage-badge';
                usageBadge.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: ${count >= limit ? '#dc3545' : count >= 3 ? '#ffc107' : '#28a745'};
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-size: 14px;
                    font-weight: 600;
                    z-index: 1000;
                    cursor: pointer;
                `;
                usageBadge.onclick = () => window.location.href = '/admin/stats';
                document.body.appendChild(usageBadge);
            } else {
                usageBadge.style.background = count >= limit ? '#dc3545' : count >= 3 ? '#ffc107' : '#28a745';
            }

            usageBadge.innerHTML = `
                🤖 Daily AI Usage: ${count}/${limit}
                ${count >= limit ? '<br><small>Limit reached</small>' : ''}
            `;
            usageBadge.title = 'Click to view detailed usage statistics';

        } catch (error) {
            console.error('Failed to load daily usage:', error);
        }
    },

    showUnauthorized(message) {
        document.getElementById('auth-check').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
        const unauthorizedDiv = document.getElementById('unauthorized');
        unauthorizedDiv.style.display = 'block';
        unauthorizedDiv.querySelector('p').textContent = message;
    },

    // Load all quizzes from Firebase
    loadQuizzes() {
        const database = firebase.database();
        database.ref('quizzes').on('value', (snapshot) => {
            const quizzesData = snapshot.val();
            if (quizzesData) {
                this.quizzes = Object.keys(quizzesData).map(key => ({
                    id: key,
                    ...quizzesData[key]
                }));
            } else {
                this.quizzes = [];
            }
            this.renderQuizList();
        });
    },

    // Render quiz list in admin panel
    renderQuizList() {
        const quizList = document.getElementById('quiz-list');
        quizList.innerHTML = '';

        if (this.quizzes.length === 0) {
            quizList.innerHTML = `
                <div class="empty-state">
                    <h3>No quizzes yet</h3>
                    <p>Click "Add New Quiz" to create your first book quiz!</p>
                </div>
            `;
            return;
        }

        this.quizzes.forEach(quiz => {
            const quizItem = document.createElement('div');
            quizItem.className = 'quiz-item';
            quizItem.innerHTML = `
                <div class="quiz-item-header">
                    <div class="quiz-item-info">
                        <h3>${quiz.title}</h3>
                        <p>${quiz.description || 'No description'}</p>
                        <p><strong>${quiz.questions.length}</strong> questions</p>
                    </div>
                    <div class="quiz-item-actions">
                        <button onclick="admin.editQuiz('${quiz.id}')" class="btn btn-small btn-edit">Edit</button>
                        <button onclick="admin.deleteQuiz('${quiz.id}', '${quiz.title.replace(/'/g, "\\'")}')" class="btn btn-small btn-danger">Delete</button>
                    </div>
                </div>
            `;
            quizList.appendChild(quizItem);
        });
    },

    // Show add quiz form
    showAddQuiz() {
        this.editingQuizId = null;
        document.getElementById('form-title').textContent = 'Add New Quiz';

        // Show AI generator by default
        this.showAIGenerator();

        document.getElementById('quiz-form-section').style.display = 'block';
        document.getElementById('quiz-form-section').scrollIntoView({ behavior: 'smooth' });
    },

    // Show AI generator
    showAIGenerator() {
        document.getElementById('ai-generation-section').style.display = 'block';
        document.getElementById('quiz-form').style.display = 'none';
        document.getElementById('ai-loading').style.display = 'none';

        // Reset AI form
        document.getElementById('ai-book-title').value = '';
        document.getElementById('ai-author').value = '';
        document.getElementById('ai-context').value = '';
    },

    // Switch to manual entry
    switchToManual() {
        document.getElementById('ai-generation-section').style.display = 'none';
        document.getElementById('quiz-form').style.display = 'block';

        // Reset manual form
        document.getElementById('quiz-form').reset();
        document.getElementById('questions-container').innerHTML = '';
        this.addQuestion(); // Add one empty question
    },

    // Generate quiz with AI
    async generateQuizWithAI(overrideLimit = false) {
        const bookTitle = document.getElementById('ai-book-title').value.trim();
        const author = document.getElementById('ai-author').value.trim();
        const questionCount = parseInt(document.getElementById('ai-question-count').value);
        const difficulty = document.getElementById('ai-difficulty').value;
        const context = document.getElementById('ai-context').value.trim();

        if (!bookTitle) {
            alert('Please enter a book title');
            return;
        }

        // Show loading
        document.getElementById('generate-btn').disabled = true;
        document.getElementById('ai-loading').style.display = 'block';

        try {
            // Call Firebase Function
            const generateQuiz = firebase.functions().httpsCallable('generateQuiz');

            const result = await generateQuiz({
                bookTitle,
                author,
                questionCount,
                difficulty,
                context: context || undefined,
                overrideLimit: overrideLimit
            });

            if (!result.data.success) {
                throw new Error('Failed to generate quiz');
            }

            const quizData = result.data.quiz;

            // Hide AI section, show manual form with AI-generated data
            this.switchToManual();

            // Populate form with AI data
            document.getElementById('quiz-title').value = quizData.title;
            document.getElementById('quiz-description').value = quizData.description || '';

            // Clear and add AI-generated questions
            document.getElementById('questions-container').innerHTML = '';
            quizData.questions.forEach(q => {
                this.addQuestion(q);
            });

            // Add notice
            const form = document.getElementById('quiz-form');
            const notice = document.createElement('div');
            notice.className = 'ai-preview-notice';
            notice.innerHTML = `
                <h4>✨ AI Generated Quiz</h4>
                <p>Review and edit the questions below. You can add, remove, or modify any question before saving.</p>
            `;
            form.insertBefore(notice, form.firstChild);

            alert('Quiz generated successfully! Review and edit as needed before saving.');

        } catch (error) {
            console.error('AI generation error:', error);

            // Handle rate limit error with override option
            if (error.code === 'resource-exhausted' && error.message.includes('Daily limit')) {
                document.getElementById('generate-btn').disabled = false;
                document.getElementById('ai-loading').style.display = 'none';

                // Show confirmation dialog for admin override
                const confirmed = confirm(
                    `⚠️ DAILY LIMIT REACHED\n\n` +
                    `${error.message}\n\n` +
                    `As the admin (${this.currentUser.email}), you can override this limit.\n\n` +
                    `Do you want to generate this quiz anyway?\n\n` +
                    `Click OK to override the limit, or Cancel to stop.`
                );

                if (confirmed) {
                    // Retry with override
                    console.log('Admin approved rate limit override');
                    this.generateQuizWithAI(true);
                }
                return;
            }

            // Show helpful error message for other errors
            let errorMessage = 'Failed to generate quiz. ';

            if (error.code === 'unauthenticated') {
                errorMessage += 'Please sign in again.';
            } else if (error.code === 'permission-denied') {
                errorMessage += 'Only admin can generate quizzes.';
            } else if (error.code === 'failed-precondition') {
                errorMessage += 'API configuration error. The function may not be deployed yet.';
            } else {
                errorMessage += error.message || 'Please try again or use manual entry.';
            }

            alert(errorMessage);
            this.switchToManual();
        } finally {
            document.getElementById('generate-btn').disabled = false;
            document.getElementById('ai-loading').style.display = 'none';
        }
    },

    // Edit existing quiz
    editQuiz(quizId) {
        const quiz = this.quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        this.editingQuizId = quizId;
        document.getElementById('form-title').textContent = 'Edit Quiz';
        document.getElementById('quiz-title').value = quiz.title;
        document.getElementById('quiz-description').value = quiz.description || '';

        // Load questions
        const questionsContainer = document.getElementById('questions-container');
        questionsContainer.innerHTML = '';

        quiz.questions.forEach((question, index) => {
            this.addQuestion(question);
        });

        document.getElementById('quiz-form-section').style.display = 'block';
        document.getElementById('quiz-form-section').scrollIntoView({ behavior: 'smooth' });
    },

    // Add question to form
    addQuestion(questionData = null) {
        const questionsContainer = document.getElementById('questions-container');
        const questionIndex = questionsContainer.children.length;

        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <div class="question-header">
                <h4>Question ${questionIndex + 1}</h4>
                <button type="button" onclick="this.closest('.question-item').remove(); admin.renumberQuestions();" class="btn-remove">Remove</button>
            </div>
            <input type="text" class="question-text-input" placeholder="Enter your question" required
                value="${questionData ? questionData.question : ''}">
            <div class="options-container">
                <div class="option-input-group">
                    <input type="radio" name="correct-${questionIndex}" value="0" required
                        ${questionData && questionData.correctAnswer === 0 ? 'checked' : ''}>
                    <span class="option-label">Option A:</span>
                    <input type="text" class="option-input" placeholder="First option" required
                        value="${questionData ? questionData.options[0] : ''}">
                </div>
                <div class="option-input-group">
                    <input type="radio" name="correct-${questionIndex}" value="1"
                        ${questionData && questionData.correctAnswer === 1 ? 'checked' : ''}>
                    <span class="option-label">Option B:</span>
                    <input type="text" class="option-input" placeholder="Second option" required
                        value="${questionData ? questionData.options[1] : ''}">
                </div>
                <div class="option-input-group">
                    <input type="radio" name="correct-${questionIndex}" value="2"
                        ${questionData && questionData.correctAnswer === 2 ? 'checked' : ''}>
                    <span class="option-label">Option C:</span>
                    <input type="text" class="option-input" placeholder="Third option" required
                        value="${questionData ? questionData.options[2] : ''}">
                </div>
                <div class="option-input-group">
                    <input type="radio" name="correct-${questionIndex}" value="3"
                        ${questionData && questionData.correctAnswer === 3 ? 'checked' : ''}>
                    <span class="option-label">Option D:</span>
                    <input type="text" class="option-input" placeholder="Fourth option" required
                        value="${questionData ? questionData.options[3] : ''}">
                </div>
            </div>
        `;

        questionsContainer.appendChild(questionDiv);
    },

    // Renumber questions after deletion
    renumberQuestions() {
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((question, index) => {
            question.querySelector('h4').textContent = `Question ${index + 1}`;
            // Update radio button names
            const radios = question.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.name = `correct-${index}`;
            });
        });
    },

    // Save quiz (create or update)
    saveQuiz(event) {
        event.preventDefault();

        const title = document.getElementById('quiz-title').value.trim();
        const description = document.getElementById('quiz-description').value.trim();

        // Collect questions
        const questionItems = document.querySelectorAll('.question-item');
        const questions = [];

        questionItems.forEach((item, index) => {
            const questionText = item.querySelector('.question-text-input').value.trim();
            const options = Array.from(item.querySelectorAll('.option-input')).map(input => input.value.trim());
            const correctAnswer = parseInt(item.querySelector(`input[name="correct-${index}"]:checked`).value);

            questions.push({
                question: questionText,
                options: options,
                correctAnswer: correctAnswer
            });
        });

        if (questions.length === 0) {
            alert('Please add at least one question!');
            return;
        }

        const quizData = {
            title: title,
            description: description,
            questions: questions,
            updatedAt: new Date().toISOString(),
            updatedBy: this.currentUser.uid
        };

        const database = firebase.database();
        let savePromise;

        if (this.editingQuizId) {
            // Update existing quiz
            savePromise = database.ref(`quizzes/${this.editingQuizId}`).update(quizData);
        } else {
            // Create new quiz
            const quizId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            quizData.createdAt = new Date().toISOString();
            quizData.createdBy = this.currentUser.uid;
            savePromise = database.ref(`quizzes/${quizId}`).set(quizData);
        }

        savePromise
            .then(() => {
                alert(this.editingQuizId ? 'Quiz updated successfully!' : 'Quiz created successfully!');
                this.cancelEdit();
            })
            .catch((error) => {
                console.error('Error saving quiz:', error);
                alert('Error saving quiz. Please try again.');
            });
    },

    // Delete quiz
    deleteQuiz(quizId, quizTitle) {
        if (!confirm(`Are you sure you want to delete "${quizTitle}"? This cannot be undone.`)) {
            return;
        }

        const database = firebase.database();
        database.ref(`quizzes/${quizId}`).remove()
            .then(() => {
                alert('Quiz deleted successfully!');
            })
            .catch((error) => {
                console.error('Error deleting quiz:', error);
                alert('Error deleting quiz. Please try again.');
            });
    },

    // Cancel editing
    cancelEdit() {
        this.editingQuizId = null;
        document.getElementById('quiz-form-section').style.display = 'none';
        document.getElementById('quiz-form').reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Initialize admin panel when page loads
document.addEventListener('DOMContentLoaded', () => {
    admin.init();
});
