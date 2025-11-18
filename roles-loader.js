// Shared Roles Loader
// This module loads user roles from Firebase and provides them to all pages

const RolesLoader = {
    roles: {
        admins: ['techride.trevor@gmail.com'], // Fallback
        teachers: [],
        students: []
    },
    loaded: false,
    callbacks: [],

    // Load roles from Firebase
    async load() {
        if (this.loaded) {
            return this.roles;
        }

        try {
            const database = firebase.database();
            const snapshot = await database.ref('user-roles').once('value');
            const rolesData = snapshot.val();

            if (rolesData) {
                // Normalize all emails to lowercase for consistent comparison
                this.roles.admins = (rolesData.admins || ['techride.trevor@gmail.com']).map(e => e.toLowerCase());
                this.roles.teachers = (rolesData.teachers || []).map(e => e.toLowerCase());
                this.roles.students = (rolesData.students || []).map(e => e.toLowerCase());
            } else {
                // Use defaults if no roles in database yet
                this.roles.admins = ['techride.trevor@gmail.com'];
                this.roles.teachers = ['iyoko.bainter@gmail.com', 'trevor.bainter@gmail.com'];
                this.roles.students = ['madmaxmadadax@gmail.com', 'sakurasaurusjade@gmail.com'];
            }

            this.loaded = true;

            // Execute any pending callbacks
            this.callbacks.forEach(callback => callback(this.roles));
            this.callbacks = [];

            return this.roles;
        } catch (error) {
            console.error('Error loading roles:', error);
            // Return fallback roles
            return this.roles;
        }
    },

    // Get roles with callback (for when they're already loaded or will be loaded)
    getRoles(callback) {
        if (this.loaded) {
            callback(this.roles);
        } else {
            this.callbacks.push(callback);
            // If not already loading, start loading
            if (this.callbacks.length === 1) {
                this.load();
            }
        }
    },

    // Check if email is in any role
    isAllowedUser(email) {
        return this.roles.admins.includes(email.toLowerCase()) ||
               this.roles.teachers.includes(email.toLowerCase()) ||
               this.roles.students.includes(email.toLowerCase());
    },

    // Check if email is admin
    isAdmin(email) {
        return this.roles.admins.includes(email.toLowerCase());
    },

    // Check if email is teacher
    isTeacher(email) {
        return this.roles.teachers.includes(email.toLowerCase());
    },

    // Check if email is student
    isStudent(email) {
        return this.roles.students.includes(email.toLowerCase());
    }
};
