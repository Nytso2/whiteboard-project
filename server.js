const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));  // Serve static files like index.html

// Endpoint to handle drawing submission
app.post('/submitDrawing', (req, res) => {
    const { drawing } = req.body;
    const base64Data = drawing.replace(/^data:image\/png;base64,/, "");

    const filePath = path.join(__dirname, 'drawing.png');  // Save the drawing as 'drawing.png'

    // Save the drawing as a PNG file
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            res.status(500).json({ message: "Error saving drawing." });
        } else {
            res.status(200).json({ message: "Drawing saved successfully!" });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
