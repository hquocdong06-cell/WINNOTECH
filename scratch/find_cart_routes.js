const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
lines.forEach((line, idx) => {
  if (line.includes('/cart')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
