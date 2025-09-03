const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kairo', {
  version: '0.1.0',
  cdp: {
    navigate: async (url) => ipcRenderer.invoke('cdp:navigate', url),
    health: async () => ipcRenderer.invoke('cdp:health'),
    screenshot: async () => ipcRenderer.invoke('cdp:screenshot'),
    click: async (nx, ny) => ipcRenderer.invoke('cdp:click', nx, ny),
    type: async (text) => ipcRenderer.invoke('cdp:type', text),
    scroll: async (deltaY) => ipcRenderer.invoke('cdp:scroll', deltaY),
    extract: async () => ipcRenderer.invoke('cdp:extract'),
    extractReadable: async () => ipcRenderer.invoke('cdp:extract'),
    extractForms: async () => ipcRenderer.invoke('cdp:extractForms'),
    extractTables: async () => ipcRenderer.invoke('cdp:extractTables'),
    waitForElement: async (selector, timeoutMs) => ipcRenderer.invoke('cdp:waitForElement', selector, timeoutMs),
    // Smart element selection methods
    findElement: async (description) => ipcRenderer.invoke('cdp:findElement', description),
    smartClick: async (description) => ipcRenderer.invoke('cdp:smartClick', description),
    smartType: async (description, text) => ipcRenderer.invoke('cdp:smartType', description, text),
  },
  ai: {
    chat: async (messages) => ipcRenderer.invoke('ai:chat', messages)
  },
  workflow: {
    create: async (description, userId) => ipcRenderer.invoke('workflow:create', description, userId),
    execute: async (workflowId, context) => ipcRenderer.invoke('workflow:execute', workflowId, context),
    status: async (workflowId) => ipcRenderer.invoke('workflow:status', workflowId),
    pause: async (workflowId) => ipcRenderer.invoke('workflow:pause', workflowId),
    resume: async (workflowId) => ipcRenderer.invoke('workflow:resume', workflowId),
    preferences: async (userId, key, value) => ipcRenderer.invoke('workflow:preferences', userId, key, value),
    history: async (limit) => ipcRenderer.invoke('workflow:history', limit),
    exportData: async (data, options) => ipcRenderer.invoke('workflow:exportData', data, options),
    // Phase 2: Advanced form automation
    autoFillForm: async (formData, options) => ipcRenderer.invoke('workflow:autoFillForm', formData, options),
    saveUserData: async (data) => ipcRenderer.invoke('workflow:saveUserData', data),
    getUserData: async () => ipcRenderer.invoke('workflow:getUserData'),
                     // Phase 2: Real-time monitoring
                 startMonitoring: async (workflowId) => ipcRenderer.invoke('workflow:startMonitoring', workflowId),
                 stopMonitoring: async (workflowId) => ipcRenderer.invoke('workflow:stopMonitoring', workflowId),
                 getProgress: async (workflowId) => ipcRenderer.invoke('workflow:getProgress', workflowId),
                 getMetrics: async (workflowId) => ipcRenderer.invoke('workflow:getMetrics', workflowId),
                 // Phase 3: Site-specific heuristics and analysis
                 analyzePageType: async (url, content) => ipcRenderer.invoke('workflow:analyzePageType', url, content),
                 analyzeData: async (data, analysisType) => ipcRenderer.invoke('workflow:analyzeData', data, analysisType),
                 detectLanguage: async (text) => ipcRenderer.invoke('workflow:detectLanguage', text),
                 getPerformanceMetrics: async () => ipcRenderer.invoke('workflow:getPerformanceMetrics')
  }
});


