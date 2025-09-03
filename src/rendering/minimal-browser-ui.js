// ========================================
// KAIRO BROWSER - MINIMAL BROWSER UI MODULE
// ========================================

console.log('🎨 Loading Minimal Browser UI Module...');

// Simple UI Manager Class
class SimpleUIManager {
    constructor() {
        this.isEnabled = true;
        this.uiState = {
            browserUIVisible: true,
            startPageVisible: true,
            webviewVisible: false
        };
        
        console.log('🎨 Simple UI Manager initialized');
    }

    // Hide browser UI to show only website content
    hideBrowserUI() {
        try {
            const startEl = document.getElementById('start');
            const replicaEl = document.getElementById('replica');
            const pageChipEl = document.getElementById('page-chip');
            
            if (startEl) {
                startEl.hidden = true;
                startEl.style.display = 'none';
            }
            
            if (replicaEl) {
                replicaEl.hidden = true;
                replicaEl.style.display = 'none';
            }
            
            if (pageChipEl) {
                pageChipEl.hidden = true;
                pageChipEl.style.display = 'none';
            }
            
            // Ensure webview is visible
            const webview = document.getElementById('view');
            if (webview) {
                webview.style.display = 'block';
                webview.style.visibility = 'visible';
                webview.style.opacity = '1';
            }
            
            this.uiState.browserUIVisible = false;
            this.uiState.startPageVisible = false;
            this.uiState.webviewVisible = true;
            
            console.log('✅ Browser UI hidden, webview visible');
        } catch (error) {
            console.error('❌ Error hiding browser UI:', error);
        }
    }

    // Restore browser UI
    restoreBrowserUI() {
        try {
            const startEl = document.getElementById('start');
            const webview = document.getElementById('view');
            
            if (startEl) {
                startEl.hidden = false;
                startEl.style.display = 'flex';
            }
            
            if (webview) {
                webview.style.display = 'block';
            }
            
            this.uiState.browserUIVisible = true;
            this.uiState.startPageVisible = true;
            this.uiState.webviewVisible = true;
            
            console.log('✅ Browser UI restored');
        } catch (error) {
            console.error('❌ Error restoring browser UI:', error);
        }
    }

    // Toggle full-screen mode
    toggleFullScreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                console.log('✅ Full-screen mode enabled');
                return true;
            } else {
                document.exitFullscreen();
                console.log('✅ Full-screen mode disabled');
                return false;
            }
        } catch (error) {
            console.error('❌ Error toggling full-screen:', error);
            return false;
        }
    }

    // Get UI state
    getUIState() {
        return { ...this.uiState };
    }
}

// Create and export instance
const simpleUIManager = new SimpleUIManager();

// Make it globally available
window.simpleUIManager = simpleUIManager;
window.hideBrowserUI = simpleUIManager.hideBrowserUI.bind(simpleUIManager);
window.restoreBrowserUI = simpleUIManager.restoreBrowserUI.bind(simpleUIManager);
window.toggleFullScreen = simpleUIManager.toggleFullScreen.bind(simpleUIManager);

console.log('✅ Minimal Browser UI Module loaded successfully');