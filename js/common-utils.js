// Common Utilities for 이하은 Portfolio
// Shared functions and configurations across all pages

// API Configuration Manager
class APIManager {
    constructor() {
        this.config = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return this.config;
        
        try {
            // Try to load from api-config.js first
            if (typeof API_CONFIG !== 'undefined') {
                this.config = API_CONFIG;
            }
            
            // Check localStorage as fallback
            const storedKey = localStorage.getItem('gemini_api_key');
            if (storedKey && (!this.config || this.config.GEMINI_API_KEY === 'YOUR_API_KEY_HERE')) {
                this.config = {
                    ...this.config,
                    GEMINI_API_KEY: storedKey
                };
            }
            
            this.initialized = true;
            return this.config;
        } catch (error) {
            console.error('Failed to initialize API config:', error);
            return null;
        }
    }

    getApiKey(service = 'GEMINI') {
        if (!this.config) return null;
        return this.config[`${service}_API_KEY`];
    }

    setApiKey(service, key) {
        if (!this.config) this.config = {};
        this.config[`${service}_API_KEY`] = key;
        localStorage.setItem(`${service.toLowerCase()}_api_key`, key);
    }

    getEndpoint(service) {
        const endpoints = {
            GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models',
            GITHUB: 'https://api.github.com',
            SUPABASE: 'https://xvjdqubiukqspucnvjyg.supabase.co'
        };
        return endpoints[service];
    }

    getModel(purpose = 'chat') {
        const models = {
            chat: 'gemini-2.5-flash',
            vision: 'gemini-2.5-flash',
            pro: 'gemini-1.5-pro',
            fallback: 'gemini-2.0-flash-exp'
        };
        return models[purpose] || models.chat;
    }
}

// File Handler for drag & drop
class FileHandler {
    constructor(dropZone, callback) {
        this.dropZone = dropZone;
        this.callback = callback;
        this.initializeEvents();
    }

    initializeEvents() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        this.dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        }, false);

        // Handle click to select
        this.dropZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                this.handleFiles(e.target.files);
            };
            input.click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFiles(files) {
        if (this.callback && files.length > 0) {
            this.callback(files[0]);
        }
    }

    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            apiCallCount: 0,
            apiTotalTime: 0,
            errorCount: 0
        };
        this.initializeMonitoring();
    }

    initializeMonitoring() {
        // Page load time
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.metrics.pageLoadTime = loadTime;
            console.log(`Page loaded in ${loadTime}ms`);
        });

        // Monitor API calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                this.trackApiCall(endTime - startTime, response.ok);
                return response;
            } catch (error) {
                this.metrics.errorCount++;
                throw error;
            }
        };
    }

    trackApiCall(duration, success) {
        this.metrics.apiCallCount++;
        this.metrics.apiTotalTime += duration;
        if (!success) this.metrics.errorCount++;
    }

    getMetrics() {
        return {
            ...this.metrics,
            avgApiTime: this.metrics.apiCallCount > 0 
                ? Math.round(this.metrics.apiTotalTime / this.metrics.apiCallCount) 
                : 0
        };
    }
}

// Animation Utilities
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    static typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        type();
    }

    static shimmer(element) {
        element.classList.add('shimmer');
        setTimeout(() => {
            element.classList.remove('shimmer');
        }, 1500);
    }
}

// Error Handler
class ErrorHandler {
    static handle(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // User-friendly error messages
        const messages = {
            'Failed to fetch': '네트워크 연결을 확인해주세요',
            '404': '요청한 리소스를 찾을 수 없습니다',
            '403': 'API 키가 유효하지 않습니다',
            '429': 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요',
            '500': '서버 오류가 발생했습니다'
        };

        let userMessage = '오류가 발생했습니다';
        for (const [key, value] of Object.entries(messages)) {
            if (error.message?.includes(key) || error.toString().includes(key)) {
                userMessage = value;
                break;
            }
        }

        // Display error to user
        this.showNotification(userMessage, 'error');
        
        // Log to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error', {
                error_context: context,
                error_message: error.message
            });
        }
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Storage Manager with encryption support
class StorageManager {
    static set(key, value, encrypt = false) {
        try {
            const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static get(key, encrypted = false) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            return encrypted ? JSON.parse(atob(data)) : JSON.parse(data);
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return null;
        }
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }

    static getSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return (size / 1024).toFixed(2) + ' KB';
    }
}

// Export utilities
window.PortfolioUtils = {
    APIManager,
    FileHandler,
    PerformanceMonitor,
    AnimationUtils,
    ErrorHandler,
    StorageManager
};

// Initialize global API manager
window.apiManager = new APIManager();
window.apiManager.init();

// Add global styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes shimmer {
        0% {
            background-position: -1000px 0;
        }
        100% {
            background-position: 1000px 0;
        }
    }
    
    .shimmer {
        animation: shimmer 1.5s infinite linear;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
        background-size: 1000px 100%;
    }
    
    .dragover {
        transform: scale(1.02);
        border-color: #22d3ee !important;
        background: rgba(34, 211, 238, 0.1) !important;
    }
`;
document.head.appendChild(style);

console.log('Portfolio utilities loaded successfully');