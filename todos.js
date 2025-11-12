// Todos Application Logic
const todos = {
    currentUser: null,
    isAdmin: false,
    userTodos: [],
    allTodos: {},

    // Initialize
    init() {
        this.setupAuthListener();
    },

    // List of allowed emails
    isAllowedUser(email) {
        const ALLOWED_EMAILS = [
            'techride.trevor@gmail.com',
            // Add your kids' emails here:
            // 'kid1@gmail.com',
            // 'kid2@gmail.com',
        ];
        return ALLOWED_EMAILS.includes(email.toLowerCase());
    },

    // Firebase Authentication Listener
    setupAuthListener() {
        if (!firebase.apps.length) {
            document.getElementById('auth-check').innerHTML = '<h2>Error</h2><p>Firebase not configured</p>';
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // Check if user is allowed
                if (!this.isAllowedUser(user.email)) {
                    alert('Access denied. This account is not authorized.');
                    firebase.auth().signOut();
                    this.showAuthSection();
                    return;
                }

                this.currentUser = user;
                this.checkAdminStatus();
                this.showTodosSection();
                this.updateUserDisplay();
                this.loadTodos();
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

        if (this.isAdmin) {
            document.getElementById('admin-controls').style.display = 'block';
            this.loadAllTodos();
        } else {
            document.getElementById('admin-controls').style.display = 'none';
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

    // Navigation
    goHome() {
        window.location.href = '/';
    },

    // UI Updates
    showAuthSection() {
        document.getElementById('auth-check').style.display = 'block';
        document.getElementById('todos-section').style.display = 'none';
    },

    showTodosSection() {
        document.getElementById('auth-check').style.display = 'none';
        document.getElementById('todos-section').style.display = 'block';
    },

    updateUserDisplay() {
        document.getElementById('user-name').textContent = this.currentUser.displayName || 'User';
        document.getElementById('user-email').textContent = this.currentUser.email || '';
        const userPhoto = document.getElementById('user-photo');
        if (this.currentUser.photoURL) {
            userPhoto.src = this.currentUser.photoURL;
        }
    },

    // Load current user's todos
    loadTodos() {
        const database = firebase.database();
        const todosRef = database.ref(`todos/${this.currentUser.uid}`);

        todosRef.on('value', (snapshot) => {
            const todosData = snapshot.val();
            if (todosData) {
                this.userTodos = Object.keys(todosData).map(key => ({
                    id: key,
                    ...todosData[key]
                }));
            } else {
                this.userTodos = [];
            }
            this.renderTodos();
            this.updateStats();
        });
    },

    // Load all users' todos (admin only)
    loadAllTodos() {
        const database = firebase.database();
        const todosRef = database.ref('todos');

        todosRef.on('value', (snapshot) => {
            const allTodosData = snapshot.val();
            this.allTodos = allTodosData || {};
            this.renderAllTodos();
        });
    },

    // Add new todo
    addTodo(event) {
        event.preventDefault();

        const input = document.getElementById('new-todo-input');
        const text = input.value.trim();

        if (!text) return;

        const database = firebase.database();
        const todoData = {
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: this.currentUser.uid,
            userName: this.currentUser.displayName || 'Anonymous',
            userEmail: this.currentUser.email
        };

        database.ref(`todos/${this.currentUser.uid}`).push(todoData)
            .then(() => {
                input.value = '';
            })
            .catch((error) => {
                console.error('Error adding todo:', error);
                alert('Failed to add todo. Please try again.');
            });
    },

    // Toggle todo completion
    toggleTodo(todoId, currentStatus) {
        const database = firebase.database();
        database.ref(`todos/${this.currentUser.uid}/${todoId}`).update({
            completed: !currentStatus,
            completedAt: !currentStatus ? new Date().toISOString() : null
        })
        .catch((error) => {
            console.error('Error updating todo:', error);
            alert('Failed to update todo. Please try again.');
        });
    },

    // Delete todo
    deleteTodo(todoId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        const database = firebase.database();
        database.ref(`todos/${this.currentUser.uid}/${todoId}`).remove()
            .catch((error) => {
                console.error('Error deleting todo:', error);
                alert('Failed to delete todo. Please try again.');
            });
    },

    // Render current user's todos
    renderTodos() {
        const todosList = document.getElementById('todos-list');

        if (this.userTodos.length === 0) {
            todosList.innerHTML = `
                <div class="empty-state">
                    <h3>No todos yet!</h3>
                    <p>Add your first task above to get started.</p>
                </div>
            `;
            return;
        }

        // Sort: incomplete first, then by creation date
        const sortedTodos = [...this.userTodos].sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.completed ? 1 : -1;
        });

        todosList.innerHTML = sortedTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="todos.toggleTodo('${todo.id}', ${todo.completed})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-meta">
                    <span class="todo-date">${this.formatDate(todo.createdAt)}</span>
                    <button onclick="todos.deleteTodo('${todo.id}')" class="todo-delete">Delete</button>
                </div>
            </div>
        `).join('');
    },

    // Render all users' todos (admin view)
    renderAllTodos() {
        const allTodosList = document.getElementById('all-todos-list');
        const showCompleted = document.getElementById('show-completed')?.checked || false;

        if (Object.keys(this.allTodos).length === 0) {
            allTodosList.innerHTML = `
                <div class="empty-state">
                    <h3>No todos yet</h3>
                    <p>Students haven't added any tasks yet.</p>
                </div>
            `;
            return;
        }

        // Group by user and count todos
        const userGroups = [];
        for (const [userId, userTodos] of Object.entries(this.allTodos)) {
            const todosArray = Object.keys(userTodos).map(key => ({
                id: key,
                ...userTodos[key]
            }));

            // Filter completed if needed
            const filteredTodos = showCompleted
                ? todosArray
                : todosArray.filter(t => !t.completed);

            if (filteredTodos.length === 0 && !showCompleted) continue;

            const pendingCount = todosArray.filter(t => !t.completed).length;
            const completedCount = todosArray.filter(t => t.completed).length;

            // Get user info from first todo
            const firstTodo = todosArray[0];

            userGroups.push({
                userId,
                userName: firstTodo.userName,
                userEmail: firstTodo.userEmail,
                todos: filteredTodos,
                pendingCount,
                completedCount
            });
        }

        // Sort by most pending tasks
        userGroups.sort((a, b) => b.pendingCount - a.pendingCount);

        allTodosList.innerHTML = userGroups.map(group => `
            <div class="user-todos-group">
                <div class="user-todos-header">
                    <div class="user-todos-info">
                        <h3>${this.escapeHtml(group.userName)}</h3>
                        <p>${this.escapeHtml(group.userEmail)}</p>
                    </div>
                    <div class="user-todos-stats">
                        <div><strong>${group.pendingCount}</strong> pending</div>
                        <div><strong>${group.completedCount}</strong> completed</div>
                    </div>
                </div>
                <div class="user-todos-list">
                    ${group.todos.length > 0 ? group.todos.map(todo => `
                        <div class="todo-item ${todo.completed ? 'completed' : ''}">
                            <input
                                type="checkbox"
                                class="todo-checkbox"
                                ${todo.completed ? 'checked' : ''}
                                disabled
                            >
                            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                            <div class="todo-meta">
                                <span class="todo-date">${this.formatDate(todo.createdAt)}</span>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #999; text-align: center;">No tasks to show</p>'}
                </div>
            </div>
        `).join('');
    },

    // Update statistics
    updateStats() {
        const pending = this.userTodos.filter(t => !t.completed).length;
        const completed = this.userTodos.filter(t => t.completed).length;

        document.getElementById('todo-count').textContent = pending;
        document.getElementById('completed-count').textContent = completed;
    },

    // Helper: Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
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
    todos.init();
});
