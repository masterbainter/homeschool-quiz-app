/**
 * ============================================
 * BENTO DASHBOARD - Drag & Drop Logic
 * ============================================
 *
 * Implements:
 * - Drag and drop tile reordering
 * - Touch support for mobile
 * - Layout persistence in localStorage
 * - Smooth animations
 * - Progress tracking
 * - Real-time updates
 */

class BentoDashboard {
  constructor() {
    this.tiles = [];
    this.draggedTile = null;
    this.touchStartPos = { x: 0, y: 0 };
    this.isDragging = false;
    this.currentUser = null;

    // Configuration
    this.storageKey = 'bento-layout';
    this.animationDuration = 300;

    this.init();
  }

  /**
   * Initialize dashboard
   */
  async init() {
    console.log('[Bento] Initializing dashboard...');

    // Wait for user authentication
    await this.waitForAuth();

    // Load user data
    await this.loadUserData();

    // Render dashboard
    this.render();

    // Setup drag and drop
    this.setupDragAndDrop();

    // Load saved layout
    this.loadLayout();

    // Setup real-time updates
    this.setupRealtimeUpdates();

    console.log('[Bento] Dashboard initialized');
  }

  /**
   * Wait for Firebase authentication
   */
  waitForAuth() {
    return new Promise((resolve) => {
      if (firebase.auth().currentUser) {
        this.currentUser = firebase.auth().currentUser;
        resolve();
      } else {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.currentUser = user;
            unsubscribe();
            resolve();
          }
        });
      }
    });
  }

  /**
   * Load user data from Firebase
   */
  async loadUserData() {
    if (!this.currentUser) return;

    const database = firebase.database();
    const userRef = database.ref(`users/${this.currentUser.uid}`);

    try {
      const snapshot = await userRef.once('value');
      this.userData = snapshot.val() || {};

      // Load progress data
      await this.loadProgressData();

      // Load today's lessons
      await this.loadTodaysLessons();

    } catch (error) {
      console.error('[Bento] Error loading user data:', error);
    }
  }

  /**
   * Load progress data for tiles
   */
  async loadProgressData() {
    // Load from Firebase or calculate from assignments
    this.progressData = {
      overall: 75,
      streak: 12,
      completedToday: 3,
      totalToday: 5,
      weeklyGoal: 85,
      achievements: [
        { id: 1, title: '7-Day Streak!', icon: '🔥', earned: true },
        { id: 2, title: 'Perfect Week', icon: '⭐', earned: false }
      ]
    };
  }

  /**
   * Load today's lessons
   */
  async loadTodaysLessons() {
    this.todaysLessons = [
      { id: 1, title: 'Math: Chapter 5 Quiz', subject: 'Mathematics', completed: true },
      { id: 2, title: 'Science: Photosynthesis', subject: 'Science', completed: true },
      { id: 3, title: 'History: Civil War', subject: 'History', completed: false },
      { id: 4, title: 'Reading: Book Report', subject: 'Literature', completed: false },
      { id: 5, title: 'Spanish: Vocabulary', subject: 'Language', completed: false }
    ];
  }

  /**
   * Render dashboard
   */
  render() {
    const container = document.getElementById('bento-container');
    if (!container) {
      console.error('[Bento] Container not found');
      return;
    }

    const html = `
      <div class="bento-dashboard">
        <div class="bento-header">
          <h1 class="bento-welcome">Welcome back, ${this.getUserFirstName()}! 👋</h1>
          <p class="bento-subtitle">${this.getGreeting()}</p>
        </div>

        <div class="bento-grid" id="bento-grid">
          ${this.renderTiles()}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Animate progress circles after render
    setTimeout(() => this.animateProgressCircles(), 100);
  }

  /**
   * Render all tiles
   */
  renderTiles() {
    return `
      ${this.renderProgressTile()}
      ${this.renderStreakTile()}
      ${this.renderTodaysLessonsTile()}
      ${this.renderQuickActionsTile()}
      ${this.renderStatsTile()}
      ${this.renderAchievementTile()}
    `;
  }

  /**
   * Render progress tile
   */
  renderProgressTile() {
    const { overall } = this.progressData;
    const circumference = 2 * Math.PI * 60; // radius = 60
    const offset = circumference - (overall / 100) * circumference;

    return `
      <div class="bento-tile tile-large progress-tile" data-tile-id="progress" draggable="true">
        <div class="tile-header">
          <div class="tile-title">
            <span class="tile-icon">📊</span>
            Overall Progress
          </div>
          <button class="tile-drag-handle" aria-label="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="5" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
              <circle cx="5" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <div class="tile-content">
          <div class="progress-circle">
            <svg viewBox="0 0 140 140">
              <circle class="progress-circle-bg" cx="70" cy="70" r="60"/>
              <circle
                class="progress-circle-fill"
                cx="70"
                cy="70"
                r="60"
                data-progress="${overall}"
                style="stroke-dashoffset: ${circumference};"
              />
            </svg>
            <div class="progress-text">
              <div class="progress-percentage">${overall}%</div>
              <div class="progress-label">Complete</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render streak tile
   */
  renderStreakTile() {
    const { streak } = this.progressData;
    const flames = '🔥'.repeat(Math.min(streak, 10));

    return `
      <div class="bento-tile tile-medium streak-tile" data-tile-id="streak" draggable="true">
        <div class="tile-header">
          <div class="tile-title">
            <span class="tile-icon">🔥</span>
            Streak
          </div>
          <button class="tile-drag-handle" aria-label="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="5" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
              <circle cx="5" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <div class="tile-content">
          <div class="streak-number">${streak}</div>
          <div class="streak-label">Days in a row!</div>
          <div class="streak-flames">${flames}</div>
        </div>
      </div>
    `;
  }

  /**
   * Render today's lessons tile
   */
  renderTodaysLessonsTile() {
    return `
      <div class="bento-tile tile-wide" data-tile-id="lessons" draggable="true">
        <div class="tile-header">
          <div class="tile-title">
            <span class="tile-icon">📚</span>
            Today's Lessons
          </div>
          <button class="tile-drag-handle" aria-label="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="5" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
              <circle cx="5" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <div class="tile-content">
          <div class="lessons-list">
            ${this.todaysLessons.slice(0, 4).map(lesson => `
              <div class="lesson-item ${lesson.completed ? 'completed' : ''}" data-lesson-id="${lesson.id}">
                <div class="lesson-checkbox"></div>
                <div class="lesson-info">
                  <div class="lesson-title">${lesson.title}</div>
                  <div class="lesson-subject">${lesson.subject}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render quick actions tile
   */
  renderQuickActionsTile() {
    return `
      <div class="bento-tile tile-medium" data-tile-id="actions" draggable="true">
        <div class="tile-header">
          <div class="tile-title">
            <span class="tile-icon">⚡</span>
            Quick Actions
          </div>
          <button class="tile-drag-handle" aria-label="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="5" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
              <circle cx="5" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <div class="tile-content">
          <div class="quick-actions">
            <button class="quick-action-btn" onclick="window.location.href='/subjects'">
              <span class="quick-action-icon">📖</span>
              <span>Browse Subjects</span>
            </button>
            <button class="quick-action-btn" onclick="window.location.href='/reading-list'">
              <span class="quick-action-icon">📚</span>
              <span>Reading List</span>
            </button>
            <button class="quick-action-btn" onclick="window.location.href='/todos'">
              <span class="quick-action-icon">✓</span>
              <span>View To-Do's</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render stats tile
   */
  renderStatsTile() {
    const { completedToday, totalToday, weeklyGoal } = this.progressData;

    return `
      <div class="bento-tile tile-medium" data-tile-id="stats" draggable="true">
        <div class="tile-header">
          <div class="tile-title">
            <span class="tile-icon">📈</span>
            Your Stats
          </div>
          <button class="tile-drag-handle" aria-label="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="5" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
              <circle cx="5" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <div class="tile-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${completedToday}/${totalToday}</div>
              <div class="stat-label">Today</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${weeklyGoal}%</div>
              <div class="stat-label">Weekly Goal</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render achievement tile
   */
  renderAchievementTile() {
    const latestAchievement = this.progressData.achievements.find(a => a.earned);

    if (!latestAchievement) return '';

    return `
      <div class="bento-tile tile-medium achievement-tile" data-tile-id="achievement" draggable="true">
        <div class="tile-header">
          <div class="tile-title">
            <span class="tile-icon">🏆</span>
            Achievement
          </div>
          <button class="tile-drag-handle" aria-label="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="5" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
              <circle cx="5" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <div class="tile-content">
          <div class="achievement-badge">${latestAchievement.icon}</div>
          <div class="achievement-title">${latestAchievement.title}</div>
          <div class="achievement-description">Keep up the great work!</div>
        </div>
      </div>
    `;
  }

  /**
   * Setup drag and drop for desktop
   */
  setupDragAndDrop() {
    const grid = document.getElementById('bento-grid');
    if (!grid) return;

    // Drag events for desktop
    grid.addEventListener('dragstart', (e) => this.handleDragStart(e));
    grid.addEventListener('dragover', (e) => this.handleDragOver(e));
    grid.addEventListener('drop', (e) => this.handleDrop(e));
    grid.addEventListener('dragend', (e) => this.handleDragEnd(e));

    // Touch events for mobile
    grid.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    grid.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    grid.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  /**
   * Handle drag start
   */
  handleDragStart(e) {
    const tile = e.target.closest('.bento-tile');
    if (!tile) return;

    this.draggedTile = tile;
    tile.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', tile.innerHTML);

    // Add haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    const tile = e.target.closest('.bento-tile');
    if (tile && tile !== this.draggedTile) {
      tile.classList.add('drag-over');
    }

    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  /**
   * Handle drop
   */
  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const targetTile = e.target.closest('.bento-tile');
    if (targetTile && targetTile !== this.draggedTile) {
      // Swap tiles
      this.swapTiles(this.draggedTile, targetTile);

      // Save layout
      this.saveLayout();

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([10, 20, 10]);
      }
    }

    return false;
  }

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    const tiles = document.querySelectorAll('.bento-tile');
    tiles.forEach(tile => {
      tile.classList.remove('dragging', 'drag-over');
    });

    this.draggedTile = null;
  }

  /**
   * Handle touch start (mobile)
   */
  handleTouchStart(e) {
    const dragHandle = e.target.closest('.tile-drag-handle');
    if (!dragHandle) return;

    const tile = e.target.closest('.bento-tile');
    if (!tile) return;

    this.draggedTile = tile;
    this.touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    tile.classList.add('dragging');

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }

  /**
   * Handle touch move (mobile)
   */
  handleTouchMove(e) {
    if (!this.draggedTile) return;

    e.preventDefault();

    const touch = e.touches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetTile = elementAtPoint?.closest('.bento-tile');

    // Remove drag-over from all tiles
    document.querySelectorAll('.bento-tile').forEach(t => t.classList.remove('drag-over'));

    // Add drag-over to target
    if (targetTile && targetTile !== this.draggedTile) {
      targetTile.classList.add('drag-over');
    }
  }

  /**
   * Handle touch end (mobile)
   */
  handleTouchEnd(e) {
    if (!this.draggedTile) return;

    const touch = e.changedTouches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetTile = elementAtPoint?.closest('.bento-tile');

    if (targetTile && targetTile !== this.draggedTile) {
      this.swapTiles(this.draggedTile, targetTile);
      this.saveLayout();

      // Success haptic
      if (navigator.vibrate) {
        navigator.vibrate([10, 20, 10]);
      }
    }

    // Cleanup
    document.querySelectorAll('.bento-tile').forEach(t => {
      t.classList.remove('dragging', 'drag-over');
    });

    this.draggedTile = null;
  }

  /**
   * Swap two tiles
   */
  swapTiles(tile1, tile2) {
    const grid = tile1.parentNode;
    const tile1Index = Array.from(grid.children).indexOf(tile1);
    const tile2Index = Array.from(grid.children).indexOf(tile2);

    if (tile1Index < tile2Index) {
      grid.insertBefore(tile2, tile1);
      grid.insertBefore(tile1, grid.children[tile2Index]);
    } else {
      grid.insertBefore(tile1, tile2);
      grid.insertBefore(tile2, grid.children[tile1Index]);
    }
  }

  /**
   * Save layout to localStorage
   */
  saveLayout() {
    const grid = document.getElementById('bento-grid');
    if (!grid) return;

    const layout = Array.from(grid.children).map(tile => {
      return tile.dataset.tileId;
    });

    localStorage.setItem(this.storageKey, JSON.stringify(layout));
    console.log('[Bento] Layout saved:', layout);
  }

  /**
   * Load layout from localStorage
   */
  loadLayout() {
    const savedLayout = localStorage.getItem(this.storageKey);
    if (!savedLayout) return;

    try {
      const layout = JSON.parse(savedLayout);
      const grid = document.getElementById('bento-grid');
      if (!grid) return;

      // Reorder tiles based on saved layout
      layout.forEach((tileId) => {
        const tile = grid.querySelector(`[data-tile-id="${tileId}"]`);
        if (tile) {
          grid.appendChild(tile);
        }
      });

      console.log('[Bento] Layout loaded:', layout);
    } catch (error) {
      console.error('[Bento] Error loading layout:', error);
    }
  }

  /**
   * Animate progress circles
   */
  animateProgressCircles() {
    const circles = document.querySelectorAll('.progress-circle-fill');

    circles.forEach(circle => {
      const progress = parseInt(circle.dataset.progress) || 0;
      const circumference = 2 * Math.PI * 60;
      const offset = circumference - (progress / 100) * circumference;

      setTimeout(() => {
        circle.style.strokeDashoffset = offset;
      }, 100);
    });
  }

  /**
   * Setup real-time updates
   */
  setupRealtimeUpdates() {
    if (!this.currentUser) return;

    const database = firebase.database();
    const userRef = database.ref(`users/${this.currentUser.uid}`);

    // Listen for data changes
    userRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.userData = data;
        // Optionally refresh tiles
      }
    });
  }

  /**
   * Get user's first name
   */
  getUserFirstName() {
    if (!this.currentUser) return 'Student';

    const displayName = this.currentUser.displayName || this.currentUser.email;
    return displayName.split(' ')[0] || 'Student';
  }

  /**
   * Get time-based greeting
   */
  getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning! Ready to learn?';
    if (hour < 17) return 'Good afternoon! Let\'s keep going!';
    return 'Good evening! Finish strong today!';
  }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.bentoDashboard = new BentoDashboard();
  });
} else {
  window.bentoDashboard = new BentoDashboard();
}
