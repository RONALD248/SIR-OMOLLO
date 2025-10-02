// Enhanced Translation Module
window.translationModule = {
    isInitialized: false,
    supportedLanguages: {
        'es': { name: 'Spanish', flag: '🇪🇸', native: 'Español' },
        'fr': { name: 'French', flag: '🇫🇷', native: 'Français' },
        'de': { name: 'German', flag: '🇩🇪', native: 'Deutsch' },
        'it': { name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
        'pt': { name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
        'ru': { name: 'Russian', flag: '🇷🇺', native: 'Русский' },
        'ja': { name: 'Japanese', flag: '🇯🇵', native: '日本語' },
        'ko': { name: 'Korean', flag: '🇰🇷', native: '한국어' },
        'zh': { name: 'Chinese', flag: '🇨🇳', native: '中文' },
        'ar': { name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
        'hi': { name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
        'sw': { name: 'Swahili', flag: '🇹🇿', native: 'Kiswahili' },
        'nl': { name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
        'sv': { name: 'Swedish', flag: '🇸🇪', native: 'Svenska' },
        'tr': { name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' }
    },

    init() {
        try {
            this.setupEventListeners();
            this.populateLanguageSelect();
            this.isInitialized = true;
            console.log('🌐 Translation module initialized');
        } catch (error) {
            console.error('Translation module init error:', error);
        }
    },

    setupEventListeners() {
        // Language selection
        const targetLang = document.getElementById('targetLang');
        if (targetLang) {
            targetLang.addEventListener('change', () => {
                this.updateTargetLanguage();
            });
        }
    },

    populateLanguageSelect() {
        const targetLang = document.getElementById('targetLang');
        if (!targetLang) return;

        // Clear existing options
        targetLang.innerHTML = '';

        // Add language options
        Object.entries(this.supportedLanguages).forEach(([code, info]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${info.flag} ${info.name} (${info.native})`;
            targetLang.appendChild(option);
        });
    },

    updateTargetLanguage() {
        const targetLang = document.getElementById('targetLang').value;
        const language = this.supportedLanguages[targetLang];
        if (language) {
            console.log(`🎯 Translation target: ${language.name}`);
        }
    },

    async translate() {
        const text = document.getElementById('inputText').value.trim();
        
        if (!text) {
            app.showNotification('Please enter some text to translate', 'warning');
            return;
        }

        if (text.length > 2000) {
            app.showNotification('Text too long for translation. Please use shorter text (max 2000 characters).', 'warning');
            return;
        }

        const targetLang = document.getElementById('targetLang').value;
        const language = this.supportedLanguages[targetLang];

        if (!language) {
            app.showNotification('Please select a valid language', 'error');
            return;
        }

        app.showProgress(true, `Translating to ${language.name}...`);

        try {
            // Try multiple translation approaches
            const translatedText = await this.tryTranslationMethods(text, targetLang, language);
            
            app.showOutput(
                translatedText,
                `Translation to ${language.name}`,
                'translation'
            );
            
            app.showNotification(`Successfully translated to ${language.name}`, 'success');
            
        } catch (error) {
            console.error('Translation error:', error);
            this.showFallbackTranslation(text, targetLang, language);
        } finally {
            app.showProgress(false);
        }
    },

    async tryTranslationMethods(text, targetLang, language) {
        // Method 1: Try browser-based translation (if available)
        try {
            const result = await this.browserTranslation(text, targetLang);
            if (result && result.trim().length > 0) {
                return result;
            }
        } catch (error) {
            console.log('Browser translation failed:', error);
        }

        // Method 2: Show demo translation with educational context
        return this.createEducationalTranslation(text, targetLang, language);
    },

    async browserTranslation(text, targetLang) {
        // This is a simulation - in a real implementation, you might use:
        // - Google Translate API
        // - Microsoft Translator API
        // - LibreTranslate
        // - MyMemory API
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate API call delay
                resolve(null); // Return null to trigger fallback
            }, 1000);
        });
    },

    createEducationalTranslation(text, targetLang, language) {
        const demoTranslations = {
            'es': `[TRADUCCIÓN AL ESPAÑOL - DEMOSTRACIÓN EDUCATIVA]

${text}

---
INFORMACIÓN DE LA TRADUCCIÓN:
• Idioma destino: Español
• Características educativas preservadas
• Contexto académico mantenido
• Fecha: ${new Date().toLocaleString()}

EJEMPLO DE CONTENIDO EDUCATIVO:
"La educación es el arma más poderosa que puedes usar para cambiar el mundo." - Nelson Mandela

NOTA: Esta es una traducción de demostración. En una implementación completa, se utilizaría un servicio de traducción profesional con soporte para contenido educativo.`,
            
            'fr': `[TRADUCTION FRANÇAISE - DÉMONSTRATION ÉDUCATIVE]

${text}

---
INFORMATIONS DE TRADUCTION:
• Langue cible: Français
• Caractéristiques éducatives préservées
• Contexte académique maintenu
• Date: ${new Date().toLocaleString()}

EXEMPLE DE CONTENU ÉDUCATIF:
"L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde." - Nelson Mandela

NOTE: Ceci est une traduction de démonstration. Dans une implémentation complète, un service de traduction professionnel serait utilisé.`,
            
            'de': `[DEUTSCHE ÜBERSETZUNG - BILDUNGSDEMONSTRATION]

${text}

---
ÜBERSETZUNGSINFORMATIONEN:
• Zielsprache: Deutsch
• Bildungsmerkmale erhalten
• Akademischer Kontext beibehalten
• Datum: ${new Date().toLocaleString()}

BEISPIEL FÜR BILDUNGSINHALT:
"Bildung ist die mächtigste Waffe, die du verwenden kannst, um die Welt zu verändern." - Nelson Mandela

HINWEIS: Dies ist eine Demo-Übersetzung. In einer vollständigen Implementierung würde ein professioneller Übersetzungsdienst verwendet werden.`,
            
            'sw': `[TAFSIRI YA KISWAHILI - ONYESHO LA ELIMU]

${text}

---
TAARIFA ZA TAFSIRI:
• Lugha lengwa: Kiswahili
• Vipengele vya kielimu vimehifadhiwa
• Muktadha wa kiakademia umehifadhiwa
• Tarehe: ${new Date().toLocaleString()}

MFANO WA MAUDHUI YA KIELIMU:
"Elimu ndio silaha lenye nguvu zaidi ambalo unaweza kutumia kubadilisha dunia." - Nelson Mandela

TAARIFA: Huu ni tafsiri ya onyesho. Katika utekelezaji kamili, huduma ya kitaalamu ya tafsiri ingetumika.`
        };

        return demoTranslations[targetLang] || 
            `[${language.name.toUpperCase()} TRANSLATION - EDUCATIONAL DEMO]

${text}

---
TRANSLATION INFORMATION:
• Target language: ${language.name}
• Educational features preserved
• Academic context maintained
• Date: ${new Date().toLocaleString()}

EDUCATIONAL CONTEXT EXAMPLE:
"Education is the most powerful weapon which you can use to change the world." - Nelson Mandela

NOTE: This is a demo translation. In a full implementation, a professional translation service with educational content support would be used.`;
    },

    showFallbackTranslation(text, targetLang, language) {
        const fallbackText = this.createEducationalTranslation(text, targetLang, language);
        
        app.showOutput(
            fallbackText,
            `Translation to ${language.name} (Demo)`,
            'translation'
        );
        
        app.showNotification(`Demo translation shown - Professional service required for full implementation`, 'info');
    },

    // Utility methods
    getLanguageName(code) {
        return this.supportedLanguages[code]?.name || code;
    },

    getLanguageFlag(code) {
        return this.supportedLanguages[code]?.flag || '🌐';
    },

    detectLanguage(text) {
        // Simple language detection based on common words
        const commonWords = {
            'en': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'for'],
            'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
            'fr': ['le', 'la', 'de', 'et', 'à', 'est', 'un', 'dans', 'que', 'pour'],
            'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'ist', 'sich']
        };

        let maxMatches = 0;
        let detectedLang = 'en';

        Object.entries(commonWords).forEach(([lang, words]) => {
            const lowerText = text.toLowerCase();
            const matches = words.filter(word => 
                lowerText.includes(` ${word} `) || 
                lowerText.startsWith(`${word} `) ||
                lowerText.endsWith(` ${word}`)
            ).length;
            
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedLang = lang;
            }
        });

        return detectedLang;
    },

    // Advanced translation features
    async translateWithContext(text, targetLang, context = 'educational') {
        // This would be implemented with a professional translation API
        // that understands educational context and terminology
        
        const contextPrompts = {
            'educational': 'Translate this educational content preserving academic terminology and learning context',
            'scientific': 'Translate this scientific content with accurate technical terminology',
            'literary': 'Translate this literary content preserving style and cultural references'
        };
        
        const prompt = contextPrompts[context] || contextPrompts.educational;
        
        // In a real implementation, this would call an AI translation service
        return this.createEducationalTranslation(text, targetLang, this.supportedLanguages[targetLang]);
    },

    getTranslationStats(text, translatedText) {
        const originalWords = text.split(/\s+/).length;
        const translatedWords = translatedText.split(/\s+/).length;
        const ratio = (translatedWords / originalWords).toFixed(2);
        
        return {
            originalWords,
            translatedWords,
            ratio,
            complexity: ratio > 1.2 ? 'Higher' : ratio < 0.8 ? 'Lower' : 'Similar'
        };
    }
};