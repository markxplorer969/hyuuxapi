#!/bin/bash

# Script untuk menjadikan user sebagai admin
# Penggunaan: ./make-admin.sh

EMAIL="user.lang@gmail.com"
API_URL="http://localhost:3000"

echo "🔧 Mengubah role user menjadi admin..."
echo "📧 Email: $EMAIL"
echo "🌐 API: $API_URL"

# Kirim request ke API
echo "📥 Mengirim request..."
HTTP_STATUS=$(curl -s -o /dev/stdout -w "%{http_code}" \
  -X POST "$API_URL/api/admin/make-admin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"targetRole\":\"admin\"}")

echo "📥 HTTP Status: $HTTP_STATUS"

# Cek jika berhasil
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ User berhasil dijadikan admin!"
    echo "🎯 Sekarang user dapat mengakses admin dashboard"
    echo "🔗 Akses: $API_URL/admin"
    echo ""
    echo "📋 Detail:"
    echo "   - Email: $EMAIL"
    echo "   - Role: admin"
    echo "   - Dashboard: $API_URL/admin"
else
    echo "❌ Gagal menjadikan user sebagai admin"
    echo "🔍 HTTP Status: $HTTP_STATUS"
    echo "📋 Periksa API server logs untuk detail error"
fi