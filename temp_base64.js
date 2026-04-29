const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'sit-logo.png');

try {
    const fileData = fs.readFileSync(filePath);
    const base64Image = fileData.toString('base64');
    console.log(`data:image/png;base64,${base64Image}`);
} catch (err) {
    console.error('Error reading file:', err);
}
