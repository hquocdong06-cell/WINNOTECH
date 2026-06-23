/**
 * API Test File - Test tất cả endpoints
 * Run: node api_test.js
 * 
 * Base URL: http://localhost:3000
 * Endpoints: /api/account
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

// Test data
let testUserId = null;
const sampleUsers = [
    {
        name: "Nguyễn Văn Admin",
        email: "admin@winnotech.com",
        password: "AdminPass123!",
        role: "admin",
        status: "active"
    },
    {
        name: "Trần Thị User",
        email: "user@winnotech.com",
        password: "UserPass123!",
        role: "user",
        status: "active"
    },
    {
        name: "Phạm Minh Seller",
        email: "seller@winnotech.com",
        password: "SellerPass123!",
        role: "seller",
        status: "active"
    }
];

// Main test function
async function runTests() {
    console.log('🚀 BẮT ĐẦU TEST API\n');
    console.log(`📍 Base URL: ${BASE_URL}/api/account\n`);

    try {
        // TEST 1: CREATE USERS
        console.log('═══════════════════════════════════════');
        console.log('TEST 1: CREATE USERS (POST /api/account)');
        console.log('═══════════════════════════════════════\n');

        for (let i = 0; i < sampleUsers.length; i++) {
            const user = sampleUsers[i];
            console.log(`Creating user ${i + 1}/${sampleUsers.length}: ${user.email}`);
            
            const response = await makeRequest('POST', '/api/account', user);
            console.log(`Status: ${response.status}`);
            console.log(`Response: ${JSON.stringify(response.body, null, 2)}\n`);

            if (response.status === 201 && response.body.success) {
                testUserId = response.body.data._id;
            }
        }

        // TEST 2: GET ALL USERS
        console.log('═══════════════════════════════════════');
        console.log('TEST 2: GET ALL USERS (GET /api/account)');
        console.log('═══════════════════════════════════════\n');

        const allUsersResponse = await makeRequest('GET', '/api/account');
        console.log(`Status: ${allUsersResponse.status}`);
        console.log(`Response: ${JSON.stringify(allUsersResponse.body, null, 2)}\n`);

        // TEST 3: GET USER BY ID
        if (testUserId) {
            console.log('═══════════════════════════════════════');
            console.log(`TEST 3: GET USER BY ID (GET /api/account/${testUserId})`);
            console.log('═══════════════════════════════════════\n');

            const userResponse = await makeRequest('GET', `/api/account/${testUserId}`);
            console.log(`Status: ${userResponse.status}`);
            console.log(`Response: ${JSON.stringify(userResponse.body, null, 2)}\n`);

            // TEST 4: UPDATE USER
            console.log('═══════════════════════════════════════');
            console.log(`TEST 4: UPDATE USER (PUT /api/account/${testUserId})`);
            console.log('═══════════════════════════════════════\n');

            const updateData = {
                name: "Nguyễn Văn Admin Updated",
                status: "inactive"
            };

            const updateResponse = await makeRequest('PUT', `/api/account/${testUserId}`, updateData);
            console.log(`Status: ${updateResponse.status}`);
            console.log(`Response: ${JSON.stringify(updateResponse.body, null, 2)}\n`);

            // TEST 5: DELETE USER
            console.log('═══════════════════════════════════════');
            console.log(`TEST 5: DELETE USER (DELETE /api/account/${testUserId})`);
            console.log('═══════════════════════════════════════\n');

            const deleteResponse = await makeRequest('DELETE', `/api/account/${testUserId}`);
            console.log(`Status: ${deleteResponse.status}`);
            console.log(`Response: ${JSON.stringify(deleteResponse.body, null, 2)}\n`);
        }

        // TEST 6: ERROR HANDLING - Invalid email
        console.log('═══════════════════════════════════════');
        console.log('TEST 6: ERROR HANDLING - Missing fields');
        console.log('═══════════════════════════════════════\n');

        const invalidData = {
            email: "test@example.com"
            // Missing name and password
        };

        const errorResponse = await makeRequest('POST', '/api/account', invalidData);
        console.log(`Status: ${errorResponse.status}`);
        console.log(`Response: ${JSON.stringify(errorResponse.body, null, 2)}\n`);

        console.log('✅ HẾT CÁC TEST\n');
        console.log('📝 GHI CHÚ:');
        console.log('- Hãy chắc chắn MongoDB đang chạy');
        console.log('- Hãy chắc chắn server đang chạy (npm start)');
        console.log('- Check .env file để đảm bảo MONGODB_URI đúng');

    } catch (error) {
        console.error('❌ LỖI:', error.message);
    }
}

// Chạy tests
runTests();
