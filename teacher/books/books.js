// Book Library Management Logic
const books = {
    currentUser: null,
    isAdmin: false,
    isTeacher: false,
    searchResults: [],
    selectedBook: null,
    students: [],

    init() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                document.getElementById('auth-check').style.display = 'none';
                document.getElementById('unauthorized').style.display = 'block';
                return;
            }

            // Load roles
            await RolesLoader.load();

            this.currentUser = user;
            this.isAdmin = RolesLoader.isAdmin(user.email);
            this.isTeacher = RolesLoader.isTeacher(user.email);

            if (!this.isAdmin && !this.isTeacher) {
                document.getElementById('auth-check').style.display = 'none';
                document.getElementById('unauthorized').style.display = 'block';
                return;
            }

            // Load Google Books API key from Firebase
            await GOOGLE_BOOKS_CONFIG.loadApiKey();

            // Check if Google Books API is configured
            if (!GoogleBooksAPI.isConfigured()) {
                document.getElementById('api-warning').style.display = 'block';
            }

            await this.loadStudents();

            document.getElementById('auth-check').style.display = 'none';
            document.getElementById('content').style.display = 'block';
        });
    },

    async loadStudents() {
        try {
            const database = firebase.database();
            const usersSnapshot = await database.ref('users').once('value');
            const usersData = usersSnapshot.val() || {};

            // Get student emails from roles
            const roles = RolesLoader.roles;
            const studentEmails = roles.students || [];

            console.log('Loading students...');
            console.log('Student emails from roles:', studentEmails);
            console.log('Users in database:', Object.keys(usersData).length);

            // Create student list from users matching student emails
            this.students = [];
            Object.keys(usersData).forEach(uid => {
                const user = usersData[uid];
                if (studentEmails.includes(user.email)) {
                    console.log('Found student with profile:', user.email);
                    this.students.push({
                        userId: uid,
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email
                    });
                }
            });

            // Also add pending students (who haven't signed in yet)
            studentEmails.forEach(email => {
                const exists = this.students.some(s => s.email === email);
                if (!exists) {
                    console.log('Adding pending student:', email);
                    this.students.push({
                        userId: `pending-${email}`,
                        name: email.split('@')[0],
                        email: email,
                        pending: true
                    });
                }
            });

            console.log('Total students loaded:', this.students.length);
            console.log('Students:', this.students);

        } catch (error) {
            console.error('Error loading students:', error);
        }
    },

    async search() {
        const query = document.getElementById('search-query').value.trim();

        if (!query) {
            alert('Please enter a search term');
            return;
        }

        if (!GoogleBooksAPI.isConfigured()) {
            alert('Google Books API is not configured. Please add your API key to google-books-config.js');
            return;
        }

        // Show loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results-container').style.display = 'none';

        try {
            this.searchResults = await GoogleBooksAPI.searchBooks(query, 30);
            this.renderResults();
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search books. Please check your API key and try again.');
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    },

    renderResults() {
        const container = document.getElementById('results-container');

        if (this.searchResults.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No books found</h3>
                    <p>Try a different search term or check your spelling</p>
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'books-grid';

        grid.innerHTML = this.searchResults.map(book => `
            <div class="book-card" onclick="books.selectBook('${book.id}')">
                ${book.coverImage ?
                    `<img src="${book.coverImage}" alt="${this.escapeHtml(book.title)}" class="book-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="book-cover-placeholder" style="display:none;">📖</div>` :
                    `<div class="book-cover-placeholder">📖</div>`
                }
                <div class="book-title">${this.escapeHtml(book.title)}</div>
                <div class="book-author">${this.escapeHtml(book.authorName)}</div>
                <div class="book-meta">
                    ${book.pageCount ? `<span class="book-meta-item">${book.pageCount} pages</span>` : ''}
                    ${book.publishedDate ? `<span class="book-meta-item">${book.publishedDate.substring(0, 4)}</span>` : ''}
                    ${book.isbn ? `<span class="book-meta-item">ISBN: ${book.isbn}</span>` : ''}
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); books.showAssignModal('${book.id}')">
                        Assign to Student
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = '';
        container.appendChild(grid);
        container.style.display = 'block';
    },

    selectBook(bookId) {
        const book = this.searchResults.find(b => b.id === bookId);
        if (book && book.infoLink) {
            window.open(book.infoLink, '_blank');
        }
    },

    showAssignModal(bookId) {
        this.selectedBook = this.searchResults.find(b => b.id === bookId);
        if (!this.selectedBook) return;

        // Show book info
        const bookInfo = document.getElementById('selected-book-info');
        bookInfo.innerHTML = `
            <div style="display: flex; gap: 15px; padding: 15px; background: #f5f5f5; border-radius: 6px;">
                ${this.selectedBook.coverImage ?
                    `<img src="${this.selectedBook.coverImage}" style="width: 80px; height: 120px; object-fit: contain; background: white; border-radius: 4px;">` :
                    `<div style="width: 80px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">📖</div>`
                }
                <div>
                    <h3 style="margin: 0 0 5px 0;">${this.escapeHtml(this.selectedBook.title)}</h3>
                    <p style="margin: 0; color: #666;">${this.escapeHtml(this.selectedBook.authorName)}</p>
                    ${this.selectedBook.pageCount ? `<p style="margin: 5px 0 0 0; font-size: 0.9em; color: #999;">${this.selectedBook.pageCount} pages</p>` : ''}
                </div>
            </div>
        `;

        // Render student list
        const studentList = document.getElementById('student-list');
        studentList.innerHTML = this.students.map(student => `
            <div class="student-checkbox">
                <input type="checkbox" id="student-${student.userId}" value="${student.userId}" ${student.pending ? 'disabled' : ''}>
                <label for="student-${student.userId}">
                    ${this.escapeHtml(student.name)}
                    ${student.pending ? '<span style="color: #999; font-size: 0.9em;"> (Not signed in yet)</span>' : ''}
                </label>
            </div>
        `).join('');

        document.getElementById('assign-modal').classList.add('active');
    },

    closeAssignModal() {
        document.getElementById('assign-modal').classList.remove('active');
        this.selectedBook = null;
    },

    async confirmAssignment() {
        if (!this.selectedBook) return;

        // Get selected students
        const checkboxes = document.querySelectorAll('#student-list input[type="checkbox"]:checked');
        const selectedStudentIds = Array.from(checkboxes).map(cb => cb.value);

        if (selectedStudentIds.length === 0) {
            alert('Please select at least one student');
            return;
        }

        try {
            const database = firebase.database();
            const updates = {};

            // Create assignment for each selected student
            selectedStudentIds.forEach(studentId => {
                const assignmentId = `${this.selectedBook.id}`;
                updates[`reading-assignments/${studentId}/${assignmentId}`] = {
                    bookId: this.selectedBook.id,
                    bookTitle: this.selectedBook.title,
                    author: this.selectedBook.authorName,
                    isbn: this.selectedBook.isbn,
                    coverImage: this.selectedBook.coverImageLarge || this.selectedBook.coverImage,
                    pageCount: this.selectedBook.pageCount,
                    assignedDate: new Date().toISOString(),
                    assignedBy: this.currentUser.email,
                    status: 'assigned',
                    currentChapter: 0
                };

                // Cache book data
                updates[`books-cache/${this.selectedBook.id}`] = {
                    ...this.selectedBook,
                    cachedAt: new Date().toISOString()
                };
            });

            await database.ref().update(updates);

            const studentNames = this.students
                .filter(s => selectedStudentIds.includes(s.userId))
                .map(s => s.name)
                .join(', ');

            alert(`✅ Successfully assigned "${this.selectedBook.title}" to: ${studentNames}`);
            this.closeAssignModal();

        } catch (error) {
            console.error('Error assigning book:', error);
            alert('Failed to assign book. Please try again.');
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    books.init();
});
