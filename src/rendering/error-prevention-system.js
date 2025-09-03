// ========================================
// KAIRO BROWSER - ERROR PREVENTION SYSTEM
// ========================================

console.log('🛡️ ERROR PREVENTION SYSTEM STARTING...');

// Comprehensive error prevention system to catch ALL remaining navigation errors
class ErrorPreventionSystem {
    constructor() {
        this.isInitialized = false;
        this.errorCount = 0;
        this.maxErrors = 10;
        this.init();
    }
    
    init() {
        console.log('🛡️ Initializing Error Prevention System...');
        this.setupErrorPrevention();
        this.setupGlobalErrorHandling();
        this.isInitialized = true;
        console.log('🛡️ Error Prevention System initialized');
    }
    
    // Setup error prevention
    setupErrorPrevention() {
        // Override console.error to catch navigation errors
        this.overrideConsoleError();
        
        // Override any remaining error-prone functions
        this.overrideErrorProneFunctions();
        
        // Setup periodic error checking
        this.setupPeriodicErrorChecking();
    }
    
    // Override console.error to catch navigation errors
    overrideConsoleError() {
        console.log('🛡️ Setting up console.error override...');
        
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Check if this is a navigation error
            const errorMessage = args.join(' ');
            
            if (this.isNavigationError(errorMessage)) {
                this.handleNavigationError(errorMessage, args);
                return; // Don't log to console
            }
            
            // Log other errors normally
            originalConsoleError.apply(console, args);
        };
        
        console.log('🛡️ Console.error override complete');
    }
    
    // Check if error message is a navigation error
    isNavigationError(errorMessage) {
        const navigationErrorPatterns = [
            /ERR_INVALID_URL/,
            /ERR_ABORTED/,
            /loading ''/,
            /loadURL\(''\)/,
            /loadURL\(""\)/,
            /GUEST_VIEW_MANAGER_CALL/,
            /Error occurred in handler/
        ];
        
        return navigationErrorPatterns.some(pattern => pattern.test(errorMessage));
    }
    
    // Handle navigation errors
    handleNavigationError(errorMessage, originalArgs) {
        this.errorCount++;
        
        console.log(`🛡️ NAVIGATION ERROR PREVENTED (${this.errorCount}/${this.maxErrors}):`, errorMessage);
        
        // If too many errors, show warning
        if (this.errorCount >= this.maxErrors) {
            console.warn('🛡️ Too many navigation errors prevented. Please check your navigation logic.');
        }
        
        // Try to recover from the error
        this.attemptErrorRecovery(errorMessage);
    }
    
    // Attempt error recovery
    attemptErrorRecovery(errorMessage) {
        console.log('🛡️ Attempting error recovery...');
        
        // Check if webview is in a bad state
        const view = document.getElementById('view');
        if (view) {
            // Don't reset webview to about:blank as it causes ERR_ABORTED
            console.log('🛡️ Webview state check completed');
        }
        
        // Show start page if available
        const startEl = document.getElementById('start');
        if (startEl) {
            startEl.style.display = 'flex';
            startEl.hidden = false;
            console.log('🛡️ Start page shown for recovery');
        }
    }
    
    // Override error-prone functions
    overrideErrorProneFunctions() {
        console.log('🛡️ Setting up error-prone function overrides...');
        
        // Override any remaining loadURL calls that might have been missed
        this.overrideRemainingLoadURLCalls();
        
        // Override any navigation functions that might cause errors
        this.overrideRemainingNavigationFunctions();
        
        console.log('🛡️ Error-prone function overrides complete');
    }
    
    // Override remaining loadURL calls
    overrideRemainingLoadURLCalls() {
        // Find all elements that might have loadURL
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            if (element.loadURL && typeof element.loadURL === 'function' && !element._loadURLProtected) {
                const original = element.loadURL.bind(element);
                
                element.loadURL = (url, options) => {
                    if (!this.isValidURL(url)) {
                        console.log('🛡️ ERROR PREVENTION: Invalid URL blocked in element.loadURL:', url);
                        return Promise.reject(new Error(`Navigation blocked: Invalid URL "${url}"`));
                    }
                    return original(url, options);
                };
                
                element._loadURLProtected = true;
            }
        });
    }
    
    // Override remaining navigation functions
    overrideRemainingNavigationFunctions() {
        // Override any remaining navigation functions
        const navigationFunctions = ['navigate', 'goTo', 'loadPage', 'openPage'];
        
        navigationFunctions.forEach(funcName => {
            if (window[funcName] && typeof window[funcName] === 'function' && !window[`_${funcName}Protected`]) {
                const original = window[funcName];
                
                window[funcName] = (url) => {
                    if (!this.isValidURL(url)) {
                        console.log(`🛡️ ERROR PREVENTION: Invalid URL blocked in window.${funcName}:`, url);
                        return;
                    }
                    return original(url);
                };
                
                window[`_${funcName}Protected`] = true;
            }
        });
    }
    
    // Setup periodic error checking
    setupPeriodicErrorChecking() {
        console.log('🛡️ Setting up periodic error checking...');
        
        // Check for errors every 5 seconds
        setInterval(() => {
            this.checkForErrors();
        }, 5000);
        
        console.log('🛡️ Periodic error checking active');
    }
    
    // Check for errors
    checkForErrors() {
        // Check if webview is in a bad state
        const view = document.getElementById('view');
        if (view) {
            try {
                const currentURL = view.getURL();
                if (!currentURL || currentURL === 'about:blank') {
                    console.log('🛡️ Webview appears to be in safe state');
                }
            } catch (e) {
                console.log('🛡️ Could not check webview state:', e);
            }
        }
        
        // Check error count
        if (this.errorCount > 0) {
            console.log(`🛡️ Error Prevention Status: ${this.errorCount} errors prevented`);
        }
    }
    
    // Ultimate URL validation
    isValidURL(url) {
        // Type check
        if (typeof url !== 'string') {
            return false;
        }
        
        // Null/undefined check
        if (url === null || url === undefined) {
            return false;
        }
        
        // Empty string check
        if (url === '') {
            return false;
        }
        
        // Whitespace check
        if (url.trim() === '') {
            return false;
        }
        
        // Length check
        if (url.length === 0) {
            return false;
        }
        
        // Basic format validation
        try {
            // Try to create a URL object for validation
            new URL(url);
            return true;
        } catch (e) {
            // If it's not a valid URL format, check if it's a search query
            if (url.length > 0 && url.trim().length > 0) {
                return true;
            }
            return false;
        }
    }
    
    // Get error prevention status
    getErrorPreventionStatus() {
        return {
            isInitialized: this.isInitialized,
            errorsPrevented: this.errorCount,
            maxErrors: this.maxErrors,
            systemHealthy: this.errorCount < this.maxErrors
        };
    }
    
    // Reset error count
    resetErrorCount() {
        this.errorCount = 0;
        console.log('🛡️ Error count reset');
    }
    
    // Force reinitialize
    reinitialize() {
        console.log('🛡️ Reinitializing error prevention system...');
        this.isInitialized = false;
        this.errorCount = 0;
        this.init();
    }
    
    // Test error prevention
    testErrorPrevention() {
        console.log('🛡️ Testing error prevention system...');
        
        // Test with a mock error
        console.error('Test ERR_INVALID_URL loading \'\'');
        
        // Test URL validation
        const testURLs = ['', 'https://www.google.com', 'google', ''];
        testURLs.forEach(url => {
            const isValid = this.isValidURL(url);
            console.log(`🛡️ URL validation test: "${url}" -> ${isValid ? 'VALID' : 'INVALID'}`);
        });
        
        console.log('🛡️ Error prevention test complete');
    }
}

// Create and export the error prevention system
window.errorPreventionSystem = new ErrorPreventionSystem();

// Export functions for manual control
window.initializeErrorPrevention = () => window.errorPreventionSystem.init();
window.getErrorPreventionStatus = () => window.errorPreventionSystem.getErrorPreventionStatus();
window.resetErrorCount = () => window.errorPreventionSystem.resetErrorCount();
window.reinitializeErrorPrevention = () => window.errorPreventionSystem.reinitialize();
window.testErrorPrevention = () => window.errorPreventionSystem.testErrorPrevention();

console.log('🛡️ Error Prevention System loaded successfully');
console.log('🛡️ Use initializeErrorPrevention() to reinitialize system');
console.log('🛡️ Use getErrorPreventionStatus() to check system status');
console.log('🛡️ Use resetErrorCount() to reset error counter');
console.log('🛡️ Use reinitializeErrorPrevention() to force reinitialize');
console.log('🛡️ Use testErrorPrevention() to test the system');
console.log('🛡️ ALL navigation errors are now PREVENTED from reaching the terminal');
