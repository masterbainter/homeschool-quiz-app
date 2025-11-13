// Student Progress Tracking Logic
const students = {
    currentUser: null,
    studentUsers: [],
    quizzes: [],
    assignments: {},
    results: {},
    selectedStudentId: null,

    STUDENT_EMAILS: [
        'madmaxmadadax@gmail.com',
        'sakurasaurusjade@gmail.com'
    ],

    init() {
        // Check auth
        firebase.auth().onAuthStateChanged((user) => {
            if (!user || user.email !== 'techride.trevor@gmail.com') {
                alert('Access denied. Admin only.');
                window.location.href = '/admin';
                return;
            }
            this.currentUser = user;
            this.loadData();
        });
    },

    async loadData() {
        try {
            const database = firebase.database();

            // Load all data in parallel
            const [quizzesSnap, assignmentsSnap, resultsSnap] = await Promise.all([
                database.ref('quizzes').once('value'),
                database.ref('assignments').once('value'),
                database.ref('quiz-results').once('value')
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

            // Create student profiles
            this.createStudentProfiles();

            // Render
            this.renderStudents();

            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load student data. Please try again.');
        }
    },

    createStudentProfiles() {
        this.studentUsers = this.STUDENT_EMAILS.map(email => {
            // Find user ID from results (if they've taken any quizzes)
            let userId = null;
            let userName = email.split('@')[0]; // Default to email username

            Object.keys(this.results).forEach(uid => {
                const userResults = this.results[uid];
                if (userResults.length > 0 && userResults[0].userEmail === email) {
                    userId = uid;
                    userName = userResults[0].userName || userName;
                }
            });

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

            return {
                userId: userId || `pending-${email}`,
                email: email,
                name: userName,
                totalAttempts: totalAttempts,
                avgScore: avgScore,
                assigned: userAssignments,
                completed: completedQuizzes
            };
        });
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

        // Render assignments
        this.renderAssignments(student);

        // Render recent results
        this.renderResults(student);
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

        // If student hasn't taken any quizzes yet, we can't assign (no userId)
        if (student.userId.startsWith('pending-')) {
            alert(`${student.name} must take at least one quiz before assignments can be created. Their account will be created automatically when they complete their first quiz.`);
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
            alert('Assignments updated successfully!');
            this.closeAssignModal();
            this.loadData(); // Refresh
        } catch (error) {
            console.error('Error saving assignments:', error);
            alert('Failed to save assignments. Please try again.');
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
            alert('Failed to remove assignment.');
        }
    },

    refresh() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        this.loadData();
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
