// ========================================
// KAIRO BROWSER - SECURITY MANAGER MODULE
// ========================================

console.log('🔒 Loading Security Manager Module...');

// Enhanced Security Manager Class
class SecurityManager {
    constructor() {
        this.isEnabled = true;
        this.securityLevel = 'high'; // low, medium, high, extreme
        this.encryptionKey = null;
        this.secureStorage = new Map();
        this.securityLog = [];
        this.maxLogSize = 1000;
        this.blockedDomains = new Set();
        this.allowedDomains = new Set();
        this.privacySettings = new Map();
        this.adBlockingEnabled = true;
        this.trackingProtectionEnabled = true;
        this.secureConnectionsOnly = true;
        
        // Security policies
        this.securityPolicies = {
            passwordMinLength: 12,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true,
            maxLoginAttempts: 5,
            lockoutDuration: 15, // minutes
            sessionTimeout: 30, // minutes
            autoLogout: true
        };
        
        console.log('🔒 Security Manager initialized');
    }

    // Initialize security system
    initializeSecurity() {
        console.log('🔒 Initializing Security System...');
        
        if (this.isEnabled) {
            this.generateEncryptionKey();
            this.loadSecuritySettings();
            this.setupSecurityMonitoring();
            this.initializeAdBlocking();
            this.setupPrivacyProtection();
            this.loadBlockedDomains();
            
            console.log('✅ Security System initialized successfully');
        }
    }

    // Generate encryption key for secure storage
    generateEncryptionKey() {
        try {
            // Generate a random encryption key
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            this.encryptionKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            
            console.log('✅ Encryption key generated successfully');
        } catch (error) {
            console.error('❌ Error generating encryption key:', error);
            // Fallback to a simpler key
            this.encryptionKey = 'kairo-browser-security-key-2024';
        }
    }

    // Encrypt sensitive data
    encryptData(data) {
        try {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }
            
            // Simple XOR encryption (in production, use proper encryption)
            const stringData = JSON.stringify(data);
            let encrypted = '';
            
            for (let i = 0; i < stringData.length; i++) {
                const charCode = stringData.charCodeAt(i);
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                encrypted += String.fromCharCode(charCode ^ keyChar);
            }
            
            return btoa(encrypted); // Base64 encode
        } catch (error) {
            console.error('❌ Error encrypting data:', error);
            return null;
        }
    }

    // Decrypt sensitive data
    decryptData(encryptedData) {
        try {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }
            
            // Decode from Base64
            const decoded = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                decrypted += String.fromCharCode(charCode ^ keyChar);
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('❌ Error decrypting data:', error);
            return null;
        }
    }

    // Secure storage operations
    secureStore(key, value) {
        try {
            const encryptedValue = this.encryptData(value);
            if (encryptedValue) {
                this.secureStorage.set(key, encryptedValue);
                localStorage.setItem(`kairo_secure_${key}`, encryptedValue);
            console.log(`✅ Securely stored: ${key}`);
            return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error in secure storage:', error);
            return false;
        }
    }

    // Secure retrieval operations
    secureRetrieve(key) {
        try {
            // Try memory first
            if (this.secureStorage.has(key)) {
                const encryptedValue = this.secureStorage.get(key);
                return this.decryptData(encryptedValue);
            }
            
            // Try localStorage
            const storedValue = localStorage.getItem(`kairo_secure_${key}`);
            if (storedValue) {
                const decryptedValue = this.decryptData(storedValue);
                this.secureStorage.set(key, storedValue);
                return decryptedValue;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error in secure retrieval:', error);
            return null;
        }
    }

    // Password management
    validatePassword(password) {
        try {
            const errors = [];
            
            if (password.length < this.securityPolicies.passwordMinLength) {
                errors.push(`Password must be at least ${this.securityPolicies.passwordMinLength} characters long`);
            }
            
            if (this.securityPolicies.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors.push('Password must contain special characters');
            }
            
            if (this.securityPolicies.requireNumbers && !/\d/.test(password)) {
                errors.push('Password must contain numbers');
            }
            
            if (this.securityPolicies.requireUppercase && !/[A-Z]/.test(password)) {
                errors.push('Password must contain uppercase letters');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        } catch (error) {
            console.error('❌ Error validating password:', error);
            return { isValid: false, errors: ['Password validation error'] };
        }
    }

    // Store encrypted password
    storePassword(service, username, password) {
        try {
            const passwordData = {
                service: service,
                username: username,
                password: password,
                timestamp: Date.now(),
                lastUsed: null
            };
            
            const success = this.secureStore(`password_${service}_${username}`, passwordData);
                
                if (success) {
                this.logSecurityEvent('password_stored', { service, username });
                console.log(`✅ Password stored for ${service}:${username}`);
            }
            
            return success;
        } catch (error) {
            console.error('❌ Error storing password:', error);
            return false;
        }
    }

    // Retrieve encrypted password
    retrievePassword(service, username) {
        try {
            const passwordData = this.secureRetrieve(`password_${service}_${username}`);
            
            if (passwordData) {
                // Update last used timestamp
                passwordData.lastUsed = Date.now();
                this.secureStore(`password_${service}_${username}`, passwordData);
                
                this.logSecurityEvent('password_retrieved', { service, username });
                console.log(`✅ Password retrieved for ${service}:${username}`);
                
                return passwordData.password;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error retrieving password:', error);
            return null;
        }
    }

    // Ad blocking system
    initializeAdBlocking() {
        console.log('🔒 Initializing Ad Blocking System...');
        
        if (this.adBlockingEnabled) {
            this.setupAdBlockingRules();
            this.startAdBlocking();
            console.log('✅ Ad blocking system initialized');
        }
    }

    // Setup ad blocking rules
    setupAdBlockingRules() {
        try {
        // Common ad domains and patterns
        const adPatterns = [
            'doubleclick.net',
            'googleadservices.com',
            'googlesyndication.com',
                'facebook.com/tr/',
            'analytics.google.com',
            'googletagmanager.com',
            'amazon-adsystem.com',
            'adnxs.com',
                'criteo.com',
                'taboola.com',
                'outbrain.com'
        ];
        
        adPatterns.forEach(pattern => {
            this.blockedDomains.add(pattern);
        });
        
            console.log(`✅ ${adPatterns.length} ad blocking patterns loaded`);
        } catch (error) {
            console.error('❌ Error setting up ad blocking rules:', error);
        }
    }

    // Start ad blocking
    startAdBlocking() {
        try {
            // Block requests to ad domains
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.blockAdElements(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Block iframe ads
            this.blockIframeAds();
            
            console.log('✅ Ad blocking active');
        } catch (error) {
            console.error('❌ Error starting ad blocking:', error);
        }
    }

    // Block ad elements
    blockAdElements(element) {
        try {
            // Block elements with ad-related classes or IDs
            const adSelectors = [
                '[class*="ad"]',
                '[class*="ads"]',
                '[class*="advertisement"]',
                '[id*="ad"]',
                '[id*="ads"]',
                '[id*="advertisement"]',
                '[data-ad]',
                '[data-ads]'
            ];
            
            adSelectors.forEach(selector => {
                const adElements = element.querySelectorAll(selector);
                adElements.forEach(adElement => {
                    adElement.style.display = 'none';
                    adElement.remove();
                });
            });
        } catch (error) {
            console.error('❌ Error blocking ad elements:', error);
        }
    }

    // Block iframe ads
    blockIframeAds() {
        try {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                const src = iframe.src || '';
                if (this.isAdDomain(src)) {
                    iframe.style.display = 'none';
                    iframe.remove();
                    this.logSecurityEvent('ad_blocked', { type: 'iframe', src: src });
                }
            });
        } catch (error) {
            console.error('❌ Error blocking iframe ads:', error);
        }
    }

    // Check if domain is an ad domain
    isAdDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return Array.from(this.blockedDomains).some(blockedDomain => 
                domain.includes(blockedDomain)
            );
        } catch (error) {
            return false;
        }
    }

    // Privacy protection system
    setupPrivacyProtection() {
        console.log('🔒 Setting up Privacy Protection...');
        
        if (this.trackingProtectionEnabled) {
        this.blockTrackingScripts();
            this.blockTrackingCookies();
            this.setupFingerprintProtection();
            console.log('✅ Privacy protection active');
        }
    }

    // Block tracking scripts
    blockTrackingScripts() {
        try {
            const trackingScripts = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.net',
                'twitter.com',
                'linkedin.com',
                'hotjar.com',
                'mixpanel.com',
                'amplitude.com'
            ];
            
            trackingScripts.forEach(domain => {
                this.blockedDomains.add(domain);
            });
            
            console.log(`✅ ${trackingScripts.length} tracking domains blocked`);
        } catch (error) {
            console.error('❌ Error blocking tracking scripts:', error);
        }
    }

    // Block tracking cookies
    blockTrackingCookies() {
        try {
            // Override cookie setting to block tracking cookies
            const originalSetCookie = document.cookie;
            
            Object.defineProperty(document, 'cookie', {
                set: function(value) {
                    if (this.isTrackingCookie(value)) {
                        console.log('🔒 Blocked tracking cookie:', value);
                        return;
                    }
                    originalSetCookie.call(this, value);
                },
                get: function() {
                    return originalSetCookie.call(this);
                }
            });
            
            console.log('✅ Tracking cookie blocking active');
        } catch (error) {
            console.error('❌ Error setting up cookie blocking:', error);
        }
    }

    // Check if cookie is a tracking cookie
    isTrackingCookie(cookieString) {
        const trackingPatterns = [
            '_ga',
            '_gid',
            '_fbp',
            '_fbc',
            'utm_',
            'fbclid',
            'gclid'
        ];
        
        return trackingPatterns.some(pattern => cookieString.includes(pattern));
    }

    // Setup fingerprint protection
    setupFingerprintProtection() {
        try {
            // Override canvas fingerprinting
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function() {
                const canvas = this;
                const context = canvas.getContext('2d');
                
                // Add subtle noise to prevent fingerprinting
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    data[i] += Math.random() * 2 - 1;     // Red
                    data[i + 1] += Math.random() * 2 - 1; // Green
                    data[i + 2] += Math.random() * 2 - 1; // Blue
                }
                
                context.putImageData(imageData, 0, 0);
                return originalToDataURL.apply(this, arguments);
            };
            
            console.log('✅ Canvas fingerprint protection active');
        } catch (error) {
            console.error('❌ Error setting up fingerprint protection:', error);
        }
    }

    // Security monitoring
    setupSecurityMonitoring() {
        console.log('🔒 Setting up Security Monitoring...');
        
        // Monitor for suspicious activities
        this.monitorNetworkRequests();
        this.monitorDOMChanges();
        this.monitorJavaScriptExecution();
        
        console.log('✅ Security monitoring active');
    }

    // Monitor network requests
    monitorNetworkRequests() {
        try {
            // Override fetch to monitor requests
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const url = args[0];
                
                // Check if request is to blocked domain
                if (this.isAdDomain(url) || this.isBlockedDomain(url)) {
                    this.logSecurityEvent('request_blocked', { url: url, reason: 'blocked_domain' });
                    throw new Error('Request blocked for security reasons');
                }
                
                // Log suspicious requests
                if (this.isSuspiciousRequest(url)) {
                    this.logSecurityEvent('suspicious_request', { url: url, type: 'fetch' });
                }
                
                return originalFetch.apply(this, args);
            };
            
            console.log('✅ Network request monitoring active');
        } catch (error) {
            console.error('❌ Error setting up network monitoring:', error);
        }
    }

    // Monitor DOM changes
    monitorDOMChanges() {
        try {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.checkForSuspiciousElements(node);
                            }
                        });
                        }
                    });
                });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('✅ DOM change monitoring active');
        } catch (error) {
            console.error('❌ Error setting up DOM monitoring:', error);
        }
    }

    // Check for suspicious elements
    checkForSuspiciousElements(element) {
        try {
            const suspiciousPatterns = [
            'eval(',
                'setTimeout(',
                'setInterval(',
                'Function(',
                'document.write(',
                'innerHTML'
            ];
            
            suspiciousPatterns.forEach(pattern => {
                if (element.innerHTML && element.innerHTML.includes(pattern)) {
                    this.logSecurityEvent('suspicious_element', { 
                        pattern: pattern, 
                        element: element.tagName 
                    });
                }
            });
        } catch (error) {
            console.error('❌ Error checking suspicious elements:', error);
        }
    }

    // Monitor JavaScript execution
    monitorJavaScriptExecution() {
        try {
            // Override eval to monitor execution
            const originalEval = window.eval;
            window.eval = function(code) {
                this.logSecurityEvent('eval_execution', { code: code.substring(0, 100) });
                return originalEval.apply(this, arguments);
            }.bind(this);
            
            console.log('✅ JavaScript execution monitoring active');
        } catch (error) {
            console.error('❌ Error setting up JavaScript monitoring:', error);
        }
    }

    // Check if request is suspicious
    isSuspiciousRequest(url) {
        const suspiciousPatterns = [
            'data:text/html',
            'javascript:',
            'vbscript:',
            'file://',
            'chrome://',
            'chrome-extension://'
        ];
        
        return suspiciousPatterns.some(pattern => url.includes(pattern));
    }

    // Check if domain is blocked
    isBlockedDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return this.blockedDomains.has(domain);
        } catch (error) {
            return false;
        }
    }

    // Security logging
    logSecurityEvent(eventType, details) {
        try {
            const logEntry = {
                timestamp: Date.now(),
                eventType: eventType,
                details: details,
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.securityLog.unshift(logEntry);
            
            // Maintain log size
            if (this.securityLog.length > this.maxLogSize) {
                this.securityLog = this.securityLog.slice(0, this.maxLogSize);
            }
            
            // Store in localStorage
            localStorage.setItem('kairo_security_log', JSON.stringify(this.securityLog));
            
            console.log(`🔒 Security Event: ${eventType}`, details);
        } catch (error) {
            console.error('❌ Error logging security event:', error);
        }
    }

    // Get security log
    getSecurityLog(limit = 50, filter = {}) {
        try {
            let filteredLog = this.securityLog;
            
            if (filter.eventType) {
                filteredLog = filteredLog.filter(entry => entry.eventType === filter.eventType);
            }
            
            if (filter.url) {
                filteredLog = filteredLog.filter(entry => entry.url.includes(filter.url));
            }
            
            if (limit && limit > 0) {
                filteredLog = filteredLog.slice(0, limit);
            }
            
            return filteredLog;
        } catch (error) {
            console.error('❌ Error getting security log:', error);
            return [];
        }
    }

    // Get security statistics
    getSecurityStats() {
        try {
            const eventCounts = {};
            this.securityLog.forEach(entry => {
                eventCounts[entry.eventType] = (eventCounts[entry.eventType] || 0) + 1;
            });
            
            return {
                totalEvents: this.securityLog.length,
                eventCounts: eventCounts,
                blockedDomains: this.blockedDomains.size,
                securityLevel: this.securityLevel,
                adBlockingEnabled: this.adBlockingEnabled,
                trackingProtectionEnabled: this.trackingProtectionEnabled,
                secureConnectionsOnly: this.secureConnectionsOnly
            };
        } catch (error) {
            console.error('❌ Error getting security stats:', error);
            return null;
        }
    }

    // Update security settings
    updateSecuritySettings(settings) {
        try {
            Object.assign(this, settings);
            this.saveSecuritySettings();
            console.log('✅ Security settings updated');
                return true;
        } catch (error) {
            console.error('❌ Error updating security settings:', error);
            return false;
        }
    }

    // Save security settings
    saveSecuritySettings() {
        try {
            const settings = {
                securityLevel: this.securityLevel,
                adBlockingEnabled: this.adBlockingEnabled,
                trackingProtectionEnabled: this.trackingProtectionEnabled,
                secureConnectionsOnly: this.secureConnectionsOnly,
                securityPolicies: this.securityPolicies
            };
            
            localStorage.setItem('kairo_security_settings', JSON.stringify(settings));
            console.log('✅ Security settings saved');
        } catch (error) {
            console.error('❌ Error saving security settings:', error);
        }
    }

    // Load security settings
    loadSecuritySettings() {
        try {
            const storedSettings = localStorage.getItem('kairo_security_settings');
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                Object.assign(this, settings);
                console.log('✅ Security settings loaded');
            }
        } catch (error) {
            console.error('❌ Error loading security settings:', error);
        }
    }

    // Load blocked domains
    loadBlockedDomains() {
        try {
            const storedDomains = localStorage.getItem('kairo_blocked_domains');
            if (storedDomains) {
                const domains = JSON.parse(storedDomains);
                domains.forEach(domain => this.blockedDomains.add(domain));
                console.log(`✅ ${domains.length} blocked domains loaded`);
            }
        } catch (error) {
            console.error('❌ Error loading blocked domains:', error);
        }
    }

    // Add blocked domain
    addBlockedDomain(domain) {
        try {
            this.blockedDomains.add(domain);
            this.saveBlockedDomains();
            this.logSecurityEvent('domain_blocked', { domain: domain });
            console.log(`✅ Domain blocked: ${domain}`);
            return true;
        } catch (error) {
            console.error('❌ Error adding blocked domain:', error);
            return false;
        }
    }

    // Remove blocked domain
    removeBlockedDomain(domain) {
        try {
            this.blockedDomains.delete(domain);
            this.saveBlockedDomains();
            this.logSecurityEvent('domain_unblocked', { domain: domain });
            console.log(`✅ Domain unblocked: ${domain}`);
            return true;
        } catch (error) {
            console.error('❌ Error removing blocked domain:', error);
            return false;
        }
    }

    // Save blocked domains
    saveBlockedDomains() {
        try {
            const domains = Array.from(this.blockedDomains);
            localStorage.setItem('kairo_blocked_domains', JSON.stringify(domains));
        } catch (error) {
            console.error('❌ Error saving blocked domains:', error);
        }
    }

    // Check if security is enabled
    isSecurityEnabled() {
        return this.isEnabled;
    }

    // Toggle security system
    toggleSecurity() {
        this.isEnabled = !this.isEnabled;
        if (this.isEnabled) {
            console.log('✅ Security system enabled');
        } else {
            console.log('❌ Security system disabled');
        }
        return this.isEnabled;
    }

    // Get security status
    getSecurityStatus() {
        return {
            enabled: this.isEnabled,
            level: this.securityLevel,
            adBlocking: this.adBlockingEnabled,
            trackingProtection: this.trackingProtectionEnabled,
            secureConnections: this.secureConnectionsOnly,
            blockedDomains: this.blockedDomains.size,
            recentEvents: this.securityLog.slice(0, 10)
        };
    }
}

// Create and export instance
// Create global instance
const securityManager = new SecurityManager();

// Make globally available
window.securityManager = securityManager;

console.log('✅ Security Manager Module loaded successfully');
