// ========================================
// KAIRO BROWSER - CORE BROWSER MODULE
// ========================================

console.log('🚀 Loading Core Browser Module...');

// Core browser state
let currentTabId = 0;
const tabs = new Map();
let ourViewEnabled = false;

// Core browser functions
function getWebview() {
    return document.getElementById('view');
}

function getUrlInput() {
    return document.getElementById('url');
}

function getStartElement() {
    return document.getElementById('start');
}

function getStartInput() {
    return document.getElementById('start-q');
}

function getStartGo() {
    return document.getElementById('start-go');
}

// Core navigation function with simplified approach
function navigate(input) {
    console.log('🧭 Core Navigation requested:', input);
    
    const urlInput = getUrlInput();
    const value = (input || (urlInput ? urlInput.value : '') || '').trim();
    
    if (!value || value === '') {
        console.log('❌ No URL provided for navigation');
        return;
    }
    
    console.log('🌐 Navigating to:', value);
    
    // Validate and construct URL
    let target;
    try {
        const hasProtocol = /^https?:\/\//i.test(value);
        if (hasProtocol) {
            // Validate URL format
            new URL(value);
            target = value;
        } else {
            // Search query - use Bing
            target = `https://www.bing.com/search?q=${encodeURIComponent(value)}`;
        }
    } catch (error) {
        console.error('❌ Invalid URL format:', error);
        // Fallback to search
        target = `https://www.bing.com/search?q=${encodeURIComponent(value)}`;
    }
    
    console.log('🎯 Target URL:', target);
    
    // Get webview element
    const view = getWebview();
    if (!view) {
        console.error('❌ Webview element not found');
        showToast('Browser not ready. Please refresh the page.', 'error');
        return;
    }
    
    console.log('✅ Webview found');
    console.log('Webview properties:', {
        tagName: view.tagName,
        id: view.id,
        src: view.src,
        hasLoadURL: typeof view.loadURL === 'function',
        hasSrc: typeof view.src !== 'undefined',
        display: view.style.display,
        position: view.style.position,
        zIndex: view.style.zIndex
    });
    
    // Ensure webview is visible and properly set up
    if (view.style.display === 'none') {
        view.style.display = 'block';
        console.log('🔧 Fixed webview display');
    }
    
    // Hide browser UI and show only website content
    if (window.hideBrowserUI) {
        try {
            window.hideBrowserUI();
        } catch (error) {
            console.error('❌ Error hiding browser UI:', error);
            // Fallback: just hide start page
            const startEl = getStartElement();
            if (startEl) {
                startEl.hidden = true;
                startEl.style.display = 'none';
            }
        }
    } else {
        // Fallback: just hide start page
        const startEl = getStartElement();
        if (startEl) {
            startEl.hidden = true;
            startEl.style.display = 'none';
        }
    }
    
    // Attempt navigation with enhanced approach
    console.log('🚀 Attempting enhanced navigation to:', target);
    
    try {
        // Ensure webview is ready
        if (!view.src || view.src === 'about:blank') {
            console.log('🔧 Webview ready for navigation');
        }
        
        // Clear any existing error listeners
        const existingListeners = view._loadListeners || [];
        existingListeners.forEach(listener => {
            view.removeEventListener('did-fail-load', listener);
        });
        
        // Set up new error listener
        const errorListener = (e) => {
            console.error('❌ Webview navigation failed:', e);
            if (e.errorCode !== -3) { // Ignore ERR_ABORTED
                showToast(`Navigation failed: ${e.errorDescription}`, 'error');
            }
            view.removeEventListener('did-fail-load', errorListener);
        };
        view.addEventListener('did-fail-load', errorListener);
        view._loadListeners = [errorListener];
        
        // Set the URL with enhanced error handling
        console.log('✅ Setting webview src to:', target);
        view.src = target;
        
        if (urlInput) {
            urlInput.value = target;
        }
        
        // Add event listener for successful load
        const onLoadStop = () => {
            console.log('✅ Navigation successful');
            view.removeEventListener('did-stop-loading', onLoadStop);
        };
        view.addEventListener('did-stop-loading', onLoadStop);
        
        // Add timeout for navigation with content verification
        setTimeout(() => {
            if (view.src === target) {
                console.log('✅ Navigation confirmed successful');
                
                // Verify webview content is visible
                if (view.style.display === 'none' || view.style.visibility === 'hidden') {
                    console.log('🔧 Forcing webview visibility after navigation');
                    view.style.display = 'block';
                    view.style.visibility = 'visible';
                    view.style.opacity = '1';
                }
                
                // Check if webview has content
                try {
                    const webviewDocument = view.getWebContents();
                    if (webviewDocument) {
                        console.log('✅ Webview has content loaded');
                    } else {
                        console.log('⚠️ Webview content not detected, forcing visibility');
                        view.style.display = 'block';
                        view.style.visibility = 'visible';
                        view.style.opacity = '1';
                    }
                } catch (error) {
                    console.log('⚠️ Could not check webview content, ensuring visibility');
                    view.style.display = 'block';
                    view.style.visibility = 'visible';
                    view.style.opacity = '1';
                }
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Navigation error:', error);
        
        // Enhanced fallback - try multiple methods
        try {
            console.log('🔄 Enhanced fallback - trying alternative methods');
            
            // Method 1: Direct src assignment
            view.src = target;
            
            // Method 2: If that fails, try loadURL
            if (typeof view.loadURL === 'function') {
                view.loadURL(target).catch(() => {
                    // Method 3: Final fallback - reload and try again
                    view.src = 'about:blank';
                    setTimeout(() => {
                        view.src = target;
                    }, 100);
                });
            }
            
            if (urlInput) {
                urlInput.value = target;
            }
            
        } catch (fallbackError) {
            console.error('❌ All navigation methods failed:', fallbackError);
            showToast('Navigation failed. Please try again.', 'error');
            
            // Restore browser UI on error
            if (window.restoreBrowserUI) {
                window.restoreBrowserUI();
            } else {
                // Fallback: just show start page
                const startEl = getStartElement();
                if (startEl) {
                    startEl.hidden = false;
                    startEl.style.display = 'flex';
                }
            }
        }
    }
}

// Tab management functions
function getCurrentTabId() {
    return currentTabId;
}

function setCurrentTabId(tabId) {
    currentTabId = tabId;
}

function getTabs() {
    return tabs;
}

function addTab(title) {
    const id = Date.now();
    const tabsEl = document.getElementById('tabs');
    const newTabEl = document.getElementById('tab-new');
    
    if (!tabsEl || !newTabEl) {
        console.error('❌ Tab elements not found');
        return null;
    }
    
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tabId = String(id);
    
    const fav = document.createElement('span');
    fav.className = 'tab-favicon';
    fav.textContent = '🌐'; // Default favicon
    
    const span = document.createElement('span');
    span.className = 'tab-title';
    span.textContent = title || 'New Tab';
    
    const close = document.createElement('button');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = 'Close Tab';
    
    close.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.add('removing');
        setTimeout(() => {
            btn.remove();
            tabs.delete(id);
            const first = tabsEl.querySelector('.tab');
            if (first) setActiveTab(Number(first.dataset.tabId));
        }, 200);
    });
    
    btn.appendChild(fav);
    btn.appendChild(span);
    btn.appendChild(close);
    btn.addEventListener('click', () => setActiveTab(id));
    
    tabsEl.insertBefore(btn, newTabEl);
    tabs.set(id, { title: title || 'New Tab', favicon: '🌐' });
    setActiveTab(id);
    
    return id;
}

function setActiveTab(tabId) {
    currentTabId = tabId;
    const tabsEl = document.getElementById('tabs');
    if (tabsEl) {
        tabsEl.querySelectorAll('.tab').forEach((btn) => 
            btn.classList.toggle('active', Number(btn.dataset.tabId) === tabId)
        );
    }
}

function updateTabInfo(tabId, info) {
    const tabsEl = document.getElementById('tabs');
    if (!tabsEl) return;
    
    const tab = tabsEl.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
        const titleEl = tab.querySelector('.tab-title');
        const faviconEl = tab.querySelector('.tab-favicon');
        
        if (titleEl && info.title) titleEl.textContent = info.title;
        if (faviconEl && info.favicon) {
            if (info.favicon.startsWith('http')) {
                faviconEl.style.backgroundImage = `url(${info.favicon})`;
                faviconEl.textContent = '';
            } else {
                faviconEl.textContent = info.favicon;
                faviconEl.style.backgroundImage = 'none';
            }
        }
    }
}

// Initialize webview with enhanced setup
function initializeWebview() {
    const view = getWebview();
    if (!view) {
        console.error('❌ Webview element not found');
        return Promise.resolve(false);
    }
    
    console.log('🔧 Initializing webview with enhanced setup...');
    
    try {
        // Set basic webview properties with enhanced visibility
        view.style.width = '100%';
        view.style.height = '100%';
        view.style.border = 'none';
        view.style.display = 'block';
        view.style.position = 'relative';
        view.style.zIndex = 'auto';
        view.style.backgroundColor = 'white';
        view.style.visibility = 'visible';
        view.style.opacity = '1';
        view.style.minHeight = '400px';
        view.style.minWidth = '600px';
        
        // Set webview permissions
        view.setAttribute('allowpopups', 'true');
        view.setAttribute('webpreferences', 'nodeIntegration=no, contextIsolation=yes, webSecurity=no, allowRunningInsecureContent=yes, experimentalFeatures=yes');
        
        // Simple initialization - just set src to about:blank
        if (!view.src || view.src === '') {
            console.log('🔧 Setting webview src to about:blank');
            view.src = 'about:blank';
        }
        
        // Ensure webview is visible and properly positioned
        setTimeout(() => {
            if (view.style.display === 'none') {
                view.style.display = 'block';
                console.log('🔧 Fixed webview display');
            }
            
            // Additional visibility checks
            if (view.style.visibility === 'hidden') {
                view.style.visibility = 'visible';
                console.log('🔧 Fixed webview visibility');
            }
            
            if (view.style.opacity === '0') {
                view.style.opacity = '1';
                console.log('🔧 Fixed webview opacity');
            }
            
            // Force webview to be visible
            view.style.display = 'block';
            view.style.visibility = 'visible';
            view.style.opacity = '1';
            view.style.position = 'relative';
            view.style.zIndex = 'auto';
            
            console.log('🔧 Webview visibility enforced');
        }, 100);
        
        // Add comprehensive webview event listeners with enhanced debugging
        view.addEventListener('dom-ready', () => {
            console.log('✅ Webview DOM ready');
            // Force webview to be visible when DOM is ready
            view.style.display = 'block';
            view.style.visibility = 'visible';
            view.style.opacity = '1';
        });
        
        view.addEventListener('did-start-loading', () => {
            console.log('🔄 Webview started loading');
            // Show loading indicator
            view.style.backgroundColor = '#f0f0f0';
        });
        
        view.addEventListener('did-stop-loading', () => {
            console.log('✅ Webview stopped loading');
            // Ensure webview is visible after loading
            view.style.display = 'block';
            view.style.visibility = 'visible';
            view.style.opacity = '1';
            view.style.backgroundColor = 'white';
            
            // Check if content is actually visible
            setTimeout(() => {
                if (view.style.display === 'none' || view.style.visibility === 'hidden') {
                    console.log('🔧 Forcing webview visibility after load');
                    view.style.display = 'block';
                    view.style.visibility = 'visible';
                    view.style.opacity = '1';
                }
            }, 500);
        });
        
        view.addEventListener('did-fail-load', (e) => {
            console.error('❌ Webview failed to load:', e);
            if (e.errorCode !== -3) {
                showToast(`Failed to load: ${e.errorDescription}`, 'error');
            }
        });
        
        view.addEventListener('crashed', () => {
            console.error('❌ Webview crashed');
            showToast('Webview crashed. Please refresh the page.', 'error');
        });
        
        view.addEventListener('gpu-crashed', () => {
            console.error('❌ Webview GPU crashed');
            showToast('Webview GPU crashed. Please refresh the page.', 'error');
        });
        
        console.log('✅ Webview initialization completed successfully');
        return Promise.resolve(true);
        
    } catch (error) {
        console.error('❌ Error during webview initialization:', error);
        return Promise.resolve(false);
    }
}

// Webview event setup
function setupWebviewEvents() {
    const view = getWebview();
    if (!view) return;
    
    // Wait for webview to be ready
    view.addEventListener('dom-ready', () => {
        console.log('✅ Webview DOM ready');
    });
    
    // Handle webview load errors
    view.addEventListener('did-fail-load', (e) => {
        console.error('❌ Webview failed to load:', e);
        // Don't show error for ERR_ABORTED as it's usually intentional
        if (e.errorCode !== -3) {
            showToast(`Failed to load: ${e.errorDescription}`, 'error');
        }
    });
    
    // Handle webview crashes
    view.addEventListener('crashed', () => {
        console.error('❌ Webview crashed');
        showToast('Browser crashed. Please refresh the page.', 'error');
    });
    
    // Update tab info when page title changes
    view.addEventListener('page-title-updated', (e) => {
        updateTabInfo(currentTabId, { title: e.title });
    });
    
    // Update tab info when page loads
    view.addEventListener('did-navigate', (e) => {
        const urlInput = getUrlInput();
        if (urlInput) urlInput.value = e.url;
        
        const tab = tabs.get(currentTabId);
        if (tab) {
            tab.url = e.url;
            tabs.set(currentTabId, tab);
        }
    });
    
    // Update favicon when it changes
    view.addEventListener('page-favicon-updated', (e) => {
        if (e.favicons && e.favicons.length > 0) {
            updateTabInfo(currentTabId, { favicon: e.favicons[0] });
        }
    });
    
    // Handle page load complete
    view.addEventListener('did-stop-loading', () => {
        if (view.getTitle()) {
            updateTabInfo(currentTabId, { title: view.getTitle() });
        }
        if (view.getURL()) {
            const tab = tabs.get(currentTabId);
            if (tab) {
                tab.url = view.getURL();
                tabs.set(currentTabId, tab);
            }
        }
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `kairo-toast kairo-toast-${type}`;
        notification.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Add to page
        document.body.appendChild(notification);
        
    } catch (error) {
        console.error('❌ Error showing toast:', error);
    }
}



// Webview functionality verification (for debugging only)
function verifyWebviewFunctionality() {
    console.log('🔍 Verifying webview functionality...');
    
    const view = getWebview();
    if (!view) {
        console.error('❌ Webview element not found');
        return false;
    }
    
    console.log('✅ Webview element found');
    console.log('Webview properties:', {
        tagName: view.tagName,
        id: view.id,
        src: view.src,
        readyState: view.readyState,
        hasLoadURL: typeof view.loadURL === 'function',
        hasSrc: typeof view.src !== 'undefined'
    });
    
    return true;
}

// Make functions globally available
try {
    window.getWebview = getWebview;
    window.getUrlInput = getUrlInput;
    window.getStartElement = getStartElement;
    window.getStartInput = getStartInput;
    window.getStartGo = getStartGo;
    window.navigate = navigate;
    window.getCurrentTabId = getCurrentTabId;
    window.setCurrentTabId = setCurrentTabId;
    window.getTabs = getTabs;
    window.addTab = addTab;
    window.setActiveTab = setActiveTab;
    window.updateTabInfo = updateTabInfo;
    window.initializeWebview = initializeWebview;
    window.setupWebviewEvents = setupWebviewEvents;
    window.showToast = showToast;
    window.verifyWebviewFunctionality = verifyWebviewFunctionality;
    
    console.log('✅ Core Browser Module loaded successfully');
    console.log('✅ Navigate function exposed globally:', typeof window.navigate === 'function');
} catch (error) {
    console.error('❌ Error exposing functions globally:', error);
}
