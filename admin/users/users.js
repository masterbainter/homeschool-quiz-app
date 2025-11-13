// User Management Logic
const userManagement = {
    currentUser: null,
    roles: {
        admins: [],
        teachers: [],
        students: []
    },

    init() {
        firebase.auth().onAuthStateChanged((user) => {
            if (!user || user.email !== 'techride.trevor@gmail.com') {
                document.getElementById('auth-check').style.display = 'none';
                document.getElementById('unauthorized').style.display = 'block';
                return;
            }
            this.currentUser = user;
            this.loadRoles();
        });
    },

    async loadRoles() {
        try {
            const database = firebase.database();
            const rolesRef = database.ref('user-roles');

            // Listen for real-time updates
            rolesRef.on('value', (snapshot) => {
                const rolesData = snapshot.val();

                if (rolesData) {
                    this.roles.admins = rolesData.admins || ['techride.trevor@gmail.com'];
                    this.roles.teachers = rolesData.teachers || [];
                    this.roles.students = rolesData.students || [];
                } else {
                    // Initialize with default roles if none exist
                    this.roles.admins = ['techride.trevor@gmail.com'];
                    this.roles.teachers = ['iyoko.bainter@gmail.com', 'trevor.bainter@gmail.com'];
                    this.roles.students = ['madmaxmadadax@gmail.com', 'sakurasaurusjade@gmail.com'];
                    this.saveRoles();
                }

                this.renderRoles();
            });

            document.getElementById('auth-check').style.display = 'none';
            document.getElementById('content').style.display = 'block';

        } catch (error) {
            console.error('Error loading roles:', error);
            alert('Failed to load user roles. Please try again.');
        }
    },

    renderRoles() {
        this.renderRoleList('admin', this.roles.admins);
        this.renderRoleList('teacher', this.roles.teachers);
        this.renderRoleList('student', this.roles.students);
    },

    renderRoleList(role, emails) {
        const listId = `${role}-list`;
        const container = document.getElementById(listId);

        if (emails.length === 0) {
            container.innerHTML = '<div class="empty-list">No users in this role yet.</div>';
            return;
        }

        container.innerHTML = emails.map(email => `
            <div class="user-item">
                <span class="user-email">${this.escapeHtml(email)}</span>
                ${this.canRemove(role, email) ? `
                    <button onclick="userManagement.removeUser('${role}', '${this.escapeHtml(email)}')"
                            class="btn-remove">Remove</button>
                ` : `
                    <span style="color: #999; font-size: 0.9em;">(Protected)</span>
                `}
            </div>
        `).join('');
    },

    canRemove(role, email) {
        // Protect the main admin account
        if (role === 'admin' && email === 'techride.trevor@gmail.com') {
            return false;
        }
        // Don't allow removing the last admin
        if (role === 'admin' && this.roles.admins.length === 1) {
            return false;
        }
        return true;
    },

    async addUser(role) {
        const inputId = `new-${role}-email`;
        const input = document.getElementById(inputId);
        const email = input.value.trim().toLowerCase();

        if (!email) {
            alert('Please enter an email address.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Check if email already exists in any role
        if (this.roles.admins.includes(email)) {
            alert('This email is already registered as an Admin.');
            return;
        }
        if (this.roles.teachers.includes(email)) {
            alert('This email is already registered as a Teacher.');
            return;
        }
        if (this.roles.students.includes(email)) {
            alert('This email is already registered as a Student.');
            return;
        }

        // Add to role
        const roleKey = `${role}s`; // admin -> admins, teacher -> teachers, etc.
        this.roles[roleKey].push(email);

        try {
            await this.saveRoles();
            input.value = '';
            alert(`Successfully added ${email} as ${role}!`);
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user. Please try again.');
            // Revert
            this.roles[roleKey] = this.roles[roleKey].filter(e => e !== email);
        }
    },

    async removeUser(role, email) {
        if (!this.canRemove(role, email)) {
            alert('This user cannot be removed for security reasons.');
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to remove ${email} from the ${role} role?\n\n` +
            `They will no longer be able to access the system.`
        );

        if (!confirmed) return;

        const roleKey = `${role}s`;
        this.roles[roleKey] = this.roles[roleKey].filter(e => e !== email);

        try {
            await this.saveRoles();
            alert(`Successfully removed ${email} from ${role} role.`);
        } catch (error) {
            console.error('Error removing user:', error);
            alert('Failed to remove user. Please try again.');
        }
    },

    async saveRoles() {
        const database = firebase.database();
        await database.ref('user-roles').set({
            admins: this.roles.admins,
            teachers: this.roles.teachers,
            students: this.roles.students
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    userManagement.init();
});
