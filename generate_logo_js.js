const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'sit-logo.png');
const outputPath = path.join(__dirname, 'client', 'src', 'utils', 'logoBase64.js');

try {
    const fileData = fs.readFileSync(imagePath);
    const base64Image = fileData.toString('base64');
    const content = `export const LOGO_BASE64 = "data:image/png;base64,${base64Image}";\n`;

    fs.writeFileSync(outputPath, content);
    console.log('Successfully created logoBase64.js');
} catch (err) {
    console.error('Error:', err);
}
