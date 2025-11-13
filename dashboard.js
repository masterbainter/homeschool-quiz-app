// Dashboard Application Logic
const dashboard = {
    currentUser: null,
    isAdmin: false,
    subjects: [],

    // Initialize
    init() {
        this.setupAuthListener();
    },

    // Firebase Authentication Listener
    setupAuthListener() {
        if (!firebase.apps.length) {
            console.log('Firebase not initialized');
            return;
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Load roles from Firebase first
                await RolesLoader.load();

                // Check if user is allowed
                if (!RolesLoader.isAllowedUser(user.email)) {
                    alert('Access denied. This account is not authorized to use this app.\n\nPlease contact your teacher.');
                    firebase.auth().signOut();
                    return;
                }

                this.currentUser = user;
                this.checkAdminStatus();
                this.createUserProfile(); // Create/update user profile
                this.loadCurriculum();
                this.showDashboard();
                this.updateUserDisplay();
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                this.showAuthSection();
            }
        });
    },

    // Check if user is admin or teacher (uses dynamic roles from Firebase)
    checkAdminStatus() {
        const userEmail = this.currentUser.email;
        this.isAdmin = RolesLoader.isAdmin(userEmail);
        this.isTeacher = RolesLoader.isTeacher(userEmail);

        // Both admins and teachers see admin button
        this.updateAdminButton();
    },

    updateAdminButton() {
        const adminBtns = ['admin-btn', 'admin-btn-small'];
        adminBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                // Show teacher/admin button based on role
                btn.style.display = (this.isAdmin || this.isTeacher) ? 'block' : 'none';

                // Update button text and link
                if (this.isAdmin) {
                    btn.textContent = 'Admin Panel';
                    btn.onclick = () => window.location.href = '/admin';
                } else if (this.isTeacher) {
                    btn.textContent = 'Teacher Panel';
                    btn.onclick = () => window.location.href = '/teacher';
                }
            }
        });
    },

    // Create or update user profile in Firebase
    createUserProfile() {
        if (!this.currentUser) return;

        const database = firebase.database();
        const userRef = database.ref(`users/${this.currentUser.uid}`);

        // Check if profile exists
        userRef.once('value').then((snapshot) => {
            const profile = {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName || this.currentUser.email.split('@')[0],
                photoURL: this.currentUser.photoURL || null,
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                isAdmin: this.isAdmin
            };

            if (!snapshot.exists()) {
                // New user - create profile
                profile.createdAt = firebase.database.ServerValue.TIMESTAMP;
                userRef.set(profile).then(() => {
                    console.log('User profile created');
                }).catch((error) => {
                    console.error('Error creating user profile:', error);
                });
            } else {
                // Existing user - update last login and display name
                userRef.update({
                    displayName: profile.displayName,
                    photoURL: profile.photoURL,
                    lastLogin: profile.lastLogin,
                    isAdmin: profile.isAdmin
                }).catch((error) => {
                    console.error('Error updating user profile:', error);
                });
            }
        }).catch((error) => {
            console.error('Error checking user profile:', error);
        });
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

    // UI Updates
    showAuthSection() {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
    },

    showDashboard() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
    },

    updateUserDisplay() {
        // Update both auth section and dashboard user info
        const userElements = [
            { photo: 'user-photo', name: 'current-user', email: 'user-email' },
            { photo: 'user-photo-small', name: 'user-name', email: 'user-email-small' }
        ];

        userElements.forEach(els => {
            const nameEl = document.getElementById(els.name);
            const emailEl = document.getElementById(els.email);
            const photoEl = document.getElementById(els.photo);

            if (nameEl) nameEl.textContent = this.currentUser.displayName || 'User';
            if (emailEl) emailEl.textContent = this.currentUser.email || '';
            if (photoEl && this.currentUser.photoURL) {
                photoEl.src = this.currentUser.photoURL;
            }
        });
    },

    // Load Curriculum from Firebase
    loadCurriculum() {
        const database = firebase.database();
        database.ref('curriculum').on('value', (snapshot) => {
            const curriculumData = snapshot.val();

            if (curriculumData) {
                // Convert to array and sort by order
                this.subjects = Object.keys(curriculumData)
                    .map(key => ({
                        id: key,
                        ...curriculumData[key]
                    }))
                    .filter(subject => subject.enabled !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
            } else {
                // Create default curriculum if none exists
                if (this.isAdmin) {
                    this.createDefaultCurriculum();
                } else {
                    this.subjects = [];
                }
            }

            this.renderSubjects();
        });

        // Load assigned quizzes and reading list for students (not admin)
        if (!this.isAdmin && !this.isTeacher) {
            this.loadReadingList();
            this.loadAssignedQuizzes();
        }
    },

    // Load reading assignments for current student
    loadReadingList() {
        const database = firebase.database();

        database.ref(`reading-assignments/${this.currentUser.uid}`).on('value', (snapshot) => {
            const readingAssignments = snapshot.val();

            if (!readingAssignments || Object.keys(readingAssignments).length === 0) {
                document.getElementById('reading-list-section').style.display = 'none';
                return;
            }

            const booksList = Object.values(readingAssignments);

            // Render reading list
            const grid = document.getElementById('reading-list-grid');
            grid.innerHTML = booksList.map(book => {
                const statusClass = book.status === 'completed' ? 'completed' :
                                   book.status === 'reading' ? 'reading' : 'assigned';
                const statusText = book.status === 'completed' ? 'Completed' :
                                  book.status === 'reading' ? 'Reading' : 'Assigned';

                return `
                    <div class="book-card" onclick="dashboard.updateBookStatus('${book.bookId}', '${book.status}')">
                        ${book.coverImage ?
                            `<img src="${book.coverImage}" alt="${this.escapeHtml(book.bookTitle)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                             <div class="book-cover-placeholder" style="display:none;">📖</div>` :
                            `<div class="book-cover-placeholder">📖</div>`
                        }
                        <h3>${this.escapeHtml(book.bookTitle)}</h3>
                        <p>${this.escapeHtml(book.author)}</p>
                        <span class="book-status ${statusClass}">${statusText}</span>
                        ${book.pageCount ? `<p style="font-size: 0.85em; color: #999;">${book.pageCount} pages</p>` : ''}
                    </div>
                `;
            }).join('');

            document.getElementById('reading-list-section').style.display = 'block';
        });
    },

    // Update book reading status (cycle through: assigned -> reading -> completed)
    updateBookStatus(bookId, currentStatus) {
        const statusCycle = {
            'assigned': 'reading',
            'reading': 'completed',
            'completed': 'assigned'
        };

        const newStatus = statusCycle[currentStatus];
        const database = firebase.database();

        database.ref(`reading-assignments/${this.currentUser.uid}/${bookId}/status`)
            .set(newStatus)
            .catch((error) => {
                console.error('Error updating book status:', error);
                alert('Failed to update status. Please try again.');
            });
    },

    // Load quizzes assigned to current student
    loadAssignedQuizzes() {
        const database = firebase.database();

        // Listen for assignments
        database.ref(`assignments/${this.currentUser.uid}`).on('value', async (assignmentsSnap) => {
            const assignments = assignmentsSnap.val();

            if (!assignments || Object.keys(assignments).length === 0) {
                document.getElementById('assigned-quizzes-section').style.display = 'none';
                return;
            }

            // Get all quizzes
            const quizzesSnap = await database.ref('quizzes').once('value');
            const allQuizzes = quizzesSnap.val() || {};

            // Get student's results
            const resultsSnap = await database.ref('quiz-results')
                .orderByChild('userId')
                .equalTo(this.currentUser.uid)
                .once('value');
            const results = resultsSnap.val() || {};

            // Build assigned quiz cards
            const assignedQuizzes = Object.keys(assignments).map(quizId => {
                const quiz = allQuizzes[quizId];
                if (!quiz) return null;

                // Find best result for this quiz
                const quizResults = Object.values(results).filter(r => r.quizId === quizId);
                const bestResult = quizResults.length > 0
                    ? quizResults.reduce((best, r) => r.percentage > best.percentage ? r : best)
                    : null;

                return {
                    id: quizId,
                    title: quiz.title,
                    description: quiz.description || '',
                    questionCount: quiz.questions.length,
                    bestScore: bestResult ? bestResult.percentage : null,
                    attempts: quizResults.length,
                    assignedDate: assignments[quizId].assignedDate
                };
            }).filter(q => q !== null);

            // Render assigned quizzes
            const grid = document.getElementById('assigned-quizzes-grid');
            if (assignedQuizzes.length > 0) {
                grid.innerHTML = assignedQuizzes.map(quiz => {
                    const statusClass = quiz.bestScore === null ? 'not-started' :
                                       quiz.bestScore >= 80 ? 'completed' : 'in-progress';
                    const statusText = quiz.bestScore === null ? 'Not Started' :
                                      `${quiz.bestScore}% (${quiz.attempts} attempt${quiz.attempts > 1 ? 's' : ''})`;

                    return `
                        <div class="quiz-card assignment-card" onclick="window.location.href='/${quiz.id.replace(/-/g, '/')}'">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <h3>${this.escapeHtml(quiz.title)}</h3>
                                <span class="status-badge status-${statusClass}" style="font-size: 0.8em; padding: 4px 10px;">
                                    ${statusText}
                                </span>
                            </div>
                            <p style="color: #666; margin: 10px 0;">${quiz.questionCount} questions</p>
                            <p style="color: #999; font-size: 0.85em; margin-top: 10px;">
                                Assigned: ${new Date(quiz.assignedDate).toLocaleDateString()}
                            </p>
                        </div>
                    `;
                }).join('');

                // Add CSS for assignment cards if not already present
                if (!document.getElementById('assignment-card-styles')) {
                    const style = document.createElement('style');
                    style.id = 'assignment-card-styles';
                    style.textContent = `
                        .assignment-card {
                            border: 2px solid #667eea;
                            position: relative;
                        }
                        .assignment-card::before {
                            content: '📌';
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            font-size: 1.2em;
                        }
                        .status-badge {
                            display: inline-block;
                            padding: 4px 12px;
                            border-radius: 12px;
                            font-size: 0.85em;
                            font-weight: 600;
                        }
                        .status-completed {
                            background: #d4edda;
                            color: #155724;
                        }
                        .status-in-progress {
                            background: #fff3cd;
                            color: #856404;
                        }
                        .status-not-started {
                            background: #f8d7da;
                            color: #721c24;
                        }
                    `;
                    document.head.appendChild(style);
                }

                document.getElementById('assigned-quizzes-section').style.display = 'block';
            } else {
                document.getElementById('assigned-quizzes-section').style.display = 'none';
            }
        });
    },

    // Create default curriculum structure
    createDefaultCurriculum() {
        const database = firebase.database();
        const defaultCurriculum = {
            reading: {
                title: 'Reading & Literature',
                icon: '📚',
                description: 'Explore books and improve reading skills',
                order: 1,
                enabled: true,
                color: 'reading',
                sections: {
                    books: {
                        title: 'Book Quizzes',
                        description: 'Test your knowledge on books you\'ve read',
                        type: 'quiz',
                        order: 1,
                        enabled: true
                    }
                }
            }
        };

        database.ref('curriculum').set(defaultCurriculum)
            .then(() => {
                console.log('Default curriculum created');
            })
            .catch((error) => {
                console.error('Error creating default curriculum:', error);
            });
    },

    // Render subjects grid
    renderSubjects() {
        const subjectsGrid = document.getElementById('subjects-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.subjects.length === 0) {
            subjectsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        subjectsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        subjectsGrid.innerHTML = this.subjects.map(subject => {
            // Count enabled sections
            const sections = subject.sections || {};
            const sectionCount = Object.keys(sections).filter(
                key => sections[key].enabled !== false
            ).length;

            return `
                <div class="subject-card ${subject.color || 'reading'} ${subject.enabled ? '' : 'disabled'}"
                     onclick="dashboard.goToSubject('${subject.id}')">
                    <span class="subject-icon">${subject.icon || '📖'}</span>
                    <h3 class="subject-title">${this.escapeHtml(subject.title)}</h3>
                    <p class="subject-description">${this.escapeHtml(subject.description || '')}</p>
                    <p class="subject-sections-count">${sectionCount} ${sectionCount === 1 ? 'section' : 'sections'} available</p>
                </div>
            `;
        }).join('');
    },

    // Navigate to subject
    goToSubject(subjectId) {
        window.location.href = `/${subjectId}`;
    },

    // Helper: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
});
