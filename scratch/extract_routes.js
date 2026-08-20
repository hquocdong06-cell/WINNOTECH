const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

// Regex to capture app.get/post/put/delete/patch calls
// e.g., app.get('/api/products', checklogin, async (req, res) => ...
// e.g., app.get(["/admin/banners", "/api/banners"], ...)

const lines = content.split('\n');
const routes = [];

lines.forEach((line, index) => {
  const match = line.match(/app\.(get|post|put|delete|patch)\s*\(\s*(\[[^\]]+\]|"[^"]+"|'[^']+'|`[^`]+`)/i);
  if (match) {
    const method = match[1].toUpperCase();
    let rawEndpoint = match[2];
    
    // Check if line or surrounding lines use checklogin middleware
    // We look at the line or function arguments
    const isAuth = line.includes('checklogin') || line.includes('checkAdmin') || line.includes('authMiddleware');
    const isAdmin = line.includes('/admin') || line.includes('checkAdmin') || line.includes('admin');
    
    routes.push({
      lineNum: index + 1,
      method,
      rawEndpoint,
      fullLine: line.trim(),
    });
  }
});

console.log(`Total route declarations found: ${routes.length}`);
fs.writeFileSync(path.join(__dirname, 'routes_dump.json'), JSON.stringify(routes, null, 2));
