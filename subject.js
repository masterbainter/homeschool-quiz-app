// Subject Page Logic
const subject = {
    currentUser: null,
    subjectId: null,
    subjectData: null,
    sections: [],

    // Initialize
    init() {
        // Get subject ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.subjectId = urlParams.get('subject');

        if (!this.subjectId) {
            window.location.href = '/';
            return;
        }

        this.setupAuthListener();
    },

    // Firebase Authentication Listener
    setupAuthListener() {
        if (!firebase.apps.length) {
            this.showNotFound();
            return;
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Load roles AFTER user is authenticated
                await RolesLoader.load();

                // Check if user is allowed using RolesLoader
                if (!RolesLoader.isAllowedUser(user.email)) {
                    console.error('Access denied for:', user.email);
                    console.log('Current roles:', RolesLoader.roles);
                    alert('Access denied. This account is not authorized.');
                    firebase.auth().signOut();
                    window.location.href = '/';
                    return;
                }

                this.currentUser = user;
                this.updateUserDisplay();
                this.loadSubject();
            } else {
                // Redirect to home to sign in
                window.location.href = '/';
            }
        });
    },

    updateUserDisplay() {
        const nameEl = document.getElementById('user-name');
        const photoEl = document.getElementById('user-photo');

        if (nameEl) nameEl.textContent = this.currentUser.displayName || 'User';
        if (photoEl && this.currentUser.photoURL) {
            photoEl.src = this.currentUser.photoURL;
        }
    },

    // Load subject from Firebase
    loadSubject() {
        const database = firebase.database();
        database.ref(`curriculum/${this.subjectId}`).once('value')
            .then((snapshot) => {
                this.subjectData = snapshot.val();

                if (!this.subjectData || this.subjectData.enabled === false) {
                    this.showNotFound();
                    return;
                }

                this.updateHeader();
                this.loadSections();
                this.showSubjectSection();
            })
            .catch((error) => {
                console.error('Error loading subject:', error);
                this.showNotFound();
            });
    },

    updateHeader() {
        // Update desktop header (top bar)
        const headerIcon = document.getElementById('subject-icon');
        const headerTitle = document.getElementById('subject-title');

        if (headerIcon) headerIcon.textContent = this.subjectData.icon || '📖';
        if (headerTitle) headerTitle.textContent = this.subjectData.title || 'Subject';

        // Update large subject icon and title in the glassmorphic card
        const iconLarge = document.getElementById('subject-icon-large');
        const titleMain = document.getElementById('subject-title-main');
        const description = document.getElementById('subject-description');

        if (iconLarge) iconLarge.textContent = this.subjectData.icon || '📖';
        if (titleMain) titleMain.textContent = this.subjectData.title || 'Subject';
        if (description) description.textContent = this.subjectData.description || '';

        document.title = `${this.subjectData.title} - Homeschool Learning Hub`;
    },

    loadSections() {
        const sectionsData = this.subjectData.sections || {};

        // Convert to array and sort
        this.sections = Object.keys(sectionsData)
            .map(key => ({
                id: key,
                ...sectionsData[key]
            }))
            .filter(section => section.enabled !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        this.renderSections();
    },

    renderSections() {
        const sectionsGrid = document.getElementById('sections-grid');
        const emptyState = document.getElementById('empty-sections');

        if (this.sections.length === 0) {
            sectionsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        sectionsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        sectionsGrid.innerHTML = this.sections.map(section => {
            // Count items in this section (e.g., quizzes)
            const itemCount = section.itemCount || 0;

            return `
                <div class="section-card ${section.enabled ? '' : 'disabled'}"
                     onclick="subject.goToSection('${section.id}')">
                    <span class="section-type-badge">${section.type || 'content'}</span>
                    <h3>${this.escapeHtml(section.title)}</h3>
                    <p>${this.escapeHtml(section.description || '')}</p>
                    <div class="section-meta">
                        <span class="section-count">${itemCount} ${itemCount === 1 ? 'item' : 'items'}</span>
                        <span>Click to explore →</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Navigate to section
    goToSection(sectionId) {
        window.location.href = `/${this.subjectId}/${sectionId}`;
    },

    // UI State Management
    showSubjectSection() {
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('not-found-section').style.display = 'none';
        document.getElementById('subject-section').style.display = 'block';
    },

    showNotFound() {
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('subject-section').style.display = 'none';
        document.getElementById('not-found-section').style.display = 'block';
        document.getElementById('subject-header').style.display = 'none';
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
    subject.init();
});
