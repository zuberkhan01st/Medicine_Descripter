const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

// Configure multer for file upload
const upload = multer({
    dest: 'uploads/', // Store images temporarily
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Invalid file type. Only image files are allowed.'));
        }
        cb(null, true);
    }
});

// Function to perform OCR and clean the extracted text
async function extractTextFromImage(imagePath) {
    try {
        const ocrResult = await Tesseract.recognize(imagePath, 'eng');
        const extractedText = ocrResult.data.text.trim();
        return extractedText;
    } catch (error) {
        throw new Error('Error performing OCR on the image.');
    }
}

module.exports = {
    upload,
    extractTextFromImage
};
