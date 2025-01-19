const express = require('express');
const router = express.Router();
const fs = require('fs');

// Import controllers
const { upload, extractTextFromImage } = require('../controllers/ocrController');
const gemini_controller = require('../controllers/gemini_controller');

// Route for handling image upload, OCR, and Gemini API call
router.post('/process-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Path to the uploaded image
        const imagePath = req.file.path;

        // Extract text from image using OCR controller
        let extractedText;
        try {
            extractedText = await extractTextFromImage(imagePath);
        } catch (ocrError) {
            fs.unlinkSync(imagePath); // Clean up the uploaded image
            return res.status(500).json({ error: 'Error performing OCR on the image.', details: ocrError.message });
        }

        if (!extractedText) {
            fs.unlinkSync(imagePath); // Clean up the uploaded image
            return res.status(400).json({ error: 'No text extracted from the image.' });
        }

        // Clean up the extracted text (remove special characters, extra spaces, etc.)
        const cleanedText = extractedText
            .replace(/®|[\n|\r|\t|\s]+/g, ' ')
            .replace(/[^\w\s.]/g, '')
            .trim();

        const refinedText = cleanedText.split(' ').slice(0, 3).join(' ');

        // Construct the message for Gemini API
        const message = `Please provide structured simple small points information on the following medicine: ${refinedText}. Its name, Its use, its issues, its containt ?`;

        let geminiResponse;
        try {
            // Get response from Gemini API using gemini controller
            geminiResponse = await gemini_controller.generateInfo(message);
        } catch (geminiError) {
            fs.unlinkSync(imagePath); // Clean up the uploaded image file
            return res.status(500).json({ error: 'Error generating content from Gemini API.', details: geminiError.message });
        }

        // Clean up the uploaded image file after processing
        fs.unlinkSync(imagePath);

        // Extract detailed response from Gemini API
        const geminiData = geminiResponse.candidates[0].content.parts[0].text;
        const medicineInfo = {
            title: "Orlistat Capsules USP",
            details: geminiData
        };

        // Return the processed response to the client in a cleaner format
        res.status(200).json({
            message: 'Successfully processed the image and retrieved information.',
            extractedText,
            medicineInfo
        });

    } catch (error) {
        console.error("Error processing the image or Gemini API call:", error);
        if (req.file) fs.unlinkSync(req.file.path); // Clean up the uploaded image file
        res.status(500).json({ error: error.message || 'An error occurred while processing the request.' });
    }
});

module.exports = router;
