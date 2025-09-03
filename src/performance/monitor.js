// ========================================
// KAIRO BROWSER - PERFORMANCE MONITOR MODULE
// ========================================

console.log('⚡ Loading Performance Monitor Module...');

// Enhanced Performance Monitor Class
class EnhancedPerformanceMonitor {
    constructor() {
        this.isEnabled = true;
        this.metrics = {
            fps: 0,
            memory: 0,
            loadTime: 0,
            cpu: 0,
            network: 0
        };
        this.history = [];
        this.maxHistorySize = 100;
        this.optimizationThresholds = {
            memory: 80, // 80% memory usage triggers optimization
            fps: 30,    // Below 30 FPS triggers optimization
            cpu: 70     // Above 70% CPU usage triggers optimization
        };
        
        console.log('⚡ Enhanced Performance Monitor initialized');
    }

    // Initialize performance monitoring
    initializeMonitoring() {
        console.log('⚡ Initializing Performance Monitoring...');
        
        if (this.isEnabled) {
            this.startFPSTracking();
            this.startMemoryTracking();
            this.startLoadTimeTracking();
            this.startCPUTracking();
            this.startNetworkTracking();
            
            // Setup periodic optimization checks
            this.setupPeriodicChecks();
            
            console.log('✅ Performance monitoring initialized successfully');
        }
    }

    // Start FPS tracking
    startFPSTracking() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Store in history
                this.addToHistory('fps', this.metrics.fps);
            }
            
            if (this.isEnabled) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
        console.log('✅ FPS tracking started');
    }

    // Start memory tracking
    startMemoryTracking() {
        if ('memory' in performance) {
            const measureMemory = () => {
                const memoryInfo = performance.memory;
                this.metrics.memory = Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100);
                
                // Store in history
                this.addToHistory('memory', this.metrics.memory);
                
                // Check if optimization is needed
                if (this.metrics.memory > this.optimizationThresholds.memory) {
                    this.performMemoryCleanup();
                }
            };
            
            setInterval(measureMemory, 2000); // Check every 2 seconds
            console.log('✅ Memory tracking started');
        } else {
            console.log('⚠️ Memory API not available');
        }
    }

    // Start load time tracking
    startLoadTimeTracking() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.loadTime = performance.now();
                this.addToHistory('loadTime', this.metrics.loadTime);
                console.log('✅ Load time tracked:', this.metrics.loadTime.toFixed(2), 'ms');
            });
        } else {
            this.metrics.loadTime = performance.now();
            console.log('✅ Load time tracked (already loaded):', this.metrics.loadTime.toFixed(2), 'ms');
        }
    }

    // Start CPU tracking (simulated)
    startCPUTracking() {
        const measureCPU = () => {
            // Simulate CPU usage based on various factors
            const startTime = performance.now();
            
            // Perform some work to measure CPU
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.random();
            }
            
            const endTime = performance.now();
            const cpuUsage = Math.min(100, Math.round((endTime - startTime) / 10));
            
            this.metrics.cpu = cpuUsage;
            this.addToHistory('cpu', this.metrics.cpu);
            
            // Check if optimization is needed
            if (this.metrics.cpu > this.optimizationThresholds.cpu) {
                this.performCPUOptimization();
            }
        };
        
        setInterval(measureCPU, 5000); // Check every 5 seconds
        console.log('✅ CPU tracking started');
    }

    // Start network tracking
    startNetworkTracking() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateNetworkInfo = () => {
                this.metrics.network = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                };
                
                this.addToHistory('network', this.metrics.network);
            };
            
            connection.addEventListener('change', updateNetworkInfo);
            updateNetworkInfo();
            console.log('✅ Network tracking started');
        } else {
            console.log('⚠️ Network Information API not available');
        }
    }

    // Add metric to history
    addToHistory(type, value) {
        const entry = {
            timestamp: Date.now(),
            type: type,
            value: value
        };
        
        this.history.push(entry);
        
        // Keep history size manageable
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    // Setup periodic optimization checks
    setupPeriodicChecks() {
        setInterval(() => {
            this.performPeriodicOptimization();
        }, 30000); // Check every 30 seconds
        
        console.log('✅ Periodic optimization checks setup completed');
    }

    // Perform memory cleanup
    performMemoryCleanup() {
        console.log('🧹 Performing memory cleanup...');
        
        try {
            // Clear unused variables and objects
            if (window.gc) {
                window.gc();
                console.log('✅ Garbage collection triggered');
            }
            
            // Clear console if it's getting too large
            if (console.clear) {
                console.clear();
                console.log('🧹 Console cleared for memory optimization');
            }
            
            // Clear some history to free memory
            if (this.history.length > 50) {
                this.history = this.history.slice(-50);
                console.log('🧹 History trimmed for memory optimization');
            }
            
            console.log('✅ Memory cleanup completed');
        } catch (error) {
            console.error('❌ Error during memory cleanup:', error);
        }
    }

    // Perform CPU optimization
    performCPUOptimization() {
        console.log('⚡ Performing CPU optimization...');
        
        try {
            // Reduce update frequency for non-critical operations
            this.optimizationThresholds.fps = Math.max(20, this.optimizationThresholds.fps - 5);
            
            // Clear some intervals if too many are running
            if (this.activeIntervals && this.activeIntervals.length > 5) {
                this.activeIntervals.slice(0, 2).forEach(interval => clearInterval(interval));
                console.log('⚡ Reduced active intervals for CPU optimization');
            }
            
            console.log('✅ CPU optimization completed');
        } catch (error) {
            console.error('❌ Error during CPU optimization:', error);
        }
    }

    // Perform periodic optimization
    performPeriodicOptimization() {
        console.log('🔄 Running periodic optimization...');
        
        try {
            // Check overall system health
            const avgFPS = this.getAverageMetric('fps');
            const avgMemory = this.getAverageMetric('memory');
            const avgCPU = this.getAverageMetric('cpu');
            
            console.log(`📊 System Health - FPS: ${avgFPS}, Memory: ${avgMemory}%, CPU: ${avgCPU}%`);
            
            // Perform optimizations based on metrics
            if (avgMemory > 70) {
                this.performMemoryCleanup();
            }
            
            if (avgCPU > 60) {
                this.performCPUOptimization();
            }
            
            if (avgFPS < 25) {
                this.performFPSOptimization();
            }
            
            console.log('✅ Periodic optimization completed');
        } catch (error) {
            console.error('❌ Error during periodic optimization:', error);
        }
    }

    // Perform FPS optimization
    performFPSOptimization() {
        console.log('🎯 Performing FPS optimization...');
        
        try {
            // Reduce visual effects
            document.body.style.setProperty('--animation-duration', '0.1s');
            
            // Disable some heavy animations
            const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.style.transition = 'none';
            });
            
            console.log('✅ FPS optimization completed');
        } catch (error) {
            console.error('❌ Error during FPS optimization:', error);
        }
    }

    // Get average metric from history
    getAverageMetric(type) {
        const relevantEntries = this.history.filter(entry => entry.type === type);
        
        if (relevantEntries.length === 0) return 0;
        
        const sum = relevantEntries.reduce((total, entry) => total + entry.value, 0);
        return Math.round(sum / relevantEntries.length);
    }

    // Get current metrics
    getMetrics() {
        return { ...this.metrics };
    }

    // Get performance history
    getHistory() {
        return [...this.history];
    }

    // Get performance report
    getPerformanceReport() {
        const avgFPS = this.getAverageMetric('fps');
        const avgMemory = this.getAverageMetric('memory');
        const avgCPU = this.getAverageMetric('cpu');
        
        return {
            current: this.metrics,
            averages: {
                fps: avgFPS,
                memory: avgMemory,
                cpu: avgCPU
            },
            health: this.getSystemHealth(),
            recommendations: this.getOptimizationRecommendations()
        };
    }

    // Get system health status
    getSystemHealth() {
        const avgFPS = this.getAverageMetric('fps');
        const avgMemory = this.getAverageMetric('memory');
        const avgCPU = this.getAverageMetric('cpu');
        
        if (avgFPS >= 50 && avgMemory < 60 && avgCPU < 50) {
            return 'excellent';
        } else if (avgFPS >= 30 && avgMemory < 80 && avgCPU < 70) {
            return 'good';
        } else if (avgFPS >= 20 && avgMemory < 90 && avgCPU < 85) {
            return 'fair';
        } else {
            return 'poor';
        }
    }

    // Get optimization recommendations
    getOptimizationRecommendations() {
        const recommendations = [];
        const avgFPS = this.getAverageMetric('fps');
        const avgMemory = this.getAverageMetric('memory');
        const avgCPU = this.getAverageMetric('cpu');
        
        if (avgFPS < 30) {
            recommendations.push('Reduce visual effects and animations');
        }
        
        if (avgMemory > 80) {
            recommendations.push('Close unnecessary tabs and clear browser cache');
        }
        
        if (avgCPU > 70) {
            recommendations.push('Close resource-intensive applications');
        }
        
        return recommendations;
    }

    // Enable/disable monitoring
    toggleMonitoring() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.initializeMonitoring();
            console.log('✅ Performance monitoring enabled');
        } else {
            console.log('❌ Performance monitoring disabled');
        }
        
        return this.isEnabled;
    }

    // Reset all metrics
    resetMetrics() {
        this.metrics = {
            fps: 0,
            memory: 0,
            loadTime: 0,
            cpu: 0,
            network: 0
        };
        this.history = [];
        console.log('✅ Performance metrics reset');
    }
}

// Create and export instance
const enhancedPerformanceMonitor = new EnhancedPerformanceMonitor();

// Make it globally available
window.enhancedPerformanceMonitor = enhancedPerformanceMonitor;

console.log('✅ Performance Monitor Module loaded successfully');
