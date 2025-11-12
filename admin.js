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
                window.location.href = 'index.html';
            }
        });
    },

    // Check if user has admin privileges
    checkAdminStatus() {
        const database = firebase.database();
        database.ref(`admins/${this.currentUser.uid}`).once('value')
            .then((snapshot) => {
                if (snapshot.val() === true) {
                    this.isAdmin = true;
                    this.showAdminPanel();
                    this.loadQuizzes();
                } else {
                    this.showUnauthorized('You do not have admin access');
                }
            })
            .catch((error) => {
                console.error('Error checking admin status:', error);
                this.showUnauthorized('Error verifying admin access');
            });
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
        document.getElementById('quiz-form').reset();
        document.getElementById('questions-container').innerHTML = '';

        // Add one empty question
        this.addQuestion();

        document.getElementById('quiz-form-section').style.display = 'block';
        document.getElementById('quiz-form-section').scrollIntoView({ behavior: 'smooth' });
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
