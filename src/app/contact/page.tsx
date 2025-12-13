export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-muted-foreground mb-6">
        Jika Anda membutuhkan bantuan, silakan hubungi kami melalui salah satu kontak berikut:
      </p>

      <div className="space-y-4 text-sm">
        <p><b>Email:</b> admin@slowlyapi.com</p>
        <p><b>WhatsApp:</b> <a className="text-blue-500" href="https://wa.me/6285123456">+62 851-2345-6xxx</a></p>
        <p><b>Support Hours:</b> 09:00 - 22:00 WIB</p>
      </div>
    </div>
  );
}