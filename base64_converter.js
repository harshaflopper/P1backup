const fs = require('fs');
const path = 'D:\\wrappedwebsite\\managemnt\\image.png';

try {
    if (fs.existsSync(path)) {
        const bitmap = fs.readFileSync(path);
        const base64 = Buffer.from(bitmap).toString('base64');
        console.log('DATA_URI_START');
        console.log(`data:image/png;base64,${base64}`);
        console.log('DATA_URI_END');
    } else {
        console.error('File not found:', path);
    }
} catch (e) {
    console.error('Error:', e.message);
}
