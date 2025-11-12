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

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.checkAdminStatus();
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

    // Check if user is admin
    checkAdminStatus() {
        const ADMIN_EMAIL = 'techride.trevor@gmail.com';
        this.isAdmin = (this.currentUser.email === ADMIN_EMAIL);
        this.updateAdminButton();
    },

    updateAdminButton() {
        const adminBtns = ['admin-btn', 'admin-btn-small'];
        adminBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.style.display = this.isAdmin ? 'block' : 'none';
            }
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
