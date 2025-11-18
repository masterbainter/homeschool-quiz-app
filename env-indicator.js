// Environment Indicator
// Shows a visual badge indicating whether you're in development or production mode

(function() {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('localhost') ||
                        window.location.hostname === 'omarchy';

    // Create environment badge
    const badge = document.createElement('div');
    badge.id = 'env-indicator';

    if (isLocalhost) {
        const displayHost = window.location.hostname === 'omarchy'
            ? `${window.location.hostname}:5050`
            : 'localhost:5050';

        badge.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                z-index: 999999;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: help;
            " title="Running on Firebase Emulators - Local data only, safe to experiment!">
                <span style="font-size: 18px;">🔧</span>
                <span>DEV MODE</span>
                <span style="
                    background: rgba(255, 255, 255, 0.3);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                ">${displayHost}</span>
            </div>
        `;
    } else {
        badge.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
                z-index: 999999;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: help;
            " title="Connected to Production Firebase - Changes affect real data!">
                <span style="font-size: 18px;">🌐</span>
                <span>PRODUCTION</span>
                <span style="
                    background: rgba(255, 255, 255, 0.3);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                ">${window.location.hostname}</span>
            </div>
        `;
    }

    // Add to page when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(badge);
        });
    } else {
        document.body.appendChild(badge);
    }
})();
