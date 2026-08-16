const http = require('http');

const data = JSON.stringify({
  message: "Tư vấn cho mình CPU tầm trung",
  history: [
    {
      role: 'model',
      text: 'Xin chào! Mình là Trợ lý AI của WINNOTech. 🤖'
    }
  ]
});

const req = http.request('http://localhost:3000/api/chatbot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Response Status:", res.statusCode);
    console.log("Response Body:", body);
  });
});

req.on('error', (e) => {
  console.error("Request Error:", e.message);
});

req.write(data);
req.end();
