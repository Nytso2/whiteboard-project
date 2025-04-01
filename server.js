const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth'); // Add express-basic-auth for authentication

const app = express();
const port = 3000;

// Middleware to handle JSON bodies
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));  // Serve static files like index.html

// Use basic authentication for the /admin route
app.use('/admin', basicAuth({
    users: { 'admin': 'artclass111' }, // Replace with your chosen username and password
    challenge: true, // Ask for authentication
    realm: 'Admin Area'
}));

// Serve images from the 'drawings' folder
app.use('/drawings', express.static(path.join(__dirname, 'drawings')));

// Endpoint to handle drawing submission
app.post('/submitDrawing', (req, res) => {
    const { drawing } = req.body;
    const base64Data = drawing.replace(/^data:image\/png;base64,/, "");

    // Generate a unique filename using timestamp
    const fileName = `drawing_${Date.now()}.png`;
    const filePath = path.join(__dirname, 'drawings', fileName);  // Save in the 'drawings' folder

    // Create the 'drawings' folder if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'drawings'))) {
        fs.mkdirSync(path.join(__dirname, 'drawings'));
    }

    // Save the drawing as a PNG file
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            res.status(500).json({ message: "Error saving drawing." });
        } else {
            res.status(200).json({ message: `Drawing saved as ${fileName}`, imageUrl: `/drawings/${fileName}` });
        }
    });
});

// Endpoint to list all submitted drawings
app.get('/listDrawings', (req, res) => {
    const drawingsFolder = path.join(__dirname, 'drawings');
    fs.readdir(drawingsFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Error reading drawings folder." });
        }

        // Filter only PNG files (your image files)
        const images = files.filter(file => file.endsWith('.png'));

        // Return the list of images (with public URLs)
        const imageUrls = images.map(image => `/drawings/${image}`);
        res.status(200).json({ images: imageUrls });
    });
});

// Admin dashboard to display images
app.get('/admin', (req, res) => {
    const drawingsFolder = path.join(__dirname, 'drawings');
    fs.readdir(drawingsFolder, (err, files) => {
        if (err) {
            return res.status(500).send("Error reading drawings folder.");
        }

        const images = files.filter(file => file.endsWith('.png'));
        const imageUrls = images.map(image => `/drawings/${image}`);

        let htmlContent = `<h1>Admin Dashboard</h1><ul>`;
        
        imageUrls.forEach(image => {
            htmlContent += `<li><img src="${image}" alt="Drawing" width="200" /></li>`;
        });

        htmlContent += `</ul>`;
        res.send(htmlContent);
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
