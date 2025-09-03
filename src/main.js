// ========================================
// KAIRO BROWSER - MAIN ENTRY POINT (FIXED)
// ========================================

console.log('🚀 Kairo Browser - Main Entry Point Starting...');

// Global state
let isInitialized = false;
let initializationAttempts = 0;
const maxInitializationAttempts = 3;

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

// Wait for all required modules to be loaded
function waitForModules() {
    return new Promise((resolve) => {
        const checkModules = () => {
            const requiredModules = [
                'navigate', 'setupWebviewEvents', 'setupAllEventListeners',
                'initializeChat', 'enhancedAIIntelligence', 'enhancedAIMemory',
                'enhancedPerformanceMonitor', 'enhancedErrorRecovery',
                'externalAPIIntegration', 'securityManager', 'simpleUIManager'
            ];
            
            const loadedModules = [];
            const missingModules = [];
            
            requiredModules.forEach(module => {
                if (window[module]) {
                    loadedModules.push(module);
                } else {
                    missingModules.push(module);
                }
            });
            
            console.log(`📊 Module Status: ${loadedModules.length}/${requiredModules.length} loaded`);
            console.log('✅ Loaded:', loadedModules.join(', '));
            if (missingModules.length > 0) {
                console.log('❌ Missing:', missingModules.join(', '));
            }
            
            // Continue if we have the essential modules
            const essentialModules = ['navigate', 'setupWebviewEvents', 'setupAllEventListeners', 'initializeChat'];
            const hasEssentials = essentialModules.every(module => window[module]);
            
            if (hasEssentials) {
                console.log('✅ Essential modules loaded, continuing initialization...');
                resolve();
            } else if (initializationAttempts >= maxInitializationAttempts) {
                console.log('⚠️ Max attempts reached, continuing with available modules...');
                resolve();
            } else {
                setTimeout(checkModules, 200);
            }
        };
        
        checkModules();
    });
}

// Initialize all systems with better error handling
async function initializeAllSystems() {
    if (isInitialized) {
        console.log('⚠️ Systems already initialized');
        return;
    }
    
    initializationAttempts++;
    console.log(`🚀 Initializing Kairo Browser systems (attempt ${initializationAttempts})...`);
    
    try {
        // Wait for DOM and modules to be ready
        await waitForDOM();
        await waitForModules();
        
        console.log('✅ DOM and modules ready, starting initialization...');
        
        // Initialize systems in order with error handling
        await initializeSystemsSafely();
        
        // Mark as initialized
        isInitialized = true;
        console.log('🎉 All Kairo Browser systems initialized successfully!');
        
        // Run post-initialization tasks
        runPostInitializationTasks();
        
    } catch (error) {
        console.error('❌ Error during system initialization:', error);
        
        // Attempt recovery if not too many attempts
        if (initializationAttempts < maxInitializationAttempts) {
            console.log('🔄 Attempting system recovery...');
            setTimeout(() => {
                isInitialized = false;
                initializeAllSystems();
            }, 1000);
        } else {
            console.error('❌ Maximum initialization attempts reached, starting with basic functionality...');
            initializeBasicFunctionality();
        }
    }
}

// Initialize systems safely with individual error handling
async function initializeSystemsSafely() {
    const systems = [
        { name: 'Core Browser', fn: () => window.setupWebviewEvents && window.setupWebviewEvents() },
        { name: 'Webview', fn: () => window.initializeWebview && window.initializeWebview() },
        { name: 'UI Event Handlers', fn: () => window.setupAllEventListeners && window.setupAllEventListeners() },
        { name: 'AI Intelligence', fn: () => window.enhancedAIIntelligence && window.enhancedAIIntelligence.initializeIntelligence() },
        { name: 'AI Memory System', fn: () => window.enhancedAIMemory && window.enhancedAIMemory.initializeMemory() },
        { name: 'Chat System', fn: () => window.initializeChat && window.initializeChat() },
        { name: 'Performance Monitor', fn: () => window.enhancedPerformanceMonitor && window.enhancedPerformanceMonitor.initializeMonitoring() },
        { name: 'Error Recovery', fn: () => window.enhancedErrorRecovery && window.enhancedErrorRecovery.initializeErrorRecovery() },
        { name: 'External API Integration', fn: () => window.externalAPIIntegration && window.externalAPIIntegration.initializeAPIIntegration() },
        { name: 'Security Manager', fn: () => window.securityManager && window.securityManager.initializeSecurity() },
        { name: 'Page Renderer', fn: () => window.kairoPageRenderer && window.kairoPageRenderer.initializeRenderer() }
    ];
    
    for (const system of systems) {
        try {
            console.log(`🔧 Initializing ${system.name}...`);
            if (system.fn) {
                await system.fn();
                console.log(`✅ ${system.name} initialized`);
            } else {
                console.log(`⚠️ ${system.name} not available, skipping...`);
            }
        } catch (error) {
            console.error(`❌ Error initializing ${system.name}:`, error);
            // Continue with other systems
        }
    }
    
    // Setup additional features
    setupAdditionalFeatures();
}

// Initialize basic functionality if full initialization fails
function initializeBasicFunctionality() {
    console.log('🔧 Initializing basic functionality...');
    
    try {
        // Setup basic navigation
        if (window.navigate) {
            console.log('✅ Basic navigation available');
        }
        
        // Setup basic UI
        setupBasicUI();
        
        // Show start page
        const startEl = document.getElementById('start');
        if (startEl) {
            startEl.hidden = false;
            startEl.style.display = 'flex';
            console.log('✅ Start page shown');
        }
        
        console.log('✅ Basic functionality initialized');
    } catch (error) {
        console.error('❌ Error initializing basic functionality:', error);
    }
}

// Setup basic UI
function setupBasicUI() {
    try {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.hidden = true;
            loadingOverlay.style.display = 'none';
        }
        
        // Hide mirror elements
        const mirror = document.getElementById('mirror');
        const mirrorType = document.getElementById('mirror-type');
        
        if (mirror) {
            mirror.style.display = 'none';
            mirror.hidden = true;
        }
        
        if (mirrorType) {
            mirrorType.style.display = 'none';
            mirrorType.hidden = true;
        }
        
        // Ensure start page is visible
        const startEl = document.getElementById('start');
        if (startEl) {
            startEl.hidden = false;
            startEl.style.display = 'flex';
        }
        
        console.log('✅ Basic UI setup completed');
    } catch (error) {
        console.error('❌ Error setting up basic UI:', error);
    }
}

// Setup additional features
function setupAdditionalFeatures() {
    console.log('🔧 Setting up additional features...');
    
    try {
        // Setup basic zoom controls
        setupZoomControls();
        
        // Setup loading overlay management
        setupLoadingOverlay();
        
        // Setup content cleanup
        setupContentCleanup();
        
        console.log('✅ Additional features setup completed');
    } catch (error) {
        console.error('❌ Error setting up additional features:', error);
    }
}

// Setup zoom controls
function setupZoomControls() {
    try {
        const zoomOut = document.getElementById('cc-zoom-out');
        const zoomIn = document.getElementById('cc-zoom-in');
        const zoomReset = document.getElementById('cc-zoom-reset');
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                const view = document.getElementById('view');
                if (view && view.setZoomLevel) {
                    const currentZoom = view.getZoomLevel() || 1;
                    view.setZoomLevel(Math.max(0.5, currentZoom - 0.1));
                }
            });
        }
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                const view = document.getElementById('view');
                if (view && view.setZoomLevel) {
                    const currentZoom = view.getZoomLevel() || 1;
                    view.setZoomLevel(Math.min(3.0, currentZoom + 0.1));
                }
            });
        }
        
        if (zoomReset) {
            zoomReset.addEventListener('click', () => {
                const view = document.getElementById('view');
                if (view && view.setZoomLevel) {
                    view.setZoomLevel(1);
                }
            });
        }
        
        console.log('✅ Zoom controls setup completed');
    } catch (error) {
        console.error('❌ Error setting up zoom controls:', error);
    }
}

// Setup loading overlay management
function setupLoadingOverlay() {
    try {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.hidden = true;
            loadingOverlay.style.display = 'none';
        }
        
        console.log('✅ Loading overlay setup completed');
    } catch (error) {
        console.error('❌ Error setting up loading overlay:', error);
    }
}

// Setup content cleanup
function setupContentCleanup() {
    try {
        // Hide unnecessary elements
        const elementsToHide = ['mirror', 'mirror-type'];
        
        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
                element.hidden = true;
            }
        });
        
        // Ensure start page is visible
        const startEl = document.getElementById('start');
        if (startEl) {
            startEl.hidden = false;
            startEl.style.display = 'flex';
        }
        
        console.log('✅ Content cleanup completed');
    } catch (error) {
        console.error('❌ Error in content cleanup:', error);
    }
}

// Run post-initialization tasks
function runPostInitializationTasks() {
    console.log('🔧 Running post-initialization tasks...');
    
    try {
        // Setup periodic health checks
        setInterval(() => {
            performHealthCheck();
        }, 30000); // Every 30 seconds
        
        // Initial health check
        setTimeout(performHealthCheck, 1000);
        
        console.log('✅ Post-initialization tasks completed');
    } catch (error) {
        console.error('❌ Error in post-initialization tasks:', error);
    }
}

// Perform health check
function performHealthCheck() {
    try {
        // Check if core elements are still available
        const essentialElements = ['view', 'url', 'start', 'chat-text'];
        const missingElements = essentialElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing essential elements:', missingElements.join(', '));
        }
        
        // Check if core functions are available
        const essentialFunctions = ['navigate', 'initializeChat'];
        const missingFunctions = essentialFunctions.filter(fn => typeof window[fn] !== 'function');
        
        if (missingFunctions.length > 0) {
            console.warn('⚠️ Missing essential functions:', missingFunctions.join(', '));
        }
        
        // Memory cleanup if performance monitor is available
        if (window.enhancedPerformanceMonitor) {
            try {
                const metrics = window.enhancedPerformanceMonitor.getMetrics();
                if (metrics.memory && metrics.memory > 85) {
                    console.log('🧹 High memory usage detected, performing cleanup...');
                    window.enhancedPerformanceMonitor.performMemoryCleanup();
                }
            } catch (error) {
                console.error('❌ Error in health check memory cleanup:', error);
            }
        }
        
    } catch (error) {
        console.error('❌ Error in health check:', error);
    }
}

// Test basic functionality
function testBasicFunctionality() {
    console.log('🧪 Testing basic functionality...');
    
    const tests = [
        { name: 'Webview element', test: () => document.getElementById('view') },
        { name: 'Navigation function', test: () => typeof window.navigate === 'function' },
        { name: 'Chat system', test: () => typeof window.initializeChat === 'function' },
        { name: 'URL input', test: () => document.getElementById('url') },
        { name: 'Start page', test: () => document.getElementById('start') }
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Starting Kairo Browser initialization...');
    
    // Small delay to ensure all script tags are processed
    setTimeout(() => {
        initializeAllSystems();
    }, 100);
});

// Backup initialization attempt after longer delay
setTimeout(() => {
    if (!isInitialized && initializationAttempts === 0) {
        console.log('🔄 Backup initialization attempt...');
        initializeAllSystems();
    }
}, 2000);

// Emergency fallback
setTimeout(() => {
    if (!isInitialized) {
        console.log('🆘 Emergency fallback - initializing basic functionality...');
        initializeBasicFunctionality();
    }
}, 5000);

console.log('✅ Kairo Browser Main Entry Point loaded successfully');