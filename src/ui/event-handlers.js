// ========================================
// KAIRO BROWSER - UI EVENT HANDLERS MODULE
// ========================================

console.log('🔧 Loading UI Event Handlers Module...');

// Using global navigate function from browser.js

// UI Elements
let goBtn, urlInput, backBtn, forwardBtn, reloadBtn, homeBtn;
let startInput, startGo;
let chatText, chatSend, chatToggle;
let themeSwitch, settingsBtn;

// Initialize UI elements
function initializeUIElements() {
    console.log('🔧 Initializing UI elements...');
    
    // Navigation elements
    goBtn = document.getElementById('go');
    urlInput = document.getElementById('url');
    backBtn = document.getElementById('back');
    forwardBtn = document.getElementById('forward');
    reloadBtn = document.getElementById('reload');
    homeBtn = document.getElementById('home');
    
    // Start page elements
    startInput = document.getElementById('start-q');
    startGo = document.getElementById('start-go');
    
    // Chat elements
    chatText = document.getElementById('chat-text');
    chatSend = document.getElementById('chat-send');
    
    // Settings and theme
    themeSwitch = document.getElementById('theme-switch');
    
    // Quick access buttons
    const quickAccessBtns = document.querySelectorAll('.start-link, .quick-access-btn');
    
    console.log(`✅ UI elements initialized: ${Object.keys({
        goBtn, urlInput, backBtn, forwardBtn, reloadBtn, homeBtn,
        startInput, startGo, chatText, chatSend, themeSwitch
    }).filter(key => this[key]).length} elements found`);
}

// Setup navigation event listeners
function setupNavigationListeners() {
    console.log('🔧 Setting up navigation event listeners...');
    
            // Go button
        if (goBtn) {
            goBtn.addEventListener('click', () => {
                const value = urlInput ? urlInput.value : '';
                if (value && value.trim()) {
                    if (window.navigate) {
                        window.navigate(value);
                    }
                }
            });
            console.log('✅ Go button event listener added');
        }
    
            // URL input Enter key
        if (urlInput) {
            urlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = urlInput.value;
                    if (value && value.trim()) {
                        if (window.navigate) {
                            window.navigate(value);
                        }
                    }
                }
            });
            console.log('✅ URL input event listener added');
        }
    
    // Navigation buttons
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const view = document.getElementById('view');
            if (view && view.canGoBack()) {
                view.goBack();
            }
        });
        console.log('✅ Back button event listener added');
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            const view = document.getElementById('view');
            if (view && view.canGoForward()) {
                view.goForward();
            }
        });
        console.log('✅ Forward button event listener added');
    }
    
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            const view = document.getElementById('view');
            if (view) {
                view.reload();
            }
        });
        console.log('✅ Reload button event listener added');
    }
    
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            const startEl = document.getElementById('start');
            if (startEl) {
                startEl.hidden = false;
                startEl.style.display = 'flex';
            }
        });
        console.log('✅ Home button event listener added');
    }
    
    console.log('✅ Navigation event listeners setup completed');
}

// Setup start page event listeners
function setupStartPageListeners() {
    console.log('🔧 Setting up start page event listeners...');
    
    if (startInput && startGo) {
        const goStart = () => {
            const q = (startInput.value || '').trim();
            if (!q) return;
            
            if (urlInput) {
                urlInput.value = q;
            }
            if (window.navigate) {
                window.navigate(q);
            }
        };
        
        startGo.addEventListener('click', goStart);
        startInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                goStart();
            }
        });
        console.log('✅ Start page search functionality added');
    }
}

// Setup quick access buttons
function setupQuickAccessButtons() {
    console.log('🔧 Setting up quick access buttons...');
    
    // Quick access buttons
    document.querySelectorAll('.start-link, .quick-access-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const href = btn.getAttribute('data-href') || '';
            if (!href) return;
            
            if (urlInput) {
                urlInput.value = href;
            }
            if (window.navigate) {
                window.navigate(href);
            }
        });
    });
    
    console.log('✅ Quick access buttons setup completed');
}

// Setup search box functionality
function setupSearchBox() {
    console.log('🔧 Setting up search box...');
    
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchBox.value.trim();
                if (query) {
                    if (urlInput) {
                        urlInput.value = query;
                    }
                    if (window.navigate) {
                        window.navigate(query);
                    }
                    searchBox.value = '';
                }
            }
        });
        console.log('✅ Search box event listener added');
    }
}

// Setup tab event listeners
function setupTabListeners() {
    console.log('🔧 Setting up tab event listeners...');
    
    const newTabEl = document.getElementById('tab-new');
    if (newTabEl) {
        newTabEl.addEventListener('click', () => {
            try {
                if (window.addTab) {
                    window.addTab('New Tab');
                }
            } catch (error) {
                console.error('❌ Error adding new tab:', error);
            }
        });
        console.log('✅ New tab button event listener added');
    }
}

// Setup chat event listeners
function setupChatListeners() {
    console.log('🔧 Setting up chat event listeners...');
    
    if (chatText && chatSend) {
        // Send button click
        chatSend.addEventListener('click', () => {
            const message = chatText.value.trim();
            if (message) {
                sendChatMessage(message);
            }
        });
        
        // Enter key in chat input
        chatText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = chatText.value.trim();
                if (message) {
                    sendChatMessage(message);
                }
            }
        });
        
        console.log('✅ Chat event listeners added');
    }
    
    // Setup chat toggle
    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            const chatContainer = document.querySelector('.ai-assistant');
            if (chatContainer) {
                chatContainer.classList.toggle('collapsed');
                console.log('✅ Chat panel toggled');
            }
        });
        console.log('✅ Chat toggle event listener added');
    }
}

// Send chat message function
function sendChatMessage(message) {
    try {
        // Clear input
        if (chatText) {
            chatText.value = '';
        }
        
        // Add user message to chat
        addChatMessage('user', message);
        
        // Process with AI if available
        if (window.enhancedAIIntelligence) {
            const response = window.enhancedAIIntelligence.processChatMessage(message);
            if (response) {
                addChatMessage('ai', response);
            }
        } else {
            // Fallback response
            addChatMessage('ai', 'I received your message: ' + message + '. The AI system is initializing...');
        }
        
    } catch (error) {
        console.error('❌ Error sending chat message:', error);
        addChatMessage('ai', 'Sorry, there was an error processing your message.');
    }
}

// Add chat message to UI
function addChatMessage(sender, message) {
    try {
        const chatPanel = document.getElementById('chat-panel');
        if (!chatPanel) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-text">${message}</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        
        chatPanel.appendChild(messageDiv);
        chatPanel.scrollTop = chatPanel.scrollHeight;
        
    } catch (error) {
        console.error('❌ Error adding chat message:', error);
    }
}

// Setup theme toggle
function setupThemeToggle() {
    console.log('🔧 Setting up theme toggle...');
    
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            const isDark = themeSwitch.checked;
            document.body.classList.toggle('dark-theme', isDark);
            
            // Save theme preference
            localStorage.setItem('kairo-theme', isDark ? 'dark' : 'light');
            
            console.log(`✅ Theme changed to: ${isDark ? 'dark' : 'light'}`);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('kairo-theme');
        if (savedTheme) {
            themeSwitch.checked = savedTheme === 'dark';
            document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        }
        
        console.log('✅ Theme toggle setup completed');
    }
    
    // Setup theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            document.body.classList.toggle('dark-theme', !isDark);
            
            // Save theme preference
            localStorage.setItem('kairo-theme', !isDark ? 'dark' : 'light');
            
            console.log(`✅ Theme changed to: ${!isDark ? 'dark' : 'light'}`);
        });
        console.log('✅ Theme toggle button event listener added');
    }
}

    // Setup settings functionality
    function setupSettings() {
        console.log('🔧 Setting up settings...');
        
        const settingsBtn = document.getElementById('settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                const settingsPanel = document.getElementById('settings-panel');
                if (settingsPanel) {
                    settingsPanel.hidden = !settingsPanel.hidden;
                    console.log('✅ Settings panel toggled');
                }
            });
            console.log('✅ Settings button event listener added');
        }
        
        // Setup menu actions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                console.log(`🔧 Menu action: ${action}`);
                
                switch (action) {
                    case 'fullscreen':
                        if (window.toggleFullScreen) {
                            const isFullScreen = window.toggleFullScreen();
                            console.log(`🖥️ Full-screen mode: ${isFullScreen ? 'enabled' : 'disabled'}`);
                        }
                        break;
                    default:
                        console.log(`📝 Menu action ${action} not implemented yet`);
                }
            });
        });
        
        console.log('✅ Menu actions setup completed');
    }

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    console.log('🔧 Setting up keyboard shortcuts...');
    
    document.addEventListener('keydown', async (e) => {
        // Ctrl+T: New tab
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            try {
                if (window.addTab) {
                    window.addTab('New Tab');
                }
            } catch (error) {
                console.error('❌ Error adding new tab:', error);
            }
        }
        
        // Ctrl+W: Close current tab
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            // Tab closing logic will be implemented
            console.log('📝 Tab close functionality coming soon...');
        }
        
        // Ctrl+Tab: Next tab
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            // Tab switching logic will be implemented
            console.log('📝 Tab switching functionality coming soon...');
        }
        
        // Ctrl+L: Focus address bar
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            if (urlInput) {
                urlInput.focus();
                urlInput.select();
            }
        }
        
        // F11: Toggle full-screen mode
        if (e.key === 'F11') {
            e.preventDefault();
            if (window.toggleFullScreen) {
                const isFullScreen = window.toggleFullScreen();
                console.log(`🖥️ Full-screen mode: ${isFullScreen ? 'enabled' : 'disabled'}`);
            }
        }
    });
    
    console.log('✅ Keyboard shortcuts setup completed');
}

// Setup content controls
function setupContentControls() {
    console.log('🔧 Setting up content controls...');
    
    // Content control buttons
    const ccBack = document.getElementById('cc-back');
    const ccForward = document.getElementById('cc-forward');
    const ccReload = document.getElementById('cc-reload');
    const ccHome = document.getElementById('cc-home');
    
    if (ccBack) {
        ccBack.addEventListener('click', () => {
            const view = document.getElementById('view');
            if (view && view.canGoBack()) {
                view.goBack();
            }
        });
        console.log('✅ Content back button event listener added');
    }
    
    if (ccForward) {
        ccForward.addEventListener('click', () => {
            const view = document.getElementById('view');
            if (view && view.canGoForward()) {
                view.goForward();
            }
        });
        console.log('✅ Content forward button event listener added');
    }
    
    if (ccReload) {
        ccReload.addEventListener('click', () => {
            const view = document.getElementById('view');
            if (view) {
                view.reload();
            }
        });
        console.log('✅ Content reload button event listener added');
    }
    
    if (ccHome) {
        ccHome.addEventListener('click', () => {
            const startEl = document.getElementById('start');
            if (startEl) {
                startEl.hidden = false;
                startEl.style.display = 'flex';
            }
        });
        console.log('✅ Content home button event listener added');
    }
    
    console.log('✅ Content controls setup completed');
}

// Setup all UI event listeners
function setupAllEventListeners() {
    console.log('🔧 Setting up all UI event listeners...');
    
    initializeUIElements();
    setupNavigationListeners();
    setupStartPageListeners();
    setupQuickAccessButtons();
    setupSearchBox();
    setupTabListeners();
    setupChatListeners();
    setupThemeToggle();
    setupSettings();
    setupKeyboardShortcuts();
    setupContentControls();
    
    console.log('✅ All UI event listeners setup completed');
}

// Make functions globally available
window.initializeUIElements = initializeUIElements;
window.setupNavigationListeners = setupNavigationListeners;
window.setupStartPageListeners = setupStartPageListeners;
window.setupQuickAccessButtons = setupQuickAccessButtons;
window.setupSearchBox = setupSearchBox;
window.setupTabListeners = setupTabListeners;
window.setupChatListeners = setupChatListeners;
window.setupThemeToggle = setupThemeToggle;
window.setupSettings = setupSettings;
window.setupKeyboardShortcuts = setupKeyboardShortcuts;
window.setupContentControls = setupContentControls;
window.setupAllEventListeners = setupAllEventListeners;

console.log('✅ UI Event Handlers Module loaded successfully');
