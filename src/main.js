// ========================================
// KAIRO BROWSER - MAIN ENTRY POINT
// ========================================

console.log('🚀 Kairo Browser - Main Entry Point Starting...');

// All modules are loaded via script tags in index.html
// This file orchestrates the initialization of all systems

// Global state
let isInitialized = false;

// Wait for DOM to be ready
function waitForDOM() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

// Wait for all modules to be loaded
function waitForModules() {
    return new Promise((resolve) => {
        const checkModules = () => {
            const requiredModules = [
                'navigate', 'setupWebviewEvents', 'setupAllEventListeners',
                'enhancedAIIntelligence', 'initializeChat'
            ];
            
            const allLoaded = requiredModules.every(module => {
                if (module.includes('.')) {
                    const [obj, prop] = module.split('.');
                    return window[obj] && window[obj][prop];
                }
                return window[module];
            });
            
            if (allLoaded) {
                resolve();
            } else {
                setTimeout(checkModules, 100);
            }
        };
        
        checkModules();
    });
}

// Initialize all systems
async function initializeAllSystems() {
    if (isInitialized) {
        console.log('⚠️ Systems already initialized');
        return;
    }
    
    console.log('🚀 Initializing all Kairo Browser systems...');
    
    try {
        // Wait for DOM and modules to be ready
        await waitForDOM();
        await waitForModules();
        
        console.log('✅ DOM and modules ready, starting initialization...');
    
        try {
        // 1. Initialize Core Browser
        console.log('🔧 Step 1: Initializing Core Browser...');
        if (typeof setupWebviewEvents === 'function') {
            setupWebviewEvents();
            console.log('✅ Core Browser initialized');
        } else {
            console.log('⚠️ Core Browser functions not available');
        }
        
        // 1.5. Initialize Webview
        console.log('🔧 Step 1.5: Initializing Webview...');
        if (typeof initializeWebview === 'function') {
            initializeWebview().then(() => {
                console.log('✅ Webview initialized successfully');
            }).catch(error => {
                console.error('❌ Webview initialization failed:', error);
            });
        } else {
            console.log('⚠️ Webview initialization function not available');
        }
        
        // 2. Initialize UI Event Handlers
        console.log('🔧 Step 2: Initializing UI Event Handlers...');
        if (typeof setupAllEventListeners === 'function') {
            setupAllEventListeners();
            console.log('✅ UI Event Handlers initialized');
        } else {
            console.log('⚠️ UI Event Handlers not available');
        }
        
        // 3. Initialize AI Intelligence
        console.log('🔧 Step 3: Initializing AI Intelligence...');
        if (window.enhancedAIIntelligence) {
            window.enhancedAIIntelligence.initializeIntelligence();
            console.log('✅ AI Intelligence initialized');
        } else {
            console.error('❌ AI Intelligence not found');
        }
        
        // 3.5. Initialize AI Memory System
        console.log('🔧 Step 3.5: Initializing AI Memory System...');
        if (window.enhancedAIMemory) {
            window.enhancedAIMemory.initializeMemory();
            console.log('✅ AI Memory System initialized');
        } else {
            console.error('❌ AI Memory System not found');
        }
        
        // 4. Initialize Chat System
        console.log('🔧 Step 4: Initializing Chat System...');
        if (window.initializeChat) {
            window.initializeChat();
            console.log('✅ Chat System initialized');
        } else {
            console.error('❌ Chat System not found');
        }
        
        // 5. Initialize Simple UI Manager
        console.log('🔧 Step 5: Initializing Simple UI Manager...');
        if (window.simpleUIManager) {
            console.log('✅ Simple UI Manager initialized');
        } else {
            console.error('❌ Simple UI Manager not found');
        }
        
        // 6. Initialize Performance Monitor
        console.log('🔧 Step 6: Initializing Performance Monitor...');
        if (enhancedPerformanceMonitor) {
            enhancedPerformanceMonitor.initializeMonitoring();
            console.log('✅ Performance Monitor initialized');
        } else {
            console.error('❌ Performance Monitor not found');
        }
        
        // 7. Initialize Error Recovery
        console.log('🔧 Step 7: Initializing Error Recovery...');
        if (enhancedErrorRecovery) {
            enhancedErrorRecovery.initializeErrorRecovery();
            console.log('✅ Error Recovery initialized');
        } else {
            console.error('❌ Error Recovery not found');
        }
        
        // 8. Initialize External API Integration
        console.log('🔧 Step 8: Initializing External API Integration...');
        if (externalAPIIntegration) {
            externalAPIIntegration.initializeAPIIntegration();
            console.log('✅ External API Integration initialized');
        } else {
            console.error('❌ External API Integration not found');
        }
        
        // 8.5. Initialize Security Manager
        console.log('🔧 Step 8.5: Initializing Security Manager...');
        if (securityManager) {
            securityManager.initializeSecurity();
            console.log('✅ Security Manager initialized');
        } else {
            console.error('❌ Security Manager not found');
        }
        
        // 9. Setup additional features
        console.log('🔧 Step 9: Setting up additional features...');
        setupAdditionalFeatures();
        console.log('✅ Additional features setup completed');
        
        // 10. Mark as initialized
        isInitialized = true;
        
        console.log('🎉 All Kairo Browser systems initialized successfully!');
        
        // 11. Test basic functionality
        testBasicFunctionality();
        
        // 11.5. Webview functionality is now properly initialized
        console.log('✅ Webview functionality ready');
        
        // 12. Run post-initialization tasks
        runPostInitializationTasks();
        
        } catch (error) {
            console.error('❌ Error during inner system initialization:', error);
        }
        
    } catch (error) {
        console.error('❌ Error during system initialization:', error);
    }
}

// Setup additional features
function setupAdditionalFeatures() {
    console.log('🔧 Setting up additional features...');
    
    // Setup floating content controls
    setupFloatingControls();
    
    // Setup loading overlay
    setupLoadingOverlay();
    
    // Setup browser content cleanup
    setupBrowserContentCleanup();
    
    // Setup global window objects for legacy compatibility
    setupGlobalWindowObjects();
}

// Setup global window objects for legacy compatibility
function setupGlobalWindowObjects() {
    console.log('🔧 Setting up global window objects...');
    
    // Make enhancement modules available globally for legacy scripts
    if (enhancedAIIntelligence) {
        window.enhancedAIIntelligence = enhancedAIIntelligence;
    }
    
    if (enhancedAIMemory) {
        window.enhancedAIMemory = enhancedAIMemory;
    }
    
    if (enhancedPerformanceMonitor) {
        window.enhancedPerformanceMonitor = enhancedPerformanceMonitor;
    }
    
    if (enhancedErrorRecovery) {
        window.enhancedErrorRecovery = enhancedErrorRecovery;
    }
    
            if (externalAPIIntegration) {
            window.externalAPIIntegration = externalAPIIntegration;
        }
        
        if (securityManager) {
            window.securityManager = securityManager;
        }
        
        if (kairoPageRenderer) {
            window.kairoPageRenderer = kairoPageRenderer;
        }
    
    console.log('✅ Global window objects setup completed');
}

// Setup floating content controls (minimal - main handlers in UI module)
function setupFloatingControls() {
    console.log('🔧 Setting up minimal floating content controls...');
    
    // Only setup zoom controls here - navigation is handled by UI module
    const cc = {
        zoomOut: document.getElementById('cc-zoom-out'),
        zoomIn: document.getElementById('cc-zoom-in'),
        zoomReset: document.getElementById('cc-zoom-reset'),
    };
    
    if (cc.zoomOut) cc.zoomOut.addEventListener('click', () => {
        const view = document.getElementById('view');
        if (view) view.setZoomLevel((view.getZoomLevel() || 1) - 0.1);
    });
    
    if (cc.zoomIn) cc.zoomIn.addEventListener('click', () => {
        const view = document.getElementById('view');
        if (view) view.setZoomLevel((view.getZoomLevel() || 1) + 0.1);
    });
    
    if (cc.zoomReset) cc.zoomReset.addEventListener('click', () => {
        const view = document.getElementById('view');
        if (view) view.setZoomLevel(1);
    });
    
    console.log('✅ Floating zoom controls setup completed');
}

// Setup loading overlay
function setupLoadingOverlay() {
    console.log('🔧 Setting up loading overlay...');
    
    const loadingOverlayEl = document.getElementById('loading-overlay');
    if (loadingOverlayEl) {
        // Hide loading overlay immediately
        loadingOverlayEl.hidden = true;
        loadingOverlayEl.style.display = 'none';
        loadingOverlayEl.style.visibility = 'hidden';
        loadingOverlayEl.style.opacity = '0';
        loadingOverlayEl.style.pointerEvents = 'none';
        
        console.log('✅ Loading overlay hidden');
    }
}

// Setup browser content cleanup
function setupBrowserContentCleanup() {
    console.log('🔧 Setting up browser content cleanup...');
    
    // Hide mirror elements
    const mirrorEl = document.getElementById('mirror');
    const mirrorType = document.getElementById('mirror-type');
    
    if (mirrorEl) {
        mirrorEl.style.display = 'none';
        mirrorEl.style.visibility = 'hidden';
        mirrorEl.style.opacity = '0';
        mirrorEl.style.position = 'absolute';
        mirrorEl.style.zIndex = '-1';
        mirrorEl.style.pointerEvents = 'none';
    }
    
    if (mirrorType) {
        mirrorType.style.display = 'none';
        mirrorType.style.visibility = 'hidden';
        mirrorType.style.opacity = '0';
        mirrorType.style.position = 'absolute';
        mirrorType.style.zIndex = '-1';
        mirrorType.style.pointerEvents = 'none';
    }
    
    // Ensure start page is visible
    const startEl = document.getElementById('start');
    if (startEl) {
        startEl.hidden = false;
        startEl.style.display = 'flex';
        startEl.style.zIndex = '10';
    }
    
    console.log('✅ Browser content cleanup completed');
}

// Run post-initialization tasks
async function runPostInitializationTasks() {
    console.log('🔧 Running post-initialization tasks...');
    
    // Add initial tab
    try {
        if (window.addTab) {
            window.addTab('New Tab');
        } else {
            console.error('❌ addTab function not available');
        }
    } catch (error) {
        console.error('❌ Error adding initial tab:', error);
    }
    
    // Setup periodic tasks
    setInterval(() => {
        // Periodic cleanup and optimization
        if (window.enhancedPerformanceMonitor) {
            try {
                const metrics = window.enhancedPerformanceMonitor.getMetrics();
                if (metrics.memory && metrics.memory > 80) {
                    console.warn('⚠️ High memory usage detected, performing cleanup...');
                    window.enhancedPerformanceMonitor.performMemoryCleanup();
                }
            } catch (error) {
                console.error('❌ Error in periodic performance check:', error);
            }
        }
    }, 30000); // Check every 30 seconds
    
    console.log('✅ Post-initialization tasks completed');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Starting Kairo Browser initialization...');
    
    // Small delay to ensure all elements are available
    setTimeout(() => {
        initializeAllSystems();
    }, 100);
});

// Also try to initialize after a longer delay as backup
setTimeout(() => {
    if (!isInitialized) {
        console.log('🔄 Backup initialization attempt...');
        initializeAllSystems();
    }
}, 2000);

// Show toast notification
function showToast(message, type = 'info') {
    const toastsEl = document.getElementById('toasts');
    if (!toastsEl) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastsEl.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Test basic functionality
function testBasicFunctionality() {
    console.log('🧪 Testing basic functionality...');
    
    const tests = [
        { name: 'Webview element', test: () => document.getElementById('view') },
        { name: 'Navigation function', test: () => typeof window.navigate === 'function' },
        { name: 'Event handlers', test: () => typeof window.setupAllEventListeners === 'function' }
    ];
    
    tests.forEach(({ name, test }) => {
        if (test()) {
            console.log(`✅ ${name} available`);
        } else {
            console.error(`❌ ${name} not available`);
        }
    });
    
    console.log('🧪 Basic functionality test completed');
}

console.log('✅ Kairo Browser Main Entry Point loaded successfully');
