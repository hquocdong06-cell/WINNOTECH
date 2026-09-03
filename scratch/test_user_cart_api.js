const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const http = require('http');

const privateKey = fs.readFileSync(path.join(__dirname, '../key/privatekey.pem'));
const token = jwt.sign(
  { _id: '6a4526f8ce1fcefd309b8eec', email: 'hquocdong06@gmail.com' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '7d' }
);

console.log('Generated token for hquocdong06');

// 1. Test GET /cart
function testGetCart() {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/cart',
    method: 'GET',
    headers: {
      'Cookie': `token=${token}`
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('GET /cart Status:', res.statusCode);
      console.log('GET /cart Body:', data);
    });
  });
  req.end();
}

testGetCart();
