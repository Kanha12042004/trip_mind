const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gemini API Configuration — load from environment for safety
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

// Trip Planning Endpoint
app.post('/api/plan-trip', async (req, res) => {
    try {
        const { location, budget, interests, duration } = req.body;

        if (!location || !budget || !interests || interests.length === 0) {
            return res.status(400).json({
                error: 'Please provide location, budget, and at least one interest.'
            });
        }

        const prompt = `You are an expert travel planner AI. Create a detailed trip plan for the destination the user wants to visit.

USER PREFERENCES:
- Destination: ${location}
- Budget Level: ${budget}
- Interests: ${interests.join(', ')}
- Trip Duration: ${duration || 'Flexible'}

IMPORTANT: Focus ONLY on ${location}. Do NOT suggest other destinations. Provide recommendations specifically for ${location}.

Please provide:
1. **About ${location}** - Brief overview and why it's a great choice for their interests

2. **Top 10 Places to Visit in ${location}** matching their interests:
   - Name of the place
   - Why to visit
   - Best time to go
   - Entry fee (if any)

3. **Best Activities in ${location}** for their interests (${interests.join(', ')})

4. **Where to Stay** - Accommodation recommendations based on their ${budget} budget

5. **Local Food to Try** - Must-try dishes and best restaurants/cafes

6. **Daily Budget Breakdown** for ${budget} level:
   - Accommodation
   - Food
   - Transport
   - Activities

7. **Pro Tips** for visiting ${location}

Format your response in a clear, organized way with proper headings and bullet points. Make it exciting and inspiring!`;

        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY environment variable not set');
            return res.status(500).json({ error: 'Server misconfiguration: missing GEMINI_API_KEY' });
        }

        const response = await fetch(GEMINI_URL(GEMINI_API_KEY), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 7000
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API Error:', errorData);
            throw new Error('Failed to get response from AI');
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            res.json({
                success: true,
                recommendations: aiResponse
            });
        } else {
            throw new Error('Invalid response from AI');
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to generate trip recommendations. Please try again.'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(port, attempts = 0) {
    const server = app.listen(port, () => {
        console.log(`🌍 Tripmind running at http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            if (attempts < 3) {
                console.warn(`Port ${port} in use, trying ${port + 1}...`);
                startServer(port + 1, attempts + 1);
            } else {
                console.error(`Port ${port} still in use after ${attempts} attempts. Exiting.`);
                process.exit(1);
            }
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

startServer(PORT);
