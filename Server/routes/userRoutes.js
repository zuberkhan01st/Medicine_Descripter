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
        console.log(extractedText);
        
        /*
        // Clean up the extracted text (remove special characters, extra spaces, etc.)
        const cleanedText = extractedText
            .replace(/®|[\n|\r|\t|\s]+/g, ' ')
            .replace(/[^\w\s.]/g, '')
            .trim();
        
        const refinedText = cleanedText.split(' ').slice(0, 3).join(' ');
        console.log(refinedText);
        */
        // Construct the message for Gemini API
        const message = `Given the following unstructured and incomplete text data, provide a well-formatted and structured response. Use contextual understanding to identify key information such as the product name, description, uses, issues, precautions, and any additional information. If parts of the text are unclear, make logical assumptions while clearly marking such assumptions. Structure the response with proper headings, subheadings, bullet points, and lists for clarity. Use bold text for headings and proper formatting to improve readability for medicine: ${extractedText}.`;
        
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

        // Return the processed response to the client
        res.status(200).json({
            message: 'Successfully processed the image and retrieved information.',
            extractedText,
            geminiResponse  // Send the response from Gemini
        });

    } catch (error) {
        console.error("Error processing the image or Gemini API call:", error);
        if (req.file) fs.unlinkSync(req.file.path); // Clean up the uploaded image file
        res.status(500).json({ error: error.message || 'An error occurred while processing the request.' });
    }
});

module.exports = router;
