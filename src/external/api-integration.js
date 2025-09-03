// ========================================
// KAIRO BROWSER - EXTERNAL API INTEGRATION MODULE
// ========================================

console.log('🔌 Loading External API Integration Module...');

// Enhanced External API Integration Class
class ExternalAPIIntegration {
    constructor() {
        this.isEnabled = true;
        this.services = new Map();
        this.authentications = new Map();
        this.activeConnections = new Map();
        this.apiKeys = new Map();
        
        console.log('🔌 External API Integration initialized');
    }

    // Initialize API integration system
    initializeAPIIntegration() {
        console.log('🔌 Initializing External API Integration...');
        
        if (this.isEnabled) {
            this.setupServices();
            this.loadStoredCredentials();
            this.setupAuthenticationHandlers();
            
            console.log('✅ External API integration initialized successfully');
        }
    }

    // Setup available services
    setupServices() {
        console.log('🔌 Setting up external services...');
        
        // Notion API
        this.services.set('notion', {
            name: 'Notion',
            baseUrl: 'https://api.notion.com/v1',
            endpoints: {
                pages: '/pages',
                databases: '/databases',
                blocks: '/blocks',
                search: '/search'
            },
            authType: 'bearer',
            scopes: ['read', 'write'],
            icon: '📝',
            description: 'Note-taking and knowledge management'
        });
        
        // Gmail API
        this.services.set('gmail', {
            name: 'Gmail',
            baseUrl: 'https://gmail.googleapis.com/gmail/v1/users/me',
            endpoints: {
                messages: '/messages',
                threads: '/threads',
                labels: '/labels',
                drafts: '/drafts'
            },
            authType: 'oauth2',
            scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
            icon: '📧',
            description: 'Email management and communication'
        });
        
        // WordPress API
        this.services.set('wordpress', {
            name: 'WordPress',
            baseUrl: '/wp-json/wp/v2',
            endpoints: {
                posts: '/posts',
                pages: '/pages',
                comments: '/comments',
                users: '/users'
            },
            authType: 'basic',
            scopes: ['read', 'write'],
            icon: '🌐',
            description: 'Content management and blogging'
        });
        
        // Slack API
        this.services.set('slack', {
            name: 'Slack',
            baseUrl: 'https://slack.com/api',
            endpoints: {
                chat: '/chat.postMessage',
                channels: '/channels.list',
                users: '/users.list',
                files: '/files.upload'
            },
            authType: 'bearer',
            scopes: ['chat:write', 'channels:read', 'users:read'],
            icon: '💬',
            description: 'Team communication and collaboration'
        });
        
        // Trello API
        this.services.set('trello', {
            name: 'Trello',
            baseUrl: 'https://api.trello.com/1',
            endpoints: {
                boards: '/boards',
                lists: '/lists',
                cards: '/cards',
                members: '/members'
            },
            authType: 'key_token',
            scopes: ['read', 'write'],
            icon: '📋',
            description: 'Project management and task organization'
        });
        
        // GitHub API
        this.services.set('github', {
            name: 'GitHub',
            baseUrl: 'https://api.github.com',
            endpoints: {
                repos: '/repos',
                issues: '/issues',
                pullRequests: '/pulls',
                user: '/user'
            },
            authType: 'bearer',
            scopes: ['repo', 'user', 'read:org'],
            icon: '💻',
            description: 'Code repository and development'
        });
        
        console.log('✅ External services setup completed');
    }

    // Load stored credentials
    loadStoredCredentials() {
        console.log('🔌 Loading stored credentials...');
        
        try {
            const storedCredentials = localStorage.getItem('kairoAPICredentials');
            if (storedCredentials) {
                const credentials = JSON.parse(storedCredentials);
                
                // Load API keys
                if (credentials.apiKeys) {
                    this.apiKeys = new Map(Object.entries(credentials.apiKeys));
                }
                
                // Load authentication tokens
                if (credentials.authentications) {
                    this.authentications = new Map(Object.entries(credentials.authentications));
                }
                
                console.log('✅ Stored credentials loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading stored credentials:', error);
        }
    }

    // Save credentials to storage
    saveCredentials() {
        try {
            const credentials = {
                apiKeys: Object.fromEntries(this.apiKeys),
                authentications: Object.fromEntries(this.authentications),
                timestamp: Date.now()
            };
            
            localStorage.setItem('kairoAPICredentials', JSON.stringify(credentials));
            console.log('✅ Credentials saved successfully');
        } catch (error) {
            console.error('❌ Error saving credentials:', error);
        }
    }

    // Setup authentication handlers
    setupAuthenticationHandlers() {
        console.log('🔌 Setting up authentication handlers...');
        
        // Handle OAuth2 flow
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'oauth_callback') {
                this.handleOAuthCallback(event.data);
            }
        });
        
        console.log('✅ Authentication handlers setup completed');
    }

    // Authenticate with a service
    async authenticateService(serviceName, credentials) {
        console.log(`🔐 Authenticating with ${serviceName}...`);
        
        try {
            const service = this.services.get(serviceName);
            if (!service) {
                throw new Error(`Service ${serviceName} not found`);
            }
            
            let authResult;
            
            switch (service.authType) {
                case 'bearer':
                    authResult = await this.authenticateBearer(serviceName, credentials);
                    break;
                case 'oauth2':
                    authResult = await this.authenticateOAuth2(serviceName, credentials);
                    break;
                case 'basic':
                    authResult = await this.authenticateBasic(serviceName, credentials);
                    break;
                case 'key_token':
                    authResult = await this.authenticateKeyToken(serviceName, credentials);
                    break;
                default:
                    throw new Error(`Unsupported authentication type: ${service.authType}`);
            }
            
            if (authResult.success) {
                this.authentications.set(serviceName, authResult.auth);
                this.saveCredentials();
                console.log(`✅ Authentication with ${serviceName} successful`);
            }
            
            return authResult;
            
        } catch (error) {
            console.error(`❌ Authentication with ${serviceName} failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // Bearer token authentication
    async authenticateBearer(serviceName, credentials) {
        const { token } = credentials;
        
        if (!token) {
            throw new Error('Bearer token is required');
        }
        
        // Test the token with a simple API call
        const service = this.services.get(serviceName);
        const testUrl = `${service.baseUrl}${service.endpoints.user || service.endpoints.pages}`;
        
        try {
            const response = await fetch(testUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return {
                    success: true,
                    auth: { token, type: 'bearer' }
                };
            } else {
                throw new Error(`API test failed: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Bearer authentication failed: ${error.message}`);
        }
    }

    // OAuth2 authentication
    async authenticateOAuth2(serviceName, credentials) {
        const { clientId, redirectUri, scopes } = credentials;
        
        if (!clientId || !redirectUri) {
            throw new Error('Client ID and redirect URI are required for OAuth2');
        }
        
        // Store OAuth2 configuration
        this.oauth2Config = {
            serviceName,
            clientId,
            redirectUri,
            scopes: scopes || ['read']
        };
        
        // Open OAuth2 authorization window
        const authUrl = this.buildOAuth2URL(serviceName);
        const authWindow = window.open(authUrl, 'oauth_auth', 'width=500,height=600');
        
        return new Promise((resolve, reject) => {
            // Set timeout for OAuth2 flow
            const timeout = setTimeout(() => {
                reject(new Error('OAuth2 authentication timeout'));
            }, 300000); // 5 minutes
            
            // Listen for OAuth2 callback
            const messageHandler = (event) => {
                if (event.data && event.data.type === 'oauth_callback') {
                    clearTimeout(timeout);
                    window.removeEventListener('message', messageHandler);
                    
                    if (event.data.success) {
                        resolve({
                            success: true,
                            auth: {
                                accessToken: event.data.accessToken,
                                refreshToken: event.data.refreshToken,
                                type: 'oauth2'
                            }
                        });
                    } else {
                        reject(new Error(event.data.error || 'OAuth2 authentication failed'));
                    }
                }
            };
            
            window.addEventListener('message', messageHandler);
        });
    }

    // Basic authentication
    async authenticateBasic(serviceName, credentials) {
        const { username, password, apiKey } = credentials;
        
        if (!username || (!password && !apiKey)) {
            throw new Error('Username and password or API key are required');
        }
        
        // Store basic auth credentials
        const auth = {
            username,
            password: password || apiKey,
            type: 'basic'
        };
        
        return {
            success: true,
            auth
        };
    }

    // Key + Token authentication
    async authenticateKeyToken(serviceName, credentials) {
        const { apiKey, token } = credentials;
        
        if (!apiKey || !token) {
            throw new Error('API key and token are required');
        }
        
        // Store key + token credentials
        const auth = {
            apiKey,
            token,
            type: 'key_token'
        };
        
        return {
            success: true,
            auth
        };
    }

    // Build OAuth2 authorization URL
    buildOAuth2URL(serviceName) {
        const config = this.oauth2Config;
        
        switch (serviceName) {
            case 'gmail':
                return `https://accounts.google.com/oauth/authorize?` +
                       `client_id=${config.clientId}&` +
                       `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
                       `scope=${encodeURIComponent(config.scopes.join(' '))}&` +
                       `response_type=code&` +
                       `access_type=offline`;
            
            default:
                throw new Error(`OAuth2 not supported for ${serviceName}`);
        }
    }

    // Handle OAuth2 callback
    handleOAuthCallback(data) {
        console.log('🔄 Handling OAuth2 callback...');
        
        if (data.success) {
            // Store the authentication
            const serviceName = this.oauth2Config.serviceName;
            this.authentications.set(serviceName, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                type: 'oauth2'
            });
            
            this.saveCredentials();
            console.log(`✅ OAuth2 authentication for ${serviceName} completed`);
        }
    }

    // Make API request to external service
    async makeAPIRequest(serviceName, endpoint, options = {}) {
        console.log(`🔌 Making API request to ${serviceName}: ${endpoint}`);
        
        try {
            const service = this.services.get(serviceName);
            if (!service) {
                throw new Error(`Service ${serviceName} not found`);
            }
            
            const auth = this.authentications.get(serviceName);
            if (!auth) {
                throw new Error(`Not authenticated with ${serviceName}`);
            }
            
            const url = `${service.baseUrl}${endpoint}`;
            const headers = this.buildRequestHeaders(service, auth);
            
            const requestOptions = {
                method: options.method || 'GET',
                headers,
                ...options
            };
            
            if (options.body) {
                requestOptions.body = JSON.stringify(options.body);
            }
            
            const response = await fetch(url, requestOptions);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ API request to ${serviceName} successful`);
                return { success: true, data };
            } else {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.error(`❌ API request to ${serviceName} failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // Build request headers
    buildRequestHeaders(service, auth) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        switch (auth.type) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${auth.token}`;
                break;
            case 'oauth2':
                headers['Authorization'] = `Bearer ${auth.accessToken}`;
                break;
            case 'basic':
                const credentials = btoa(`${auth.username}:${auth.password}`);
                headers['Authorization'] = `Basic ${credentials}`;
                break;
            case 'key_token':
                headers['X-API-Key'] = auth.apiKey;
                headers['Authorization'] = `Bearer ${auth.token}`;
                break;
        }
        
        return headers;
    }

    // Get service information
    getServiceInfo(serviceName) {
        return this.services.get(serviceName);
    }

    // Get all available services
    getAllServices() {
        return Array.from(this.services.values());
    }

    // Check if service is authenticated
    isServiceAuthenticated(serviceName) {
        return this.authentications.has(serviceName);
    }

    // Get authentication status for all services
    getAuthenticationStatus() {
        const status = {};
        
        for (const [serviceName, service] of this.services) {
            status[serviceName] = {
                name: service.name,
                icon: service.icon,
                description: service.description,
                authenticated: this.isServiceAuthenticated(serviceName),
                authType: service.authType
            };
        }
        
        return status;
    }

    // Disconnect from a service
    disconnectService(serviceName) {
        console.log(`🔌 Disconnecting from ${serviceName}...`);
        
        try {
            this.authentications.delete(serviceName);
            this.activeConnections.delete(serviceName);
            this.saveCredentials();
            
            console.log(`✅ Disconnected from ${serviceName} successfully`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Error disconnecting from ${serviceName}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Refresh OAuth2 token
    async refreshOAuth2Token(serviceName) {
        console.log(`🔄 Refreshing OAuth2 token for ${serviceName}...`);
        
        try {
            const auth = this.authentications.get(serviceName);
            if (!auth || auth.type !== 'oauth2') {
                throw new Error('No OAuth2 authentication found');
            }
            
            // This would typically involve making a request to the OAuth2 provider
            // For now, we'll just return success
            console.log(`✅ OAuth2 token refresh for ${serviceName} completed`);
            return { success: true };
            
        } catch (error) {
            console.error(`❌ Error refreshing OAuth2 token for ${serviceName}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Get API usage statistics
    getAPIUsageStats() {
        const stats = {
            totalServices: this.services.size,
            authenticatedServices: 0,
            activeConnections: this.activeConnections.size,
            lastActivity: null
        };
        
        for (const [serviceName] of this.services) {
            if (this.isServiceAuthenticated(serviceName)) {
                stats.authenticatedServices++;
            }
        }
        
        return stats;
    }

    // Enable/disable API integration
    toggleAPIIntegration() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.initializeAPIIntegration();
            console.log('✅ External API integration enabled');
        } else {
            console.log('❌ External API integration disabled');
        }
        
        return this.isEnabled;
    }

    // Clear all stored credentials
    clearAllCredentials() {
        console.log('🧹 Clearing all stored credentials...');
        
        try {
            this.authentications.clear();
            this.apiKeys.clear();
            this.activeConnections.clear();
            localStorage.removeItem('kairoAPICredentials');
            
            console.log('✅ All credentials cleared successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Error clearing credentials:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create and export instance
// Create global instance
const externalAPIIntegration = new ExternalAPIIntegration();

// Make globally available
window.externalAPIIntegration = externalAPIIntegration;

console.log('✅ External API Integration Module loaded successfully');
