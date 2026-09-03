const http = require('http');

http.get('http://localhost:3000/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const monitors = (json.data || []).filter(p => {
        const catName = (p.cat_id?.name || p.cat_id?.slug || '').toLowerCase();
        return catName.includes('man-hinh') || catName.includes('màn hình') || (p.name || '').includes('Màn hình');
      });
      console.log(`Found ${monitors.length} monitor products from /products`);
      if (monitors.length > 0) {
        const sample = monitors[0];
        console.log(`Sample Monitor: [${sample._id}] slug: "${sample.slug}", name: "${sample.name}"`);
        
        // Fetch detailed product
        http.get(`http://localhost:3000/products/${sample.slug || sample._id}`, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            const detailJson = JSON.parse(data2);
            console.log('Detail API success:', detailJson.success);
            const p = detailJson.data?.product;
            const variants = detailJson.data?.Variants || [];
            console.log(`Product: ${p?.name}`);
            console.log(`Variants count: ${variants.length}`);
            if (variants.length > 0) {
              console.log(`Variant 0 has ${variants[0].Attributes?.length || 0} attributes:`);
              (variants[0].Attributes || []).forEach(a => {
                console.log(`  - ${a.attribute_name}: ${a.value_name}`);
              });
            }
          });
        });
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', err => {
  console.error('API request error:', err.message);
});
