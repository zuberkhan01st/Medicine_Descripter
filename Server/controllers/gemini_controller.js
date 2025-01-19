// controllers/geminiController.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI with the Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Function to interact with the Gemini API and generate content
const generateInfo = async (message) => {
    try {
        // Ensure the message is a string before passing it to the Gemini model
        const prompt = String(message);  // Convert to string to avoid any non-iterable issues

        // Send the message to the Gemini API
        const response = await model.generateContent(prompt);

        // Extract and return the response text
        return response.response;
    } catch (error) {
        console.error("Error generating text from Gemini API:", error);
        throw new Error('Error generating content from Gemini API');
    }
};

module.exports = {
    generateInfo
};
