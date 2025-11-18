/**
 * PWA Installation Handler
 * Manages "Add to Home Screen" prompts with beautiful UI
 * 2025 best practices: Respect user preferences, elegant prompting
 */

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.hasShownPrompt = localStorage.getItem('pwa-prompt-shown') === 'true';
    this.userDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';

    this.init();
  }

  init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Stash the event so it can be triggered later
      this.deferredPrompt = e;

      // Show install button after a delay (don't be annoying!)
      if (!this.hasShownPrompt && !this.userDismissed) {
        setTimeout(() => this.showInstallPrompt(), 30000); // Wait 30s
      }
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.deferredPrompt = null;
      this.hideInstallPrompt();

      // Show success toast
      if (window.Toast) {
        Toast.success('App installed! Find it on your home screen.', 5000);
      }

      // Track installation
      this.trackInstallation();
    });

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] Running as installed app');
      this.hideInstallPrompt();
    }

    // Register service worker
    this.registerServiceWorker();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdatePrompt(registration);
            }
          });
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    }
  }

  showInstallPrompt() {
    if (!this.deferredPrompt) return;

    // Create elegant install banner
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">📱</div>
        <div class="pwa-banner-text">
          <strong>Install HomeQuiz</strong>
          <p>Get faster access and work offline</p>
        </div>
        <div class="pwa-banner-actions">
          <button class="pwa-install-button" id="pwa-install-btn">Install</button>
          <button class="pwa-dismiss-button" id="pwa-dismiss-btn">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add styles
    this.injectStyles();

    // Animate in
    setTimeout(() => banner.classList.add('pwa-banner-visible'), 100);

    // Attach event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', () => {
      this.install();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      this.dismissPrompt();
    });

    this.hasShownPrompt = true;
    localStorage.setItem('pwa-prompt-shown', 'true');
  }

  async install() {
    if (!this.deferredPrompt) return;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    console.log('[PWA] User choice:', outcome);

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }

    // Clear the deferredPrompt
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }

  dismissPrompt() {
    this.hideInstallPrompt();
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    this.userDismissed = true;
  }

  hideInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('pwa-banner-visible');
      setTimeout(() => banner.remove(), 300);
    }
  }

  showUpdatePrompt(registration) {
    // Create update notification
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">🎉</div>
        <div class="pwa-banner-text">
          <strong>Update Available</strong>
          <p>A new version is ready to install</p>
        </div>
        <div class="pwa-banner-actions">
          <button class="pwa-update-button" id="pwa-update-btn">Update Now</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);
    setTimeout(() => updateBanner.classList.add('pwa-banner-visible'), 100);

    document.getElementById('pwa-update-btn').addEventListener('click', () => {
      // Tell the new service worker to skip waiting
      const newWorker = registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      }

      // Reload the page
      window.location.reload();
    });
  }

  trackInstallation() {
    // Track installation for analytics
    if (window.firebase && firebase.analytics) {
      firebase.analytics().logEvent('pwa_installed');
    }
  }

  injectStyles() {
    if (document.getElementById('pwa-installer-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'pwa-installer-styles';
    styles.textContent = `
      .pwa-install-banner,
      .pwa-update-banner {
        position: fixed;
        bottom: -200px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        width: calc(100% - 32px);
        max-width: 500px;
        background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(77, 158, 147, 0.2),
                    0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        transition: bottom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: 1px solid rgba(77, 158, 147, 0.2);
      }

      .pwa-banner-visible {
        bottom: 20px;
      }

      .pwa-banner-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .pwa-banner-icon {
        font-size: 40px;
        flex-shrink: 0;
      }

      .pwa-banner-text {
        flex: 1;
        min-width: 0;
      }

      .pwa-banner-text strong {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 4px;
      }

      .pwa-banner-text p {
        font-size: 14px;
        color: #4a5568;
        margin: 0;
      }

      .pwa-banner-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .pwa-install-button,
      .pwa-update-button {
        background: linear-gradient(135deg, #4d9e93 0%, #3d8e83 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(77, 158, 147, 0.3);
      }

      .pwa-install-button:hover,
      .pwa-update-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(77, 158, 147, 0.4);
      }

      .pwa-dismiss-button {
        background: transparent;
        border: none;
        color: #718096;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .pwa-dismiss-button:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #4a5568;
      }

      @media (max-width: 640px) {
        .pwa-install-banner,
        .pwa-update-banner {
          bottom: -200px;
          left: 16px;
          right: 16px;
          width: auto;
          transform: none;
        }

        .pwa-banner-visible {
          bottom: 16px;
        }

        .pwa-banner-content {
          flex-wrap: wrap;
        }

        .pwa-banner-actions {
          width: 100%;
          justify-content: stretch;
        }

        .pwa-install-button,
        .pwa-update-button {
          flex: 1;
        }
      }

      @media (prefers-color-scheme: dark) {
        .pwa-install-banner,
        .pwa-update-banner {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          border-color: rgba(77, 158, 147, 0.3);
        }

        .pwa-banner-text strong {
          color: #f7fafc;
        }

        .pwa-banner-text p {
          color: #cbd5e0;
        }

        .pwa-dismiss-button {
          color: #a0aec0;
        }

        .pwa-dismiss-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
      }
    `;

    document.head.appendChild(styles);
  }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaInstaller = new PWAInstaller();
  });
} else {
  window.pwaInstaller = new PWAInstaller();
}
