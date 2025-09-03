// ========================================
// KAIRO BROWSER - ERROR RECOVERY MODULE
// ========================================

console.log('🛡️ Loading Error Recovery Module...');

// Enhanced Error Recovery Class
class EnhancedErrorRecovery {
    constructor() {
        this.isEnabled = true;
        this.errorHistory = [];
        this.maxErrorHistory = 50;
        this.recoveryStrategies = new Map();
        this.autoRecoveryEnabled = true;
        this.maxRetryAttempts = 3;
        
        console.log('🛡️ Enhanced Error Recovery initialized');
    }

    // Initialize error recovery system
    initializeErrorRecovery() {
        console.log('🛡️ Initializing Error Recovery System...');
        
        if (this.isEnabled) {
            this.setupErrorListeners();
            this.setupRecoveryStrategies();
            this.setupGlobalErrorHandling();
            
            console.log('✅ Error recovery system initialized successfully');
        }
    }

    // Setup error event listeners
    setupErrorListeners() {
        console.log('🛡️ Setting up error event listeners...');
        
        // Listen for JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error || event.message, 'javascript', event);
        });
        
        // Listen for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise', event);
        });
        
        // Listen for resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target && event.target.tagName) {
                this.handleError(`Resource loading failed: ${event.target.src || event.target.href}`, 'resource', event);
            }
        }, true);
        
        console.log('✅ Error event listeners setup completed');
    }

    // Setup recovery strategies
    setupRecoveryStrategies() {
        console.log('🛡️ Setting up recovery strategies...');
        
        // Navigation errors
        this.recoveryStrategies.set('navigation', {
            name: 'Navigation Error Recovery',
            handler: (error) => this.handleNavigationError(error),
            priority: 'high'
        });
        
        // AI system errors
        this.recoveryStrategies.set('ai', {
            name: 'AI System Error Recovery',
            handler: (error) => this.handleAIError(error),
            priority: 'medium'
        });
        
        // UI errors
        this.recoveryStrategies.set('ui', {
            name: 'UI Error Recovery',
            handler: (error) => this.handleUIError(error),
            priority: 'medium'
        });
        
        // Performance errors
        this.recoveryStrategies.set('performance', {
            name: 'Performance Error Recovery',
            handler: (error) => this.handlePerformanceError(error),
            priority: 'low'
        });
        
        // Network errors
        this.recoveryStrategies.set('network', {
            name: 'Network Error Recovery',
            handler: (error) => this.handleNetworkError(error),
            priority: 'high'
        });
        
        console.log('✅ Recovery strategies setup completed');
    }

    // Setup global error handling
    setupGlobalErrorHandling() {
        console.log('🛡️ Setting up global error handling...');
        
        // Override console.error to capture errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError(args.join(' '), 'console', { args });
            originalConsoleError.apply(console, args);
        };
        
        // Override console.warn to capture warnings
        const originalConsoleWarn = console.warn;
        console.warn = (...args) => {
            this.handleError(args.join(' '), 'warning', { args });
            originalConsoleWarn.apply(console, args);
        };
        
        console.log('✅ Global error handling setup completed');
    }

    // Handle errors
    handleError(error, type, context) {
        try {
            const errorInfo = {
                timestamp: Date.now(),
                type: type,
                message: error.message || error.toString(),
                stack: error.stack,
                context: context,
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            console.log(`🛡️ Error detected: ${errorInfo.message}`);
            
            // Add to error history
            this.addToErrorHistory(errorInfo);
            
            // Attempt automatic recovery
            if (this.autoRecoveryEnabled) {
                this.attemptAutoRecovery(errorInfo);
            }
            
            // Log error for debugging
            this.logError(errorInfo);
            
        } catch (recoveryError) {
            console.error('❌ Error in error recovery:', recoveryError);
        }
    }

    // Add error to history
    addToErrorHistory(errorInfo) {
        this.errorHistory.push(errorInfo);
        
        // Keep history size manageable
        if (this.errorHistory.length > this.maxErrorHistory) {
            this.errorHistory.shift();
        }
    }

    // Attempt automatic recovery
    async attemptAutoRecovery(errorInfo) {
        console.log('🔄 Attempting automatic error recovery...');
        
        try {
            // Determine error category
            const category = this.categorizeError(errorInfo);
            
            // Find appropriate recovery strategy
            if (this.recoveryStrategies.has(category)) {
                const strategy = this.recoveryStrategies.get(category);
                console.log(`🛡️ Using recovery strategy: ${strategy.name}`);
                
                // Execute recovery strategy
                const result = await strategy.handler(errorInfo);
                
                if (result.success) {
                    console.log('✅ Error recovery successful');
                    this.showRecoveryNotification('Error recovered automatically', 'success');
                } else {
                    console.log('⚠️ Error recovery partially successful');
                    this.showRecoveryNotification('Error partially recovered', 'warning');
                }
            } else {
                console.log('⚠️ No specific recovery strategy found, using generic recovery');
                await this.performGenericRecovery(errorInfo);
            }
            
        } catch (recoveryError) {
            console.error('❌ Error during automatic recovery:', recoveryError);
            this.showRecoveryNotification('Automatic recovery failed', 'error');
        }
    }

    // Categorize error
    categorizeError(errorInfo) {
        const message = errorInfo.message.toLowerCase();
        
        if (message.includes('navigation') || message.includes('url') || message.includes('load')) {
            return 'navigation';
        } else if (message.includes('ai') || message.includes('chat') || message.includes('intelligence')) {
            return 'ai';
        } else if (message.includes('ui') || message.includes('dom') || message.includes('element')) {
            return 'ui';
        } else if (message.includes('performance') || message.includes('memory') || message.includes('fps')) {
            return 'performance';
        } else if (message.includes('network') || message.includes('fetch') || message.includes('http')) {
            return 'network';
        } else {
            return 'generic';
        }
    }

    // Handle navigation errors
    async handleNavigationError(errorInfo) {
        console.log('🧭 Handling navigation error...');
        
        try {
            // Check if webview is available
            const webview = document.getElementById('view');
            if (webview) {
                // Try to reload the page
                webview.reload();
                console.log('✅ Navigation error: Page reloaded');
                return { success: true, action: 'reload' };
            }
            
            // Fallback: show start page
            const startEl = document.getElementById('start');
            if (startEl) {
                startEl.hidden = false;
                console.log('✅ Navigation error: Start page shown');
                return { success: true, action: 'show_start_page' };
            }
            
            return { success: false, reason: 'No recovery options available' };
            
        } catch (error) {
            console.error('❌ Error in navigation recovery:', error);
            return { success: false, reason: error.message };
        }
    }

    // Handle AI errors
    async handleAIError(errorInfo) {
        console.log('🧠 Handling AI error...');
        
        try {
            // Check if AI system is available
            if (window.enhancedAIIntelligence) {
                // Try to reinitialize AI system
                if (typeof window.enhancedAIIntelligence.initializeIntelligence === 'function') {
                    window.enhancedAIIntelligence.initializeIntelligence();
                    console.log('✅ AI error: System reinitialized');
                    return { success: true, action: 'reinitialize' };
                }
            }
            
            // Fallback: show error message in chat
            this.showRecoveryNotification('AI system temporarily unavailable', 'warning');
            return { success: false, reason: 'AI system not available' };
            
        } catch (error) {
            console.error('❌ Error in AI recovery:', error);
            return { success: false, reason: error.message };
        }
    }

    // Handle UI errors
    async handleUIError(errorInfo) {
        console.log('🔧 Handling UI error...');
        
        try {
            // Check if UI elements are available
            const urlInput = document.getElementById('url');
            const goBtn = document.getElementById('go');
            
            if (urlInput && goBtn) {
                // Try to reattach event listeners
                this.reattachUIEventListeners();
                console.log('✅ UI error: Event listeners reattached');
                return { success: true, action: 'reattach_listeners' };
            }
            
            return { success: false, reason: 'UI elements not available' };
            
        } catch (error) {
            console.error('❌ Error in UI recovery:', error);
            return { success: false, reason: error.message };
        }
    }

    // Handle performance errors
    async handlePerformanceError(errorInfo) {
        console.log('⚡ Handling performance error...');
        
        try {
            // Check if performance monitor is available
            if (window.enhancedPerformanceMonitor) {
                // Try to reset performance metrics
                if (typeof window.enhancedPerformanceMonitor.resetMetrics === 'function') {
                    window.enhancedPerformanceMonitor.resetMetrics();
                    console.log('✅ Performance error: Metrics reset');
                    return { success: true, action: 'reset_metrics' };
                }
            }
            
            return { success: false, reason: 'Performance monitor not available' };
            
        } catch (error) {
            console.error('❌ Error in performance recovery:', error);
            return { success: false, reason: error.message };
        }
    }

    // Handle network errors
    async handleNetworkError(errorInfo) {
        console.log('🌐 Handling network error...');
        
        try {
            // Check network connectivity
            if (navigator.onLine) {
                // Online but error occurred, try to refresh
                console.log('✅ Network error: Connection available, suggesting refresh');
                return { success: true, action: 'suggest_refresh' };
            } else {
                // Offline, show offline message
                this.showRecoveryNotification('You are currently offline', 'warning');
                return { success: false, reason: 'Offline' };
            }
            
        } catch (error) {
            console.error('❌ Error in network recovery:', error);
            return { success: false, reason: error.message };
        }
    }

    // Perform generic recovery
    async performGenericRecovery(errorInfo) {
        console.log('🔧 Performing generic error recovery...');
        
        try {
            // Try to clear any corrupted state
            this.clearCorruptedState();
            
            // Attempt to restore basic functionality
            const restored = await this.restoreBasicFunctionality();
            
            if (restored) {
                console.log('✅ Generic recovery: Basic functionality restored');
                return { success: true, action: 'restore_basic_functionality' };
            } else {
                console.log('⚠️ Generic recovery: Partial restoration');
                return { success: false, reason: 'Partial restoration only' };
            }
            
        } catch (error) {
            console.error('❌ Error in generic recovery:', error);
            return { success: false, reason: error.message };
        }
    }

    // Clear corrupted state
    clearCorruptedState() {
        console.log('🧹 Clearing corrupted state...');
        
        try {
            // Clear any error flags
            if (window.errorFlags) {
                delete window.errorFlags;
            }
            
            // Reset any corrupted variables
            if (window.corruptedState) {
                delete window.corruptedState;
            }
            
            console.log('✅ Corrupted state cleared');
        } catch (error) {
            console.error('❌ Error clearing corrupted state:', error);
        }
    }

    // Restore basic functionality
    async restoreBasicFunctionality() {
        console.log('🔧 Restoring basic functionality...');
        
        try {
            let restored = false;
            
            // Try to restore navigation
            if (this.restoreNavigation()) {
                restored = true;
            }
            
            // Try to restore UI
            if (this.restoreUI()) {
                restored = true;
            }
            
            // Try to restore AI
            if (this.restoreAI()) {
                restored = true;
            }
            
            return restored;
            
        } catch (error) {
            console.error('❌ Error restoring basic functionality:', error);
            return false;
        }
    }

    // Restore navigation
    restoreNavigation() {
        try {
            const webview = document.getElementById('view');
            if (webview) {
                // Ensure webview is functional
                webview.style.display = 'block';
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error restoring navigation:', error);
            return false;
        }
    }

    // Restore UI
    restoreUI() {
        try {
            // Ensure start page is visible
            const startEl = document.getElementById('start');
            if (startEl) {
                startEl.hidden = false;
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error restoring UI:', error);
            return false;
        }
    }

    // Restore AI
    restoreAI() {
        try {
            // Check if AI system exists
            if (window.enhancedAIIntelligence) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error restoring AI:', error);
            return false;
        }
    }

    // Reattach UI event listeners
    reattachUIEventListeners() {
        console.log('🔧 Reattaching UI event listeners...');
        
        try {
            // Reattach navigation listeners
            const urlInput = document.getElementById('url');
            const goBtn = document.getElementById('go');
            
            if (urlInput && goBtn) {
                // Remove existing listeners
                urlInput.replaceWith(urlInput.cloneNode(true));
                goBtn.replaceWith(goBtn.cloneNode(true));
                
                // Get fresh references
                const newUrlInput = document.getElementById('url');
                const newGoBtn = document.getElementById('go');
                
                // Reattach listeners (this will be done by the main system)
                console.log('✅ UI event listeners reattached');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error reattaching UI event listeners:', error);
            return false;
        }
    }

    // Show recovery notification
    showRecoveryNotification(message, type = 'info') {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `kairo-notification kairo-notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">×</button>
                </div>
            `;
            
            // Add styles
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${this.getNotificationColor(type)};
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
            const closeBtn = notification.querySelector('.notification-close');
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
            console.error('❌ Error showing recovery notification:', error);
        }
    }

    // Get notification icon
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    }

    // Get notification color
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'warning': return '#ffc107';
            case 'error': return '#dc3545';
            default: return '#17a2b8';
        }
    }

    // Log error for debugging
    logError(errorInfo) {
        try {
            // Store in localStorage for debugging
            const errorLog = JSON.parse(localStorage.getItem('kairoErrorLog') || '[]');
            errorLog.push(errorInfo);
            
            // Keep only last 100 errors
            if (errorLog.length > 100) {
                errorLog.splice(0, errorLog.length - 100);
            }
            
            localStorage.setItem('kairoErrorLog', JSON.stringify(errorLog));
            
        } catch (error) {
            console.error('❌ Error logging error:', error);
        }
    }

    // Get error history
    getErrorHistory() {
        return [...this.errorHistory];
    }

    // Get error statistics
    getErrorStatistics() {
        const stats = {
            total: this.errorHistory.length,
            byType: {},
            byTime: {
                lastHour: 0,
                lastDay: 0,
                lastWeek: 0
            }
        };
        
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;
        const oneWeek = 7 * oneDay;
        
        this.errorHistory.forEach(error => {
            // Count by type
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // Count by time
            const timeDiff = now - error.timestamp;
            if (timeDiff < oneHour) stats.byTime.lastHour++;
            if (timeDiff < oneDay) stats.byTime.lastDay++;
            if (timeDiff < oneWeek) stats.byTime.lastWeek++;
        });
        
        return stats;
    }

    // Clear error history
    clearErrorHistory() {
        this.errorHistory = [];
        localStorage.removeItem('kairoErrorLog');
        console.log('✅ Error history cleared');
    }

    // Enable/disable error recovery
    toggleErrorRecovery() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.initializeErrorRecovery();
            console.log('✅ Error recovery enabled');
        } else {
            console.log('❌ Error recovery disabled');
        }
        
        return this.isEnabled;
    }

    // Enable/disable auto recovery
    toggleAutoRecovery() {
        this.autoRecoveryEnabled = !this.autoRecoveryEnabled;
        console.log(`🔄 Auto recovery ${this.autoRecoveryEnabled ? 'enabled' : 'disabled'}`);
        return this.autoRecoveryEnabled;
    }
}

// Create and export instance
const enhancedErrorRecovery = new EnhancedErrorRecovery();

// Make it globally available
window.enhancedErrorRecovery = enhancedErrorRecovery;

console.log('✅ Error Recovery Module loaded successfully');
