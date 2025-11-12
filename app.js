// Main Application Logic
const app = {
    currentUser: null,
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,

    // Initialize the app
    init() {
        this.checkSavedUser();
        this.renderQuizList();
    },

    // User Authentication (Simple local storage based)
    login() {
        const username = document.getElementById('username').value.trim();
        if (username) {
            this.currentUser = username;
            localStorage.setItem('homeschoolUser', username);
            this.showSection('quiz-selection');
            this.updateUserDisplay();
        } else {
            alert('Please enter your name!');
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('homeschoolUser');
        document.getElementById('username').value = '';
        this.showSection('auth-section');
        this.updateUserDisplay();
    },

    checkSavedUser() {
        const savedUser = localStorage.getItem('homeschoolUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.showSection('quiz-selection');
            this.updateUserDisplay();
        }
    },

    updateUserDisplay() {
        const loginForm = document.getElementById('login-form');
        const userInfo = document.getElementById('user-info');
        const currentUserSpan = document.getElementById('current-user');

        if (this.currentUser) {
            loginForm.style.display = 'none';
            userInfo.style.display = 'block';
            currentUserSpan.textContent = this.currentUser;
        } else {
            loginForm.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    },

    // UI Navigation
    showSection(sectionId) {
        const sections = ['auth-section', 'quiz-selection', 'quiz-section', 'results-section'];
        sections.forEach(id => {
            document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
        });
    },

    // Quiz List Rendering
    renderQuizList() {
        const quizList = document.getElementById('quiz-list');
        quizList.innerHTML = '';

        quizzes.forEach(quiz => {
            const quizCard = document.createElement('div');
            quizCard.className = 'quiz-card';
            quizCard.innerHTML = `
                <h3>${quiz.title}</h3>
                <p>${quiz.questions.length} questions</p>
                <p style="margin-top: 10px; font-size: 0.85em;">${quiz.description || ''}</p>
            `;
            quizCard.onclick = () => this.startQuiz(quiz);
            quizList.appendChild(quizCard);
        });
    },

    // Quiz Functionality
    startQuiz(quiz) {
        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.showSection('quiz-section');
        this.renderQuestion();
    },

    renderQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];

        // Update header
        document.getElementById('quiz-title').textContent = this.currentQuiz.title;
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.currentQuiz.questions.length;

        // Update progress bar
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        document.getElementById('progress').style.width = progress + '%';

        // Display question
        document.getElementById('question-text').textContent = question.question;

        // Display answers
        const answersContainer = document.getElementById('answers');
        answersContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.onclick = () => this.selectAnswer(index);
            answersContainer.appendChild(button);
        });

        // Hide next button initially
        document.getElementById('next-btn').style.display = 'none';
    },

    selectAnswer(selectedIndex) {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const answerButtons = document.querySelectorAll('.answer-btn');

        // Disable all buttons
        answerButtons.forEach(btn => btn.disabled = true);

        // Mark correct and incorrect answers
        answerButtons.forEach((btn, index) => {
            if (index === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === selectedIndex) {
                btn.classList.add('incorrect');
            }
        });

        // Store answer
        this.userAnswers.push(selectedIndex);

        // Update score
        if (selectedIndex === question.correctAnswer) {
            this.score++;
        }

        // Show next button or finish
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            document.getElementById('next-btn').style.display = 'block';
        } else {
            setTimeout(() => this.showResults(), 1500);
        }
    },

    nextQuestion() {
        this.currentQuestionIndex++;
        this.renderQuestion();
    },

    showResults() {
        const totalQuestions = this.currentQuiz.questions.length;
        const percentage = Math.round((this.score / totalQuestions) * 100);

        document.getElementById('score').textContent = this.score;
        document.getElementById('total').textContent = totalQuestions;
        document.getElementById('percentage').textContent = percentage + '%';

        // Feedback message
        let feedback = '';
        if (percentage === 100) {
            feedback = 'Perfect! You\'re a star! 🌟';
        } else if (percentage >= 80) {
            feedback = 'Great job! Keep it up! 🎉';
        } else if (percentage >= 60) {
            feedback = 'Good effort! Try again for a better score! 👍';
        } else {
            feedback = 'Keep practicing! You\'ll do better next time! 💪';
        }
        document.getElementById('feedback-message').textContent = feedback;

        this.showSection('results-section');

        // Save results to Firebase
        this.saveResults(percentage);
    },

    retakeQuiz() {
        this.startQuiz(this.currentQuiz);
    },

    backToQuizzes() {
        this.currentQuiz = null;
        this.showSection('quiz-selection');
    },

    // Firebase Integration
    saveResults(percentage) {
        if (!firebase.apps.length || !this.currentUser) {
            console.log('Firebase not initialized or no user logged in');
            return;
        }

        const database = firebase.database();
        const timestamp = new Date().toISOString();

        const resultData = {
            user: this.currentUser,
            quiz: this.currentQuiz.title,
            score: this.score,
            total: this.currentQuiz.questions.length,
            percentage: percentage,
            timestamp: timestamp
        };

        database.ref('quiz-results').push(resultData)
            .then(() => {
                console.log('Results saved successfully!');
            })
            .catch((error) => {
                console.error('Error saving results:', error);
            });
    }
};

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
