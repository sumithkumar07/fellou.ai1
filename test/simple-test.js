// ========================================
// KAIRO BROWSER - SIMPLE TEST
// ========================================

console.log('🧪 SIMPLE TEST STARTING...');

// Test script to verify that modules are loading correctly
(function() {
    'use strict';
    
    console.log('🧪 Running simple module test...');
    
    // Test 1: Check if core browser functions are available
    function testCoreBrowser() {
        console.log('🧪 Testing Core Browser functions...');
        
        const requiredFunctions = [
            'getWebview',
            'getUrlInput', 
            'navigate',
            'addTab',
            'setupWebviewEvents'
        ];
        
        let allAvailable = true;
        requiredFunctions.forEach(funcName => {
            if (window[funcName]) {
                console.log(`✅ ${funcName} is available`);
            } else {
                console.log(`❌ ${funcName} is NOT available`);
                allAvailable = false;
            }
        });
        
        return allAvailable;
    }
    
    // Test 2: Check if AI system is available
    function testAISystem() {
        console.log('🧪 Testing AI System...');
        
        if (window.enhancedAIIntelligence) {
            console.log('✅ AI Intelligence is available');
            return true;
        } else {
            console.log('❌ AI Intelligence is NOT available');
            return false;
        }
    }
    
    // Test 3: Check if error recovery is available
    function testErrorRecovery() {
        console.log('🧪 Testing Error Recovery...');
        
        if (window.enhancedErrorRecovery) {
            console.log('✅ Error Recovery is available');
            return true;
        } else {
            console.log('❌ Error Recovery is NOT available');
            return false;
        }
    }
    
    // Test 4: Check if performance monitor is available
    function testPerformanceMonitor() {
        console.log('🧪 Testing Performance Monitor...');
        
        if (window.enhancedPerformanceMonitor) {
            console.log('✅ Performance Monitor is available');
            return true;
        } else {
            console.log('❌ Performance Monitor is NOT available');
            return false;
        }
    }
    
    // Test 5: Check if webview element exists
    function testWebviewElement() {
        console.log('🧪 Testing Webview Element...');
        
        const view = document.getElementById('view');
        if (view) {
            console.log('✅ Webview element found');
            return true;
        } else {
            console.log('❌ Webview element NOT found');
            return false;
        }
    }
    
    // Run all tests
    function runAllTests() {
        console.log('🧪 Running all tests...');
        
        const results = [
            testCoreBrowser(),
            testAISystem(),
            testErrorRecovery(),
            testPerformanceMonitor(),
            testWebviewElement()
        ];
        
        const passed = results.filter(result => result === true).length;
        const total = results.length;
        
        console.log(`🧪 Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 ALL TESTS PASSED! Browser is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the logs above.');
        }
        
        return results;
    }
    
    // Run tests after a short delay to ensure modules are loaded
    setTimeout(() => {
        runAllTests();
    }, 1000);
    
})();
