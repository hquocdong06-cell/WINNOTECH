/**
 * Product API Test File - Test tất cả endpoints sản phẩm
 * Run: node product_test.js
 * 
 * Base URL: http://localhost:3000
 * Endpoints: /api/product
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Hàm gửi request
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: responseData ? JSON.parse(responseData) : null
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Sample product data
const sampleProducts = [
    {
        name: "CPU Intel Core i9-13900K",
        slug: "cpu-intel-core-i9-13900k",
        sale: 15,
        thumnail: "https://example.com/cpu-i9.jpg",
        description: "Bộ xử lý tối cao cấp cho gaming và công việc",
        short_desc: "Intel Core i9 Gen 13 - 24 cores",
        status: "active"
    },
    {
        name: "GPU NVIDIA RTX 4090",
        slug: "gpu-nvidia-rtx-4090",
        sale: 10,
        thumnail: "https://example.com/rtx-4090.jpg",
        description: "Card đồ họa gaming flagship 2024",
        short_desc: "NVIDIA RTX 4090 - 24GB GDDR6X",
        status: "active"
    },
    {
        name: "Motherboard ASUS ROG",
        slug: "motherboard-asus-rog",
        sale: 5,
        thumnail: "https://example.com/asus-rog.jpg",
        description: "Bo mạch chủ cao cấp cho gaming",
        short_desc: "ASUS ROG MAXIMUS Z790",
        status: "active"
    }
];

let testProductId = null;

// Main test function
async function runTests() {
    console.log('🚀 BẮT ĐẦU TEST PRODUCT API\n');
    console.log(`📍 Base URL: ${BASE_URL}/api/product\n`);

    try {
        // TEST 1: CREATE PRODUCTS
        console.log('═══════════════════════════════════════════════════════════');
        console.log('TEST 1: CREATE PRODUCTS (POST /api/product)');
        console.log('═══════════════════════════════════════════════════════════\n');

        for (let i = 0; i < sampleProducts.length; i++) {
            const product = sampleProducts[i];
            console.log(`Creating product ${i + 1}/${sampleProducts.length}: ${product.name}`);
            
            const response = await makeRequest('POST', '/api/product', product);
            console.log(`Status: ${response.status}`);
            console.log(`Response: ${JSON.stringify(response.body, null, 2)}\n`);

            if (response.status === 201 && response.body.success) {
                testProductId = response.body.data._id;
            }
        }

        // TEST 2: GET ALL PRODUCTS
        console.log('═══════════════════════════════════════════════════════════');
        console.log('TEST 2: GET ALL PRODUCTS (GET /api/product)');
        console.log('═══════════════════════════════════════════════════════════\n');

        const allProductsResponse = await makeRequest('GET', '/api/product');
        console.log(`Status: ${allProductsResponse.status}`);
        console.log(`Response: ${JSON.stringify(allProductsResponse.body, null, 2)}\n`);

        // TEST 3: GET PRODUCT BY ID
        if (testProductId) {
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`TEST 3: GET PRODUCT BY ID (GET /api/product/${testProductId})`);
            console.log('═══════════════════════════════════════════════════════════\n');

            const productResponse = await makeRequest('GET', `/api/product/${testProductId}`);
            console.log(`Status: ${productResponse.status}`);
            console.log(`Response: ${JSON.stringify(productResponse.body, null, 2)}\n`);

            // TEST 4: GET PRODUCT BY SLUG
            const productData = productResponse.body.data;
            if (productData && productData.slug) {
                console.log('═══════════════════════════════════════════════════════════');
                console.log(`TEST 4: GET PRODUCT BY SLUG (GET /api/product/slug/${productData.slug})`);
                console.log('═══════════════════════════════════════════════════════════\n');

                const slugResponse = await makeRequest('GET', `/api/product/slug/${productData.slug}`);
                console.log(`Status: ${slugResponse.status}`);
                console.log(`Response: ${JSON.stringify(slugResponse.body, null, 2)}\n`);
            }

            // TEST 5: UPDATE PRODUCT
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`TEST 5: UPDATE PRODUCT (PUT /api/product/${testProductId})`);
            console.log('═══════════════════════════════════════════════════════════\n');

            const updateData = {
                name: "CPU Intel Core i9-13900K Updated",
                sale: 20,
                status: "inactive"
            };

            const updateResponse = await makeRequest('PUT', `/api/product/${testProductId}`, updateData);
            console.log(`Status: ${updateResponse.status}`);
            console.log(`Response: ${JSON.stringify(updateResponse.body, null, 2)}\n`);

            // TEST 6: DELETE PRODUCT
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`TEST 6: DELETE PRODUCT (DELETE /api/product/${testProductId})`);
            console.log('═══════════════════════════════════════════════════════════\n');

            const deleteResponse = await makeRequest('DELETE', `/api/product/${testProductId}`);
            console.log(`Status: ${deleteResponse.status}`);
            console.log(`Response: ${JSON.stringify(deleteResponse.body, null, 2)}\n`);
        }

        // TEST 7: ERROR HANDLING - Missing required fields
        console.log('═══════════════════════════════════════════════════════════');
        console.log('TEST 7: ERROR HANDLING - Missing required fields');
        console.log('═══════════════════════════════════════════════════════════\n');

        const invalidProduct = {
            description: "Product without name and slug"
        };

        const errorResponse = await makeRequest('POST', '/api/product', invalidProduct);
        console.log(`Status: ${errorResponse.status}`);
        console.log(`Response: ${JSON.stringify(errorResponse.body, null, 2)}\n`);

        // TEST 8: Duplicate slug test
        console.log('═══════════════════════════════════════════════════════════');
        console.log('TEST 8: DUPLICATE SLUG - Create two products with same slug');
        console.log('═══════════════════════════════════════════════════════════\n');

        const product1 = {
            name: "Test Product 1",
            slug: "test-product-unique-slug-123",
            description: "First test product"
        };

        const product2 = {
            name: "Test Product 2",
            slug: "test-product-unique-slug-123", // Same slug
            description: "Second test product"
        };

        const res1 = await makeRequest('POST', '/api/product', product1);
        console.log(`Create Product 1 - Status: ${res1.status}`);
        console.log(`Response: ${JSON.stringify(res1.body, null, 2)}\n`);

        const res2 = await makeRequest('POST', '/api/product', product2);
        console.log(`Create Product 2 (duplicate slug) - Status: ${res2.status}`);
        console.log(`Response: ${JSON.stringify(res2.body, null, 2)}\n`);

        console.log('✅ TEST HOÀN THÀNH');

    } catch (error) {
        console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', error);
    }
}

// Run tests
runTests();
