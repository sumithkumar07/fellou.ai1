// ========================================
// KAIRO BROWSER - AI CHAT SYSTEM MODULE
// ========================================

console.log('💬 Loading AI Chat System Module...');

// Chat elements
let chatTextEl, chatSendEl, chatStopEl;

// Initialize chat elements
function initializeChatElements() {
    console.log('🔧 Initializing chat elements...');
    
    chatTextEl = document.getElementById('chat-text');
    chatSendEl = document.getElementById('chat-send');
    chatStopEl = document.getElementById('chat-stop');
    
    console.log('✅ Chat elements initialized');
}

// Show Enhanced AI response with memory and context
function showEnhancedAIResponse(userMessage, aiResponse, isEnhanced = false, aiData = null) {
    const chatContent = document.querySelector('.chat-content');
    
    if (!chatContent) {
        console.error('❌ Chat content element not found');
        return;
    }
    
    // Create user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = `
        <div class="message-content">
            <div class="message-text">${userMessage}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    // Create enhanced AI response
    const aiMsg = document.createElement('div');
    aiMsg.className = `chat-message ai-message ${isEnhanced ? 'enhanced' : ''}`;
    
    const enhancedBadge = isEnhanced ? '<span class="enhanced-badge">🤖 AI Enhanced</span>' : '';
    
    aiMsg.innerHTML = `
        <div class="message-content">
            <div class="message-text">
                ${enhancedBadge}
                ${aiResponse}
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    // Add messages to chat
    chatContent.appendChild(userMsg);
    chatContent.appendChild(aiMsg);
    
    // Scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
    
    // Handle AI commands if available
    if (aiData && aiData.action) {
        handleAICommand(aiData);
    }
    
    // Store in Enhanced AI Memory if available
    if (window.enhancedAIMemory) {
        const context = {
            pageUrl: window.location.href,
            pageTitle: document.title,
            userAction: 'chat_message',
            enhanced: isEnhanced
        };
        window.enhancedAIMemory.addConversationEntry(userMessage, aiResponse, context);
    }
}

// Handle AI commands and execute actions
function handleAICommand(aiData) {
    console.log('🚀 Handling AI command:', aiData);
    
    try {
        switch (aiData.action) {
            case 'navigate':
                if (aiData.url) {
                    console.log('🧭 Navigating to:', aiData.url);
                    // Use the existing navigate function
                    const urlInput = document.getElementById('url');
                    if (urlInput) urlInput.value = aiData.url;
                    if (window.navigate) {
                        window.navigate(aiData.url);
                    }
                }
                break;
                
            case 'search':
                if (aiData.url) {
                    console.log('🔍 Executing search:', aiData.query);
                    const urlInput = document.getElementById('url');
                    if (urlInput) urlInput.value = aiData.url;
                    if (window.navigate) {
                        window.navigate(aiData.url);
                    }
                }
                break;
                
            case 'help':
                console.log('❓ Showing help information');
                break;
                
            default:
                console.log('⚠️ Unknown AI action:', aiData.action);
        }
    } catch (error) {
        console.error('❌ Error executing AI command:', error);
    }
}

// Show AI response (fallback)
function showAIResponse(userMessage) {
    showEnhancedAIResponse(userMessage, "Hello! I'm Kairo AI, your intelligent browser companion. How can I help you today?", false);
}

// Enhanced chat functionality with AI Intelligence
async function sendChat() {
    console.log('🚀 sendChat function called');
    
    // Get fresh references to chat elements
    const chatTextEl = document.getElementById('chat-text');
    const chatSendEl = document.getElementById('chat-send');
    
    console.log('🔍 sendChat - Chat elements found:', {
        chatText: !!chatTextEl,
        chatSend: !!chatSendEl
    });
    
    if (!chatTextEl) {
        console.error('❌ Chat text element not found in sendChat');
        return;
    }
    
    const message = chatTextEl.value.trim();
    console.log('📝 Message to send:', message);
    
    if (!message) {
        console.log('⚠️ Empty message, not sending');
        return;
    }
    
    console.log('🚀 Enhanced AI Chat: Processing message:', message);
    
    // Clear input
    chatTextEl.value = '';
    chatTextEl.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Use Enhanced AI Intelligence to process the message
        if (window.enhancedAIIntelligence && window.enhancedAIIntelligence.processChatMessage) {
            console.log('🧠 Using Enhanced AI Intelligence...');
            
            const context = {
                pageUrl: window.location.href,
                pageTitle: document.title,
                timestamp: Date.now(),
                userAction: 'chat_message'
            };
            
            const result = await window.enhancedAIIntelligence.processChatMessage(message, context);
            
            hideTypingIndicator();
            
            if (result && result.response) {
                showEnhancedAIResponse(message, result.response, result.enhanced, result);
            } else {
                showEnhancedAIResponse(message, "I'm sorry, I couldn't process that request. Please try again.", false);
            }
        } else {
            // Fallback to basic response if enhanced system not available
            console.log('⚠️ Enhanced AI not available, using fallback');
            setTimeout(() => {
                hideTypingIndicator();
                showAIResponse(message);
            }, 1500);
        }
    } catch (error) {
        console.error('❌ Error in enhanced chat:', error);
        hideTypingIndicator();
        showEnhancedAIResponse(message, "I encountered an error processing your request. Please try again.", false);
    }
}

// Setup chat event listeners
function setupChatEventListeners() {
    console.log('🔧 Setting up chat event listeners...');
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        // Get fresh references to elements
        const chatTextEl = document.getElementById('chat-text');
        const chatSendEl = document.getElementById('chat-send');
        const chatStopEl = document.getElementById('chat-stop');
        
        console.log('🔍 Chat elements found:', {
            chatText: !!chatTextEl,
            chatSend: !!chatSendEl,
            chatStop: !!chatStopEl
        });
        
        // Remove any existing event listeners
        if (chatSendEl) {
            const newSendEl = chatSendEl.cloneNode(true);
            chatSendEl.parentNode.replaceChild(newSendEl, chatSendEl);
            
            newSendEl.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Chat send button clicked');
                sendChat();
            });
            console.log('✅ Chat send button event listener added');
        } else {
            console.error('❌ Chat send button not found');
        }
        
        if (chatTextEl) {
            const newTextEl = chatTextEl.cloneNode(true);
            chatTextEl.parentNode.replaceChild(newTextEl, chatTextEl);
            
            newTextEl.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Enter key pressed in chat input');
                    sendChat();
                    return false;
                }
            });
            console.log('✅ Chat text input event listener added');
        } else {
            console.error('❌ Chat text input not found');
        }
        
        if (chatStopEl) {
            chatStopEl.addEventListener('click', () => {
                console.log('🛑 Chat stopped by user');
                // Implement stop functionality if needed
            });
            console.log('✅ Chat stop button event listener added');
        }
        
        console.log('✅ Chat event listeners setup completed');
    }, 100);
}

// Initialize chat system
function initializeChat() {
    console.log('🚀 Initializing Chat System...');
    
    initializeChatElements();
    setupChatEventListeners();
    
    console.log('✅ Chat System initialized successfully');
}

// Add missing functions
function showTypingIndicator() {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message ai-message typing-indicator';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="message-content">
                <div class="message-text">
                    <span class="typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </span>
                </div>
            </div>
        `;
        chatContent.appendChild(typingEl);
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}

function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
        typingEl.remove();
    }
}

function showAIResponse(message) {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user-message';
        userMsg.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai-message';
        aiMsg.innerHTML = `
            <div class="message-content">
                <div class="message-text">
                    I understand you said: "${message}". How can I help you with that?
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        chatContent.appendChild(userMsg);
        chatContent.appendChild(aiMsg);
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}

// Make functions globally available
window.initializeChat = initializeChat;
window.sendChat = sendChat;
window.showEnhancedAIResponse = showEnhancedAIResponse;
window.handleAICommand = handleAICommand;

// Setup event listeners immediately when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 DOM Content Loaded - Setting up chat event listeners...');
    setupChatEventListeners();
});

// Also try to setup after a delay as backup
setTimeout(function() {
    console.log('🔧 Backup setup - Setting up chat event listeners...');
    setupChatEventListeners();
}, 500);

console.log('✅ AI Chat System Module loaded successfully');
