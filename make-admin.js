#!/bin/bash

# Script untuk menjadikan user sebagai admin
# Penggunaan: node make-admin.js

EMAIL="user.lang@gmail.com"
API_URL="http://localhost:3000"

echo "🔧 Mengubah role user menjadi admin..."
echo "📧 Email: $EMAIL"
echo "🌐 API: $API_URL"

# Kirim request ke API
RESPONSE=$(curl -s -X POST "$API_URL/api/admin/make-admin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"targetRole\":\"admin\"}")

echo "📥 Response:"
echo "$RESPONSE"

# Cek jika berhasil menggunakan parsing sederhana
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ User berhasil dijadikan admin!"
    echo "🎯 Sekarang user dapat mengakses admin dashboard"
    echo "🔗 Akses: $API_URL/admin"
else
    echo "❌ Gagal menjadikan user sebagai admin"
    echo "🔍 Periksa response di atas untuk detail error"
fi