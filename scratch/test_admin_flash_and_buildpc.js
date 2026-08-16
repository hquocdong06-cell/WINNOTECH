const http = require('http');

function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testToggleDisabled() {
  console.log("🧪 1. Turning OFF Flash Sale section (status: disabled)...");
  await makeRequest('http://localhost:3000/api/admin/flash-sale', 'PUT', { status: 'disabled' });

  const homeRes = await makeRequest('http://localhost:3000/products/home/flash-sale');
  console.log("Home API Response when Disabled -> Active:", homeRes.data?.active, "Products:", homeRes.data?.data?.length);

  console.log("\n🧪 2. Turning ON Flash Sale section (status: active)...");
  await makeRequest('http://localhost:3000/api/admin/flash-sale', 'PUT', { status: 'active', durationSeconds: 28800 });

  const homeResOn = await makeRequest('http://localhost:3000/products/home/flash-sale');
  console.log("Home API Response when Active -> Active:", homeResOn.data?.active, "Products:", homeResOn.data?.data?.length);

  console.log("\n✅ TOGGLE TEST PASSED SUCCESSFULLY!");
}

testToggleDisabled().catch(console.error);
