// Enhanced Text Simplification Module
window.simplificationModule = {
    isInitialized: false,
    simplificationLevels: {
        'light': {
            name: 'Light Simplification',
            description: 'Keeps most details while improving readability',
            maxSentences: 8,
            maxWordsPerSentence: 20,
            complexityThreshold: 0.7,
            example: 'Like turning "The meteorological precipitation is substantial" into "It\'s raining heavily"'
        },
        'medium': {
            name: 'Medium Simplification',
            description: 'Balanced approach for general understanding',
            maxSentences: 6,
            maxWordsPerSentence: 15,
            complexityThreshold: 0.5,
            example: 'Like changing "Utilize the apparatus" to "Use the equipment"'
        },
        'heavy': {
            name: 'Heavy Simplification',
            description: 'Maximum simplicity for easy reading',
            maxSentences: 4,
            maxWordsPerSentence: 12,
            complexityThreshold: 0.3,
            example: 'Like simplifying "The cognitive processes involved in comprehension" to "How we understand things"'
        }
    },

    init() {
        try {
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✍️ Simplification module initialized');
        } catch (error) {
            console.error('Simplification module init error:', error);
        }
    },

    setupEventListeners() {
        // Simplification level
        const simplifyLevel = document.getElementById('simplifyLevel');
        if (simplifyLevel) {
            simplifyLevel.addEventListener('change', () => {
                this.updateSimplificationLevel();
            });
        }
    },

    updateSimplificationLevel() {
        const level = document.getElementById('simplifyLevel').value;
        const levelInfo = this.simplificationLevels[level];
        
        if (levelInfo) {
            console.log(`🎯 Simplification level: ${levelInfo.name}`);
        }
    },

    async simplify() {
        const text = document.getElementById('inputText').value.trim();
        
        if (!text) {
            app.showNotification('Please enter some text to simplify', 'warning');
            return;
        }

        if (text.length < 10) {
            app.showNotification('Text is already very short', 'info');
            return;
        }

        const level = document.getElementById('simplifyLevel').value;
        const addExamples = document.getElementById('addExamples')?.checked || false;
        const showOriginal = document.getElementById('showOriginal')?.checked || false;

        app.showProgress(true, 'Simplifying text for better understanding...');

        try {
            let simplifiedText;
            
            // Try AI-powered simplification first
            try {
                simplifiedText = await this.smartSimplification(text, level);
                app.updateProgress(70);
            } catch (aiError) {
                console.log('AI simplification failed, using advanced rule-based:', aiError);
                simplifiedText = this.advancedRuleBasedSimplification(text, level);
                app.updateProgress(60);
            }

            // Add educational examples if requested
            if (addExamples && simplifiedText) {
                simplifiedText = this.addEducationalExamples(simplifiedText, level);
            }

            app.updateProgress(90);
            
            // Calculate improvement statistics
            const stats = this.calculateImprovementStats(text, simplifiedText);
            
            // Format final output
            let finalOutput = simplifiedText;
            if (showOriginal && simplifiedText) {
                finalOutput = this.formatWithOriginal(text, simplifiedText, stats);
            } else {
                finalOutput = this.formatOutput(simplifiedText, level, stats);
            }

            app.updateProgress(100);
            
            const levelInfo = this.simplificationLevels[level];
            app.showOutput(
                finalOutput,
                `Simplified Text - ${levelInfo.name}`,
                'simplification'
            );
            
            this.showSimplificationStats(stats);
            app.showNotification(`Text simplified successfully! Readability improved by ${stats.improvement}%`, 'success');
            
        } catch (error) {
            console.error('Simplification error:', error);
            app.showNotification('Simplification failed', 'error');
        } finally {
            setTimeout(() => app.showProgress(false), 500);
        }
    },

    async smartSimplification(text, level) {
        // In a full implementation, this would call an AI API
        // For now, we use advanced rule-based with educational context
        return this.advancedRuleBasedSimplification(text, level);
    },

    advancedRuleBasedSimplification(text, level) {
        const levelConfig = this.simplificationLevels[level];
        
        // Step 1: Split into meaningful sentences
        let sentences = this.splitIntoSentences(text);
        
        // Step 2: Score sentences by educational importance
        const scoredSentences = sentences.map(sentence => ({
            sentence: sentence.trim(),
            score: this.scoreEducationalSentence(sentence),
            wordCount: sentence.split(/\s+/).length,
            complexity: this.assessComplexity(sentence)
        }));
        
        // Step 3: Filter and sort sentences based on level
        let importantSentences = scoredSentences
            .filter(item => item.wordCount <= levelConfig.maxWordsPerSentence)
            .filter(item => item.complexity <= levelConfig.complexityThreshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, levelConfig.maxSentences)
            .sort((a, b) => scoredSentences.indexOf(a) - scoredSentences.indexOf(b)) // Maintain order
            .map(item => this.simplifySentenceStructure(item.sentence, level));

        // Step 4: Ensure we have content
        if (importantSentences.length === 0 && sentences.length > 0) {
            importantSentences = sentences
                .slice(0, levelConfig.maxSentences)
                .map(sentence => this.simplifySentenceStructure(sentence, level));
        }

        // Step 5: Reconstruct text with proper flow
        let simplifiedText = this.reconstructText(importantSentences, level);
        
        return simplifiedText || "Unable to simplify this text while preserving educational value.";
    },

    splitIntoSentences(text) {
        // Advanced sentence splitting that handles abbreviations
        return text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=[.!?])\s+/)
                  .filter(sentence => sentence.trim().length > 0)
                  .map(sentence => sentence.trim());
    },

    scoreEducationalSentence(sentence) {
        let score = 0;
        
        // Base score
        score += 1;
        
        // Position scoring (intro and conclusion are important)
        // This would be more sophisticated in full implementation
        
        // Length scoring (medium length sentences are often most important)
        const wordCount = sentence.split(/\s+/).length;
        if (wordCount >= 8 && wordCount <= 25) score += 2;
        if (wordCount > 35) score -= 1;
        
        // Educational keyword scoring
        const educationalKeywords = [
            'education', 'learn', 'teach', 'student', 'teacher', 'school', 
            'knowledge', 'understand', 'important', 'key', 'concept', 'study',
            'research', 'development', 'skill', 'ability', 'critical', 'analysis'
        ];
        
        educationalKeywords.forEach(keyword => {
            if (sentence.toLowerCase().includes(keyword)) score += 1;
        });
        
        // Question sentences are often important
        if (sentence.includes('?')) score += 1;
        
        // Definition sentences are important
        if (sentence.toLowerCase().includes('is defined as') || 
            sentence.toLowerCase().includes('means that') ||
            sentence.toLowerCase().includes('refers to')) {
            score += 2;
        }
        
        return score;
    },

    assessComplexity(sentence) {
        let complexity = 0;
        
        // Word length complexity
        const words = sentence.split(/\s+/);
        const longWords = words.filter(word => word.length > 8).length;
        complexity += (longWords / words.length) * 0.5;
        
        // Sentence structure complexity
        const clauses = sentence.split(/[,;:]/).length;
        complexity += (clauses - 1) * 0.2;
        
        // Technical term density
        const technicalTerms = words.filter(word => 
            word.length > 10 || /[A-Z]{2,}/.test(word)
        ).length;
        complexity += (technicalTerms / words.length) * 0.3;
        
        return Math.min(1, complexity);
    },

    simplifySentenceStructure(sentence, level) {
        let simplified = sentence;

        // Replace complex words with simpler alternatives
        simplified = this.replaceComplexWords(simplified);
        
        // Simplify sentence structure based on level
        if (level === 'heavy') {
            simplified = this.heavySimplification(simplified);
        } else if (level === 'medium') {
            simplified = this.mediumSimplification(simplified);
        }
        
        // Remove unnecessary phrases
        simplified = this.removeUnnecessaryPhrases(simplified);
        
        return simplified.trim();
    },

    replaceComplexWords(text) {
        const simpleWordMap = {
            'utilize': 'use',
            'approximately': 'about',
            'assistance': 'help',
            'commence': 'start',
            'demonstrate': 'show',
            'numerous': 'many',
            'require': 'need',
            'terminate': 'end',
            'additional': 'more',
            'facilitate': 'help',
            'implement': 'start',
            'objective': 'goal',
            'participate': 'join',
            'purchase': 'buy',
            'remainder': 'rest',
            'sufficient': 'enough',
            'terminology': 'words',
            'utilization': 'use',
            'verify': 'check',
            'acquire': 'get',
            'conclude': 'end',
            'construct': 'build',
            'determine': 'find',
            'establish': 'set up',
            'indicate': 'show',
            'observe': 'see',
            'obtain': 'get',
            'possess': 'have',
            'prioritize': 'rank',
            'require': 'need',
            'reside': 'live',
            'select': 'choose',
            'terminate': 'end',
            'transmit': 'send',
            'undertake': 'do'
        };

        let simplified = text;
        Object.keys(simpleWordMap).forEach(complexWord => {
            const regex = new RegExp(`\\b${complexWord}\\b`, 'gi');
            simplified = simplified.replace(regex, simpleWordMap[complexWord]);
        });

        return simplified;
    },

    heavySimplification(sentence) {
        let simplified = sentence;
        
        // Remove relative clauses
        simplified = simplified.replace(/, which [^,]+,/g, '');
        simplified = simplified.replace(/, that [^,]+,/g, '');
        
        // Simplify verb phrases
        simplified = simplified.replace(/is able to/g, 'can');
        simplified = simplified.replace(/has the ability to/g, 'can');
        simplified = simplified.replace(/is capable of/g, 'can');
        
        return simplified;
    },

    mediumSimplification(sentence) {
        let simplified = sentence;
        
        // Replace passive voice with active (basic)
        simplified = simplified.replace(/(\w+) is (\w+)ed by/g, '$2 $1s');
        simplified = simplified.replace(/(\w+) are (\w+)ed by/g, '$2 $1');
        
        return simplified;
    },

    removeUnnecessaryPhrases(sentence) {
        let simplified = sentence;
        
        const unnecessaryPhrases = [
            'it is important to note that',
            'it should be noted that',
            'in order to',
            'due to the fact that',
            'with regard to',
            'with respect to',
            'in the process of',
            'at this point in time',
            'for the purpose of',
            'in the event that'
        ];

        unnecessaryPhrases.forEach(phrase => {
            const regex = new RegExp(phrase, 'gi');
            simplified = simplified.replace(regex, '');
        });

        return simplified;
    },

    reconstructText(sentences, level) {
        if (sentences.length === 0) return '';
        
        let text = sentences.join('. ');
        
        // Ensure proper capitalization and punctuation
        if (text.length > 0) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
            if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
                text += '.';
            }
        }
        
        // Add educational transition for heavy simplification
        if (level === 'heavy' && sentences.length > 1) {
            text = "Here are the main points:\n\n" + text;
        }
        
        return text;
    },

    addEducationalExamples(simplifiedText, level) {
        const levelInfo = this.simplificationLevels[level];
        const examples = [
            `\n\n💡 Example: ${levelInfo.example}`,
            `\n\n📚 Tip: This simplified version maintains key educational concepts while being easier to understand.`,
            `\n\n🎓 Educational Note: Simplified text helps diverse learners grasp complex concepts more easily.`
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        return simplifiedText + randomExample;
    },

    calculateImprovementStats(original, simplified) {
        const originalWords = original.split(/\s+/).length;
        const simplifiedWords = simplified.split(/\s+/).length;
        const originalSentences = this.splitIntoSentences(original).length;
        const simplifiedSentences = this.splitIntoSentences(simplified).length;
        
        const wordReduction = Math.round((1 - simplifiedWords / originalWords) * 100);
        const sentenceReduction = Math.round((1 - simplifiedSentences / originalSentences) * 100);
        
        // Calculate readability improvement (simplified metric)
        const originalComplexity = this.assessOverallComplexity(original);
        const simplifiedComplexity = this.assessOverallComplexity(simplified);
        const improvement = Math.round(((originalComplexity - simplifiedComplexity) / originalComplexity) * 100);
        
        return {
            originalWords,
            simplifiedWords,
            originalSentences,
            simplifiedSentences,
            wordReduction,
            sentenceReduction,
            improvement: Math.max(0, improvement),
            originalComplexity: Math.round(originalComplexity * 100),
            simplifiedComplexity: Math.round(simplifiedComplexity * 100)
        };
    },

    assessOverallComplexity(text) {
        const sentences = this.splitIntoSentences(text);
        if (sentences.length === 0) return 0;
        
        const totalComplexity = sentences.reduce((sum, sentence) => {
            return sum + this.assessComplexity(sentence);
        }, 0);
        
        return totalComplexity / sentences.length;
    },

    formatOutput(simplifiedText, level, stats) {
        const levelInfo = this.simplificationLevels[level];
        
        return `🎯 ${levelInfo.name.toUpperCase()}

${simplifiedText}

---
📊 SIMPLIFICATION RESULTS:

• Word count reduced by ${stats.wordReduction}% (${stats.simplifiedWords} vs ${stats.originalWords} words)
• Sentence count reduced by ${stats.sentenceReduction}% (${stats.simplifiedSentences} vs ${stats.originalSentences} sentences)
• Readability improved by ${stats.improvement}%
• Complexity reduced from ${stats.originalComplexity}% to ${stats.simplifiedComplexity}%

💡 ${levelInfo.example}

🎓 This simplified version maintains educational value while being more accessible to diverse learners.`;
    },

    formatWithOriginal(original, simplified, stats) {
        return `📖 ORIGINAL TEXT (${stats.originalWords} words, ${stats.originalSentences} sentences):
${original}

🎯 SIMPLIFIED VERSION (${stats.simplifiedWords} words, ${stats.simplifiedSentences} sentences):
${simplified}

---
📊 TRANSFORMATION SUMMARY:

• Word reduction: ${stats.wordReduction}%
• Sentence reduction: ${stats.sentenceReduction}%
• Readability improvement: ${stats.improvement}%
• Complexity reduction: ${stats.originalComplexity}% → ${stats.simplifiedComplexity}%

💡 Educational Impact: This simplified version makes the content more accessible while preserving key learning concepts for diverse student needs.`;
    },

    showSimplificationStats(stats) {
        console.log('Simplification Statistics:', stats);
    },

    // Public method to check if module is ready
    isReady() {
        return this.isInitialized;
    }
};

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.simplificationModule && !window.simplificationModule.isInitialized) {
            window.simplificationModule.init();
        }
    }, 100);
});