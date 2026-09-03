const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/cart',
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', err => console.error(err));
req.end();
