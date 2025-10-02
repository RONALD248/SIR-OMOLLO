// Enhanced Voice Recognition Module
window.voiceRecognitionModule = {
    isInitialized: false,
    isRecording: false,
    recognition: null,
    recordingTimer: null,
    recordingStartTime: null,
    finalTranscript: '',
    
    init() {
        try {
            this.setupEventListeners();
            this.initializeSpeechRecognition();
            this.isInitialized = true;
            console.log('🎤 Voice recognition module initialized');
        } catch (error) {
            console.error('Voice recognition module init error:', error);
        }
    },
    
    setupEventListeners() {
        // Voice recording button
        const voiceRecordBtn = document.getElementById('voiceRecordBtn');
        if (voiceRecordBtn) {
            voiceRecordBtn.addEventListener('click', () => this.toggleRecordingInterface());
        }
        
        // Recording controls
        this.setupButton('startRecording', () => this.startRecording());
        this.setupButton('stopRecording', () => this.stopRecording());
        this.setupButton('cancelRecording', () => this.cancelRecording());
    },
    
    setupButton(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    },
    
    initializeSpeechRecognition() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showUnsupportedMessage();
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configuration for educational content
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3; // Get multiple alternatives for accuracy
        
        // Event handlers
        this.recognition.onstart = () => {
            this.onRecordingStart();
        };
        
        this.recognition.onresult = (event) => {
            this.onRecognitionResult(event);
        };
        
        this.recognition.onerror = (event) => {
            this.onRecognitionError(event);
        };
        
        this.recognition.onend = () => {
            this.onRecordingEnd();
        };
        
        console.log('✅ Speech recognition initialized');
    },
    
    showUnsupportedMessage() {
        const voiceRecordBtn = document.getElementById('voiceRecordBtn');
        if (voiceRecordBtn) {
            voiceRecordBtn.disabled = true;
            voiceRecordBtn.innerHTML = `
                <div class="upload-icon">
                    <i class="fas fa-microphone-slash"></i>
                </div>
                <div class="upload-info">
                    <strong>Not Supported</strong>
                    <span>Voice Recognition</span>
                </div>
            `;
        }
        
        const recordingInterface = document.getElementById('voiceRecording');
        if (recordingInterface) {
            recordingInterface.innerHTML = `
                <div class="recording-header">
                    <h4><i class="fas fa-microphone-slash"></i> Voice Recording Not Supported</h4>
                </div>
                <div class="recording-controls">
                    <p style="text-align: center; color: var(--text-light); padding: var(--spacing-xl);">
                        Voice recording is not supported in your browser. 
                        Please use Chrome, Edge, or another supported browser for this feature.
                    </p>
                </div>
            `;
        }
    },
    
    toggleRecordingInterface() {
        const recordingInterface = document.getElementById('voiceRecording');
        if (recordingInterface) {
            recordingInterface.classList.toggle('hidden');
            
            if (!recordingInterface.classList.contains('hidden')) {
                // Scroll to recording interface
                setTimeout(() => {
                    recordingInterface.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        }
    },
    
    startRecording() {
        if (!this.recognition) {
            app.showNotification('Speech recognition not supported in your browser', 'error');
            return;
        }
        
        if (this.isRecording) {
            return;
        }
        
        try {
            // Reset transcript
            this.finalTranscript = '';
            
            // Start recognition
            this.recognition.start();
            this.isRecording = true;
            
            // Update UI
            this.updateRecordingUI();
            this.startRecordingTimer();
            
            app.showNotification('Recording started... Speak clearly for best results', 'info');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            app.showNotification('Error starting recording', 'error');
        }
    },
    
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    },
    
    cancelRecording() {
        this.stopRecording();
        this.resetRecording();
        const recordingInterface = document.getElementById('voiceRecording');
        if (recordingInterface) {
            recordingInterface.classList.add('hidden');
        }
        app.showNotification('Recording cancelled', 'info');
    },
    
    onRecordingStart() {
        this.recordingStartTime = Date.now();
        this.updateRecordingStatus('Listening... Speak now');
        this.animateVisualizer(true);
        console.log('🎤 Recording started');
    },
    
    onRecognitionResult(event) {
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                // Final result - add to final transcript
                this.finalTranscript += this.formatTranscript(transcript);
            } else {
                // Interim result - show for real-time feedback
                interimTranscript += transcript;
            }
        }
        
        // Update input text with both final and interim results
        this.updateInputText(this.finalTranscript + interimTranscript);
    },
    
    formatTranscript(transcript) {
        // Basic formatting for educational content
        let formatted = transcript.trim();
        
        // Capitalize first letter of sentences
        if (formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }
        
        // Add space if needed
        if (!this.finalTranscript.endsWith(' ') && this.finalTranscript.length > 0) {
            formatted = ' ' + formatted;
        }
        
        return formatted;
    },
    
    updateInputText(text) {
        const inputText = document.getElementById('inputText');
        if (inputText) {
            inputText.value = text;
            app.updateStats();
        }
    },
    
    onRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Speech recognition error: ';
        switch (event.error) {
            case 'no-speech':
                errorMessage += 'No speech was detected. Please try speaking louder or closer to the microphone.';
                break;
            case 'audio-capture':
                errorMessage += 'No microphone was found. Please check your microphone connection.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone permission was denied. Please allow microphone access in your browser settings.';
                break;
            case 'network':
                errorMessage += 'Network error occurred. Please check your internet connection.';
                break;
            case 'service-not-allowed':
                errorMessage += 'Speech recognition service is not allowed.';
                break;
            default:
                errorMessage += event.error;
        }
        
        app.showNotification(errorMessage, 'error');
        this.resetRecording();
    },
    
    onRecordingEnd() {
        console.log('🎤 Recording stopped');
        this.resetRecording();
        
        if (this.finalTranscript.trim().length > 0) {
            app.showNotification('Recording completed successfully', 'success');
            
            // Add educational context note
            this.addEducationalContext();
        } else {
            app.showNotification('No speech detected. Please try again.', 'warning');
        }
    },
    
    addEducationalContext() {
        const currentText = document.getElementById('inputText').value;
        if (currentText.trim().length > 50) {
            const educationalNote = `

---
🎤 VOICE-TO-TEXT TRANSCRIPTION:
• Source: Speech Recognition
• Words: ${currentText.split(/\s+/).length}
• Date: ${new Date().toLocaleString()}
• Educational Use: This transcribed content can now be processed using all accessibility tools.`;

            document.getElementById('inputText').value += educationalNote;
            app.updateStats();
        }
    },
    
    updateRecordingUI() {
        const voiceRecordBtn = document.getElementById('voiceRecordBtn');
        const startBtn = document.getElementById('startRecording');
        const stopBtn = document.getElementById('stopRecording');
        
        if (voiceRecordBtn) {
            voiceRecordBtn.classList.add('recording');
        }
        if (startBtn) {
            startBtn.disabled = true;
        }
        if (stopBtn) {
            stopBtn.disabled = false;
        }
    },
    
    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timerElement = document.getElementById('recordingTimer');
            if (timerElement) {
                timerElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },
    
    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    },
    
    resetRecording() {
        this.isRecording = false;
        this.stopRecordingTimer();
        
        // Update UI
        const voiceRecordBtn = document.getElementById('voiceRecordBtn');
        const startBtn = document.getElementById('startRecording');
        const stopBtn = document.getElementById('stopRecording');
        const timerElement = document.getElementById('recordingTimer');
        const statusElement = document.getElementById('recordingStatus');
        
        if (voiceRecordBtn) {
            voiceRecordBtn.classList.remove('recording');
        }
        if (startBtn) {
            startBtn.disabled = false;
        }
        if (stopBtn) {
            stopBtn.disabled = true;
        }
        if (timerElement) {
            timerElement.textContent = '00:00';
        }
        if (statusElement) {
            statusElement.textContent = 'Ready to record';
        }
        
        this.animateVisualizer(false);
    },
    
    animateVisualizer(start) {
        const bars = document.querySelectorAll('.visualizer-bar');
        
        if (start && this.isRecording) {
            bars.forEach(bar => {
                bar.style.animation = 'pulse 0.5s infinite alternate';
                this.updateVisualizerHeight(bar);
            });
            
            // Continuous height updates while recording
            this.visualizerInterval = setInterval(() => {
                bars.forEach(bar => {
                    if (this.isRecording) {
                        this.updateVisualizerHeight(bar);
                    }
                });
            }, 100);
        } else {
            bars.forEach(bar => {
                bar.style.animation = 'none';
                bar.style.height = '20px';
            });
            
            if (this.visualizerInterval) {
                clearInterval(this.visualizerInterval);
                this.visualizerInterval = null;
            }
        }
    },
    
    updateVisualizerHeight(bar) {
        if (this.isRecording) {
            const height = 20 + Math.random() * 40;
            bar.style.height = `${height}px`;
        }
    },
    
    updateRecordingStatus(status) {
        const statusElement = document.getElementById('recordingStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    },
    
    // Educational speech recognition features
    setEducationalLanguage(lang = 'en-US') {
        if (this.recognition) {
            this.recognition.lang = lang;
            console.log(`🎯 Speech recognition language set to: ${lang}`);
        }
    },
    
    getRecordingStats() {
        return {
            duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
            wordCount: this.finalTranscript.split(/\s+/).length,
            isRecording: this.isRecording,
            language: this.recognition ? this.recognition.lang : 'unknown'
        };
    },
    
    // Method for educational content optimization
    optimizeForEducationalContent() {
        if (this.recognition) {
            // These settings might improve recognition for educational terminology
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 3;
        }
    }
};

// Initialize voice recognition when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.voiceRecognitionModule && !window.voiceRecognitionModule.isInitialized) {
            window.voiceRecognitionModule.init();
        }
    }, 100);
});