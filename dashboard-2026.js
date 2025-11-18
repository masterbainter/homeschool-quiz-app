/**
 * ============================================
 * DASHBOARD 2026 - Main App Logic
 * ============================================
 *
 * Coordinates:
 * - Authentication flow
 * - User role detection
 * - Dashboard vs Auth view switching
 * - Navigation visibility
 * - Real-time Firebase updates
 */

const dashboard = {
  currentUser: null,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,

  /**
   * Initialize dashboard
   */
  init() {
    console.log('[Dashboard 2026] Initializing...');

    // Setup Firebase auth listener
    this.setupAuthListener();

    // Setup navigation
    this.setupNavigation();

    // Hide loading screen
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 500);
  },

  /**
   * Setup Firebase authentication listener
   */
  setupAuthListener() {
    if (!firebase.apps.length) {
      console.error('[Dashboard 2026] Firebase not initialized');
      return;
    }

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        console.log('[Dashboard 2026] User signed in:', user.email);

        // Load roles from Firebase
        await RolesLoader.load();

        // Check if user is allowed
        if (!RolesLoader.isAllowedUser(user.email)) {
          Toast.error('Access denied. This account is not authorized.', 6000);
          this.logout();
          return;
        }

        // Determine user roles
        this.isAdmin = RolesLoader.isAdmin(user.email);
        this.isTeacher = RolesLoader.isTeacher(user.email);
        this.isStudent = RolesLoader.isStudent(user.email);

        // Show dashboard
        this.showDashboard();

        // Update user display
        this.updateUserDisplay();

        // Update navigation based on role
        this.updateNavigationForRole();

      } else {
        // User signed out
        this.currentUser = null;
        this.isAdmin = false;
        this.isTeacher = false;
        this.isStudent = false;

        console.log('[Dashboard 2026] User signed out');
        this.showAuthSection();
      }
    });
  },

  /**
   * Google Sign In
   */
  login() {
    const provider = new firebase.auth.GoogleAuthProvider();

    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');

    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        console.log('[Dashboard 2026] Sign in successful');

        // Show success toast
        if (window.Toast) {
          Toast.success(`Welcome back, ${result.user.displayName || 'Student'}!`, 3000);
        }

        // Haptic feedback if supported
        if (navigator.vibrate) {
          navigator.vibrate([10, 20, 10]);
        }
      })
      .catch((error) => {
        console.error('[Dashboard 2026] Sign in error:', error);

        // Show error toast
        if (window.Toast) {
          Toast.error('Sign in failed. Please try again.', 4000);
        }
      });
  },

  /**
   * Sign Out
   */
  logout() {
    firebase.auth().signOut()
      .then(() => {
        console.log('[Dashboard 2026] Sign out successful');

        if (window.Toast) {
          Toast.success('Signed out successfully', 2000);
        }
      })
      .catch((error) => {
        console.error('[Dashboard 2026] Sign out error:', error);

        if (window.Toast) {
          Toast.error('Sign out failed', 3000);
        }
      });
  },

  /**
   * Show authentication section
   */
  showAuthSection() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');

    if (authSection) authSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';

    // Hide navigation
    const bottomNav = document.getElementById('bottom-nav');
    const appHeader = document.getElementById('app-header');
    if (bottomNav) bottomNav.style.display = 'none';
    if (appHeader) appHeader.style.display = 'none';
  },

  /**
   * Show dashboard section
   */
  showDashboard() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');

    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';

    // Show navigation
    const bottomNav = document.getElementById('bottom-nav');
    const appHeader = document.getElementById('app-header');
    if (bottomNav) bottomNav.style.display = 'flex';
    if (appHeader) appHeader.style.display = 'block';
  },

  /**
   * Update user display in header
   */
  updateUserDisplay() {
    if (!this.currentUser) return;

    // Update avatar
    const avatarImg = document.getElementById('user-avatar');
    if (avatarImg) {
      avatarImg.src = this.currentUser.photoURL || '/icons/default-avatar.png';
      avatarImg.alt = this.currentUser.displayName || 'User avatar';
    }

    // Update name
    const userName = document.getElementById('user-name-header');
    if (userName) {
      const name = this.currentUser.displayName || this.currentUser.email.split('@')[0];
      userName.textContent = name;
    }

    // Update role
    const userRole = document.getElementById('user-role');
    if (userRole) {
      if (this.isAdmin) {
        userRole.textContent = 'Administrator';
      } else if (this.isTeacher) {
        userRole.textContent = 'Teacher';
      } else if (this.isStudent) {
        userRole.textContent = 'Student';
      } else {
        userRole.textContent = 'User';
      }
    }
  },

  /**
   * Update navigation based on user role
   */
  updateNavigationForRole() {
    // Show/hide teacher link
    const teacherLink = document.getElementById('teacher-link');
    if (teacherLink) {
      teacherLink.style.display = (this.isAdmin || this.isTeacher) ? 'flex' : 'none';
    }

    // Show/hide admin link
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
      adminLink.style.display = this.isAdmin ? 'flex' : 'none';
    }
  },

  /**
   * Setup navigation active states
   */
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;

    navItems.forEach(item => {
      const href = item.getAttribute('href');

      if (href === currentPath || (currentPath === '/' && href === '/')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  /**
   * Update active navigation on route change
   */
  updateActiveNav(path) {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const href = item.getAttribute('href');

      if (href === path) {
        item.classList.add('active');

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } else {
        item.classList.remove('active');
      }
    });
  }
};

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
  });
} else {
  dashboard.init();
}

/**
 * Handle visibility change (tab switching)
 * Pause/resume animations for performance
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('[Dashboard 2026] Tab hidden - pausing animations');
    // Pause heavy animations if needed
  } else {
    console.log('[Dashboard 2026] Tab visible - resuming');
    // Resume animations
  }
});

/**
 * Handle online/offline events
 */
window.addEventListener('online', () => {
  console.log('[Dashboard 2026] Back online');

  if (window.Toast) {
    Toast.success('Connection restored', 2000);
  }

  // Sync any pending data
  if (window.bentoDashboard) {
    window.bentoDashboard.setupRealtimeUpdates();
  }
});

window.addEventListener('offline', () => {
  console.log('[Dashboard 2026] Offline');

  if (window.Toast) {
    Toast.warning('You\'re offline. Changes will sync when you reconnect.', 4000);
  }
});

/**
 * Performance monitoring
 */
if (window.performance && window.performance.timing) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log('[Dashboard 2026] Performance metrics:');
      console.log(`  Page load: ${pageLoadTime}ms`);
      console.log(`  Server response: ${connectTime}ms`);
      console.log(`  DOM render: ${renderTime}ms`);

      // Log to analytics if available
      if (firebase.analytics) {
        firebase.analytics().logEvent('page_load_time', {
          load_time: pageLoadTime,
          page: window.location.pathname
        });
      }
    }, 0);
  });
}

/**
 * Export for global access
 */
window.dashboard = dashboard;
