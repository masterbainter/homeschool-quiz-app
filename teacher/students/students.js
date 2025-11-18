// Student Progress Tracking Logic
console.log('=== STUDENTS.JS LOADING ===');

const students = {
    currentUser: null,
    studentUsers: [],
    quizzes: [],
    assignments: {},
    results: {},
    selectedStudentId: null,

    async init() {
        console.log('=== STUDENTS INIT ===');
        console.log('Firebase auth:', firebase.auth());
        console.log('Current user (before listener):', firebase.auth().currentUser);

        // Check auth FIRST - wait for user to be logged in
        firebase.auth().onAuthStateChanged(async (user) => {
            console.log('=== AUTH STATE CHANGED ===');
            console.log('User object:', user);
            console.log('User email:', user?.email);

            if (!user) {
                console.log('No user logged in, redirecting...');
                Toast.error('Access denied. Admin or teacher access required.');
                window.location.href = '/admin';
                return;
            }

            // NOW load roles (after we know user is authenticated)
            console.log('User is authenticated, loading roles...');
            await RolesLoader.load();
            console.log('Roles loaded:', RolesLoader.roles);

            console.log('Checking permissions for:', user.email);
            console.log('Is admin?', RolesLoader.isAdmin(user.email));
            console.log('Is teacher?', RolesLoader.isTeacher(user.email));

            if (!(RolesLoader.isAdmin(user.email) || RolesLoader.isTeacher(user.email))) {
                console.log('Access denied!');
                Toast.error('Access denied. Admin or teacher access required.');
                window.location.href = '/admin';
                return;
            }
            console.log('Access granted!');
            this.currentUser = user;
            this.loadData();
        });
    },

    async loadData() {
        try {
            const database = firebase.database();

            // Load all data in parallel
            const [quizzesSnap, assignmentsSnap, resultsSnap, usersSnap, readingSnap] = await Promise.all([
                database.ref('quizzes').once('value'),
                database.ref('assignments').once('value'),
                database.ref('quiz-results').once('value'),
                database.ref('users').once('value'),
                database.ref('reading-assignments').once('value')
            ]);

            // Process quizzes
            const quizzesData = quizzesSnap.val() || {};
            this.quizzes = Object.keys(quizzesData).map(key => ({
                id: key,
                ...quizzesData[key]
            }));

            // Process assignments
            this.assignments = assignmentsSnap.val() || {};

            // Process results
            const resultsData = resultsSnap.val() || {};
            this.results = {};
            Object.keys(resultsData).forEach(key => {
                const result = resultsData[key];
                if (!this.results[result.userId]) {
                    this.results[result.userId] = [];
                }
                this.results[result.userId].push({
                    id: key,
                    ...result
                });
            });

            // Get user profiles
            const usersData = usersSnap.val() || {};

            // Process reading assignments
            this.readingAssignments = readingSnap.val() || {};

            // Create student profiles from users collection
            this.createStudentProfiles(usersData);

            // Render
            this.renderStudents();

            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';

        } catch (error) {
            console.error('Error loading data:', error);
            Toast.error('Failed to load student data. Please try again.');
        }
    },

    createStudentProfiles(usersData) {
        // Get student emails from roles
        const studentEmails = RolesLoader.roles.students || [];

        console.log('=== CREATE STUDENT PROFILES ===');
        console.log('Student emails from roles:', studentEmails);
        console.log('Users in database:', Object.keys(usersData).length);
        console.log('All users:', Object.keys(usersData).map(uid => ({
            uid,
            email: usersData[uid].email,
            name: usersData[uid].displayName
        })));

        this.studentUsers = studentEmails.map(email => {
            // Find user by email from users collection (case-insensitive)
            let userProfile = null;
            let userId = null;

            console.log(`Looking for student: ${email}`);

            Object.keys(usersData).forEach(uid => {
                const userEmail = usersData[uid].email;
                const emailLower = userEmail ? userEmail.toLowerCase() : '';
                const targetLower = email.toLowerCase();
                const isMatch = emailLower === targetLower;

                console.log(`  Comparing: "${userEmail}" (${emailLower}) vs "${email}" (${targetLower}) = ${isMatch}`);

                // Case-insensitive email comparison
                if (usersData[uid].email && isMatch) {
                    console.log(`  ✓ FOUND MATCH for ${email}`);
                    userProfile = usersData[uid];
                    userId = uid;
                }
            });

            // Use profile data if available
            const userName = userProfile
                ? userProfile.displayName
                : email.split('@')[0];

            // Calculate stats
            const userResults = userId ? (this.results[userId] || []) : [];
            const totalAttempts = userResults.length;
            const avgScore = totalAttempts > 0
                ? Math.round(userResults.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts)
                : 0;

            // Count assigned vs completed
            const userAssignments = userId && this.assignments[userId]
                ? Object.keys(this.assignments[userId]).length
                : 0;
            const completedQuizzes = new Set(userResults.map(r => r.quizId)).size;

            const studentProfile = {
                userId: userId || `pending-${email}`,
                email: email,
                name: userName,
                hasProfile: !!userProfile,
                totalAttempts: totalAttempts,
                avgScore: avgScore,
                assigned: userAssignments,
                completed: completedQuizzes
            };

            console.log(`Student profile created:`, studentProfile);
            return studentProfile;
        });

        console.log('=== FINAL STUDENT PROFILES ===');
        console.log('Total students:', this.studentUsers.length);
        console.log('Students:', this.studentUsers);
    },

    renderStudents() {
        const grid = document.getElementById('students-grid');

        if (this.studentUsers.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>No students configured</h3></div>';
            return;
        }

        grid.innerHTML = this.studentUsers.map(student => `
            <div class="student-card ${this.selectedStudentId === student.userId ? 'selected' : ''}"
                 onclick="students.selectStudent('${student.userId}')">
                <div class="student-name">${this.escapeHtml(student.name)}</div>
                <div class="student-email">${this.escapeHtml(student.email)}</div>
                <div class="student-stats">
                    <div class="stat-box">
                        <div class="stat-value">${student.assigned}</div>
                        <div class="stat-label">Assigned</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${student.completed}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${student.avgScore}%</div>
                        <div class="stat-label">Avg Score</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    selectStudent(studentId) {
        this.selectedStudentId = studentId;
        this.renderStudents();
        this.renderStudentDetails();
    },

    renderStudentDetails() {
        const student = this.studentUsers.find(s => s.userId === this.selectedStudentId);
        if (!student) return;

        document.getElementById('student-details').style.display = 'block';
        document.getElementById('student-details-name').textContent = `${student.name}'s Progress`;

        // Render reading list
        this.renderReadingList(student);

        // Render assignments
        this.renderAssignments(student);

        // Render recent results
        this.renderResults(student);
    },

    renderReadingList(student) {
        const container = document.getElementById('reading-list-container');
        if (!container) return; // Container doesn't exist yet, will add to HTML

        const userBooks = student.userId && this.readingAssignments[student.userId]
            ? this.readingAssignments[student.userId]
            : {};

        const booksList = Object.values(userBooks);

        if (booksList.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No books assigned yet. <a href="/admin/books">Assign books from the library</a></p>';
            return;
        }

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${booksList.map(book => `
                    <div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${book.coverImage ?
                            `<img src="${book.coverImage}" style="width: 100%; height: 180px; object-fit: contain; background: #f5f5f5; border-radius: 4px; margin-bottom: 10px;">` :
                            `<div style="width: 100%; height: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">📖</div>`
                        }
                        <h4 style="margin: 0 0 5px 0; font-size: 1em; line-height: 1.3;">${this.escapeHtml(book.bookTitle)}</h4>
                        <p style="margin: 0 0 10px 0; font-size: 0.85em; color: #666;">${this.escapeHtml(book.author)}</p>
                        <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                            <span style="background: ${book.status === 'completed' ? '#d4edda' : book.status === 'reading' ? '#fff3cd' : '#f8d7da'}; color: ${book.status === 'completed' ? '#155724' : book.status === 'reading' ? '#856404' : '#721c24'}; padding: 4px 8px; border-radius: 12px; font-size: 0.75em; font-weight: 600;">
                                ${book.status === 'completed' ? 'Completed' : book.status === 'reading' ? 'Reading' : 'Assigned'}
                            </span>
                            ${book.pageCount ? `<span style="background: #e9ecef; padding: 4px 8px; border-radius: 12px; font-size: 0.75em; color: #666;">${book.pageCount} pages</span>` : ''}
                        </div>
                        <button onclick="students.generateQuizForBook('${book.bookId}', '${this.escapeHtml(book.bookTitle)}', '${this.escapeHtml(book.author)}')" class="btn btn-primary" style="width: 100%; padding: 8px; font-size: 0.85em;">
                            📝 Generate Quiz
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderAssignments(student) {
        const container = document.getElementById('assignments-container');
        const userAssignments = student.userId && this.assignments[student.userId]
            ? this.assignments[student.userId]
            : {};

        if (Object.keys(userAssignments).length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No quizzes assigned yet. Click "Assign Quizzes" to get started.</p>';
            return;
        }

        // Get results for this student
        const userResults = student.userId && this.results[student.userId]
            ? this.results[student.userId]
            : [];

        const assignmentsList = Object.keys(userAssignments).map(quizId => {
            const quiz = this.quizzes.find(q => q.id === quizId);
            if (!quiz) return null;

            // Find best result for this quiz
            const quizResults = userResults.filter(r => r.quizId === quizId);
            const bestResult = quizResults.length > 0
                ? quizResults.reduce((best, r) => r.percentage > best.percentage ? r : best)
                : null;

            const status = bestResult
                ? (bestResult.percentage >= 80 ? 'completed' : 'in-progress')
                : 'not-started';

            const statusText = bestResult
                ? `${bestResult.percentage}% (${bestResult.score}/${bestResult.total})`
                : 'Not Started';

            return {
                quizId: quizId,
                quiz: quiz,
                status: status,
                statusText: statusText,
                assignedDate: userAssignments[quizId].assignedDate,
                attempts: quizResults.length
            };
        }).filter(a => a !== null);

        container.innerHTML = `
            <table class="assignments-table">
                <thead>
                    <tr>
                        <th>Quiz</th>
                        <th>Status</th>
                        <th>Best Score</th>
                        <th>Attempts</th>
                        <th>Assigned</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${assignmentsList.map(a => `
                        <tr>
                            <td><strong>${this.escapeHtml(a.quiz.title)}</strong></td>
                            <td><span class="status-badge status-${a.status}">${a.status.replace('-', ' ')}</span></td>
                            <td>${a.statusText}</td>
                            <td>${a.attempts}</td>
                            <td>${new Date(a.assignedDate).toLocaleDateString()}</td>
                            <td><button onclick="students.unassignQuiz('${student.userId}', '${a.quizId}')" class="btn-secondary" style="padding:6px 12px; font-size:0.9em;">Unassign</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    renderResults(student) {
        const container = document.getElementById('results-container');
        const userResults = student.userId && this.results[student.userId]
            ? this.results[student.userId]
            : [];

        if (userResults.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No quiz attempts yet.</p>';
            return;
        }

        // Sort by most recent
        const sortedResults = [...userResults].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = `
            <table class="assignments-table">
                <thead>
                    <tr>
                        <th>Quiz</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedResults.slice(0, 10).map(r => `
                        <tr>
                            <td>${this.escapeHtml(r.quiz)}</td>
                            <td>${r.score}/${r.total}</td>
                            <td>
                                <span class="status-badge ${r.percentage >= 80 ? 'status-completed' : r.percentage >= 60 ? 'status-in-progress' : 'status-not-started'}">
                                    ${r.percentage}%
                                </span>
                            </td>
                            <td>${new Date(r.timestamp).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    showAssignModal() {
        const student = this.studentUsers.find(s => s.userId === this.selectedStudentId);
        if (!student) return;

        document.getElementById('modal-student-name').textContent = student.name;

        // Get current assignments
        const userAssignments = student.userId && this.assignments[student.userId]
            ? this.assignments[student.userId]
            : {};

        // Render quiz checkboxes
        const quizList = document.getElementById('quiz-list-modal');
        quizList.innerHTML = this.quizzes.map(quiz => {
            const isAssigned = userAssignments[quiz.id] !== undefined;
            return `
                <div class="quiz-checkbox">
                    <label>
                        <input type="checkbox"
                               data-quiz-id="${quiz.id}"
                               ${isAssigned ? 'checked' : ''}>
                        <span><strong>${this.escapeHtml(quiz.title)}</strong> (${quiz.questions.length} questions)</span>
                    </label>
                </div>
            `;
        }).join('');

        document.getElementById('assign-modal').classList.add('active');
    },

    closeAssignModal() {
        document.getElementById('assign-modal').classList.remove('active');
    },

    async saveAssignments() {
        const student = this.studentUsers.find(s => s.userId === this.selectedStudentId);
        if (!student) return;

        // If student hasn't signed in yet, we can't assign (no userId)
        if (student.userId.startsWith('pending-')) {
            Toast.warning(`${student.name} hasn't signed in yet. Ask them to sign in to school.bainter.xyz first, then you can assign quizzes.`, 8000);
            return;
        }

        const checkboxes = document.querySelectorAll('#quiz-list-modal input[type="checkbox"]');
        const database = firebase.database();
        const updates = {};

        checkboxes.forEach(checkbox => {
            const quizId = checkbox.getAttribute('data-quiz-id');
            if (checkbox.checked) {
                // Assign
                updates[`assignments/${student.userId}/${quizId}`] = {
                    assignedDate: new Date().toISOString(),
                    assignedBy: this.currentUser.email
                };
            } else {
                // Unassign
                updates[`assignments/${student.userId}/${quizId}`] = null;
            }
        });

        try {
            await database.ref().update(updates);
            Toast.success('Assignments updated successfully!');
            this.closeAssignModal();
            this.loadData(); // Refresh
        } catch (error) {
            console.error('Error saving assignments:', error);
            Toast.error('Failed to save assignments. Please try again.');
        }
    },

    async unassignQuiz(studentId, quizId) {
        if (!confirm('Remove this quiz assignment?')) return;

        const database = firebase.database();
        try {
            await database.ref(`assignments/${studentId}/${quizId}`).remove();
            this.loadData(); // Refresh
        } catch (error) {
            console.error('Error removing assignment:', error);
            Toast.error('Failed to remove assignment.');
        }
    },

    refresh() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        this.loadData();
    },

    generateQuizForBook(bookId, bookTitle, author) {
        // Find the selected student
        const student = this.studentUsers.find(s => s.userId === this.selectedStudentId);
        if (!student) {
            Toast.warning('Please select a student first');
            return;
        }

        // Store book info for quiz generation
        this.selectedBookForQuiz = {
            id: bookId,
            title: bookTitle,
            author: author
        };

        // Show the modal
        document.getElementById('quiz-gen-book-title').textContent = bookTitle;
        document.getElementById('quiz-gen-book-author').textContent = author;
        document.getElementById('quiz-gen-student-name').textContent = student.name;
        document.getElementById('quiz-gen-modal').classList.add('active');
    },

    closeQuizGenerationModal() {
        document.getElementById('quiz-gen-modal').classList.remove('active');
        this.selectedBookForQuiz = null;

        // Reset form
        document.getElementById('quiz-chapter-input').value = '';
        document.getElementById('quiz-num-questions').value = '10';
        document.getElementById('quiz-difficulty-select').value = 'medium';
    },

    async generateQuizForStudent() {
        if (!this.selectedBookForQuiz || !this.selectedStudentId) return;

        const student = this.studentUsers.find(s => s.userId === this.selectedStudentId);
        if (!student) return;

        const chapter = document.getElementById('quiz-chapter-input').value.trim();
        const numQuestions = parseInt(document.getElementById('quiz-num-questions').value) || 10;
        const difficulty = document.getElementById('quiz-difficulty-select').value;

        if (!chapter) {
            Toast.warning('Please enter a chapter or topic');
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
                bookAuthor: this.selectedBookForQuiz.author,
                chapter: chapter,
                numQuestions: numQuestions,
                difficulty: difficulty,
                studentId: student.userId,
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
                    this.saveGeneratedQuiz(result.quiz, chapter, student);

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

    async saveGeneratedQuiz(quiz, chapter, student) {
        try {
            const database = firebase.database();

            // Create a unique quiz ID based on book and chapter
            const bookSlug = this.selectedBookForQuiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const chapterSlug = chapter.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const quizId = `reading-${bookSlug}-${chapterSlug}`;

            // Save quiz to Firebase
            await database.ref(`quizzes/${quizId}`).set({
                title: `${this.selectedBookForQuiz.title} - ${chapter}`,
                description: `Quiz for ${this.selectedBookForQuiz.title} by ${this.selectedBookForQuiz.author}`,
                bookTitle: this.selectedBookForQuiz.title,
                bookAuthor: this.selectedBookForQuiz.author,
                chapter: chapter,
                questions: quiz.questions,
                createdBy: this.currentUser.uid,
                createdAt: new Date().toISOString(),
                type: 'reading'
            });

            // Assign to student
            await database.ref(`assignments/${student.userId}/${quizId}`).set({
                assignedDate: new Date().toISOString(),
                assignedBy: this.currentUser.email
            });

            Toast.success(`Quiz generated successfully! "${this.selectedBookForQuiz.title} - ${chapter}" has been assigned to ${student.name}.`);

            this.closeQuizGenerationModal();

            // Reload student data to show the new quiz
            this.loadData();

        } catch (error) {
            console.error('Error saving quiz:', error);
            Toast.error('Quiz was generated but failed to save. Please try again.');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    students.init();
});
