// ========================================
// KAIRO BROWSER - AI MEMORY SYSTEM MODULE
// ========================================

console.log('🧠 Loading AI Memory System Module...');

// Enhanced AI Memory System Class
class EnhancedAIMemory {
    constructor() {
        this.isEnabled = true;
        this.conversationHistory = [];
        this.userPreferences = new Map();
        this.behavioralPatterns = new Map();
        this.maxHistorySize = 1000;
        this.maxPreferences = 100;
        this.maxPatterns = 50;
        
        console.log('🧠 Enhanced AI Memory System initialized');
    }

    // Initialize memory system
    initializeMemory() {
        console.log('🧠 Initializing AI Memory System...');
        
        if (this.isEnabled) {
            this.loadStoredData();
            this.setupMemoryCleanup();
            this.analyzeBehavioralPatterns();
            
            console.log('✅ AI Memory System initialized successfully');
        }
    }

    // Add conversation entry
    addConversationEntry(userInput, aiResponse, context = {}) {
        try {
            const entry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userInput: userInput,
                aiResponse: aiResponse,
                context: {
                    pageUrl: context.pageUrl || window.location.href,
                    pageTitle: context.pageTitle || document.title,
                    userAction: context.userAction || 'chat_message',
                    enhanced: context.enhanced || false,
                    ...context
                },
                metadata: {
                    inputLength: userInput.length,
                    responseLength: aiResponse.length,
                    responseTime: context.responseTime || 0,
                    userSatisfaction: context.satisfaction || null
                }
            };

            this.conversationHistory.unshift(entry);
            
            // Maintain history size
            if (this.conversationHistory.length > this.maxHistorySize) {
                this.conversationHistory = this.conversationHistory.slice(0, this.maxHistorySize);
            }

            // Store in localStorage
            this.saveStoredData();
            
            // Analyze for patterns
            this.analyzeConversationPatterns(entry);
            
            console.log('✅ Conversation entry added to memory');
            return entry;
            
        } catch (error) {
            console.error('❌ Error adding conversation entry:', error);
            return null;
        }
    }

    // Get conversation history
    getConversationHistory(limit = 10, filter = {}) {
        try {
            let filteredHistory = this.conversationHistory;
            
            // Apply filters
            if (filter.userAction) {
                filteredHistory = filteredHistory.filter(entry => 
                    entry.context.userAction === filter.userAction
                );
            }
            
            if (filter.enhanced !== undefined) {
                filteredHistory = filteredHistory.filter(entry => 
                    entry.context.enhanced === filter.enhanced
                );
            }
            
            if (filter.pageUrl) {
                filteredHistory = filteredHistory.filter(entry => 
                    entry.context.pageUrl.includes(filter.pageUrl)
                );
            }
            
            // Apply limit
            if (limit && limit > 0) {
                filteredHistory = filteredHistory.slice(0, limit);
            }
            
            return filteredHistory;
            
        } catch (error) {
            console.error('❌ Error getting conversation history:', error);
            return [];
        }
    }

    // Add user preference
    addUserPreference(category, key, value) {
        try {
            if (!this.userPreferences.has(category)) {
                this.userPreferences.set(category, new Map());
            }
            
            const categoryPrefs = this.userPreferences.get(category);
            categoryPrefs.set(key, {
                value: value,
                timestamp: Date.now(),
                usageCount: (categoryPrefs.get(key)?.usageCount || 0) + 1
            });
            
            // Maintain preferences size
            if (this.userPreferences.size > this.maxPreferences) {
                const oldestCategory = Array.from(this.userPreferences.keys())[0];
                this.userPreferences.delete(oldestCategory);
            }
            
            this.saveStoredData();
            console.log(`✅ User preference added: ${category}.${key} = ${value}`);
            
        } catch (error) {
            console.error('❌ Error adding user preference:', error);
        }
    }

    // Get user preference
    getUserPreference(category, key, defaultValue = null) {
        try {
            const categoryPrefs = this.userPreferences.get(category);
            if (categoryPrefs && categoryPrefs.has(key)) {
                return categoryPrefs.get(key).value;
            }
            return defaultValue;
            
        } catch (error) {
            console.error('❌ Error getting user preference:', error);
            return defaultValue;
        }
    }

    // Add behavioral pattern
    addBehavioralPattern(patternType, data) {
        try {
            const pattern = {
                type: patternType,
                data: data,
                timestamp: Date.now(),
                frequency: 1,
                confidence: 0.5
            };
            
            const patternKey = `${patternType}_${JSON.stringify(data)}`;
            
            if (this.behavioralPatterns.has(patternKey)) {
                const existing = this.behavioralPatterns.get(patternKey);
                existing.frequency++;
                existing.confidence = Math.min(1.0, existing.confidence + 0.1);
                existing.timestamp = Date.now();
            } else {
                this.behavioralPatterns.set(patternKey, pattern);
            }
            
            // Maintain patterns size
            if (this.behavioralPatterns.size > this.maxPatterns) {
                const oldestPattern = Array.from(this.behavioralPatterns.keys())[0];
                this.behavioralPatterns.delete(oldestPattern);
            }
            
            this.saveStoredData();
            console.log(`✅ Behavioral pattern added: ${patternType}`);
            
        } catch (error) {
            console.error('❌ Error adding behavioral pattern:', error);
        }
    }

    // Get behavioral patterns
    getBehavioralPatterns(patternType = null, minConfidence = 0.3) {
        try {
            let patterns = Array.from(this.behavioralPatterns.values());
            
            if (patternType) {
                patterns = patterns.filter(pattern => pattern.type === patternType);
            }
            
            if (minConfidence > 0) {
                patterns = patterns.filter(pattern => pattern.confidence >= minConfidence);
            }
            
            // Sort by confidence and frequency
            patterns.sort((a, b) => {
                if (b.confidence !== a.confidence) {
                    return b.confidence - a.confidence;
                }
                return b.frequency - a.frequency;
            });
            
            return patterns;
            
        } catch (error) {
            console.error('❌ Error getting behavioral patterns:', error);
            return [];
        }
    }

    // Analyze conversation patterns
    analyzeConversationPatterns(entry) {
        try {
            // Analyze user input patterns
            const inputLength = entry.userInput.length;
            const hasQuestion = entry.userInput.includes('?');
            const hasCommand = entry.userInput.toLowerCase().includes('open') || 
                             entry.userInput.toLowerCase().includes('search');
            
            // Add behavioral patterns
            this.addBehavioralPattern('input_length', {
                category: inputLength < 20 ? 'short' : inputLength < 100 ? 'medium' : 'long',
                value: inputLength
            });
            
            this.addBehavioralPattern('input_type', {
                category: hasQuestion ? 'question' : hasCommand ? 'command' : 'statement'
            });
            
            // Analyze response satisfaction (if available)
            if (entry.metadata.userSatisfaction !== null) {
                this.addBehavioralPattern('response_satisfaction', {
                    category: entry.metadata.userSatisfaction > 0.7 ? 'high' : 
                             entry.metadata.userSatisfaction > 0.4 ? 'medium' : 'low',
                    value: entry.metadata.userSatisfaction
                });
            }
            
        } catch (error) {
            console.error('❌ Error analyzing conversation patterns:', error);
        }
    }

    // Analyze behavioral patterns
    analyzeBehavioralPatterns() {
        try {
            // Analyze conversation frequency
            const recentConversations = this.conversationHistory.slice(0, 50);
            const conversationFrequency = recentConversations.length / 24; // per hour
            
            this.addBehavioralPattern('conversation_frequency', {
                category: conversationFrequency > 5 ? 'high' : 
                         conversationFrequency > 2 ? 'medium' : 'low',
                value: conversationFrequency
            });
            
            // Analyze preferred actions
            const actionCounts = {};
            recentConversations.forEach(entry => {
                const action = entry.context.userAction;
                actionCounts[action] = (actionCounts[action] || 0) + 1;
            });
            
            Object.entries(actionCounts).forEach(([action, count]) => {
                this.addBehavioralPattern('preferred_action', {
                    action: action,
                    frequency: count
                });
            });
            
        } catch (error) {
            console.error('❌ Error analyzing behavioral patterns:', error);
        }
    }

    // Get memory statistics
    getMemoryStats() {
        try {
            return {
                conversationHistory: {
                    total: this.conversationHistory.length,
                    maxSize: this.maxHistorySize,
                    oldestEntry: this.conversationHistory.length > 0 ? 
                        this.conversationHistory[this.conversationHistory.length - 1].timestamp : null,
                    newestEntry: this.conversationHistory.length > 0 ? 
                        this.conversationHistory[0].timestamp : null
                },
                userPreferences: {
                    total: this.userPreferences.size,
                    maxSize: this.maxPreferences,
                    categories: Array.from(this.userPreferences.keys())
                },
                behavioralPatterns: {
                    total: this.behavioralPatterns.size,
                    maxSize: this.maxPatterns,
                    types: [...new Set(Array.from(this.behavioralPatterns.values()).map(p => p.type))]
                }
            };
            
        } catch (error) {
            console.error('❌ Error getting memory stats:', error);
            return null;
        }
    }

    // Clear memory
    clearMemory(type = 'all') {
        try {
            switch (type) {
                case 'conversations':
                    this.conversationHistory = [];
                    console.log('✅ Conversation history cleared');
                    break;
                case 'preferences':
                    this.userPreferences.clear();
                    console.log('✅ User preferences cleared');
                    break;
                case 'patterns':
                    this.behavioralPatterns.clear();
                    console.log('✅ Behavioral patterns cleared');
                    break;
                case 'all':
                    this.conversationHistory = [];
                    this.userPreferences.clear();
                    this.behavioralPatterns.clear();
                    console.log('✅ All memory cleared');
                    break;
                default:
                    console.log('⚠️ Unknown memory type to clear');
                    return false;
            }
            
            this.saveStoredData();
            return true;
            
        } catch (error) {
            console.error('❌ Error clearing memory:', error);
            return false;
        }
    }

    // Save data to localStorage
    saveStoredData() {
        try {
            const data = {
                conversationHistory: this.conversationHistory,
                userPreferences: Object.fromEntries(
                    Array.from(this.userPreferences.entries()).map(([key, value]) => [
                        key, 
                        Object.fromEntries(value.entries())
                    ])
                ),
                behavioralPatterns: Object.fromEntries(this.behavioralPatterns.entries())
            };
            
            localStorage.setItem('kairoAIMemory', JSON.stringify(data));
            console.log('✅ AI Memory data saved to localStorage');
            
        } catch (error) {
            console.error('❌ Error saving AI Memory data:', error);
        }
    }

    // Load data from localStorage
    loadStoredData() {
        try {
            const storedData = localStorage.getItem('kairoAIMemory');
            if (storedData) {
                const data = JSON.parse(storedData);
                
                if (data.conversationHistory) {
                    this.conversationHistory = data.conversationHistory;
                }
                
                if (data.userPreferences) {
                    this.userPreferences = new Map(
                        Object.entries(data.userPreferences).map(([key, value]) => [
                            key, 
                            new Map(Object.entries(value))
                        ])
                    );
                }
                
                if (data.behavioralPatterns) {
                    this.behavioralPatterns = new Map(Object.entries(data.behavioralPatterns));
                }
                
                console.log('✅ AI Memory data loaded from localStorage');
            }
            
        } catch (error) {
            console.error('❌ Error loading AI Memory data:', error);
        }
    }

    // Setup memory cleanup
    setupMemoryCleanup() {
        // Clean up old entries every hour
        setInterval(() => {
            this.cleanupOldEntries();
        }, 3600000); // 1 hour
        
        console.log('✅ Memory cleanup scheduled');
    }

    // Clean up old entries
    cleanupOldEntries() {
        try {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000; // 24 hours
            
            // Clean up old conversations (older than 7 days)
            this.conversationHistory = this.conversationHistory.filter(entry => {
                const entryTime = new Date(entry.timestamp).getTime();
                return (now - entryTime) < (7 * oneDay);
            });
            
            // Clean up old preferences (older than 30 days)
            for (const [category, prefs] of this.userPreferences.entries()) {
                for (const [key, pref] of prefs.entries()) {
                    if ((now - pref.timestamp) > (30 * oneDay)) {
                        prefs.delete(key);
                    }
                }
                if (prefs.size === 0) {
                    this.userPreferences.delete(category);
                }
            }
            
            // Clean up old patterns (older than 14 days)
            for (const [key, pattern] of this.behavioralPatterns.entries()) {
                if ((now - pattern.timestamp) > (14 * oneDay)) {
                    this.behavioralPatterns.delete(key);
                }
            }
            
            this.saveStoredData();
            console.log('✅ Memory cleanup completed');
            
        } catch (error) {
            console.error('❌ Error during memory cleanup:', error);
        }
    }

    // Check if memory system is enabled
    isMemoryEnabled() {
        return this.isEnabled;
    }

    // Toggle memory system
    toggleMemory() {
        this.isEnabled = !this.isEnabled;
        if (this.isEnabled) {
            console.log('✅ AI Memory System enabled');
        } else {
            console.log('❌ AI Memory System disabled');
        }
        return this.isEnabled;
    }
}

// Create and export instance
const enhancedAIMemory = new EnhancedAIMemory();

// Make it globally available
window.enhancedAIMemory = enhancedAIMemory;

console.log('✅ AI Memory System Module loaded successfully');
