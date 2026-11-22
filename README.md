# Career Match — Layanan BK Karier Kelas XII SMA

Website statis (HTML + JS modul, tanpa build). Dua mode:

| Mode | Kapan aktif | Data |
|---|---|---|
| **Demo** | `js/config.js` masih berisi `ISI_...` | localStorage browser (untuk presentasi/uji) |
| **Firebase** | `js/config.js` sudah diisi | Firebase Authentication + Cloud Firestore |

## Struktur
```
index.html            kerangka halaman
css/style.css         tema
js/config.js          firebaseConfig  <- ISI DI SINI
js/data.js            data awal: 48 butir, 21 kartu karier, kelas, pengumuman
js/store.js           penyimpanan (demo & Firebase, API sama)
js/app.js             antarmuka dan logika
firestore.rules       Security Rules (tempel ke Firebase Console)
vercel.json           header keamanan dasar untuk Vercel
```

## Menjalankan lokal (mode demo)
```
python3 -m http.server 8080      # lalu buka http://localhost:8080
```
Siswa: `CM-0101`, PIN `1234`, kelas XII-IPA-1. Staf: `guru@demo.id` atau `admin@demo.id`, sandi `demo123`.
Reset data demo: hapus kunci `cm_demo_v2` di localStorage.

---

## Menyiapkan Firebase (sekali saja)

1. **Buat proyek** di console.firebase.google.com (Google Analytics boleh dimatikan).
2. **Tambah Web App** (ikon `</>`), salin `firebaseConfig` ke `js/config.js`.
3. **Authentication → Sign-in method → aktifkan hanya "Email/Password".** Jangan aktifkan Anonymous.
4. **Firestore Database → Create database** (mode produksi, lokasi `asia-southeast2` Jakarta bila ada).
5. **Firestore → Rules** → tempel seluruh isi `firestore.rules` → **Publish**.
6. **Buat Admin sekolah pertama (manual, karena belum ada admin yang bisa membuatnya):**
   - Authentication → Users → *Add user* (email + sandi, min. 6 karakter). Salin **User UID**.
   - Firestore → *Start collection* `staff` → Document ID = UID tadi, field:
     `email` (string), `name` (string), `role` = `admin` (string), `off` = `false` (boolean).
7. Deploy ke Vercel (bagian berikut). **Tambahkan domain Vercel** di Authentication → Settings → **Authorized domains**.
8. Buka situs → **Login Staf** → masuk sebagai admin → menu **Konten → Impor data awal** (mengisi 48 butir, 21 kartu, kelas, pengumuman).
9. Menu **Akun dan Kode Siswa**: tambah akun Guru BK, buat kode siswa per kelas, cetak lembar kode.

### Cara kerja login siswa (tanpa email)
Admin membuat kode+PIN; aplikasi membuat akun Firebase dengan email turunan `cm-0412-1234@siswa.career-match.id` (email palsu, tidak ada surat yang dikirim) dan sandi turunan dari PIN. Data siswa disimpan pada `students/{kode}` dan hanya bisa dibaca akun yang tercatat di `roster/{kode}`. Reset PIN membuat akun baru dan memindahkan kepemilikan kode, sehingga data siswa tetap ada.

### Pemisahan akses (ditegakkan `firestore.rules`)
- **Siswa**: hanya data miliknya.
- **Guru BK**: konsultasi, data yang dibagikan siswa, dan skor agregat per kelas (tanpa kode siswa). Tidak bisa membaca `students` maupun `roster`.
- **Admin sekolah**: `roster` (kode, kelas, status), akun staf, konten. Tidak bisa membaca `students`, `consults`, `entries`, `shares`.
- Grafik kelas baru tampil bila minimal 5 siswa mengisi; batas ini ditegakkan di antarmuka (Rules tidak dapat menghitung jumlah dokumen).

### Batasan yang perlu diketahui
- Karena pembuatan akun dilakukan dari browser, **pendaftaran Email/Password pada proyek tidak bisa dimatikan**. Orang luar yang tahu konfigurasi dapat membuat akun kosong, tetapi akun itu tidak punya akses ke data apa pun (hanya dapat menulis dokumen `entries` anonim). Untuk keamanan lebih kuat, pindahkan pembuatan akun ke Cloud Functions (Admin SDK).
- Firebase membatasi pembuatan akun per IP per jam; buat kode siswa per kelas (maks. 40 sekali klik).
- Akun Auth yang sudah tidak terpakai (hasil reset PIN / hapus staf) tidak ikut terhapus dari Firebase Authentication tanpa Admin SDK; akun itu tidak punya hak akses. Hapus manual di Console bila perlu.
- Sesi disimpan per tab (`browserSessionPersistence`), cocok untuk komputer sekolah bersama.

## Deploy ke Vercel
1. Push folder ini ke GitHub (repo baru).
2. vercel.com → **Add New → Project** → impor repo.
3. **Framework Preset: Other**, Build Command kosong, Output Directory kosong (root). Klik **Deploy**.
4. Tambahkan domain Vercel ke **Authorized domains** Firebase (langkah 7 di atas).
5. Setiap `git push` akan otomatis deploy ulang.

CLI alternatif: `npm i -g vercel && vercel --prod` dari folder ini.

## Embed Google Sites (opsional)
Sisipkan → Sematkan → Dengan URL → alamat Vercel. Bila storage pihak ketiga diblokir, sesi memakai memori sementara.

## Catatan isi
- Bank butir (48) disusun sendiri; **wajib ditelaah ahli BK** sebelum dipakai pada siswa (sesuai proposal).
- Kode Holland pada 21 kartu adalah rancangan awal untuk ditinjau ahli.
- Tautan sumber resmi diperiksa 22 Nov 2026. Lima tautan dibuka langsung (SNPMB, KarirHub, Prakerja, SSCASN, BNSP); tautan **KIP Kuliah, KIP Kuliah PTKIN (Kemenag), dan PDDikti** diambil dari sumber resmi/berita tetapi belum dibuka langsung: **klik ketiganya sendiri**, lalu perbarui tanggal akses di menu Konten.
- Seri skor pada kode tiga huruf diurutkan menurut R-I-A-S-E-C; sebutkan aturan ini bila ditanya.
