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

            console.log('=== LOADING STUDENTS ===');
            console.log('RolesLoader.loaded:', RolesLoader.loaded);
            console.log('Full roles object:', roles);
            console.log('Student emails from roles:', studentEmails);
            console.log('Users in database:', Object.keys(usersData).length);
            console.log('All users:', Object.keys(usersData).map(uid => ({
                uid,
                email: usersData[uid].email,
                name: usersData[uid].displayName
            })));

            // Create student list from users matching student emails
            this.students = [];
            Object.keys(usersData).forEach(uid => {
                const user = usersData[uid];
                const userEmailLower = user.email ? user.email.toLowerCase() : '';
                const isMatch = studentEmails.includes(userEmailLower);

                console.log(`Checking user ${user.email}: toLowerCase="${userEmailLower}", isMatch=${isMatch}`);

                // Case-insensitive email comparison
                if (user.email && isMatch) {
                    console.log('✓ Found student with profile:', user.email);
                    this.students.push({
                        userId: uid,
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email
                    });
                }
            });

            console.log('After database match, students:', this.students.length);

            // Also add pending students (who haven't signed in yet)
            studentEmails.forEach(email => {
                // Case-insensitive check for existing students
                const exists = this.students.some(s => s.email.toLowerCase() === email.toLowerCase());
                console.log(`Checking pending: ${email}, exists=${exists}`);
                if (!exists) {
                    console.log('✓ Adding pending student:', email);
                    this.students.push({
                        userId: `pending-${email}`,
                        name: email.split('@')[0],
                        email: email,
                        pending: true
                    });
                }
            });

            console.log('=== FINAL RESULT ===');
            console.log('Total students loaded:', this.students.length);
            console.log('Students:', this.students);

        } catch (error) {
            console.error('Error loading students:', error);
        }
    },

    async search() {
        const query = document.getElementById('search-query').value.trim();

        if (!query) {
            Toast.warning('Please enter a search term');
            return;
        }

        if (!GoogleBooksAPI.isConfigured()) {
            Toast.error('Google Books API is not configured. Please add your API key to google-books-config.js');
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
            Toast.error('Failed to search books. Please check your API key and try again.');
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    },

    renderResults() {
        const container = document.getElementById('results-container');

        if (this.searchResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3 class="empty-title">No books found</h3>
                    <p class="empty-description">Try a different search term or check your spelling</p>
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
                    <button class="btn-assign" onclick="event.stopPropagation(); books.showAssignModal('${book.id}')">
                        📚 Assign
                    </button>
                    <button class="btn-quiz" onclick="event.stopPropagation(); books.showQuizGenerationModal('${book.id}')">
                        ✨ Quiz
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
        console.log('=== SHOW ASSIGN MODAL ===');
        console.log('bookId:', bookId);
        console.log('this.students:', this.students);
        console.log('this.students.length:', this.students.length);

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
            Toast.warning('Please select at least one student');
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

            Toast.success(`Successfully assigned "${this.selectedBook.title}" to: ${studentNames}`);
            this.closeAssignModal();

        } catch (error) {
            console.error('Error assigning book:', error);
            Toast.error('Failed to assign book. Please try again.');
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Quiz Generation Methods
    showQuizGenerationModal(bookId) {
        this.selectedBookForQuiz = this.searchResults.find(b => b.id === bookId);
        if (!this.selectedBookForQuiz) return;

        document.getElementById('quiz-gen-book-title').textContent = this.selectedBookForQuiz.title;
        document.getElementById('quiz-gen-book-author').textContent = this.selectedBookForQuiz.authorName;

        // Populate student select
        const studentSelect = document.getElementById('quiz-student-select');
        studentSelect.innerHTML = '<option value="">Select a student...</option>' +
            this.students.map(student => `
                <option value="${student.userId}"${student.pending ? ' disabled' : ''}>
                    ${this.escapeHtml(student.name)}${student.pending ? ' (Not signed in yet)' : ''}
                </option>
            `).join('');

        document.getElementById('quiz-gen-modal').classList.add('active');
    },

    closeQuizGenerationModal() {
        document.getElementById('quiz-gen-modal').classList.remove('active');
        this.selectedBookForQuiz = null;

        // Reset form
        document.getElementById('quiz-chapter-input').value = '';
        document.getElementById('quiz-num-questions').value = '10';
        document.getElementById('quiz-difficulty-select').value = 'medium';
        document.getElementById('quiz-student-select').value = '';
    },

    async generateQuizForStudent() {
        if (!this.selectedBookForQuiz) return;

        const chapter = document.getElementById('quiz-chapter-input').value.trim();
        const numQuestions = parseInt(document.getElementById('quiz-num-questions').value) || 10;
        const difficulty = document.getElementById('quiz-difficulty-select').value;
        const studentId = document.getElementById('quiz-student-select').value;

        if (!chapter) {
            Toast.warning('Please enter a chapter or topic');
            return;
        }

        if (!studentId) {
            Toast.warning('Please select a student');
            return;
        }

        // Get student info
        const student = this.students.find(s => s.userId === studentId);
        if (!student) {
            Toast.error('Student not found');
            return;
        }

        // Show loading state
        const generateBtn = document.querySelector('#quiz-gen-modal .btn-primary');
        const originalText = generateBtn.textContent;
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating quiz...';

        try {
            const database = firebase.database();

            // Create AI request
            const requestData = {
                type: 'generate-quiz',
                bookTitle: this.selectedBookForQuiz.title,
                bookAuthor: this.selectedBookForQuiz.authorName,
                chapter: chapter,
                numQuestions: numQuestions,
                difficulty: difficulty,
                studentId: studentId,
                studentName: student.name,
                userId: this.currentUser.uid,
                userName: this.currentUser.displayName || this.currentUser.email,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            // Save request to Firebase
            const requestRef = await database.ref('ai-quiz-requests').push(requestData);
            const requestId = requestRef.key;

            // Listen for completion
            const resultRef = database.ref(`ai-quiz-results/${requestId}`);

            // Set up one-time listener for the result
            resultRef.on('value', (snapshot) => {
                const result = snapshot.val();

                if (result && result.status === 'completed') {
                    // Stop listening
                    resultRef.off();

                    // Save the quiz
                    this.saveGeneratedQuiz(result.quiz, chapter, studentId, student.name);

                    // Clean up request
                    database.ref(`ai-quiz-requests/${requestId}`).remove();
                    database.ref(`ai-quiz-results/${requestId}`).remove();

                } else if (result && result.status === 'error') {
                    resultRef.off();
                    Toast.error(`Failed to generate quiz: ${result.error}`);
                    generateBtn.disabled = false;
                    generateBtn.textContent = originalText;

                    // Clean up
                    database.ref(`ai-quiz-requests/${requestId}`).remove();
                    database.ref(`ai-quiz-results/${requestId}`).remove();
                }
            });

            // Timeout after 2 minutes
            setTimeout(() => {
                resultRef.off();
                Toast.error('Quiz generation timed out. Please try again.');
                generateBtn.disabled = false;
                generateBtn.textContent = originalText;
            }, 120000);

        } catch (error) {
            console.error('Error generating quiz:', error);
            Toast.error('Failed to generate quiz. Please try again.');
            generateBtn.disabled = false;
            generateBtn.textContent = originalText;
        }
    },

    async saveGeneratedQuiz(quiz, chapter, studentId, studentName) {
        try {
            const database = firebase.database();

            // Create a unique quiz ID based on book and chapter
            const bookSlug = this.selectedBookForQuiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const chapterSlug = chapter.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const quizId = `reading-${bookSlug}-${chapterSlug}`;

            // Save quiz to Firebase
            await database.ref(`quizzes/${quizId}`).set({
                title: `${this.selectedBookForQuiz.title} - ${chapter}`,
                description: `Quiz for ${this.selectedBookForQuiz.title} by ${this.selectedBookForQuiz.authorName}`,
                bookTitle: this.selectedBookForQuiz.title,
                bookAuthor: this.selectedBookForQuiz.authorName,
                chapter: chapter,
                questions: quiz.questions,
                createdBy: this.currentUser.uid,
                createdAt: new Date().toISOString(),
                type: 'reading'
            });

            // Assign to student
            await database.ref(`assignments/${studentId}/${quizId}`).set({
                assignedDate: new Date().toISOString(),
                assignedBy: this.currentUser.email
            });

            Toast.success(`Quiz generated successfully! "${this.selectedBookForQuiz.title} - ${chapter}" has been assigned to ${studentName}.`);

            this.closeQuizGenerationModal();

        } catch (error) {
            console.error('Error saving quiz:', error);
            Toast.error('Quiz was generated but failed to save. Please try again.');
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    books.init();
});
