const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const http = require('http');
require('dotenv').config();
const WebSocket = require('ws');
const fetch = require('node-fetch');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      enableRemoteModule: false,
    },
    title: 'Kairo',
  });

  win.loadFile('index.html');
  
  // Handle webview permission requests
  win.webContents.on('permission-request', (event, webContents, permission, callback) => {
    console.log('Permission requested:', permission);
    callback(true); // Allow all permissions
  });
  
  // Handle webview new window requests
  win.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    console.log('New window requested:', navigationUrl);
  });
  
  // Handle webview navigation
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('Navigation requested:', navigationUrl);
  });
  
  // Handle webview load errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Webview load failed:', errorCode, errorDescription, validatedURL);
  });
  
  // Handle webview console messages (using old format with enhanced filtering)
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (message && message !== 'undefined' && !message.includes('require is not defined')) {
      console.log(`Webview console [${level}]: ${message}`);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// --- Minimal CDP Controller (Chrome/Edge via --remote-debugging-port=9222) ---
class CdpController {
  constructor() {
    this.browserWs = null;
    this.pageWs = null;
    this.msgId = 0;
    this.pending = new Map();
    this.connected = false;
  }

  async #httpJson(pathname) {
    const url = `http://127.0.0.1:9222${pathname}`;
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', (c) => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
    });
  }

  async #connectWebSocket(wsUrl) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.once('open', () => resolve(ws));
      ws.once('error', reject);
    });
  }

  async ensureConnected() {
    if (this.connected && this.pageWs && this.pageWs.readyState === WebSocket.OPEN) return true;
    try {
      // Create a fresh target page if possible
      let target = null;
      try {
        target = await this.#httpJson('/json/new?about:blank');
      } catch (error) {
        console.log('CDP: Could not create new target, trying existing:', error.message);
        try {
          const list = await this.#httpJson('/json/list');
          target = list.find((t) => t.type === 'page') || list[0];
        } catch (listError) {
          console.log('CDP: Could not get target list:', listError.message);
          throw new Error('No CDP targets available - browser may not be running');
        }
      }
      
      if (!target || !target.webSocketDebuggerUrl) {
        throw new Error('No valid CDP target available');
      }

      this.pageWs = await this.#connectWebSocket(target.webSocketDebuggerUrl);
      
      // Enhanced error handling for WebSocket
      this.pageWs.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) {
              console.log('CDP Error:', msg.error);
              reject(new Error(msg.error.message || 'CDP protocol error'));
            } else {
              resolve(msg.result);
            }
          }
        } catch (parseError) { 
          console.log('CDP: Failed to parse message:', parseError.message);
        }
      });
      
      this.pageWs.on('close', () => { 
        console.log('CDP: WebSocket connection closed');
        this.connected = false; 
      });
      
      this.pageWs.on('error', (error) => {
        console.log('CDP: WebSocket error:', error.message);
        this.connected = false;
      });
      
      this.connected = true;
      
      // Enable basic domains with error handling
      try {
        await this.send('Page.enable');
        await this.send('Runtime.enable');
        console.log('CDP: Successfully connected and enabled domains');
      } catch (domainError) {
        console.log('CDP: Failed to enable domains:', domainError.message);
        // Don't fail connection for domain enable errors
      }
      
      return true;
    } catch (err) {
      console.log('CDP Connection Error:', err.message);
      this.connected = false;
      return false;
    }
  }

  send(method, params = {}) {
    if (!this.pageWs || this.pageWs.readyState !== WebSocket.OPEN) return Promise.reject(new Error('CDP not connected'));
    const id = ++this.msgId;
    const payload = { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.pageWs.send(JSON.stringify(payload));
    });
  }

  async navigate(url) {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('Could not connect to Chrome. Start Chrome with --remote-debugging-port=9222');
    await this.send('Page.navigate', { url });
    return { ok: true };
  }

  async getVersion() {
    try {
      const data = await this.#httpJson('/json/version');
      return data;
    } catch (e) {
      throw e;
    }
  }

  async screenshot() {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    const result = await this.send('Page.captureScreenshot', { format: 'png' });
    return result && result.data;
  }

  async clickAt(normX, normY) {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    // Get layout metrics to compute absolute coords
    const metrics = await this.send('Page.getLayoutMetrics');
    const { clientWidth, clientHeight } = metrics.contentSize || { clientWidth: 1200, clientHeight: 800 };
    const x = Math.max(0, Math.min(clientWidth - 1, Math.round(normX * clientWidth)));
    const y = Math.max(0, Math.min(clientHeight - 1, Math.round(normY * clientHeight)));
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    return { ok: true };
  }

  async typeText(text) {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    // Send key events as raw text
    await this.send('Input.insertText', { text: String(text) });
    return { ok: true };
  }

  async click(x, y) {
    try {
      // Get viewport dimensions
      const viewport = await this.send('Page.getLayoutMetrics');
      const width = viewport.layoutViewport.clientWidth;
      const height = viewport.layoutViewport.clientHeight;
      
      // Convert normalized coordinates (0-1) to actual pixels
      const pixelX = Math.round(x * width);
      const pixelY = Math.round(y * height);
      
      // Perform mouse click
      await this.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: pixelX,
        y: pixelY,
        button: 'left',
        clickCount: 1
      });
      
      await this.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: pixelX,
        y: pixelY,
        button: 'left',
        clickCount: 1
      });
      
      return { success: true, message: `Clicked at (${pixelX}, ${pixelY})` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async type(text) {
    try {
      const result = await this.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        text: text
      });
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async scroll(deltaY) {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    // Wheel event at center of viewport
    const metrics = await this.send('Page.getLayoutMetrics');
    const { clientWidth, clientHeight } = metrics.contentSize || { clientWidth: 1200, clientHeight: 800 };
    const x = Math.floor(clientWidth / 2);
    const y = Math.floor(clientHeight / 2);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaY: Number(deltaY) || 0 });
    return { ok: true };
  }

  async extractForms() {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    const script = `(() => {
      try {
        const forms = Array.from(document.querySelectorAll('form')).map(form => {
          const inputs = Array.from(form.querySelectorAll('input, select, textarea, button')).map(input => ({
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || input.id || '',
            placeholder: input.placeholder || '',
            value: input.value || '',
            required: input.required || false,
            disabled: input.disabled || false
          }));
          return {
            action: form.action || '',
            method: form.method || 'get',
            inputs: inputs
          };
        });
        return forms;
      } catch (e) {
        return [];
      }
    })();`;
    try {
      const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
      const data = result && result.result && result.result.value || [];
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  async extractTables() {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    const script = `(() => {
      try {
        const tables = Array.from(document.querySelectorAll('table')).map(table => {
          const rows = Array.from(table.querySelectorAll('tr')).map(row => 
            Array.from(row.querySelectorAll('th, td')).map(cell => cell.innerText.trim())
          );
          return {
            headers: rows[0] || [],
            data: rows.slice(1) || [],
            caption: table.querySelector('caption')?.innerText || ''
          };
        });
        return tables;
      } catch (e) {
        return [];
      }
    })();`;
    try {
      const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
      const data = result && result.result && result.result.value || [];
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  async waitForElement(selector, timeoutMs = 5000) {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    const script = `(() => {
      return new Promise((resolve) => {
        const el = document.querySelector('${selector}');
        if (el) return resolve(true);
        const observer = new MutationObserver(() => {
          const el = document.querySelector('${selector}');
          if (el) { observer.disconnect(); resolve(true); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); resolve(false); }, ${timeoutMs});
      });
    })();`;
    const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
    return result && result.result && result.result.value || false;
  }

  // Smart element selection by description
  async findElementByDescription(description, timeoutMs = 10000) {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    
    const script = `(() => {
      return new Promise((resolve) => {
        const findElement = () => {
          const desc = '${description.toLowerCase()}';
          
          // Try multiple strategies to find the element
          let element = null;
          
          // Strategy 1: Look for text content
          const textElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent?.toLowerCase() || '';
            return text.includes(desc) && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT');
          });
          
          if (textElements.length > 0) {
            element = textElements[0];
          }
          
          // Strategy 2: Look for placeholder text
          if (!element) {
            const placeholderElements = document.querySelectorAll('input[placeholder*="' + desc + '"], textarea[placeholder*="' + desc + '"]');
            if (placeholderElements.length > 0) {
              element = placeholderElements[0];
            }
          }
          
          // Strategy 3: Look for aria-label
          if (!element) {
            const ariaElements = document.querySelectorAll('[aria-label*="' + desc + '"]');
            if (ariaElements.length > 0) {
              element = ariaElements[0];
            }
          }
          
          // Strategy 4: Look for title attribute
          if (!element) {
            const titleElements = document.querySelectorAll('[title*="' + desc + '"]');
            if (titleElements.length > 0) {
              element = titleElements[0];
            }
          }
          
          // Strategy 5: Look for common selectors
          if (!element) {
            const commonSelectors = [
              'button:contains("' + desc + '")',
              'a:contains("' + desc + '")',
              'input[type="submit"]',
              'input[type="button"]',
              '.btn:contains("' + desc + '")',
              '.button:contains("' + desc + '")'
            ];
            
            for (const selector of commonSelectors) {
              try {
                const el = document.querySelector(selector);
                if (el) {
                  element = el;
                  break;
                }
              } catch (e) {}
            }
          }
          
          if (element) {
            resolve({
              found: true,
              element: {
                tagName: element.tagName,
                textContent: element.textContent?.trim() || '',
                placeholder: element.placeholder || '',
                type: element.type || '',
                className: element.className || '',
                id: element.id || ''
              }
            });
            return;
          }
          
          // If not found, wait a bit and try again
          setTimeout(findElement, 100);
        };
        
        findElement();
        
        // Timeout after specified time
        setTimeout(() => {
          resolve({ found: false, error: 'Element not found within timeout' });
        }, ${timeoutMs});
      });
    })();`;
    
    try {
      const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
      return result && result.result && result.result.value || { found: false, error: 'Failed to execute script' };
    } catch (error) {
      return { found: false, error: error.message };
    }
  }

  // Smart click by element description
  async smartClick(description) {
    try {
      // First find the element
      const elementInfo = await this.findElementByDescription(description);
      
      if (!elementInfo.found) {
        return { success: false, error: `Element not found: ${description}` };
      }
      
      // Now click the element using its selector
      const script = `(() => {
        const desc = '${description.toLowerCase()}';
        let element = null;
        
        // Find the element using the same logic
        const textElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes(desc) && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT');
        });
        
        if (textElements.length > 0) {
          element = textElements[0];
        }
        
        if (element) {
          element.click();
          return { success: true, message: 'Element clicked successfully' };
        } else {
          return { success: false, error: 'Element not found for clicking' };
        }
      })();`;
      
      const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
      
      if (result && result.result && result.result.value) {
        return result.result.value;
      } else {
        return { success: false, error: 'Failed to click element' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Smart type by element description
  async smartType(description, text) {
    try {
      // First find the input element
      const elementInfo = await this.findElementByDescription(description);
      
      if (!elementInfo.found) {
        return { success: false, error: `Input element not found: ${description}` };
      }
      
      // Now type into the element
      const script = `(() => {
        const desc = '${description.toLowerCase()}';
        const textToType = '${text}';
        let element = null;
        
        // Find the input element
        const inputElements = document.querySelectorAll('input, textarea');
        for (const input of inputElements) {
          const placeholder = input.placeholder?.toLowerCase() || '';
          const label = input.labels?.[0]?.textContent?.toLowerCase() || '';
          const name = input.name?.toLowerCase() || '';
          const id = input.id?.toLowerCase() || '';
          
          if (placeholder.includes(desc) || label.includes(desc) || name.includes(desc) || id.includes(desc)) {
            element = input;
            break;
          }
        }
        
        if (element) {
          element.focus();
          element.value = textToType;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, message: 'Text typed successfully' };
        } else {
          return { success: false, error: 'Input element not found for typing' };
        }
      })();`;
      
      const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
      
      if (result && result.result && result.result.value) {
        return result.result.value;
      } else {
        return { success: false, error: 'Failed to type text' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async extractReadable() {
    const ok = await this.ensureConnected();
    if (!ok) throw new Error('CDP not connected');
    const script = `(() => {
      try {
        const meta = {
          title: (document.querySelector('meta[property="og:title"], meta[name="twitter:title"]')||{}).content || document.title || '',
          description: (document.querySelector('meta[property="og:description"], meta[name="description"], meta[name="twitter:description"]')||{}).content || '',
          image: (document.querySelector('meta[property="og:image"], meta[name="twitter:image"]')||{}).content || ''
        };
        const candidates = Array.from(document.querySelectorAll('article, main, #content, .content, .post, .entry, .article'));
        let root = candidates[0] || document.body;
        // Score candidates by text density
        const score = (el) => {
          const text = (el.innerText||'').trim();
          const len = text.length;
          const links = el.querySelectorAll('a').length + 1;
          const imgs = el.querySelectorAll('img').length + 1;
          return len / (links + imgs);
        };
        let best = root, bestScore = score(root);
        for (const el of candidates) { const s = score(el); if (s > bestScore) { bestScore = s; best = el; } }
        root = best;

        // Clone and sanitize
        const cloned = root.cloneNode(true);
        const walker = document.createTreeWalker(cloned, NodeFilter.SHOW_ELEMENT, null);
        let node;
        while ((node = walker.nextNode())) {
          // Remove scripts/styles and dangerous attrs
          if (['SCRIPT','STYLE','IFRAME','NOSCRIPT'].includes(node.tagName)) {
            node.remove();
            continue;
          }
          const attrs = Array.from(node.attributes || []);
          for (const a of attrs) {
            const n = a.name.toLowerCase();
            if (n.startsWith('on') || n === 'srcdoc') node.removeAttribute(a.name);
          }
        }

        // Resolve relative links/images to absolute
        cloned.querySelectorAll('a[href]').forEach(a => { try { a.href = new URL(a.getAttribute('href'), location.href).href; } catch(e){} });
        cloned.querySelectorAll('img[src]').forEach(img => { try { img.src = new URL(img.getAttribute('src'), location.href).href; } catch(e){} });

        const title = meta.title || document.title || '';
        const html = '<div>' + cloned.innerHTML + '</div>';
        const text = (root.innerText || '').slice(0, 200000);
        const links = Array.from(root.querySelectorAll('a[href]')).slice(0, 200).map(a => ({
          text: (a.innerText || '').trim().slice(0, 160),
          href: (new URL(a.getAttribute('href'), location.href)).href
        }));
        const images = Array.from(root.querySelectorAll('img[src]')).slice(0, 50).map(img => ({
          src: (new URL(img.getAttribute('src'), location.href)).href,
          alt: (img.getAttribute('alt') || '').slice(0, 160)
        }));
        return { title, html, text, links, images, meta };
      } catch (e) {
        return { title: '', html: '', text: '', links: [], images: [], meta: {} };
      }
    })();`;
    const result = await this.send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
    return result && result.result && result.result.value || { title: '', html: '', text: '', links: [], images: [] };
  }
}

const cdp = new CdpController();

ipcMain.handle('cdp:navigate', async (_e, url) => {
  try {
    console.log('CDP: Navigating to:', url);
    const res = await cdp.navigate(url);
    console.log('CDP: Navigation successful');
    return { success: true, data: res };
  } catch (err) {
    console.log('CDP: Navigation failed:', err.message);
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:health', async () => {
  try {
    const data = await cdp.getVersion();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:screenshot', async () => {
  try {
    const data = await cdp.screenshot();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:extract', async () => {
  try {
    const data = await cdp.extractReadable();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:scroll', async (_e, deltaY) => {
  try {
    const data = await cdp.scroll(deltaY);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:waitForElement', async (_e, selector, timeoutMs) => {
  try {
    const data = await cdp.waitForElement(selector, timeoutMs);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:extractForms', async () => {
  try {
    const result = await cdp.extractForms();
    return result;
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:extractTables', async () => {
  try {
    const result = await cdp.extractTables();
    return result;
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

// Smart element selection handlers
ipcMain.handle('cdp:findElement', async (_e, description) => {
  try {
    const result = await cdp.findElementByDescription(description);
    return result;
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:smartClick', async (_e, description) => {
  try {
    const result = await cdp.smartClick(description);
    return result;
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:smartType', async (_e, description, text) => {
  try {
    const result = await cdp.smartType(description, text);
    return result;
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

ipcMain.handle('cdp:click', async (_e, x, y) => {
  try {
    const result = await cdp.click(x, y);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cdp:type', async (_e, text) => {
  try {
    const result = await cdp.type(text);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// --- AI: Groq chat completion via main process ---
ipcMain.handle('ai:chat', async (_e, messages) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set');
    const body = {
      model: 'llama-4-scout-17b-16e',
      messages: Array.isArray(messages) ? messages : [{ role: 'user', content: String(messages || '') }],
      temperature: 0.2
    };
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Groq error ${res.status}: ${text}`);
    }
    const json = await res.json();
    const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content || '';
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

// --- Workflow Engine & Agentic Memory ---
class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.userPreferences = new Map();
    this.conversationHistory = [];
    this.workflowHistory = [];
  }

  // Store user preference
  setPreference(userId, key, value) {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, new Map());
    }
    this.userPreferences.get(userId).set(key, value);
  }

  // Get user preference
  getPreference(userId, key) {
    return this.userPreferences.get(userId)?.get(key);
  }

  // Add to conversation history
  addToHistory(role, content, metadata = {}) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now(),
      metadata
    });
    // Keep last 100 messages
    if (this.conversationHistory.length > 100) {
      this.conversationHistory.shift();
    }
  }

  // Get recent conversation context
  getRecentContext(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }

  // Create workflow from natural language
  async createWorkflow(description, userId) {
    const workflowId = `wf_${Date.now()}`;
    const workflow = {
      id: workflowId,
      description,
      steps: [],
      status: 'created',
      createdAt: Date.now(),
      userId,
      metadata: {}
    };

    // Parse description to extract workflow steps
    const steps = await this.parseWorkflowDescription(description);
    workflow.steps = steps;
    
    this.workflows.set(workflowId, workflow);
    this.addToHistory('system', `Created workflow: ${description}`, { workflowId });
    
    return workflow;
  }

  // Parse natural language to workflow steps with conditional logic
  async parseWorkflowDescription(description) {
    const steps = [];
    const lowerDesc = description.toLowerCase();
    const lines = description.split('\n').filter(line => line.trim());
    
    // Parse line by line for complex workflows
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Handle conditional statements
      if (line.toLowerCase().startsWith('if ') || line.toLowerCase().startsWith('when ')) {
        const condition = line.replace(/^(if|when)\s+/i, '');
        steps.push({
          id: `step_${i}`,
          type: 'condition',
          condition: condition,
          action: `Check: ${condition}`,
          status: 'pending',
          result: null,
          children: []
        });
      }
      // Handle else statements
      else if (line.toLowerCase().startsWith('else') || line.toLowerCase().startsWith('otherwise')) {
        const action = line.replace(/^(else|otherwise)\s*:?\s*/i, '');
        if (steps.length > 0 && steps[steps.length - 1].type === 'condition') {
          steps[steps.length - 1].children.push({
            id: `step_${i}_else`,
            action: action || 'Execute alternative action',
            status: 'pending',
            result: null
          });
        }
      }
      // Handle retry logic
      else if (line.toLowerCase().includes('retry') || line.toLowerCase().includes('try again')) {
        const retryMatch = line.match(/(\d+)\s+times?/i);
        const retryCount = retryMatch ? parseInt(retryMatch[1]) : 3;
        steps.push({
          id: `step_${i}`,
          type: 'retry',
          action: line,
          retryCount: retryCount,
          currentAttempt: 0,
          status: 'pending',
          result: null
        });
      }
      // Handle regular steps
      else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        const action = line.replace(/^[-•*]\s*/, '');
        steps.push({
          id: `step_${i}`,
          type: 'action',
          action: action,
          status: 'pending',
          result: null
        });
      }
      // Handle numbered steps
      else if (/^\d+\./.test(line)) {
        const action = line.replace(/^\d+\.\s*/, '');
        steps.push({
          id: `step_${i}`,
          type: 'action',
          action: action,
          status: 'pending',
          result: null
        });
      }
    }
    
    // If no structured steps found, use keyword-based parsing
    if (steps.length === 0) {
      if (lowerDesc.includes('login')) {
        steps.push({
          id: 'step_0',
          type: 'action',
          action: 'navigate',
          target: 'login_page',
          params: {},
          description: 'Navigate to login page',
          status: 'pending',
          result: null
        });
      }
      
      if (lowerDesc.includes('search')) {
        steps.push({
          id: 'step_1',
          type: 'action',
          action: 'type',
          target: 'search_input',
          params: { text: '[SEARCH_QUERY]' },
          description: 'Type search query',
          status: 'pending',
          result: null
        });
      }
      
      if (lowerDesc.includes('extract') || lowerDesc.includes('scrape')) {
        steps.push({
          id: 'step_2',
          type: 'action',
          action: 'extract_data',
          target: 'page_content',
          params: { type: 'auto' },
          description: 'Extract relevant data',
          status: 'pending',
          result: null
        });
      }
      
      if (lowerDesc.includes('save') || lowerDesc.includes('export')) {
        steps.push({
          id: 'step_3',
          type: 'action',
          action: 'export_data',
          target: 'local_storage',
          params: { format: 'json' },
          description: 'Save extracted data',
          status: 'pending',
          result: null
        });
      }
    }
    
    return steps;
  }

  // Execute workflow step by step
  async executeWorkflow(workflowId, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    
    // Phase 3: Auto-detect page type and apply optimizations
    if (context.url && !context.pageType) {
      try {
        const pageContent = context.content || '';
        context.pageType = await this.analyzePageType(context.url, pageContent);
        console.log(`Auto-detected page type: ${context.pageType.type} for ${context.url}`);
        this.addToHistory('system', `Page type detected: ${context.pageType.type} (${context.pageType.priority})`, { workflowId });
      } catch (error) {
        console.log('Could not auto-detect page type, using default strategies');
        context.pageType = { type: 'general', priority: 'standard', extractMode: 'balanced' };
      }
    }
    
    workflow.status = 'running';
    workflow.currentStep = 0;
    workflow.results = [];
    workflow.errors = [];
    
    this.addToHistory('system', `Started workflow: ${workflow.description}`, { workflowId });
    
    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        workflow.currentStep = i;
        const step = workflow.steps[i];
        
        // Execute step
        const result = await this.executeStep(step, context);
        workflow.results.push(result);
        
        // Update context for next steps
        context = { ...context, ...result };
        
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      workflow.status = 'completed';
      workflow.completedAt = Date.now();
      this.addToHistory('system', `Completed workflow: ${workflow.description}`, { workflowId, results: workflow.results });
      
    } catch (error) {
      workflow.status = 'failed';
      workflow.errors.push(error.message);
      this.addToHistory('system', `Workflow failed: ${error.message}`, { workflowId, error: error.message });
      throw error;
    }
    
    return workflow;
  }

  // Phase 3: Site-specific Heuristics
  async analyzePageType(url, content) {
    const domain = new URL(url).hostname.toLowerCase();
    const text = content.toLowerCase();
    
    // Site-specific heuristics
    if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn') || domain.includes('reuters')) {
      return { type: 'news', priority: 'article', extractMode: 'readable' };
    } else if (domain.includes('wikipedia') || domain.includes('docs') || domain.includes('manual')) {
      return { type: 'documentation', priority: 'content', extractMode: 'structured' };
    } else if (domain.includes('youtube') || domain.includes('vimeo') || domain.includes('netflix')) {
      return { type: 'video', priority: 'media', extractMode: 'media' };
    } else if (domain.includes('shop') || domain.includes('amazon') || domain.includes('ebay')) {
      return { type: 'ecommerce', priority: 'product', extractMode: 'product' };
    } else if (domain.includes('github') || domain.includes('stackoverflow') || domain.includes('dev')) {
      return { type: 'developer', priority: 'code', extractMode: 'code' };
    }
    
    // Content-based detection
    if (text.includes('article') && text.includes('published') && text.includes('author')) {
      return { type: 'article', priority: 'content', extractMode: 'readable' };
    } else if (text.includes('product') && text.includes('price') && text.includes('buy')) {
      return { type: 'ecommerce', priority: 'product', extractMode: 'product' };
    } else if (text.includes('function') && text.includes('class') && text.includes('import')) {
      return { type: 'developer', priority: 'code', extractMode: 'code' };
    }
    
    return { type: 'general', priority: 'standard', extractMode: 'balanced' };
  }

  // Phase 3: Performance Optimization
  async optimizeElementDetection(description, pageType) {
    const strategies = {
      news: ['text', 'aria-label', 'data-testid', 'class'],
      documentation: ['id', 'aria-label', 'text', 'class'],
      video: ['aria-label', 'title', 'alt', 'text'],
      ecommerce: ['data-testid', 'aria-label', 'text', 'placeholder'],
      developer: ['id', 'data-testid', 'aria-label', 'text'],
      general: ['text', 'aria-label', 'placeholder', 'title', 'class']
    };
    
    return strategies[pageType.type] || strategies.general;
  }

  // Phase 3: Multi-language Support
  async detectLanguage(text) {
    const languagePatterns = {
      english: /^[a-zA-Z\s.,!?;:'"()]+$/,
      spanish: /[áéíóúñü]/i,
      french: /[àâäéèêëïîôöùûüÿç]/i,
      german: /[äöüß]/i,
      chinese: /[\u4e00-\u9fff]/,
      japanese: /[\u3040-\u309f\u30a0-\u30ff]/,
      korean: /[\uac00-\ud7af]/,
      arabic: /[\u0600-\u06ff]/,
      hindi: /[\u0900-\u097f]/,
      russian: /[\u0400-\u04ff]/
    };
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    return 'english';
  }

  async translateCommand(command, targetLanguage = 'english') {
    // Simple keyword translation for common browser actions
    const translations = {
      spanish: {
        'click': 'hacer clic',
        'type': 'escribir',
        'navigate': 'navegar',
        'wait': 'esperar',
        'extract': 'extraer',
        'form': 'formulario',
        'button': 'botón',
        'input': 'entrada',
        'link': 'enlace'
      },
      french: {
        'click': 'cliquer',
        'type': 'taper',
        'navigate': 'naviguer',
        'wait': 'attendre',
        'extract': 'extraire',
        'form': 'formulaire',
        'button': 'bouton',
        'input': 'entrée',
        'link': 'lien'
      },
      german: {
        'click': 'klicken',
        'type': 'eingeben',
        'navigate': 'navigieren',
        'wait': 'warten',
        'extract': 'extrahieren',
        'form': 'formular',
        'button': 'schaltfläche',
        'input': 'eingabe',
        'link': 'verknüpfung'
      }
    };
    
    if (translations[targetLanguage]) {
      let translated = command;
      for (const [eng, trans] of Object.entries(translations[targetLanguage])) {
        translated = translated.replace(new RegExp(eng, 'gi'), trans);
      }
      return translated;
    }
    
    return command;
  }

  // Phase 3: Advanced Data Analysis
  async analyzeExtractedData(data, analysisType = 'auto') {
    if (analysisType === 'auto') {
      analysisType = this.detectDataType(data);
    }
    
    const analysis = {
      type: analysisType,
      insights: [],
      recommendations: [],
      patterns: [],
      summary: ''
    };
    
    switch (analysisType) {
      case 'table':
        analysis.insights = this.analyzeTableData(data);
        break;
      case 'form':
        analysis.insights = this.analyzeFormData(data);
        break;
      case 'text':
        analysis.insights = this.analyzeTextData(data);
        break;
      case 'list':
        analysis.insights = this.analyzeListData(data);
        break;
    }
    
    analysis.recommendations = this.generateRecommendations(analysis.insights);
    analysis.patterns = this.findPatterns(data);
    analysis.summary = this.generateSummary(analysis);
    
    return analysis;
  }

  detectDataType(data) {
    if (Array.isArray(data) && data.length > 0) {
      if (data[0].hasOwnProperty('cells') || data[0].hasOwnProperty('headers')) {
        return 'table';
      } else if (data[0].hasOwnProperty('fields')) {
        return 'form';
      } else if (typeof data[0] === 'string') {
        return 'list';
      }
    } else if (typeof data === 'string') {
      return 'text';
    }
    return 'mixed';
  }

  analyzeTableData(data) {
    const insights = [];
    
    if (data.length > 0) {
      const firstRow = data[0];
      insights.push(`Table has ${data.length} rows`);
      
      if (firstRow.headers) {
        insights.push(`Columns: ${firstRow.headers.join(', ')}`);
      }
      
      // Find numeric columns
      const numericColumns = [];
      for (const row of data) {
        for (const [key, value] of Object.entries(row)) {
          if (key !== 'headers' && key !== 'cells' && !isNaN(value) && value !== '') {
            numericColumns.push(key);
          }
        }
      }
      
      if (numericColumns.length > 0) {
        insights.push(`Numeric columns: ${[...new Set(numericColumns)].join(', ')}`);
      }
    }
    
    return insights;
  }

  analyzeFormData(data) {
    const insights = [];
    
    if (data.fields) {
      insights.push(`Form has ${data.fields.length} fields`);
      
      const requiredFields = data.fields.filter(field => field.required).length;
      if (requiredFields > 0) {
        insights.push(`${requiredFields} required fields`);
      }
      
      const fieldTypes = [...new Set(data.fields.map(field => field.type))];
      insights.push(`Field types: ${fieldTypes.join(', ')}`);
    }
    
    return insights;
  }

  analyzeTextData(data) {
    const insights = [];
    
    if (typeof data === 'string') {
      const words = data.split(/\s+/).length;
      const sentences = data.split(/[.!?]+/).length;
      const paragraphs = data.split(/\n\s*\n/).length;
      
      insights.push(`Text contains ${words} words, ${sentences} sentences, ${paragraphs} paragraphs`);
      
      // Detect key topics
      const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const wordMatches = data.toLowerCase().match(/\b\w+\b/g) || [];
      const wordFreq = {};
      
      wordMatches.forEach(word => {
        if (!commonWords.includes(word) && word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      
      const topWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => `${word} (${count})`);
      
      if (topWords.length > 0) {
        insights.push(`Key topics: ${topWords.join(', ')}`);
      }
    }
    
    return insights;
  }

  analyzeListData(data) {
    const insights = [];
    
    if (Array.isArray(data)) {
      insights.push(`List contains ${data.length} items`);
      
      if (data.length > 0) {
        const avgLength = data.reduce((sum, item) => sum + String(item).length, 0) / data.length;
        insights.push(`Average item length: ${Math.round(avgLength)} characters`);
        
        const uniqueItems = new Set(data).size;
        if (uniqueItems < data.length) {
          insights.push(`${data.length - uniqueItems} duplicate items found`);
        }
      }
    }
    
    return insights;
  }

  findPatterns(data) {
    const patterns = [];
    
    if (Array.isArray(data) && data.length > 2) {
      // Look for repeating patterns
      for (let i = 1; i < data.length; i++) {
        if (data[i] === data[i-1]) {
          patterns.push(`Repeating item: "${data[i]}"`);
        }
      }
      
      // Look for sequential patterns
      if (typeof data[0] === 'number') {
        let isSequential = true;
        for (let i = 1; i < data.length; i++) {
          if (data[i] !== data[i-1] + 1) {
            isSequential = false;
            break;
          }
        }
        if (isSequential) {
          patterns.push('Sequential number pattern detected');
        }
      }
    }
    
    return patterns;
  }

  generateRecommendations(insights) {
    const recommendations = [];
    
    insights.forEach(insight => {
      if (insight.includes('numeric columns')) {
        recommendations.push('Consider creating charts or graphs for numeric data');
      }
      if (insight.includes('required fields')) {
        recommendations.push('Focus on completing required fields first');
      }
      if (insight.includes('duplicate items')) {
        recommendations.push('Remove duplicate items for cleaner data');
      }
      if (insight.includes('key topics')) {
        recommendations.push('Use key topics for search optimization');
      }
    });
    
    return recommendations;
  }

  generateSummary(analysis) {
    const { type, insights, patterns, recommendations } = analysis;
    
    let summary = `Data Analysis Summary (${type}): `;
    summary += `${insights.length} insights, ${patterns.length} patterns, ${recommendations.length} recommendations. `;
    
    if (insights.length > 0) {
      summary += `Key findings: ${insights.slice(0, 2).join('; ')}. `;
    }
    
    if (recommendations.length > 0) {
      summary += `Top recommendation: ${recommendations[0]}`;
    }
    
    return summary;
  }

  // Phase 3: Enhanced workflow execution with new features
  async executeStep(step, context) {
    const startTime = Date.now();
    const stepId = `${context.workflowId}-${context.stepIndex}`;
    
    try {
      // Apply site-specific optimizations
      if (context.pageType) {
        const strategies = await this.optimizeElementDetection(step.description, context.pageType);
        step.optimizedStrategies = strategies;
      }
      
      // Language detection and translation
      if (step.description) {
        const detectedLang = await this.detectLanguage(step.description);
        if (detectedLang !== 'english') {
          step.originalDescription = step.description;
          step.description = await this.translateCommand(step.description, 'english');
          context.language = detectedLang;
        }
      }
      
      // Execute the step with enhanced context
      let result;
      switch (step.action) {
        case 'navigate':
          result = await this.executeNavigateStep(step, context);
          break;
        case 'type':
          result = await this.executeTypeStep(step, context);
          break;
        case 'click':
          result = await this.executeClickStep(step, context);
          break;
        case 'wait':
          result = await this.executeWaitStep(step, context);
          break;
        case 'extract':
          result = await this.executeExtractStep(step, context);
          break;
        case 'export':
          result = await this.executeExportStep(step, context);
          break;
        case 'analyze':
          result = await this.executeAnalyzeStep(step, context);
          break;
        default:
          throw new Error(`Unknown action: ${step.action}`);
      }
      
      // Record step performance
      const duration = Date.now() - startTime;
      this.recordStepPerformance(stepId, duration, 'success');
      
      return { success: true, result, duration, stepId };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordStepPerformance(stepId, duration, 'error');
      
      // Enhanced error recovery with language context
      if (context.language && context.language !== 'english') {
        error.message = `[${context.language.toUpperCase()}] ${error.message}`;
      }
      
      return await this.handleRetryStep(step, context, error);
    }
  }

  async executeAnalyzeStep(step, context) {
    const data = step.data || context.lastExtractedData;
    if (!data) {
      throw new Error('No data available for analysis');
    }
    
    const analysis = await this.analyzeExtractedData(data, step.analysisType);
    
    // Store analysis results in context
    context.analysisResults = context.analysisResults || [];
    context.analysisResults.push({
      step: step.description,
      analysis,
      timestamp: new Date().toISOString()
    });
    
    return analysis;
  }

  recordStepPerformance(stepId, duration, status) {
    if (!this.performanceMetrics) {
      this.performanceMetrics = {};
    }
    
    this.performanceMetrics[stepId] = {
      duration,
      status,
      timestamp: new Date().toISOString()
    };
  }

  // Execute individual workflow step with error recovery
  async executeStep(step, context) {
    const startTime = Date.now();
    
    try {
      // Record step start time
      if (!this.stepStartTimes) this.stepStartTimes = {};
      this.stepStartTimes[step.id] = startTime;

      let result;
      
      switch (step.action) {
        case 'navigate':
          result = await this.executeNavigateStep(step, context);
          break;
          
        case 'type':
          result = await this.executeTypeStep(step, context);
          break;
          
        case 'extract_data':
          result = await this.executeExtractStep(step, context);
          break;
          
        case 'export_data':
          result = await this.executeExportStep(step, context);
          break;
          
        case 'click':
          result = await this.executeClickStep(step, context);
          break;
          
        case 'wait':
          result = await this.executeWaitStep(step, context);
          break;
          
        default:
          result = { success: false, message: `Unknown action: ${step.action}` };
      }

      // Record step end time
      if (!this.stepEndTimes) this.stepEndTimes = {};
      this.stepEndTimes[step.id] = Date.now();

      // Update step status
      step.status = 'completed';
      step.result = result;

      return result;
      
    } catch (error) {
      // Record step end time on error
      if (!this.stepEndTimes) this.stepEndTimes = {};
      this.stepEndTimes[step.id] = Date.now();

      // Update step status
      step.status = 'failed';
      step.result = { success: false, error: error.message };

      // Try error recovery if this is a retry step
      if (step.type === 'retry' && step.currentAttempt < step.retryCount) {
        return await this.handleRetryStep(step, context, error);
      }

      return { success: false, error: error.message };
    }
  }

  // Execute navigation step with error recovery
  async executeNavigateStep(step, context) {
    try {
      let url = step.target;
      
      // Handle dynamic URLs from context
      if (url.startsWith('{{') && url.endsWith('}}')) {
        const key = url.slice(2, -2);
        url = context[key] || url;
      }

      await cdp.navigate(url);
      return { success: true, message: `Navigated to ${url}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Execute typing step with error recovery
  async executeTypeStep(step, context) {
    try {
      let text = step.params.text;
      let target = step.target;
      
      // Handle dynamic values from context
      if (text.startsWith('{{') && text.endsWith('}}')) {
        const key = text.slice(2, -2);
        text = context[key] || text;
      }

      if (target.startsWith('{{') && target.endsWith('}}')) {
        const key = target.slice(2, -2);
        target = context[key] || target;
      }

      const result = await cdp.smartType(target, text);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Execute click step with error recovery
  async executeClickStep(step, context) {
    try {
      let target = step.target;
      
      // Handle dynamic targets from context
      if (target.startsWith('{{') && target.endsWith('}}')) {
        const key = target.slice(2, -2);
        target = context[key] || target;
      }

      const result = await cdp.smartClick(target);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Execute wait step
  async executeWaitStep(step, context) {
    try {
      const duration = step.params.duration || 1000;
      await new Promise(resolve => setTimeout(resolve, duration));
      return { success: true, message: `Waited for ${duration}ms` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Execute data extraction step
  async executeExtractStep(step, context) {
    try {
      const forms = await cdp.extractForms();
      const tables = await cdp.extractTables();
      
      return { 
        success: true, 
        forms: forms.success ? forms.data : [],
        tables: tables.success ? tables.data : [],
        message: 'Data extracted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Execute export step
  async executeExportStep(step, context) {
    try {
      const format = step.params.format || 'json';
      const data = context.extractedData || [];
      
      const result = await this.processAndExportData(data, { format });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Handle retry logic for failed steps
  async handleRetryStep(step, context, error) {
    step.currentAttempt++;
    
    if (step.currentAttempt < step.retryCount) {
      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, step.currentAttempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Update step status
      step.status = 'retrying';
      step.result = { 
        success: false, 
        error: `Attempt ${step.currentAttempt} failed: ${error.message}. Retrying...`,
        attempt: step.currentAttempt,
        maxAttempts: step.retryCount
      };
      
      // Try to execute the step again
      return await this.executeStep(step, context);
    } else {
      // Max retries reached
      step.status = 'failed';
      step.result = { 
        success: false, 
        error: `Failed after ${step.retryCount} attempts: ${error.message}`,
        attempts: step.currentAttempt
      };
      
      return step.result;
    }
  }

  // Get workflow status
  getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;
    
    return {
      id: workflow.id,
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      description: workflow.description,
      progress: workflow.status === 'running' ? (workflow.currentStep / workflow.steps.length) * 100 : 0
    };
  }

  // Pause workflow
  pauseWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'paused';
      this.addToHistory('system', `Paused workflow: ${workflow.description}`, { workflowId });
      return true;
    }
    return false;
  }

  // Resume workflow
  resumeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'running';
      this.addToHistory('system', `Resumed workflow: ${workflow.description}`, { workflowId });
      return true;
    }
    return false;
  }

  // Real-time workflow monitoring
  startWorkflowMonitoring(workflowId, callback) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Create monitoring interval
    const monitorInterval = setInterval(() => {
      const status = this.getWorkflowStatus(workflowId);
      if (status && callback) {
        callback(status);
      }

      // Stop monitoring if workflow is completed or failed
      if (status && (status.status === 'completed' || status.status === 'failed')) {
        clearInterval(monitorInterval);
      }
    }, 1000); // Update every second

    // Store monitoring info
    workflow.monitoring = {
      interval: monitorInterval,
      callback: callback,
      startTime: Date.now()
    };

    return true;
  }

  // Stop workflow monitoring
  stopWorkflowMonitoring(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.monitoring) {
      clearInterval(workflow.monitoring.interval);
      workflow.monitoring = null;
      return true;
    }
    return false;
  }

  // Get detailed workflow progress
  getWorkflowProgress(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const currentStep = workflow.currentStep || 0;
    const totalSteps = workflow.steps.length;
    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
    
    // Calculate time estimates
    const startTime = workflow.createdAt;
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    let estimatedTotal = 0;
    let estimatedRemaining = 0;
    
    if (progress > 0) {
      estimatedTotal = (elapsed / progress) * 100;
      estimatedRemaining = estimatedTotal - elapsed;
    }

    return {
      id: workflow.id,
      status: workflow.status,
      currentStep,
      totalSteps,
      progress: Math.round(progress * 100) / 100,
      elapsed: Math.round(elapsed / 1000), // seconds
      estimatedRemaining: Math.round(estimatedRemaining / 1000), // seconds
      currentStepInfo: workflow.steps[currentStep] || null,
      nextStepInfo: workflow.steps[currentStep + 1] || null,
      results: workflow.results || [],
      errors: workflow.errors || []
    };
  }

  // Get workflow performance metrics
  getWorkflowMetrics(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const startTime = workflow.createdAt;
    const endTime = workflow.completedAt || Date.now();
    const duration = endTime - startTime;

    // Calculate step performance
    const stepPerformance = workflow.steps.map((step, index) => {
      const stepStart = workflow.stepStartTimes?.[index] || startTime;
      const stepEnd = workflow.stepEndTimes?.[index] || endTime;
      const stepDuration = stepEnd - stepStart;

      return {
        step: index + 1,
        action: step.action,
        duration: stepDuration,
        status: step.status,
        success: step.result?.success || false
      };
    });

    return {
      id: workflow.id,
      totalDuration: duration,
      averageStepDuration: duration / workflow.steps.length,
      stepPerformance,
      successRate: (workflow.results.filter(r => r.success).length / workflow.results.length) * 100,
      errorCount: workflow.errors.length
    };
  }

  // Enhanced data processing and export
  async processAndExportData(data, options = {}) {
    try {
      const {
        format = 'json',
        filename = `kairo_export_${Date.now()}`,
        includeMetadata = true,
        cleanData = true
      } = options;

      let processedData = data;

      // Clean data if requested
      if (cleanData) {
        processedData = this.cleanData(data);
      }

      // Add metadata if requested
      if (includeMetadata) {
        processedData = {
          metadata: {
            exportedAt: new Date().toISOString(),
            source: 'Kairo Browser',
            version: '1.0.0',
            dataType: Array.isArray(data) ? 'array' : typeof data,
            recordCount: Array.isArray(data) ? data.length : 1
          },
          data: processedData
        };
      }

      // Format data
      const formattedData = this.formatData(processedData, format);

      // Save to local storage
      const storageResult = this.saveData(processedData, format);

      // Create downloadable file
      if (format === 'csv' || format === 'txt') {
        this.downloadFile(formattedData, filename, format);
      }

      return {
        success: true,
        storage: storageResult,
        download: format !== 'json',
        filename: `${filename}.${format}`,
        size: formattedData.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Clean and validate data
  cleanData(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.cleanDataItem(item)).filter(item => item !== null);
    } else if (typeof data === 'object' && data !== null) {
      return this.cleanDataItem(data);
    }
    return data;
  }

  // Clean individual data item
  cleanDataItem(item) {
    if (!item || typeof item !== 'object') return item;

    const cleaned = {};
    for (const [key, value] of Object.entries(item)) {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed) cleaned[key] = value;
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  // Download file to user's computer
  downloadFile(content, filename, format) {
    try {
      // In main process, we'll save to a temporary file instead of downloading
      const tempDir = require('os').tmpdir();
      const filePath = require('path').join(tempDir, `${filename}.${format}`);
      require('fs').writeFileSync(filePath, content);
      console.log(`File saved to: ${filePath}`);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Download failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Format data for export
  formatData(data, format) {
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(data, null, 2);
        case 'csv':
          return this.convertToCSV(data);
        case 'txt':
          return this.convertToTXT(data);
        default:
          return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      console.error('Format data failed:', error);
      return JSON.stringify(data, null, 2);
    }
  }

  // Convert data to CSV format
  convertToCSV(data) {
    try {
      if (!Array.isArray(data)) {
        data = [data];
      }
      
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];
      
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        });
        csvRows.push(values.join(','));
      }
      
      return csvRows.join('\n');
    } catch (error) {
      console.error('CSV conversion failed:', error);
      return '';
    }
  }

  // Convert data to TXT format
  convertToTXT(data) {
    try {
      if (typeof data === 'string') return data;
      if (Array.isArray(data)) {
        return data.map(item => JSON.stringify(item, null, 2)).join('\n\n');
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('TXT conversion failed:', error);
      return String(data);
    }
  }

  // Save data to local storage
  saveData(data, format) {
    try {
      const key = `kairo_data_${Date.now()}`;
      // Store in memory for main process (could be enhanced with file system storage)
      if (!this.dataStorage) this.dataStorage = new Map();
      this.dataStorage.set(key, { data, format, timestamp: Date.now() });
      return { success: true, key };
    } catch (error) {
      console.error('Save data failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Advanced form automation with saved user data
  async autoFillForm(formData, options = {}) {
    try {
      const {
        useSavedData = true,
        smartFieldMatching = true,
        validateBeforeSubmit = true,
        submitAfterFill = false
      } = options;

      let filledFields = 0;
      let errors = [];

      // Get saved user data if requested
      let userData = {};
      if (useSavedData) {
        userData = this.getUserData();
      }

      // Process each form field
      for (const field of formData) {
        try {
          const result = await this.fillFormField(field, userData, smartFieldMatching);
          if (result.success) {
            filledFields++;
          } else {
            errors.push({ field: field.name, error: result.error });
          }
        } catch (error) {
          errors.push({ field: field.name, error: error.message });
        }
      }

      // Validate form if requested
      let validationResult = { valid: true, errors: [] };
      if (validateBeforeSubmit) {
        validationResult = await this.validateForm(formData);
      }

      // Submit form if requested and valid
      let submitResult = null;
      if (submitAfterFill && validationResult.valid) {
        submitResult = await this.submitForm(formData);
      }

      return {
        success: true,
        filledFields,
        totalFields: formData.length,
        validation: validationResult,
        submit: submitResult,
        errors: errors.length > 0 ? errors : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Fill individual form field intelligently
  async fillFormField(field, userData, smartMatching) {
    try {
      let valueToFill = '';

      if (smartMatching) {
        // Smart field matching using AI-like logic
        valueToFill = this.matchFieldToUserData(field, userData);
      } else {
        // Direct value assignment
        valueToFill = userData[field.name] || field.defaultValue || '';
      }

      // Use CDP to fill the field
      const result = await cdp.smartType(field.name, valueToFill);
      
      if (result.success) {
        return { success: true, field: field.name, value: valueToFill };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Smart field matching using AI-like logic
  matchFieldToUserData(field, userData) {
    const fieldName = field.name.toLowerCase();
    const fieldType = field.type.toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const label = (field.label || '').toLowerCase();

    // Common field patterns
    const patterns = {
      email: ['email', 'e-mail', 'mail', 'correo'],
      name: ['name', 'nombre', 'nome', 'fullname', 'firstname', 'lastname'],
      phone: ['phone', 'tel', 'telephone', 'mobile', 'cell'],
      address: ['address', 'street', 'city', 'state', 'zip', 'postal'],
      password: ['password', 'pass', 'pwd', 'contraseña'],
      username: ['username', 'user', 'login', 'account']
    };

    // Find matching pattern
    for (const [key, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => 
        fieldName.includes(keyword) || 
        placeholder.includes(keyword) || 
        label.includes(keyword)
      )) {
        return userData[key] || '';
      }
    }

    // Fallback to direct name matching
    return userData[field.name] || userData[fieldName] || '';
  }

  // Get saved user data
  getUserData() {
    try {
      if (!this.userDataStorage) this.userDataStorage = {};
      return this.userDataStorage;
    } catch (error) {
      return {};
    }
  }

  // Save user data
  saveUserData(data) {
    try {
      if (!this.userDataStorage) this.userDataStorage = {};
      this.userDataStorage = { ...this.userDataStorage, ...data };
      return true;
    } catch (error) {
      return false;
    }
  }

  // Validate form data
  async validateForm(formData) {
    try {
      const errors = [];
      
      for (const field of formData) {
        if (field.required && (!field.value || field.value.trim() === '')) {
          errors.push({ field: field.name, error: 'Required field is empty' });
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            errors.push({ field: field.name, error: 'Invalid email format' });
          }
        }
        
        // Phone validation
        if (field.type === 'tel' && field.value) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
            errors.push({ field: field.name, error: 'Invalid phone format' });
          }
        }
      }
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    } catch (error) {
      return { valid: false, errors: [{ field: 'general', error: error.message }] };
    }
  }

  // Submit form
  async submitForm(formData) {
    try {
      // Find submit button and click it
      const submitResult = await cdp.smartClick('submit');
      
      if (submitResult.success) {
        return { success: true, message: 'Form submitted successfully' };
      } else {
        return { success: false, error: submitResult.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const workflowEngine = new WorkflowEngine();

// IPC handlers for workflow engine
ipcMain.handle('workflow:create', async (_e, description, userId) => {
  try {
    const workflow = await workflowEngine.createWorkflow(description, userId);
    return { success: true, workflow };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:execute', async (_e, workflowId, context) => {
  try {
    const result = await workflowEngine.executeWorkflow(workflowId, context);
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:status', async (_e, workflowId) => {
  try {
    const status = workflowEngine.getWorkflowStatus(workflowId);
    return { success: true, status };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:pause', async (_e, workflowId) => {
  try {
    const success = workflowEngine.pauseWorkflow(workflowId);
    return { success };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:resume', async (_e, workflowId) => {
  try {
    const success = workflowEngine.resumeWorkflow(workflowId);
    return { success };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:preferences', async (_e, userId, key, value) => {
  try {
    if (value !== undefined) {
      workflowEngine.setPreference(userId, key, value);
      return { success: true };
    } else {
      const preference = workflowEngine.getPreference(userId, key);
      return { success: true, value: preference };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:history', async (_e, limit) => {
  try {
    const context = workflowEngine.getRecentContext(limit);
    return { success: true, context };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Data processing and export handler
ipcMain.handle('workflow:exportData', async (_e, data, options) => {
  try {
    const result = await workflowEngine.processAndExportData(data, options);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Phase 2: Advanced form automation handlers
ipcMain.handle('workflow:autoFillForm', async (_e, formData, options) => {
  try {
    const result = await workflowEngine.autoFillForm(formData, options);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:saveUserData', async (_e, data) => {
  try {
    const success = workflowEngine.saveUserData(data);
    return { success };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:getUserData', async () => {
  try {
    const data = workflowEngine.getUserData();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Phase 2: Real-time monitoring handlers
ipcMain.handle('workflow:startMonitoring', async (_e, workflowId) => {
  try {
    const success = workflowEngine.startWorkflowMonitoring(workflowId, (status) => {
      // Send real-time updates to renderer
      _e.sender.send('workflow:statusUpdate', { workflowId, status });
    });
    return { success };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:stopMonitoring', async (_e, workflowId) => {
  try {
    const success = workflowEngine.stopWorkflowMonitoring(workflowId);
    return { success };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:getProgress', async (_e, workflowId) => {
  try {
    const progress = workflowEngine.getWorkflowProgress(workflowId);
    return { success: true, progress };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:getMetrics', async (_e, workflowId) => {
  try {
    const metrics = workflowEngine.getWorkflowMetrics(workflowId);
    return { success: true, metrics };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Phase 3: Site-specific heuristics and analysis handlers
ipcMain.handle('workflow:analyzePageType', async (_e, url, content) => {
  try {
    const pageType = await workflowEngine.analyzePageType(url, content);
    return { success: true, pageType };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:analyzeData', async (_e, data, analysisType) => {
  try {
    const analysis = await workflowEngine.analyzeExtractedData(data, analysisType);
    return { success: true, analysis };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:detectLanguage', async (_e, text) => {
  try {
    const language = await workflowEngine.detectLanguage(text);
    return { success: true, language };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('workflow:getPerformanceMetrics', async (_e) => {
  try {
    const metrics = workflowEngine.performanceMetrics || {};
    return { success: true, metrics };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// --- Auto launch hidden Edge/Chrome for CDP ---
let cdpProc = null;

function findBrowserPath() {
  const candidates = [
    // Edge
    path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
    path.join(process.env['ProgramFiles'] || 'C:/Program Files', 'Microsoft/Edge/Application/msedge.exe'),
    // Chrome
    path.join(process.env['ProgramFiles'] || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Google/Chrome/Application/chrome.exe'),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch (_) {}
  }
  return null;
}

async function launchHiddenBrowser() {
  const exe = findBrowserPath();
  if (!exe) return;
  const userDir = path.join(os.tmpdir(), 'kairo-cdp-profile');
  try { fs.mkdirSync(userDir, { recursive: true }); } catch (_) {}

  const baseArgs = [
    `--remote-debugging-port=9222`,
    `--user-data-dir=${userDir}`,
  ];
  const headlessArgs = [...baseArgs, '--headless=new', '--disable-gpu'];
  const fallbackArgs = [...baseArgs, '--app=data:,', '--window-size=1,1', '--window-position=-32000,-32000', '--start-minimized'];

  function spawnWithArgs(args) {
    const child = spawn(exe, args, { stdio: 'ignore', detached: true });
    child.unref();
    return child;
  }

  try {
    cdpProc = spawnWithArgs(headlessArgs);
  } catch (_) {
    cdpProc = null;
  }
  // If headless crashed immediately, try fallback
  setTimeout(() => {
    if (!cdpProc || cdpProc.exitCode !== null) {
      try { cdpProc = spawnWithArgs(fallbackArgs); } catch (_) { /* ignore */ }
    }
  }, 600);
}

app.on('before-quit', () => {
  try {
    if (cdpProc && cdpProc.pid) process.kill(-cdpProc.pid);
  } catch (_) {}
});

