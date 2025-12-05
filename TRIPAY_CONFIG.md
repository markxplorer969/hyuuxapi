# Tripay Configuration Documentation

## 📋 Configuration Details

Berikut adalah konfigurasi Tripay yang telah diperbarui untuk project HyuuxAPI:

### 🔑 Kredensial
- **API Key**: `wQpoX52cDDYAzHSqbbP4olgBi72LzulFZZIgupvn`
- **Private Key**: `jdxUW-1FPAr-NHdvs-YU9cN-LPG3z`
- **Merchant ID**: `T29243`

### 🌐 Environment
- **Mode**: Production (Real Mode)
- **Base URL**: `https://tripay.co.id/api`

## 🛠️ Fitur yang Tersedia

### 1. **createQris()**
Membuat pembayaran QRIS untuk upgrade plan
- Parameters: `userId`, `planId`, `amount`, `customer_name`, `customer_email`
- Returns: Object dengan `merchant_ref` dan response dari Tripay

### 2. **checkTransactionStatus()**
 Mengecek status transaksi
- Parameters: `reference` (merchant_ref)
- Returns: Detail transaksi dari Tripay

### 3. **getPaymentChannels()**
 Mendapatkan daftar channel pembayaran yang tersedia
- Returns: Array dari payment channels

### 4. **calculateFee()**
 Menghitung fee untuk setiap channel pembayaran
- Parameters: `amount`, `channel`
- Returns: Fee dalam Rupiah

## 💰 Fee Structure

| Channel | Fee Type | Rate |
|---------|----------|------|
| QRIS | Percentage | 0.7% (min Rp 1,000) |
| OVO/DANA/SHOPEEPAY | Percentage | 2% (min Rp 1,000) |
| Virtual Account | Percentage | 2% (min Rp 2,500) |
| Alfamart/Indomaret | Fixed | Rp 5,000 |

## 🔧 Environment Variables

Konfigurasi tersimpan di `.env`:
```env
TRIPAY_API_KEY=wQpoX52cDDYAzHSqbbP4olgBi72LzulFZZIgupvn
TRIPAY_PRIVATE_KEY=jdxUW-1FPAr-NHdvs-YU9cN-LPG3z
TRIPAY_MERCHANT_ID=T29243
```

## ✅ Testing Status

- ✅ API Key: Terkonfigurasi dengan benar
- ✅ Private Key: Terkonfigurasi dengan benar  
- ✅ Merchant ID: Terkonfigurasi dengan benar
- ✅ Signature Generation: Berfungsi dengan baik
- ✅ Fee Calculation: Berfungsi dengan benar

## 🚀 Penggunaan

```typescript
import { Tripay } from '@/lib/tripay';

const tripay = new Tripay();

// Membuat pembayaran QRIS
const payment = await tripay.createQris({
  userId: 'user123',
  planId: 'PREMIUM',
  amount: 50000,
  customer_name: 'John Doe',
  customer_email: 'john@example.com'
});

// Mengecek status
const status = await tripay.checkTransactionStatus(payment.merchant_ref);
```

## 📝 Catatan

- Konfigurasi menggunakan mode production
- Callback URL otomatis mengarah ke `/api/payment/callback`
- Return URL mengarah ke `/payment/success`
- Signature menggunakan HMAC-SHA256 untuk keamanan