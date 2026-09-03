async function test() {
  try {
    const res = await fetch('http://localhost:3000/products');
    const data = await res.json();
    console.log('Total products returned:', data.data?.length);
    const withSales = data.data.filter(p => (p.sold_count || 0) > 0);
    console.log('Products with sold_count > 0:', withSales.length);
    console.log('Sample top 10 sold products:');
    data.data
      .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
      .slice(0, 10)
      .forEach((p, idx) => {
        console.log((idx + 1) + '. [Đã bán: ' + p.sold_count + '] ' + p.name);
      });
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
