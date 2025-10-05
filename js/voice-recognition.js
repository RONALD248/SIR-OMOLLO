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
                // Add beautiful animation
                recordingInterface.style.animation = 'fadeInUp 0.5s ease';
                
                // Scroll to recording interface
                setTimeout(() => {
                    recordingInterface.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        }
    },
    
    startRecording() {
        if (!this.recognition) {
            this.initializeSpeechRecognition();
        }

        if (this.isRecording) return;

        try {
            // Reset transcript
            this.finalTranscript = '';
            
            // Start recognition
            this.recognition.start();
            this.isRecording = true;
            
            // Update UI
            this.updateRecordingUI();
            this.startRecordingTimer();
            
            app.showNotification('Recording started... Speak clearly about educational content', 'info');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.handleRecordingError(error);
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
                this.finalTranscript += this.formatEducationalTranscript(transcript);
                this.saveToLocalStorage(this.finalTranscript); // Save progress
            } else {
                // Interim result - show for real-time feedback
                interimTranscript += transcript;
            }
        }
        
        // Update input text with both final and interim results
        this.updateInputText(this.finalTranscript + interimTranscript);
    },
    
    formatEducationalTranscript(transcript) {
        let formatted = transcript.trim();
        
        // Basic formatting for educational content
        if (formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
            
            // Add period if missing and sentence is complete
            if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
                const lastChar = formatted.charAt(formatted.length - 1);
                if (lastChar !== ',' && lastChar !== ';' && formatted.split(/\s+/).length > 3) {
                    formatted += '.';
                }
            }
        }
        
        if (this.finalTranscript.length > 0 && !this.finalTranscript.endsWith(' ')) {
            formatted = ' ' + formatted;
        }
        
        return formatted;
    },
    
    updateInputText(text) {
        const inputText = document.getElementById('inputText');
        if (inputText) {
            inputText.value = text;
            app.updateStats();
            this.updateRealTimeStats(text);
        }
    },
    
    updateRealTimeStats(transcript) {
        const words = transcript.split(/\s+/).filter(word => word.length > 0);
        const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Update stats display
        const statsElement = document.getElementById('recordingStats');
        if (statsElement) {
            statsElement.innerHTML = `
                <span>Words: ${words.length}</span>
                <span>Sentences: ${sentences.length}</span>
                <span>Characters: ${transcript.length}</span>
            `;
        }
    },
    
    saveToLocalStorage(transcript) {
        // Auto-save transcription progress
        try {
            const transcriptionHistory = JSON.parse(localStorage.getItem('transcriptionHistory') || '[]');
            transcriptionHistory.push({
                text: transcript,
                timestamp: new Date().toISOString(),
                wordCount: transcript.split(/\s+/).length
            });
            
            // Keep only last 10 transcriptions
            if (transcriptionHistory.length > 10) {
                transcriptionHistory.shift();
            }
            
            localStorage.setItem('transcriptionHistory', JSON.stringify(transcriptionHistory));
        } catch (error) {
            console.warn('Could not save transcription to localStorage');
        }
    },
    
    onRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        
        let userMessage = 'Speech recognition error: ';
        switch (event.error) {
            case 'no-speech':
                userMessage += 'No speech was detected. Please try speaking louder or closer to the microphone.';
                break;
            case 'audio-capture':
                userMessage += 'No microphone was found. Please check your microphone connection.';
                break;
            case 'not-allowed':
                userMessage += 'Microphone permission was denied. Please allow microphone access in your browser settings.';
                break;
            case 'network':
                userMessage += 'Network error occurred. Please check your internet connection.';
                break;
            case 'service-not-allowed':
                userMessage += 'Speech recognition service is not allowed.';
                break;
            default:
                userMessage += event.error;
        }
        
        app.showNotification(userMessage, 'error');
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
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording...';
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
            startBtn.innerHTML = '<i class="fas fa-record-vinyl"></i> Start Recording';
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
            
            // Add color coding for status
            statusElement.className = 'recording-status';
            if (status.includes('Listening')) {
                statusElement.classList.add('listening');
            } else if (status.includes('Ready')) {
                statusElement.classList.add('ready');
            }
        }
    },
    
    handleRecordingError(error) {
        let userMessage = 'Recording error: ';
        
        switch(error.name || error) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                userMessage += 'Microphone access denied. Please allow microphone permissions in your browser settings.';
                break;
            case 'NotSupportedError':
                userMessage += 'Speech recognition not supported in this browser. Try Chrome or Edge.';
                break;
            case 'NoSpeechError':
                userMessage += 'No speech detected. Please check your microphone and try speaking louder.';
                break;
            default:
                userMessage += 'Please check your microphone and try again.';
        }
        
        app.showNotification(userMessage, 'error');
        this.resetRecording();
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