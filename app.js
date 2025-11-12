// Main Application Logic with Google Authentication
const app = {
    currentUser: null,
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
    quizzes: [],
    isAdmin: false,

    // Initialize the app
    init() {
        this.setupAuthListener();
    },

    // Firebase Authentication Listener
    setupAuthListener() {
        if (!firebase.apps.length) {
            console.log('Firebase not initialized');
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.checkAdminStatus();
                this.loadQuizzes();
                this.showSection('quiz-selection');
                this.updateUserDisplay();
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                this.showSection('auth-section');
                this.updateUserDisplay();
            }
        });
    },

    // Check if user is admin
    checkAdminStatus() {
        if (!this.currentUser) return;

        const database = firebase.database();
        database.ref(`admins/${this.currentUser.uid}`).once('value')
            .then((snapshot) => {
                this.isAdmin = snapshot.val() === true;
                this.updateAdminButton();
            })
            .catch((error) => {
                console.error('Error checking admin status:', error);
                this.isAdmin = false;
            });
    },

    updateAdminButton() {
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.style.display = this.isAdmin ? 'block' : 'none';
        }
    },

    // Google Sign In
    login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .catch((error) => {
                console.error('Authentication error:', error);
                alert('Sign in failed. Please try again.');
            });
    },

    // Sign Out
    logout() {
        firebase.auth().signOut()
            .catch((error) => {
                console.error('Sign out error:', error);
            });
    },

    updateUserDisplay() {
        const loginForm = document.getElementById('login-form');
        const userInfo = document.getElementById('user-info');
        const currentUserSpan = document.getElementById('current-user');
        const userEmailSpan = document.getElementById('user-email');
        const userPhoto = document.getElementById('user-photo');

        if (this.currentUser) {
            loginForm.style.display = 'none';
            userInfo.style.display = 'block';
            currentUserSpan.textContent = this.currentUser.displayName || 'User';
            userEmailSpan.textContent = this.currentUser.email || '';
            if (userPhoto && this.currentUser.photoURL) {
                userPhoto.src = this.currentUser.photoURL;
            }
        } else {
            loginForm.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    },

    // Navigate to admin panel
    goToAdmin() {
        window.location.href = 'admin.html';
    },

    // UI Navigation
    showSection(sectionId) {
        const sections = ['auth-section', 'quiz-selection', 'quiz-section', 'results-section'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = id === sectionId ? 'block' : 'none';
            }
        });
    },

    // Load Quizzes from Firebase
    loadQuizzes() {
        const database = firebase.database();
        database.ref('quizzes').once('value')
            .then((snapshot) => {
                const quizzesData = snapshot.val();
                if (quizzesData) {
                    this.quizzes = Object.keys(quizzesData).map(key => ({
                        id: key,
                        ...quizzesData[key]
                    }));
                } else {
                    // No quizzes in database, use default ones
                    this.quizzes = this.getDefaultQuizzes();
                }
                this.renderQuizList();
            })
            .catch((error) => {
                console.error('Error loading quizzes:', error);
                // Fallback to default quizzes
                this.quizzes = this.getDefaultQuizzes();
                this.renderQuizList();
            });
    },

    // Default quizzes for initial setup
    getDefaultQuizzes() {
        return [
            {
                id: 'charlottes-web',
                title: "Charlotte's Web",
                description: "Test your knowledge of E.B. White's classic tale",
                questions: [
                    {
                        question: "What is the name of the pig in Charlotte's Web?",
                        options: ["Wilbur", "Charlie", "Babe", "Porky"],
                        correctAnswer: 0
                    },
                    {
                        question: "What kind of animal is Charlotte?",
                        options: ["Butterfly", "Bee", "Spider", "Ant"],
                        correctAnswer: 2
                    },
                    {
                        question: "What does Charlotte write in her web to save Wilbur?",
                        options: ["GOOD PIG", "SOME PIG", "BEST PIG", "NICE PIG"],
                        correctAnswer: 1
                    },
                    {
                        question: "Who is Fern?",
                        options: ["The farmer's wife", "The farmer's daughter", "A goose", "A horse"],
                        correctAnswer: 1
                    },
                    {
                        question: "Where does the story take place?",
                        options: ["A zoo", "A farm", "A forest", "A city"],
                        correctAnswer: 1
                    }
                ]
            }
        ];
    },

    // Quiz List Rendering
    renderQuizList() {
        const quizList = document.getElementById('quiz-list');
        if (!quizList) return;

        quizList.innerHTML = '';

        if (this.quizzes.length === 0) {
            quizList.innerHTML = '<p style="text-align: center; color: #666;">No quizzes available yet. Check back soon!</p>';
            return;
        }

        this.quizzes.forEach(quiz => {
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
            userId: this.currentUser.uid,
            userName: this.currentUser.displayName || 'Anonymous',
            userEmail: this.currentUser.email,
            quiz: this.currentQuiz.title,
            quizId: this.currentQuiz.id,
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
