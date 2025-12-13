export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>

      <p className="text-muted-foreground mb-6">
        Dengan menggunakan layanan Slowly API, Anda menyetujui ketentuan berikut:
      </p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>1. Anda bertanggung jawab sepenuhnya atas penggunaan API Key Anda.</p>
        <p>2. Penyalahgunaan API akan menyebabkan suspensi akun.</p>
        <p>3. Tidak boleh menggunakan API untuk spam, fraud, atau aktivitas ilegal.</p>
        <p>4. Harga dan paket dapat berubah sewaktu-waktu dengan pemberitahuan.</p>
        <p>5. Tidak ada refund untuk paket berjalan.</p>
      </div>
    </div>
  );
}