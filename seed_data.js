/**
 * SEED DATA - Tạo dữ liệu mẫu vào database
 * Run: node seed_data.js
 * 
 * Script này sẽ:
 * 1. Kết nối tới MongoDB
 * 2. Xóa tất cả users cũ
 * 3. Tạo 5 users mẫu
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

// Dữ liệu mẫu
const sampleUsers = [
    {
        name: "Admin WINNOTech",
        email: "admin@winnotech.com",
        password: "Admin@123456",
        role: "admin",
        status: "active"
    },
    {
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        password: "User@123456",
        role: "user",
        status: "active"
    },
    {
        name: "Trần Thị B",
        email: "tranthib@gmail.com",
        password: "User@123456",
        role: "user",
        status: "active"
    },
    {
        name: "Phạm Minh C",
        email: "phamminhc@gmail.com",
        password: "Seller@123456",
        role: "seller",
        status: "active"
    },
    {
        name: "Hoàng Huy D",
        email: "hoanghuyd@gmail.com",
        password: "User@123456",
        role: "user",
        status: "inactive"
    }
];

// Main function
async function seedData() {
    console.log('🚀 BẮT ĐẦU TẠO DỮ LIỆU MẪU\n');
    console.log('⏳ Đang kết nối tới server...\n');

    try {
        // Tạo users
        console.log('📝 Đang tạo users...\n');
        
        let createdUsers = [];

        for (let i = 0; i < sampleUsers.length; i++) {
            const user = sampleUsers[i];
            console.log(`[${i + 1}/${sampleUsers.length}] Tạo: ${user.email}`);
            
            try {
                const response = await makeRequest('POST', '/api/account', user);
                
                console.log(`   Status: ${response.status}`);
                
                if (response.status === 201 && response.body.success) {
                    createdUsers.push({
                        id: response.body.data._id,
                        email: response.body.data.email,
                        name: response.body.data.name
                    });
                    console.log(`✅ Thành công! ID: ${response.body.data._id}`);
                } else {
                    console.log(`⚠️  Lỗi Status: ${response.status}`);
                    console.log(`   Message: ${response.body?.message || 'No message'}`);
                    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
                }
            } catch (error) {
                console.log(`❌ Lỗi kết nối: ${error.message}`);
            }
            console.log('');
        }

        // Hiển thị thông tin
        console.log('═══════════════════════════════════════');
        console.log('✅ HOÀN THÀNH TẠO DỮ LIỆU');
        console.log('═══════════════════════════════════════\n');
        
        console.log(`📊 Tổng cộng tạo: ${createdUsers.length} users\n`);
        
        console.log('📋 DANH SÁCH USERS ĐÃ TẠO:');
        console.log('─────────────────────────────────────\n');
        
        createdUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   ID: ${user.id}\n`);
        });

        console.log('═══════════════════════════════════════');
        console.log('🎯 HƯỚNG DẪN TEST API');
        console.log('═══════════════════════════════════════\n');
        
        console.log('1️⃣  GET tất cả users:');
        console.log('   curl http://localhost:3000/api/account\n');
        
        if (createdUsers.length > 0) {
            console.log('2️⃣  GET user theo ID:');
            console.log(`   curl http://localhost:3000/api/account/${createdUsers[0].id}\n`);
            
            console.log('3️⃣  UPDATE user:');
            console.log(`   curl -X PUT http://localhost:3000/api/account/${createdUsers[0].id} \\`);
            console.log(`     -H "Content-Type: application/json" \\`);
            console.log(`     -d '{"name":"Tên mới"}'\\n`);
            
            console.log('4️⃣  DELETE user:');
            console.log(`   curl -X DELETE http://localhost:3000/api/account/${createdUsers[0].id}\n`);
        }

        console.log('═══════════════════════════════════════');
        console.log('💡 HOẶC SỬ DỤNG CHROME CONSOLE:');
        console.log('═══════════════════════════════════════\n');
        console.log('F12 → Console → Copy-paste code test\n');

    } catch (error) {
        console.error('❌ LỖI:', error.message);
    }
}

// Chạy
seedData();
