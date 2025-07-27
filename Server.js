const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load or initialize pixel grid
let pixelGrid = {};
const SAVE_FILE = './pixels.json';

// Load existing data
if (fs.existsSync(SAVE_FILE)) {
    pixelGrid = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
}

// GET current grid
app.get('/pixels', (req, res) => {
    res.json(pixelGrid);
});

// SET a pixel
app.post('/setPixel', (req, res) => {
    const { x, y, color } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const key = `${x},${y}`;
    pixelGrid[key] = color;

    // Save to disk
    fs.writeFileSync(SAVE_FILE, JSON.stringify(pixelGrid));

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Pixel server running on port ${PORT}`);
});
