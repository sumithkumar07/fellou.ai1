// ========================================
// KAIRO BROWSER - SECURITY MANAGER MODULE
// ========================================

console.log('🔒 Loading Security Manager Module...');

// Security Manager Class
class SecurityManager {
    constructor() {
        this.isEnabled = true;
        this.securityPolicies = new Map();
        this.blockedUrls = new Set();
        this.allowedUrls = new Set();
        
        console.log('🔒 Security Manager initialized');
    }

    // Initialize security system
    initializeSecurity() {
        console.log('🔒 Initializing Security Manager...');
        
        if (this.isEnabled) {
            this.setupDefaultPolicies();
            this.setupContentSecurityPolicy();
            console.log('✅ Security Manager initialized successfully');
        }
    }

    // Setup default security policies
    setupDefaultPolicies() {
        this.securityPolicies.set('allowInsecureContent', false);
        this.securityPolicies.set('allowMixedContent', false);
        this.securityPolicies.set('blockMaliciousUrls', true);
        this.securityPolicies.set('enableSafeMode', true);
        
        console.log('✅ Default security policies set up');
    }

    // Setup content security policy
    setupContentSecurityPolicy() {
        // Add common blocked URLs for security
        this.blockedUrls.add('javascript:');
        this.blockedUrls.add('data:text/html');
        
        console.log('✅ Content security policy set up');
    }

    // Check if URL is safe
    isUrlSafe(url) {
        try {
            const urlObj = new URL(url);
            
            // Check blocked URLs
            for (const blocked of this.blockedUrls) {
                if (url.startsWith(blocked)) {
                    return false;
                }
            }
            
            // Check protocol
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error checking URL safety:', error);
            return false;
        }
    }

    // Add URL to blocked list
    blockUrl(url) {
        this.blockedUrls.add(url);
        console.log(`🔒 URL blocked: ${url}`);
    }

    // Remove URL from blocked list
    unblockUrl(url) {
        this.blockedUrls.delete(url);
        console.log(`🔓 URL unblocked: ${url}`);
    }

    // Get security status
    getSecurityStatus() {
        return {
            enabled: this.isEnabled,
            policies: Object.fromEntries(this.securityPolicies),
            blockedUrls: Array.from(this.blockedUrls),
            allowedUrls: Array.from(this.allowedUrls)
        };
    }
}

// Create and export instance
const securityManager = new SecurityManager();

// Make it globally available
window.securityManager = securityManager;

console.log('✅ Security Manager Module loaded successfully');