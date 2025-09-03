// ========================================
// KAIRO BROWSER - SIMPLE RENDERING SYSTEM
// ========================================

console.log('🎨 Loading Simple Rendering System...');

// Simple Browser UI Manager
class SimpleUIManager {
    constructor() {
        console.log('🎨 Simple UI Manager initialized');
    }

    // Hide browser UI and show only website content
    hideBrowserUI() {
        console.log('🎨 Hiding browser UI...');
        
        try {
            // Only run in main browser window, not in webview
            if (window.location.protocol !== 'file:' && window.location.hostname !== '') {
                console.log('🎨 Skipping UI hide in webview context');
                return;
            }
            
            // Hide browser UI elements
            const elementsToHide = [
                '.tabs',
                '.toolbar', 
                '.ai-assistant',
                '.content-controls',
                '#start'
            ];
            
            elementsToHide.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.display = 'none';
                    console.log(`✅ Hidden: ${selector}`);
                }
            });
            
            // Make webview take full screen
            const view = document.getElementById('view');
            if (view) {
                view.style.position = 'fixed';
                view.style.top = '0';
                view.style.left = '0';
                view.style.width = '100vw';
                view.style.height = '100vh';
                view.style.zIndex = '9999';
                view.style.border = 'none';
                view.style.margin = '0';
                view.style.padding = '0';
                console.log('✅ Webview set to full screen');
            }
            
            console.log('✅ Browser UI hidden successfully');
        } catch (error) {
            console.error('❌ Error hiding browser UI:', error);
        }
    }

    // Restore browser UI
    restoreBrowserUI() {
        console.log('🎨 Restoring browser UI...');
        
        try {
            // Only run in main browser window, not in webview
            if (window.location.protocol !== 'file:' && window.location.hostname !== '') {
                console.log('🎨 Skipping UI restore in webview context');
                return;
            }
            
            // Show browser UI elements
            const elementsToShow = [
                '.tabs',
                '.toolbar',
                '.ai-assistant', 
                '.content-controls'
            ];
            
            elementsToShow.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.display = 'flex';
                    console.log(`✅ Shown: ${selector}`);
                }
            });
            
            // Reset webview to normal position
            const view = document.getElementById('view');
            if (view) {
                view.style.position = 'relative';
                view.style.top = 'auto';
                view.style.left = 'auto';
                view.style.width = '100%';
                view.style.height = '100%';
                view.style.zIndex = 'auto';
                view.style.border = 'none';
                view.style.margin = '0';
                view.style.padding = '0';
                console.log('✅ Webview reset to normal position');
            }
            
            console.log('✅ Browser UI restored successfully');
        } catch (error) {
            console.error('❌ Error restoring browser UI:', error);
        }
    }

    // Toggle full-screen mode (hide/show browser UI)
    toggleFullScreen() {
        // Only run in main browser window, not in webview
        if (window.location.protocol !== 'file:' && window.location.hostname !== '') {
            console.log('🎨 Skipping full-screen toggle in webview context');
            return false;
        }
        
        const view = document.getElementById('view');
        if (view && view.style.position === 'fixed') {
            this.restoreBrowserUI();
            return false; // Not in full screen
        } else {
            this.hideBrowserUI();
            return true; // In full screen
        }
    }
}

// Create global instance
const simpleUIManager = new SimpleUIManager();

// Make globally available
window.simpleUIManager = simpleUIManager;
window.hideBrowserUI = () => simpleUIManager.hideBrowserUI();
window.restoreBrowserUI = () => simpleUIManager.restoreBrowserUI();
window.toggleFullScreen = () => simpleUIManager.toggleFullScreen();

console.log('✅ Simple Rendering System loaded successfully');
