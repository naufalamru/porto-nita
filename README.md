# React Portfolio Starter

Starter website portofolio dengan React + Vite, CRUD admin, Supabase Database/Auth, dan deployment gratis di Vercel.

## Fitur

- Halaman publik portofolio: About, Projects, Experience, Education, Skills, Certificates, Contact.
- Admin login menggunakan Supabase Auth.
- CRUD untuk Projects, Experience, Education, Skills, dan Certificates.
- Edit profil utama (nama, headline, deskripsi, kontak, foto, LinkedIn, GitHub).
- Data tersimpan di Supabase, bukan hanya di browser.
- Responsif untuk desktop dan mobile.

## 1. Persiapan

Install Node.js versi LTS dari https://nodejs.org lalu ekstrak folder project ini.

Buka terminal pada folder project:

```bash
npm install
```

## 2. Buat database Supabase (gratis)

1. Buat project di https://supabase.com.
2. Buka **SQL Editor** pada dashboard Supabase.
3. Buka file `supabase-schema.sql` dari project ini, salin seluruh isinya, lalu jalankan di SQL Editor.
4. Buka **Project Settings > API** (atau Connect) dan salin Project URL serta anon/public key.
5. Buka **Authentication > Users**, lalu buat user admin dengan email dan password yang kamu tentukan.
6. Buka **Authentication > Sign In / Providers** atau pengaturan Auth dan nonaktifkan public sign-ups. Jangan menyediakan pendaftaran akun publik.

> Penting: schema ini memberi hak tulis kepada user yang berhasil login. Karena itu, nonaktifkan public sign-ups dan buat hanya akun admin yang kamu kendalikan. Jangan pernah memasukkan `service_role` key ke frontend.

## 3. Hubungkan React ke Supabase

Di root project (sejajar dengan `package.json`), buat file bernama `.env`:

```env
VITE_SUPABASE_URL=https://PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=ANON_PUBLIC_KEY
```

Isi dengan nilai dari project Supabase. Gunakan anon/public key, bukan service_role key.

## 4. Jalankan di komputer

```bash
npm run dev
```

Buka alamat lokal yang ditampilkan Vite (biasanya http://localhost:5173).

Klik **Admin** di website, lalu login menggunakan akun admin Supabase. Dari dashboard tersebut kamu bisa mengisi profil dan melakukan CRUD konten.

## 5. Publish gratis ke Vercel

1. Buat akun di https://vercel.com.
2. Upload project ke GitHub (buat repository baru, lalu push seluruh isi folder project).
3. Di Vercel pilih **Add New > Project**, lalu import repository GitHub.
4. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
5. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = URL project Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon/public key Supabase
6. Klik Deploy.

Setelah deploy, website mendapat domain `*.vercel.app`. Setiap push perubahan kode ke branch yang terhubung akan memicu deployment baru.

## 6. Cara mengisi konten

- Buka website publik dan klik **Admin**.
- Login menggunakan akun admin.
- Pilih **Profile** untuk mengisi nama, headline, about, email, tautan sosial, dan URL foto.
- Pilih kategori konten lalu klik **Add new**.
- Isi informasi, kemudian klik **Save item**.
- Gunakan ikon pensil untuk edit dan ikon tempat sampah untuk menghapus.

Untuk foto proyek dan foto profil, versi awal ini menggunakan URL gambar. Kamu bisa mengunggah gambar ke layanan hosting gambar atau Supabase Storage, lalu tempel URL publiknya di kolom URL gambar.

## Catatan paket gratis

Vercel Hobby dan Supabase Free memiliki batas pemakaian dan kebijakan masing-masing yang dapat berubah. Untuk portofolio pribadi dengan trafik ringan, paket gratis biasanya memadai, tetapi cek dashboard pemakaian masing-masing layanan. Database Supabase Free dapat memiliki kebijakan pause untuk project yang tidak aktif.
