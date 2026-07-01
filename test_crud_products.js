const http = require('http');

async function runTest() {
  console.log('--- TESTING CRUD PRODUCTS ---');
  
  const API_URL = 'http://localhost:3000/products';
  let createdProductId = null;

  try {
    // 1. POST - Create
    console.log('\n[1] POST /products - Creating a product...');
    const createRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Product ' + Date.now(),
        price: 150000,
        sale: 10,
        thumnail: 'https://example.com/thumb.jpg',
        description: 'Test Description',
        stock: 50,
        status: 'active'
      })
    });
    const createData = await createRes.json();
    console.log('POST Response:', createData);
    if (createData.success && createData.data && createData.data.product) {
      createdProductId = createData.data.product._id;
    }

    // 2. GET - List
    console.log('\n[2] GET /products - Fetching products...');
    const listRes = await fetch(API_URL);
    const listData = await listRes.json();
    console.log('GET Response (Success):', listData.success, 'Count:', listData.SoLuongSP);

    if (createdProductId) {
      // 3. PUT - Update
      console.log('\n[3] PUT /products/' + createdProductId + ' - Updating product...');
      const updateRes = await fetch(API_URL + '/' + createdProductId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Test Product ' + Date.now(),
          price: 200000
        })
      });
      const updateData = await updateRes.json();
      console.log('PUT Response:', updateData);

      // 4. DELETE - Delete
      console.log('\n[4] DELETE /products/' + createdProductId + ' - Deleting product...');
      const deleteRes = await fetch(API_URL + '/' + createdProductId, {
        method: 'DELETE'
      });
      const deleteData = await deleteRes.json();
      console.log('DELETE Response:', deleteData);
    }
    
    console.log('\n--- TEST COMPLETED ---');
  } catch (error) {
    console.error('Test failed:', error);
  }
}
runTest();
