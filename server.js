const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { createCanvas } = require('canvas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SAVE_FILE = './pixels.json';
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const IMAGE_PATH = './public/canvas.png';

let pixelGrid = {};

// Load existing pixels
if (fs.existsSync(SAVE_FILE)) {
    pixelGrid = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
}

// Create PNG and save to disk
function generatePNG() {
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Draw all pixels
    for (const key in pixelGrid) {
        const [x, y] = key.split(',').map(Number);
        const color = pixelGrid[key];
        ctx.fillStyle = `#${color}`;
        ctx.fillRect(x, y, 1, 1);
    }

    const buffer = canvas.toBuffer('image/png');

    // Ensure ./public folder exists
    fs.mkdirSync('./public', { recursive: true });

    fs.writeFileSync(IMAGE_PATH, buffer);
    console.log('PNG canvas generated');
}

// Endpoint to get current grid data
app.get('/pixels', (req, res) => {
    res.json(pixelGrid);
});

// Endpoint to set a pixel and update PNG
app.post('/setPixel', (req, res) => {
    const { x, y, color } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const key = `${x},${y}`;
    pixelGrid[key] = color;

    fs.writeFileSync(SAVE_FILE, JSON.stringify(pixelGrid));
    generatePNG();

    res.json({ success: true });
});

// Serve the image as static file
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Pixel server running on port ${PORT}`);
    generatePNG(); // Generate on startup
});
