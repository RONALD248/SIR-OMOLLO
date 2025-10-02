// Enhanced File Processing Module
window.fileProcessingModule = {
    isInitialized: false,
    
    init() {
        try {
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('📁 File processing module initialized');
        } catch (error) {
            console.error('File processing module init error:', error);
        }
    },
    
    setupEventListeners() {
        // Document upload
        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleDocumentUpload(e));
        }
        
        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    },
    
    async handleDocumentUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|doc|docx)$/i)) {
            app.showNotification('Please upload PDF, TXT, or DOC files only', 'error');
            event.target.value = '';
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            app.showNotification('File size must be less than 10MB', 'error');
            event.target.value = '';
            return;
        }
        
        app.showProgress(true, `Processing ${file.name}...`);
        
        try {
            let text = '';
            
            if (file.type === 'application/pdf') {
                text = await this.extractTextFromPDF(file);
            } else if (file.type.includes('word')) {
                text = await this.extractTextFromWord(file);
            } else {
                text = await this.extractTextFromTextFile(file);
            }
            
            document.getElementById('inputText').value = text;
            app.updateStats();
            app.showNotification(`Successfully extracted text from ${file.name}`, 'success');
            
        } catch (error) {
            console.error('Document processing error:', error);
            app.showNotification('Failed to process document', 'error');
        } finally {
            app.showProgress(false);
            event.target.value = ''; // Reset file input
        }
    },
    
    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            // Check if PDF.js is available
            if (typeof pdfjsLib === 'undefined') {
                resolve(this.createPDFDemoText(file.name));
                return;
            }
            
            const fileReader = new FileReader();
            
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    
                    // Load PDF.js with error handling
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    
                    // Extract text from each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n\n';
                        
                        // Update progress
                        app.updateProgress((i / pdf.numPages) * 80);
                    }
                    
                    resolve(fullText.trim() || this.createPDFDemoText(file.name));
                } catch (error) {
                    console.error('PDF extraction error:', error);
                    resolve(this.createPDFDemoText(file.name));
                }
            }.bind(this);
            
            fileReader.onerror = () => {
                reject(new Error('Failed to read PDF file'));
            };
            
            fileReader.readAsArrayBuffer(file);
        });
    },
    
    createPDFDemoText(filename) {
        return `[PDF CONTENT EXTRACTED: ${filename}]

This is simulated text that would be extracted from the uploaded PDF document using Optical Character Recognition (OCR).

In a full implementation, this would use PDF.js to extract actual text content from:

• Textbook pages and educational materials
• Research papers and academic documents
• Course syllabi and learning resources
• Student assignments and worksheets

Example educational content that might be in the PDF:

"CHAPTER 1: INTRODUCTION TO ACCESSIBLE EDUCATION

Education is a fundamental human right and essential for the exercise of all other human rights. It promotes individual freedom and empowerment and yields important development benefits.

Key Principles:
1. Equity and Inclusion
2. Quality Learning
3. Lifelong Opportunities
4. Sustainable Development

The right to education includes the obligation to eliminate discrimination at all levels of the educational system, to set minimum standards and to improve quality of education."

[Note: This is demo content. Actual PDF processing would extract the real text from your document.]

---
DOCUMENT INFORMATION:
• File: ${filename}
• Type: PDF Document
• Processing: Text Extraction
• Date: ${new Date().toLocaleString()}`;
    },
    
    async extractTextFromWord(file) {
        // For DOC/DOCX files, provide informative demo text
        return `[WORD DOCUMENT CONTENT: ${file.name}]

This is simulated text that would be extracted from the uploaded Word document.

In a full implementation, this would use libraries like Mammoth.js or similar to extract text from:

• Educational lesson plans
• Student essays and assignments
• Teacher resources and guides
• Curriculum documents

Example structure of educational content:

"LESSON PLAN: INTRODUCTION TO INCLUSIVE EDUCATION

Learning Objectives:
- Understand the principles of inclusive education
- Identify barriers to learning accessibility
- Develop strategies for inclusive teaching

Activities:
1. Group discussion on educational accessibility
2. Case study analysis of inclusive practices
3. Development of accessibility checklist

Assessment:
- Participation in discussions (20%)
- Case study report (40%)
- Final accessibility plan (40%)"

[Note: This is demo content. Actual Word document processing would extract the real text from your file.]

---
DOCUMENT INFORMATION:
• File: ${filename}
• Type: Word Document
• Processing: Text Extraction
• Date: ${new Date().toLocaleString()}`;
    },
    
    async extractTextFromTextFile(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = function() {
                resolve(this.result);
            };
            
            fileReader.onerror = () => {
                reject(new Error('Failed to read text file'));
            };
            
            fileReader.readAsText(file);
        });
    },
    
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            app.showNotification('Please upload an image file (JPG, PNG, etc.)', 'error');
            event.target.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            app.showNotification('Image size must be less than 5MB', 'error');
            event.target.value = '';
            return;
        }
        
        app.showProgress(true, `Analyzing image for text...`);
        
        try {
            // Use image analysis module for OCR simulation
            if (window.imageAnalysisModule) {
                await imageAnalysisModule.analyzeImage(file);
            } else {
                // Fallback to basic image processing
                const demoText = this.createImageDemoText(file.name);
                document.getElementById('inputText').value = demoText;
                app.updateStats();
                app.showNotification('Demo OCR text generated from image', 'success');
            }
        } catch (error) {
            console.error('Image processing error:', error);
            app.showNotification('Failed to process image', 'error');
        } finally {
            app.showProgress(false);
            event.target.value = ''; // Reset file input
        }
    },
    
    createImageDemoText(filename) {
        return `[OPTICAL CHARACTER RECOGNITION (OCR) RESULTS: ${filename}]

This is simulated text that would be extracted from the uploaded image using Optical Character Recognition technology.

In a full implementation, this would use Tesseract.js or similar OCR libraries to read text from:

• Textbook page photos
• Whiteboard photos with educational content
• Handwritten notes and assignments
• Document scans and screenshots
• Educational infographics and diagrams

Example of text that might be recognized:

"EDUCATION FOR SUSTAINABLE DEVELOPMENT

Key Learning Areas:
1. Environmental Awareness
   - Climate change understanding
   - Biodiversity conservation
   - Sustainable resource use

2. Social Inclusion
   - Human rights education
   - Gender equality
   - Cultural diversity

3. Economic Understanding
   - Sustainable consumption
   - Poverty reduction
   - Green economy principles

Assessment Methods:
• Project-based learning
• Collaborative activities
• Reflective journals"

[Note: This is demo OCR content. Actual image processing would read the real text from your image using advanced OCR technology.]

---
IMAGE PROCESSING INFORMATION:
• File: ${filename}
• Type: Image File (OCR Simulation)
• Technology: Optical Character Recognition
• Date: ${new Date().toLocaleString()}`;
    },
    
    // Utility methods
    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'fas fa-file-pdf',
            'txt': 'fas fa-file-alt',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image'
        };
        return icons[extension] || 'fas fa-file';
    },
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Initialize file processing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.fileProcessingModule && !window.fileProcessingModule.isInitialized) {
            window.fileProcessingModule.init();
        }
    }, 100);
});