// Enhanced Text-to-Speech Module
window.speechModule = {
    isInitialized: false,
    isPlaying: false,
    isPaused: false,
    currentUtterance: null,
    voices: [],
    currentVoice: null,
    
    init() {
        try {
            this.setupEventListeners();
            this.loadVoices();
            this.isInitialized = true;
            console.log('🔊 Speech module initialized');
        } catch (error) {
            console.error('Speech module init error:', error);
        }
    },
    
    setupEventListeners() {
        // Voice selection
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.setVoice(parseInt(e.target.value));
            });
        }
        
        // Load voices when available
        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    },
    
    loadVoices() {
        if (!('speechSynthesis' in window)) {
            this.showUnsupportedMessage();
            return;
        }
        
        setTimeout(() => {
            this.voices = speechSynthesis.getVoices();
            this.populateVoiceList();
            
            if (this.voices.length > 0) {
                console.log(`✅ ${this.voices.length} voices loaded`);
            } else {
                console.warn('⚠️ No voices available');
            }
        }, 100);
    },
    
    populateVoiceList() {
        const voiceSelect = document.getElementById('voiceSelect');
        if (!voiceSelect || this.voices.length === 0) return;
        
        // Clear existing options except the first one
        while (voiceSelect.options.length > 1) {
            voiceSelect.remove(1);
        }
        
        // Add available voices
        this.voices.forEach((voice, index) => {
            // Prefer English voices but include others if few available
            if (voice.lang.includes('en') || this.voices.length < 5) {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            }
        });
        
        // Set default voice
        if (this.voices.length > 0) {
            this.setVoice(0);
        }
    },
    
    setVoice(voiceIndex) {
        if (this.voices[voiceIndex]) {
            this.currentVoice = this.voices[voiceIndex];
            console.log(`🎤 Voice set to: ${this.currentVoice.name}`);
        }
    },
    
    play() {
        const text = document.getElementById('inputText').value.trim();
        
        if (!text) {
            app.showNotification('Please enter some text to read aloud', 'warning');
            return;
        }
        
        if (text.length > 5000) {
            app.showNotification('Text too long for speech synthesis. Please use shorter text.', 'warning');
            return;
        }
        
        if (!this.checkBrowserSupport()) {
            return;
        }
        
        try {
            if (this.isPaused && this.currentUtterance) {
                // Resume paused speech
                speechSynthesis.resume();
                this.isPlaying = true;
                this.isPaused = false;
                this.updatePlaybackButtons();
                app.showNotification('Resumed speaking', 'info');
                return;
            }
            
            // Stop any current speech
            this.stop();
            
            // Create new utterance
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            
            // Configure voice
            if (this.currentVoice) {
                this.currentUtterance.voice = this.currentVoice;
            }
            
            // Configure settings
            const speed = parseFloat(document.getElementById('speechSpeed').value) || 1;
            this.currentUtterance.rate = speed;
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 1;
            
            // Event handlers
            this.currentUtterance.onstart = () => {
                this.isPlaying = true;
                this.isPaused = false;
                this.updatePlaybackButtons();
                app.showNotification('Started speaking', 'info');
            };
            
            this.currentUtterance.onend = () => {
                this.isPlaying = false;
                this.isPaused = false;
                this.updatePlaybackButtons();
                app.showNotification('Finished speaking', 'success');
                this.currentUtterance = null;
            };
            
            this.currentUtterance.onerror = (event) => {
                console.error('Speech error:', event);
                this.isPlaying = false;
                this.isPaused = false;
                this.updatePlaybackButtons();
                app.showNotification('Speech synthesis error', 'error');
                this.currentUtterance = null;
            };
            
            this.currentUtterance.onpause = () => {
                this.isPaused = true;
                this.isPlaying = false;
                this.updatePlaybackButtons();
                app.showNotification('Speech paused', 'info');
            };
            
            // Start speaking
            speechSynthesis.speak(this.currentUtterance);
            
        } catch (error) {
            console.error('Speech play error:', error);
            app.showNotification('Speech synthesis failed', 'error');
            this.fallbackTTS(text);
        }
    },
    
    pause() {
        if (this.isPlaying && speechSynthesis.speaking) {
            speechSynthesis.pause();
            this.isPlaying = false;
            this.isPaused = true;
            this.updatePlaybackButtons();
            app.showNotification('Speech paused', 'info');
        }
    },
    
    stop() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            this.isPlaying = false;
            this.isPaused = false;
            this.updatePlaybackButtons();
            this.currentUtterance = null;
        }
    },
    
    updatePlaybackButtons() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (playBtn) {
            if (this.isPaused) {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Audio';
            }
        }
        
        if (pauseBtn) {
            pauseBtn.disabled = !this.isPlaying;
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.isPlaying && !this.isPaused;
        }
    },
    
    checkBrowserSupport() {
        if (!('speechSynthesis' in window)) {
            app.showNotification('Text-to-speech not supported in this browser', 'warning');
            return false;
        }
        
        if (this.voices.length === 0) {
            app.showNotification('No speech voices available', 'warning');
            return false;
        }
        
        return true;
    },
    
    showUnsupportedMessage() {
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect) {
            voiceSelect.innerHTML = '<option value="default">Text-to-speech not supported</option>';
            voiceSelect.disabled = true;
        }
        
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Not Supported';
        }
    },
    
    fallbackTTS(text) {
        // Simple fallback - could use Web Audio API or external service
        app.showNotification('Using fallback speech method', 'info');
        
        try {
            // Try with basic utterance
            const utterance = new SpeechSynthesisUtterance(text.substring(0, 1000));
            speechSynthesis.speak(utterance);
        } catch (fallbackError) {
            console.error('Fallback TTS failed:', fallbackError);
            app.showNotification('Speech synthesis completely unavailable', 'error');
        }
    },
    
    // Public methods
    getVoices() {
        return this.voices;
    },
    
    isSupported() {
        return 'speechSynthesis' in window;
    },
    
    getCurrentState() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            currentVoice: this.currentVoice,
            voicesAvailable: this.voices.length
        };
    }
};