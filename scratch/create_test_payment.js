const http = require('http');

const payload = JSON.stringify({
  Name: "NGUYEN VAN A",
  Phone: "0987654321",
  Adress: "123 Cầu Giấy, Hà Nội",
  items: [
    {
      variant_id: "6a79ded9d9c7c632c6aed804",
      quantity: 1
    }
  ]
});

const req = http.request('http://localhost:3000/api/create-qr', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('CREATE_PAYMENT_RESULT:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(payload);
req.end();
