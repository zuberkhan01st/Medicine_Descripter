require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Initialize app
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

app.get('/', async=(req,res)=>{
    res.json({message:"Welcome to the server!"})
})

// Routes
app.use('/api/gemini', require('./routes/geminiRoute'));
app.use('/api', require('./routes/userRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Hello, the server is live!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
