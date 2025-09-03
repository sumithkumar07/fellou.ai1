// ========================================
// KAIRO BROWSER - AI INTELLIGENCE MODULE
// ========================================

console.log('🧠 Loading AI Intelligence Module...');

// Enhanced AI Intelligence Class
class EnhancedAIIntelligence {
    constructor() {
        console.log('🧠 Enhanced AI Intelligence constructor called');
        this.isEnabled = true;
        this.conversationHistory = [];
        this.userPreferences = {};
        this.responseCount = 0;
    }

    async processChatMessage(userInput, context = {}) {
        console.log('🧠 Processing chat message:', userInput);
        
        try {
            // Store in conversation history
            this.conversationHistory.push({
                user: userInput,
                timestamp: Date.now(),
                context: context
            });
            
            // Keep only last 10 messages
            if (this.conversationHistory.length > 10) {
                this.conversationHistory.shift();
            }
            
            // Check for specific commands first
            const commandResult = await this.processCommands(userInput, context);
            if (commandResult) {
                console.log('🎯 Command detected:', commandResult);
                return commandResult;
            }
            
            // Generate intelligent response based on input and history
            const intelligentResponse = await this.generateIntelligentResponse(userInput, context);
            
            // Store AI response in history
            this.conversationHistory.push({
                ai: intelligentResponse.response,
                timestamp: Date.now()
            });
            
            return intelligentResponse;
        } catch (error) {
            console.error('❌ Error in chat message processing:', error);
            return { 
                response: "I encountered an error. Please try again.", 
                enhanced: false 
            };
        }
    }

    async processCommands(userInput, context = {}) {
        const input = userInput.toLowerCase().trim();
        console.log('🔍 Processing commands for input:', input);
        
        // Browser navigation commands
        if (input.includes('open') || input.includes('go to') || input.includes('navigate')) {
            return await this.processNavigationCommand(input, context);
        }
        
        // Search commands
        if (input.includes('search') || input.includes('find')) {
            return await this.processSearchCommand(input, context);
        }
        
        // Help commands
        if (input.includes('help') || input.includes('what can you do')) {
            return await this.processHelpCommand(input, context);
        }
        
        // No command found
        return null;
    }

    async processNavigationCommand(input, context = {}) {
        console.log('🧭 Processing navigation command:', input);
        
        if (input.includes('youtube') || input.includes('youtu.be')) {
            return {
                response: "Opening YouTube for you! 🎥",
                enhanced: true,
                action: 'navigate',
                url: 'https://www.youtube.com',
                command: 'open_youtube'
            };
        }
        
        if (input.includes('google') || input.includes('search')) {
            return {
                response: "Opening Google search for you! 🔍",
                enhanced: true,
                action: 'navigate',
                url: 'https://www.google.com',
                command: 'open_google'
            };
        }
        
        if (input.includes('github') || input.includes('github.com')) {
            return {
                response: "Opening GitHub for you! 💻",
                enhanced: true,
                action: 'navigate',
                url: 'https://github.com',
                command: 'open_github'
            };
        }
        
        // Generic open command
        if (input.startsWith('open ')) {
            const url = input.substring(5).trim();
            if (url) {
                // Validate URL format
                let fullUrl;
                try {
                    if (url.startsWith('http')) {
                        new URL(url); // Validate
                        fullUrl = url;
                    } else {
                        // Try to construct a valid URL
                        fullUrl = `https://${url}`;
                        new URL(fullUrl); // Validate
                    }
                    
                    return {
                        response: `Opening ${url} for you! 🌐`,
                        enhanced: true,
                        action: 'navigate',
                        url: fullUrl,
                        command: 'open_website'
                    };
                } catch (error) {
                    console.error('❌ Invalid URL in AI command:', error);
                    return {
                        response: `I couldn't open "${url}" - it doesn't seem to be a valid website. Try searching for it instead! 🔍`,
                        enhanced: true,
                        action: 'search',
                        query: url,
                        url: `https://www.bing.com/search?q=${encodeURIComponent(url)}`,
                        command: 'search_fallback'
                    };
                }
            }
        }
        
        return null;
    }

    async processSearchCommand(input, context = {}) {
        console.log('🔍 Processing search command:', input);
        
        if (input.startsWith('search ')) {
            const query = input.substring(7).trim();
            if (query) {
                return {
                    response: `Searching for "${query}" on Google! 🔍`,
                    enhanced: true,
                    action: 'search',
                    query: query,
                    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    command: 'search_google'
                };
            }
        }
        
        return null;
    }

    async processHelpCommand(input, context = {}) {
        console.log('❓ Processing help command:', input);
        
        const helpText = `
**🎯 What I can do for you:**

**🌐 Navigation Commands:**
• "open youtube" - Opens YouTube
• "open google" - Opens Google
• "open github" - Opens GitHub
• "open [website]" - Opens any website

**🔍 Search Commands:**
• "search [query]" - Searches Google
• "find [query]" - Searches Google

**💬 General Chat:**
• Ask me questions
• Get information
• Have a conversation

**🚀 Try these commands:**
• "open youtube"
• "search how to code"
• "what can you do?"
        `.trim();
        
        return {
            response: helpText,
            enhanced: true,
            action: 'help',
            command: 'show_help'
        };
    }

    // Generate intelligent response based on user input
    async generateIntelligentResponse(userInput, context = {}) {
        console.log('🧠 Generating intelligent response for:', userInput);
        
        const input = userInput.toLowerCase().trim();
        
        // Greeting responses
        if (this.isGreeting(input)) {
            return {
                response: this.getGreetingResponse(),
                enhanced: true,
                action: 'chat',
                command: 'greeting'
            };
        }
        
        // Question responses
        if (this.isQuestion(input)) {
            return {
                response: await this.getQuestionResponse(input),
                enhanced: true,
                action: 'chat',
                command: 'question'
            };
        }
        
        // Statement responses
        if (this.isStatement(input)) {
            return {
                response: await this.getStatementResponse(input),
                enhanced: true,
                action: 'chat',
                command: 'statement'
            };
        }
        
        // Default intelligent response
        return {
            response: await this.getContextualResponse(input, context),
            enhanced: true,
            action: 'chat',
            command: 'intelligent_response'
        };
    }
    
    // Check if input is a greeting
    isGreeting(input) {
        const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'sup', 'yo'];
        return greetings.some(greeting => input.includes(greeting));
    }
    
    // Get greeting response
    getGreetingResponse() {
        const responses = [
            "Hello! I'm Kairo AI, your intelligent browser companion. How can I help you today? 🌟",
            "Hi there! I'm here to make your browsing experience smarter and more efficient. What would you like to do? 🚀",
            "Greetings! I'm Kairo AI, ready to assist you with navigation, search, and more. How can I help? 💫",
            "Hey! I'm your AI assistant. I can help you browse the web, find information, and much more. What's on your mind? ✨"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Check if input is a question
    isQuestion(input) {
        const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you', 'could you', 'would you', 'do you', 'are you'];
        return questionWords.some(word => input.includes(word)) || input.includes('?');
    }
    
    // Get question response
    async getQuestionResponse(input) {
        if (input.includes('what can you do') || input.includes('help')) {
            return this.getHelpResponse();
        }
        
        if (input.includes('time') || input.includes('date')) {
            return `The current time is ${new Date().toLocaleTimeString()} and today is ${new Date().toLocaleDateString()}. ⏰`;
        }
        
        if (input.includes('weather')) {
            return "I can't check the weather directly, but I can help you navigate to a weather website! Try saying 'open weather.com' or 'search weather' 🌤️";
        }
        
        if (input.includes('name')) {
            return "My name is Kairo AI! I'm your intelligent browser assistant designed to make your web browsing experience smarter and more efficient. 🤖";
        }
        
        return "That's an interesting question! I'm designed to help with web browsing, navigation, and finding information. Could you be more specific about what you'd like to know? 🤔";
    }
    
    // Check if input is a statement
    isStatement(input) {
        return !this.isGreeting(input) && !this.isQuestion(input);
    }
    
    // Get statement response
    async getStatementResponse(input) {
        if (input.includes('thank')) {
            return "You're welcome! I'm here to help make your browsing experience better. Is there anything else I can assist you with? 😊";
        }
        
        if (input.includes('good') || input.includes('great') || input.includes('awesome')) {
            return "I'm glad I could help! I'm constantly learning and improving to provide you with the best browsing experience. 🎉";
        }
        
        if (input.includes('bye') || input.includes('goodbye')) {
            return "Goodbye! Feel free to chat with me anytime. I'm always here to help with your browsing needs! 👋";
        }
        
        return "I understand what you're saying. I'm here to help with web browsing, navigation, and finding information. Is there something specific you'd like me to help you with? 💭";
    }
    
    // Get contextual response
    async getContextualResponse(input, context) {
        // Check if this is a follow-up to previous conversation
        if (this.conversationHistory.length > 2) {
            const lastUserMessage = this.conversationHistory[this.conversationHistory.length - 3]?.user?.toLowerCase();
            const lastAIResponse = this.conversationHistory[this.conversationHistory.length - 2]?.ai;
            
            if (lastUserMessage && lastAIResponse) {
                // Provide more contextual responses based on conversation history
                if (lastUserMessage.includes('time') && input.includes('date')) {
                    return "You asked about time earlier, and now you're asking about the date! The current date is " + new Date().toLocaleDateString() + ". 📅";
                }
                
                if (lastUserMessage.includes('weather') && input.includes('temperature')) {
                    return "I see you're interested in weather information! I can help you navigate to weather websites. Try saying 'open weather.com' or 'search weather forecast' 🌤️";
                }
                
                if (lastUserMessage.includes('search') && input.includes('find')) {
                    return "I notice you're doing a lot of searching! I can help you find information more efficiently. What are you looking for? 🔍";
                }
            }
        }
        
        // Check for repeated messages
        const recentMessages = this.conversationHistory.filter(msg => msg.user).slice(-3);
        const isRepeated = recentMessages.some(msg => msg.user.toLowerCase() === input);
        
        if (isRepeated) {
            return "I see you've mentioned that before! Is there something specific you'd like me to help you with? I'm here to assist with browsing, navigation, and finding information. 🤔";
        }
        
        const responses = [
            "I understand what you're saying. I can help you navigate the web, search for information, or assist with various tasks. What would you like to do? 🌐",
            "That's interesting! I'm here to make your browsing experience smarter. I can help with navigation, search, and much more. How can I assist you? 🚀",
            "I hear you! I'm your AI assistant designed to help with web browsing and information finding. What would you like to explore? 💫",
            "Got it! I'm here to help with your browsing needs. I can navigate to websites, search for information, and provide assistance. What can I help you with? ✨",
            "I'm listening! As your AI browser assistant, I can help with web navigation, searches, and various tasks. What would you like to accomplish? 🎯",
            "That's noted! I'm designed to make your browsing experience more intelligent and efficient. How can I help you today? 💡"
        ];
        
        // Rotate through responses to avoid repetition
        this.responseCount++;
        return responses[this.responseCount % responses.length];
    }
    
    // Get help response
    getHelpResponse() {
        return `**🎯 What I can do for you:**

**🌐 Navigation Commands:**
• "open youtube" - Opens YouTube
• "open google" - Opens Google
• "open github" - Opens GitHub
• "open [website]" - Opens any website

**🔍 Search Commands:**
• "search [query]" - Searches Google
• "find [query]" - Searches Google

**💬 General Chat:**
• Ask me questions
• Get information
• Have a conversation

**🚀 Try these commands:**
• "open youtube"
• "search how to code"
• "what time is it?"
• "what can you do?"`;
    }
    
    // Initialize AI system
    initializeIntelligence() {
        console.log('🧠 Initializing Enhanced AI Intelligence...');
        this.isEnabled = true;
        console.log('✅ Enhanced AI Intelligence initialized');
    }
}

// Create and export instance
const enhancedAIIntelligence = new EnhancedAIIntelligence();

// Make it globally available
window.enhancedAIIntelligence = enhancedAIIntelligence;

console.log('✅ AI Intelligence Module loaded successfully');
