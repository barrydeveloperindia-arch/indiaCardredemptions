const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../assets/images/splash-icon.png');
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);
console.log('Header bytes:', buffer.slice(0, 12).toString('hex'));
if (buffer.slice(0, 4).toString('ascii') === 'RIFF') {
  console.log('Detected WEBP signature (RIFF/WEBP)');
} else if (buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
  console.log('Detected PNG signature');
} else {
  console.log('Unknown format');
}
