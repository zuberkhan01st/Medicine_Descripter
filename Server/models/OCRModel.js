const mongoose = require('mongoose');

const OCRSchema = new mongoose.Schema({
  imagePath: String,
  extractedText: String,
  geminiResponse: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OCRRecord', OCRSchema);
