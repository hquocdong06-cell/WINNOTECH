#!/bin/bash
# cURL Commands để test Product API
# Run: bash product_api_curl_test.sh

API_URL="http://localhost:3000/api/product"

echo "==============================================="
echo "🧪 PRODUCT API TEST USING cURL"
echo "==============================================="

# 1. GET ALL PRODUCTS
echo ""
echo "1️⃣ GET ALL PRODUCTS"
echo "---"
curl -X GET "$API_URL" -H "Content-Type: application/json"
echo ""
echo ""

# 2. CREATE PRODUCT
echo "2️⃣ CREATE PRODUCT"
echo "---"
CREATE_RESPONSE=$(curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CPU Intel Core i9-13900K",
    "slug": "cpu-intel-core-i9-13900k",
    "sale": 15,
    "thumnail": "https://example.com/cpu-i9.jpg",
    "description": "Bộ xử lý tối cao cấp",
    "short_desc": "Intel Core i9 Gen 13 - 24 cores",
    "status": "active"
  }')
echo "$CREATE_RESPONSE"
echo ""
echo ""

# Extract ID từ response (simplified - trong thực tế nên dùng jq)
PRODUCT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4 | head -1)

echo "Product ID: $PRODUCT_ID"
echo ""

# 3. GET PRODUCT BY ID (nếu có ID)
if [ ! -z "$PRODUCT_ID" ]; then
  echo "3️⃣ GET PRODUCT BY ID"
  echo "---"
  curl -X GET "$API_URL/$PRODUCT_ID" -H "Content-Type: application/json"
  echo ""
  echo ""

  # 4. UPDATE PRODUCT
  echo "4️⃣ UPDATE PRODUCT"
  echo "---"
  curl -X PUT "$API_URL/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "CPU Intel Core i9-13900K Updated",
      "sale": 20
    }'
  echo ""
  echo ""

  # 5. DELETE PRODUCT
  echo "5️⃣ DELETE PRODUCT"
  echo "---"
  curl -X DELETE "$API_URL/$PRODUCT_ID" -H "Content-Type: application/json"
  echo ""
  echo ""
fi

echo "✅ TEST COMPLETED"
