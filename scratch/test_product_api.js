const http = require('http');

http.get('http://localhost:3000/products/gskill-trident-z5-rgb-ddr5-32gb', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API success:', json.success);
      console.log('Product:', json.data?.product?.name);
      console.log('Variants count:', json.data?.Variants?.length);
      console.log('Variants:', JSON.stringify(json.data?.Variants, null, 2));
      console.log('Attributes:', JSON.stringify(json.data?.Attributes, null, 2));
    } catch (e) {
      console.error('Error:', e, data);
    }
  });
});
