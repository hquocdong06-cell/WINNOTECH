const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const lines = content.split('\n');

const routeList = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/app\.(get|post|put|delete|patch)\s*\(\s*(\[[^\]]+\]|"[^"]+"|'[^']+'|`[^`]+`)/i);
  if (match) {
    const method = match[1].toUpperCase();
    let rawEndpoint = match[2];
    
    // Parse endpoints if array or string
    let endpoints = [];
    try {
      if (rawEndpoint.startsWith('[')) {
        endpoints = JSON.parse(rawEndpoint.replace(/'/g, '"'));
      } else {
        endpoints = [rawEndpoint.replace(/['"`]/g, '')];
      }
    } catch (e) {
      endpoints = [rawEndpoint.replace(/['"`\[\]]/g, '').trim()];
    }

    // Look at surrounding comments (up to 5 lines above)
    let comments = [];
    for (let c = Math.max(0, i - 5); c < i; c++) {
      const cLine = lines[c].trim();
      if (cLine.startsWith('//') || cLine.startsWith('*') || cLine.startsWith('/*')) {
        comments.push(cLine.replace(/^\/\/\s*|^\/\*\s*|^\*\s*/, ''));
      }
    }

    // Look at code block for auth middleware
    const codeBlock = lines.slice(i, Math.min(lines.length, i + 15)).join('\n');
    const hasCheckLogin = codeBlock.includes('checklogin') || line.includes('checklogin');
    const isAdminRoute = line.includes('/admin') || codeBlock.includes('/admin') || comments.join(' ').toLowerCase().includes('admin');

    routeList.push({
      lineNum: i + 1,
      method,
      endpoints,
      comments: comments.join(' | '),
      hasCheckLogin,
      isAdminRoute,
      lineContent: line.trim()
    });
  }
}

console.log(`Extracted ${routeList.length} route blocks.`);
fs.writeFileSync(path.join(__dirname, 'detailed_routes.json'), JSON.stringify(routeList, null, 2));
