// ========================================
// KAIRO BROWSER - MINIMAL BROWSER UI SYSTEM
// ========================================

console.log('🎭 MINIMAL BROWSER UI SYSTEM STARTING...');

// Minimal browser UI system - hides browser elements for clean content viewing
class MinimalBrowserUI {
    constructor() {
        this.isMinimalMode = false;
        this.originalStyles = new Map();
        this.init();
    }
    
    init() {
        console.log('🎭 Initializing Minimal Browser UI System...');
        this.setupEventListeners();
        this.loadMinimalModePreference();
    }
    
    // Setup event listeners for minimal mode toggle
    setupEventListeners() {
        // Add minimal mode toggle button to toolbar
        this.addMinimalModeToggle();
        
        // Keyboard shortcut: Ctrl+Shift+M to toggle minimal mode
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                this.toggleMinimalMode();
            }
        });
        
        // Listen for webview load events to auto-hide UI when needed
        const view = document.getElementById('view');
        if (view) {
            view.addEventListener('did-start-loading', () => {
                if (this.isMinimalMode) {
                    this.hideBrowserUI();
                }
            });
        }
    }
    
    // Add minimal mode toggle button to toolbar
    addMinimalModeToggle() {
        const toolbarActions = document.querySelector('.toolbar-actions');
        if (!toolbarActions) return;
        
        // Check if button already exists
        if (document.getElementById('minimal-mode-toggle')) return;
        
        const minimalToggle = document.createElement('button');
        minimalToggle.id = 'minimal-mode-toggle';
        minimalToggle.className = 'action-btn minimal-toggle';
        minimalToggle.title = 'Toggle Minimal Mode (Ctrl+Shift+M)';
        minimalToggle.innerHTML = '<span class="action-icon">🎭</span>';
        
        minimalToggle.addEventListener('click', () => {
            this.toggleMinimalMode();
        });
        
        // Insert before the last button
        toolbarActions.insertBefore(minimalToggle, toolbarActions.lastElementChild);
        console.log('🎭 Minimal mode toggle button added');
    }
    
    // Toggle minimal mode on/off
    toggleMinimalMode() {
        if (this.isMinimalMode) {
            this.exitMinimalMode();
        } else {
            this.enterMinimalMode();
        }
    }
    
    // Enter minimal mode - hide all browser UI
    enterMinimalMode() {
        console.log('🎭 Entering minimal mode...');
        
        // Store original styles
        this.saveOriginalStyles();
        
        // Hide browser UI elements
        this.hideBrowserUI();
        
        // Show minimal mode indicator
        this.showMinimalModeIndicator();
        
        // Update toggle button
        this.updateToggleButton(true);
        
        this.isMinimalMode = true;
        this.saveMinimalModePreference(true);
        
        console.log('🎭 Minimal mode activated - browser UI hidden');
    }
    
    // Exit minimal mode - restore browser UI
    exitMinimalMode() {
        console.log('🎭 Exiting minimal mode...');
        
        // Restore original styles
        this.restoreOriginalStyles();
        
        // Show browser UI elements
        this.showBrowserUI();
        
        // Hide minimal mode indicator
        this.hideMinimalModeIndicator();
        
        // Update toggle button
        this.updateToggleButton(false);
        
        this.isMinimalMode = false;
        this.saveMinimalModePreference(false);
        
        console.log('🎭 Minimal mode deactivated - browser UI restored');
    }
    
    // Hide all browser UI elements
    hideBrowserUI() {
        const elementsToHide = [
            '.tabs-bar',
            '.toolbar',
            '.ai-assistant',
            '.settings-panel',
            '#start'
        ];
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                }
            });
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
        }
        
        // Hide body scrollbars
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        console.log('🎭 Browser UI hidden - webview in full screen');
    }
    
    // Show browser UI elements
    showBrowserUI() {
        const elementsToShow = [
            '.tabs-bar',
            '.toolbar',
            '.ai-assistant',
            '.settings-panel'
        ];
        
        elementsToShow.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.style.display = '';
                    el.style.visibility = '';
                    el.style.opacity = '';
                    el.style.pointerEvents = '';
                }
            });
        });
        
        // Restore webview to normal position
        const view = document.getElementById('view');
        if (view) {
            view.style.position = '';
            view.style.top = '';
            view.style.left = '';
            view.style.width = '';
            view.style.height = '';
            view.style.zIndex = '';
        }
        
        // Restore body scrollbars
        document.body.style.overflow = '';
        document.body.style.margin = '';
        document.body.style.padding = '';
        
        console.log('🎭 Browser UI restored - normal layout');
    }
    
    // Save original styles before hiding
    saveOriginalStyles() {
        const elementsToSave = [
            '.tabs-bar',
            '.toolbar',
            '.ai-assistant',
            '.settings-panel',
            '#view'
        ];
        
        elementsToSave.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                const key = `${selector}-${index}`;
                this.originalStyles.set(key, {
                    display: el.style.display,
                    visibility: el.style.visibility,
                    opacity: el.style.opacity,
                    pointerEvents: el.style.pointerEvents,
                    position: el.style.position,
                    top: el.style.top,
                    left: el.style.left,
                    width: el.style.width,
                    height: el.style.height,
                    zIndex: el.style.zIndex
                });
            });
        });
        
        // Save body styles
        this.originalStyles.set('body', {
            overflow: document.body.style.overflow,
            margin: document.body.style.margin,
            padding: document.body.style.padding
        });
    }
    
    // Restore original styles
    restoreOriginalStyles() {
        this.originalStyles.forEach((styles, key) => {
            if (key === 'body') {
                Object.entries(styles).forEach(([property, value]) => {
                    document.body.style[property] = value;
                });
            } else {
                const [selector, index] = key.split('-');
                const elements = document.querySelectorAll(selector);
                if (elements[index]) {
                    Object.entries(styles).forEach(([property, value]) => {
                        elements[index].style[property] = value;
                    });
                }
            }
        });
    }
    
    // Show minimal mode indicator
    showMinimalModeIndicator() {
        // Remove existing indicator
        this.hideMinimalModeIndicator();
        
        const indicator = document.createElement('div');
        indicator.id = 'minimal-mode-indicator';
        indicator.className = 'minimal-mode-indicator';
        indicator.innerHTML = `
            <div class="indicator-content">
                <span class="indicator-icon">🎭</span>
                <span class="indicator-text">Minimal Mode Active</span>
                <button class="indicator-exit" title="Exit Minimal Mode (Esc)">×</button>
            </div>
        `;
        
        // Style the indicator
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        `;
        
        // Style the content
        const content = indicator.querySelector('.indicator-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        // Style the icon
        const icon = indicator.querySelector('.indicator-icon');
        icon.style.cssText = `
            font-size: 16px;
        `;
        
        // Style the text
        const text = indicator.querySelector('.indicator-text');
        text.style.cssText = `
            font-weight: 500;
        `;
        
        // Style the exit button
        const exitBtn = indicator.querySelector('.indicator-exit');
        exitBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
        `;
        
        exitBtn.addEventListener('mouseenter', () => {
            exitBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        exitBtn.addEventListener('mouseleave', () => {
            exitBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        exitBtn.addEventListener('click', () => {
            this.exitMinimalMode();
        });
        
        document.body.appendChild(indicator);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0.3';
                indicator.style.transform = 'scale(0.9)';
            }
        }, 5000);
        
        // Show on hover
        indicator.addEventListener('mouseenter', () => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'scale(1)';
        });
        
        indicator.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (indicator.parentNode && this.isMinimalMode) {
                    indicator.style.opacity = '0.3';
                    indicator.style.transform = 'scale(0.9)';
                }
            }, 1000);
        });
        
        console.log('🎭 Minimal mode indicator shown');
    }
    
    // Hide minimal mode indicator
    hideMinimalModeIndicator() {
        const indicator = document.getElementById('minimal-mode-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Update toggle button appearance
    updateToggleButton(isActive) {
        const toggle = document.getElementById('minimal-mode-toggle');
        if (toggle) {
            if (isActive) {
                toggle.classList.add('active');
                toggle.style.background = 'rgba(102, 126, 234, 0.8)';
                toggle.style.color = 'white';
            } else {
                toggle.classList.remove('active');
                toggle.style.background = '';
                toggle.style.color = '';
            }
        }
    }
    
    // Save minimal mode preference
    saveMinimalModePreference(isActive) {
        try {
            localStorage.setItem('kairo-minimal-mode', isActive ? 'true' : 'false');
        } catch (error) {
            console.warn('🎭 Could not save minimal mode preference:', error);
        }
    }
    
    // Load minimal mode preference
    loadMinimalModePreference() {
        try {
            const saved = localStorage.getItem('kairo-minimal-mode');
            if (saved === 'true') {
                // Auto-enter minimal mode if previously enabled
                setTimeout(() => {
                    this.enterMinimalMode();
                }, 2000);
            }
        } catch (error) {
            console.warn('🎭 Could not load minimal mode preference:', error);
        }
    }
    
    // Get current minimal mode status
    getMinimalModeStatus() {
        return this.isMinimalMode;
    }
}

// Create and export the minimal browser UI system
window.minimalBrowserUI = new MinimalBrowserUI();

// Export functions for manual control
window.toggleMinimalMode = () => window.minimalBrowserUI.toggleMinimalMode();
window.enterMinimalMode = () => window.minimalBrowserUI.enterMinimalMode();
window.exitMinimalMode = () => window.minimalBrowserUI.exitMinimalMode();

console.log('🎭 Minimal Browser UI System loaded successfully');
console.log('🎭 Use toggleMinimalMode() to toggle minimal mode');
console.log('🎭 Keyboard shortcut: Ctrl+Shift+M');
console.log('🎭 Minimal mode completely hides browser UI for distraction-free browsing');
