// Main Application Controller - EduAccess Hub
window.app = {
    isInitialized: false,
    currentTheme: 'light',
    deferredPrompt: null,
    
    init() {
        try {
            console.log('🚀 Initializing EduAccess Hub...');
            
            this.setupEventListeners();
            this.setupTheme();
            this.setupPWA();
            this.initializeModules();
            this.updateStats();
            
            // Hide loading screen with smooth transition
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.isInitialized = true;
                this.showNotification('EduAccess Hub is ready! Start making education accessible.', 'success');
                console.log('✅ EduAccess Hub initialized successfully');
            }, 500);
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    },
    
    setupEventListeners() {
        // Text input events
        const inputText = document.getElementById('inputText');
        if (inputText) {
            inputText.addEventListener('input', () => {
                this.updateStats();
                this.validateInput();
            });
        }
        
        // Button events
        this.setupButton('clearInput', () => this.clearInput());
        this.setupButton('sampleText', () => this.loadSampleText());
        this.setupButton('pasteText', () => this.pasteText());
        this.setupButton('copyOutput', () => this.copyOutput());
        this.setupButton('downloadOutput', () => this.downloadOutput());
        this.setupButton('clearOutput', () => this.clearOutput());
        
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTheme(e.currentTarget.dataset.theme);
            });
        });
        
        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.currentTarget.dataset.action);
            });
        });
        
        // Speech speed control
        const speedSlider = document.getElementById('speechSpeed');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                speedValue.textContent = `${e.target.value}x`;
            });
        }
    },
    
    setupButton(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    },
    
    setupTheme() {
        const savedTheme = localStorage.getItem('preferred-theme') || 'light';
        this.setTheme(savedTheme);
    },
    
    setTheme(themeName) {
        try {
            this.currentTheme = themeName;
            document.body.setAttribute('data-theme', themeName);
            localStorage.setItem('preferred-theme', themeName);
            
            // Update active theme button
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.theme === themeName) {
                    btn.classList.add('active');
                }
            });
            
            this.showNotification(`Theme changed to ${themeName} mode`, 'info');
        } catch (error) {
            console.error('Theme change error:', error);
        }
    },
    
    setupPWA() {
        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const installBtn = document.getElementById('installBtn');
            if (installBtn) {
                installBtn.classList.remove('hidden');
            }
        });
        
        // Install button
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        installBtn.classList.add('hidden');
                        this.showNotification('EduAccess Hub installed successfully!', 'success');
                    }
                    this.deferredPrompt = null;
                }
            });
        }
        
        // Track app installed
        window.addEventListener('appinstalled', () => {
            console.log('📱 EduAccess Hub installed successfully');
            this.deferredPrompt = null;
        });
    },
    
    initializeModules() {
        // Initialize all modules with error handling
        const modules = [
            { name: 'speechModule', file: 'speech.js' },
            { name: 'translationModule', file: 'translation.js' },
            { name: 'simplificationModule', file: 'simplification.js' },
            { name: 'fileProcessingModule', file: 'file-processing.js' },
            { name: 'voiceRecognitionModule', file: 'voice-recognition.js' },
            { name: 'imageAnalysisModule', file: 'image-analysis.js' }
        ];
        
        modules.forEach(module => {
            try {
                if (window[module.name]) {
                    window[module.name].init();
                    console.log(`✅ ${module.name} initialized`);
                } else {
                    console.warn(`⚠️ ${module.name} not found`);
                }
            } catch (error) {
                console.error(`❌ ${module.name} initialization failed:`, error);
            }
        });
        
        this.connectModuleButtons();
    },
    
    connectModuleButtons() {
        // Text-to-Speech
        this.setupButton('playBtn', () => {
            if (window.speechModule) speechModule.play();
        });
        this.setupButton('pauseBtn', () => {
            if (window.speechModule) speechModule.pause();
        });
        this.setupButton('stopBtn', () => {
            if (window.speechModule) speechModule.stop();
        });
        
        // Translation
        this.setupButton('translateBtn', () => {
            if (window.translationModule) translationModule.translate();
        });
        
        // Simplification
        this.setupButton('simplifyBtn', () => {
            if (window.simplificationModule) simplificationModule.simplify();
        });
        
        // Voice recording
        this.setupButton('voiceRecordBtn', () => {
            if (window.voiceRecognitionModule) {
                voiceRecognitionModule.toggleRecordingInterface();
            }
        });
        this.setupButton('startRecording', () => {
            if (window.voiceRecognitionModule) voiceRecognitionModule.startRecording();
        });
        this.setupButton('stopRecording', () => {
            if (window.voiceRecognitionModule) voiceRecognitionModule.stopRecording();
        });
        this.setupButton('cancelRecording', () => {
            if (window.voiceRecognitionModule) voiceRecognitionModule.cancelRecording();
        });
        
        // File upload
        const fileUpload = document.getElementById('fileUpload');
        const imageUpload = document.getElementById('imageUpload');
        if (fileUpload && window.fileProcessingModule) {
            fileUpload.addEventListener('change', (e) => fileProcessingModule.handleFileUpload(e));
        }
        if (imageUpload && window.imageAnalysisModule) {
            imageUpload.addEventListener('change', (e) => imageAnalysisModule.handleImageUpload(e));
        }
    },
    
    handleQuickAction(action) {
        const text = document.getElementById('inputText').value.trim();
        if (!text) {
            this.showNotification('Please enter some text first', 'warning');
            return;
        }
        
        switch(action) {
            case 'speech':
                if (window.speechModule) speechModule.play();
                break;
            case 'translate':
                if (window.translationModule) translationModule.translate();
                break;
            case 'simplify':
                if (window.simplificationModule) simplificationModule.simplify();
                break;
            case 'analyze':
                this.analyzeReadability(text);
                break;
        }
    },
    
    updateStats() {
        const text = document.getElementById('inputText').value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const sentenceCount = text.trim() ? text.split(/[.!?]+/).length - 1 : 0;
        
        // Update display
        this.updateElement('charCount', charCount);
        this.updateElement('wordCount', wordCount);
        this.updateElement('sentenceCount', sentenceCount);
        
        // Update character limit warning
        const charLimit = document.getElementById('charLimit');
        if (charLimit) {
            if (charCount > 4500) {
                charLimit.style.color = 'var(--error-red)';
                charLimit.textContent = `Near limit: ${charCount}/5000`;
            } else if (charCount > 4000) {
                charLimit.style.color = 'var(--warning-orange)';
                charLimit.textContent = `${charCount}/5000 characters`;
            } else {
                charLimit.style.color = '';
                charLimit.textContent = `${charCount}/5000 characters`;
            }
        }
    },
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },
    
    validateInput() {
        const text = document.getElementById('inputText').value;
        if (text.length > 5000) {
            this.showNotification('Text exceeds 5000 character limit', 'warning');
            document.getElementById('inputText').value = text.substring(0, 5000);
            this.updateStats();
        }
    },
    
    analyzeReadability(text) {
        if (!text.trim()) {
            this.showNotification('Please enter text to analyze', 'warning');
            return;
        }
        
        const words = text.trim().split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length - 1;
        const characters = text.length;
        
        const avgSentenceLength = words / Math.max(sentences, 1);
        const avgWordLength = characters / Math.max(words, 1);
        
        let readability = 'Easy';
        let score = 100 - (avgSentenceLength + avgWordLength * 10);
        
        if (score < 40) readability = 'Expert';
        else if (score < 60) readability = 'Hard';
        else if (score < 80) readability = 'Medium';
        
        const analysis = `📊 READABILITY ANALYSIS

Text Statistics:
• Words: ${words}
• Sentences: ${sentences}
• Characters: ${characters}
• Average sentence length: ${avgSentenceLength.toFixed(1)} words
• Average word length: ${avgWordLength.toFixed(1)} characters

Readability Score: ${readability}

Recommendations:
${readability === 'Easy' ? '✅ Perfect for most readers' :
  readability === 'Medium' ? '📖 Suitable for general audience' :
  readability === 'Hard' ? '🎓 Consider simplifying for wider audience' :
  '🔍 May be challenging - consider using text simplification tool'}

---
Analysis performed at: ${new Date().toLocaleString()}`;

        this.showOutput(analysis, 'Readability Analysis', 'analysis');
        this.showNotification('Readability analysis completed', 'success');
    },
    
    clearInput() {
        if (confirm('Are you sure you want to clear the input text?')) {
            document.getElementById('inputText').value = '';
            this.updateStats();
            this.showNotification('Input cleared', 'info');
        }
    },
    
    loadSampleText() {
        const sampleText = `Education transforms lives and is at the heart of UNESCO's mission to build peace, eradicate poverty and drive sustainable development. It is a human right for all throughout life, and access must be matched by quality.

The UNESCO Education Strategy 2024-2029 has three strategic pillars: access, quality, and inclusion. It focuses on better learning outcomes and skills development, especially for the most marginalized, including persons with disabilities, indigenous peoples, and girls and women.

Quality education provides all learners with capabilities they require to become economically productive, develop sustainable livelihoods, contribute to peaceful and democratic societies and enhance individual well-being.

This sample text demonstrates how EduAccess Hub can transform educational content into multiple accessible formats to support diverse learning needs and promote inclusive education for all.`;
        
        document.getElementById('inputText').value = sampleText;
        this.updateStats();
        this.showNotification('Sample educational text loaded', 'success');
    },
    
    async pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('inputText').value = text;
            this.updateStats();
            this.showNotification('Text pasted from clipboard', 'success');
        } catch (error) {
            this.showNotification('Failed to paste from clipboard. Please use Ctrl+V instead.', 'error');
            console.error('Paste error:', error);
        }
    },
    
    showOutput(content, title, type) {
        try {
            const placeholder = document.getElementById('outputPlaceholder');
            const outputContent = document.getElementById('outputContent');
            const outputTitle = document.getElementById('outputTitle');
            const outputType = document.getElementById('outputType');
            const outputTime = document.getElementById('outputTime');
            const outputText = document.getElementById('outputText');
            const outputWords = document.getElementById('outputWords');
            const outputChars = document.getElementById('outputChars');
            
            if (!outputContent || !outputText) {
                console.error('Output elements not found');
                return;
            }
            
            // Update output content
            if (outputTitle) outputTitle.textContent = title;
            if (outputType) outputType.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            if (outputTime) outputTime.textContent = new Date().toLocaleTimeString();
            if (outputText) outputText.textContent = content;
            if (outputWords) outputWords.textContent = content.split(/\s+/).length;
            if (outputChars) outputChars.textContent = content.length;
            
            // Show output, hide placeholder
            if (placeholder) placeholder.classList.add('hidden');
            outputContent.classList.remove('hidden');
            
            // Scroll to output smoothly
            setTimeout(() => {
                outputContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            
        } catch (error) {
            console.error('Error showing output:', error);
            this.showNotification('Error displaying output', 'error');
        }
    },
    
    async copyOutput() {
        const outputText = document.getElementById('outputText');
        if (!outputText || !outputText.textContent.trim()) {
            this.showNotification('No output to copy', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(outputText.textContent);
            this.showNotification('Output copied to clipboard', 'success');
        } catch (error) {
            this.showNotification('Failed to copy output', 'error');
            console.error('Copy error:', error);
        }
    },
    
    downloadOutput() {
        const outputText = document.getElementById('outputText');
        const outputTitle = document.getElementById('outputTitle');
        
        if (!outputText || !outputText.textContent.trim()) {
            this.showNotification('No output to download', 'warning');
            return;
        }
        
        try {
            const text = outputText.textContent;
            const title = outputTitle ? outputTitle.textContent : 'output';
            const format = document.getElementById('exportFormat')?.value || 'txt';
            
            const mimeTypes = {
                'txt': 'text/plain',
                'pdf': 'application/pdf',
                'doc': 'application/msword'
            };
            
            const blob = new Blob([text], { type: mimeTypes[format] || 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`Output downloaded as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Failed to download output', 'error');
        }
    },
    
    clearOutput() {
        if (confirm('Are you sure you want to clear the output?')) {
            const placeholder = document.getElementById('outputPlaceholder');
            const outputContent = document.getElementById('outputContent');
            
            if (outputContent) outputContent.classList.add('hidden');
            if (placeholder) placeholder.classList.remove('hidden');
            
            this.showNotification('Output cleared', 'info');
        }
    },
    
    showProgress(show, text = 'Processing...') {
        try {
            const progressBar = document.getElementById('progressBar');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const progressPercent = document.getElementById('progressPercent');
            
            if (!progressBar || !progressFill) {
                console.warn('Progress elements not found');
                return;
            }
            
            if (show) {
                if (progressText) progressText.textContent = text;
                if (progressPercent) progressPercent.textContent = '0%';
                progressBar.classList.remove('hidden');
                progressFill.style.width = '0%';
                
                // Store progress interval for cleanup
                this.progressInterval = setInterval(() => {
                    const currentWidth = parseFloat(progressFill.style.width) || 0;
                    if (currentWidth < 90) {
                        const newWidth = currentWidth + Math.random() * 10;
                        progressFill.style.width = `${newWidth}%`;
                        if (progressPercent) {
                            progressPercent.textContent = `${Math.min(90, Math.round(newWidth))}%`;
                        }
                    }
                }, 200);
                
            } else {
                // Complete progress
                progressFill.style.width = '100%';
                if (progressPercent) progressPercent.textContent = '100%';
                
                setTimeout(() => {
                    progressBar.classList.add('hidden');
                    progressFill.style.width = '0%';
                    if (this.progressInterval) {
                        clearInterval(this.progressInterval);
                        this.progressInterval = null;
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Progress update error:', error);
        }
    },
    
    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${percent}%`;
        }
    },
    
    showNotification(message, type = 'info') {
        try {
            const container = document.getElementById('notificationContainer');
            if (!container) {
                console.log(`Notification (${type}): ${message}`);
                return;
            }
            
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            
            notification.innerHTML = `
                <i class="${icons[type] || icons.info}"></i>
                <span>${message}</span>
            `;
            
            container.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
            
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, initializing app...');
        app.init();
    });
} else {
    console.log('⚡ DOM already loaded, initializing app...');
    app.init();
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            app.showNotification('New version available! Refresh to update.', 'info');
                        }
                    });
                });
            })
            .catch((registrationError) => {
                console.log('❌ Service Worker registration failed:', registrationError);
            });
    });

    // Listen for claiming of service worker
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            window.location.reload();
            refreshing = true;
        }
    });
}

// Export app for global access
window.EduAccessHub = window.app;