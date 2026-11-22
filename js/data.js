/* DATA AWAL Career Match (dipakai mode demo dan tombol "Impor data awal" pada mode Firebase).
   Bank butir disusun sendiri (48 butir, 8 per tipe RIASEC) dan WAJIB ditelaah ahli BK sebelum dipakai pada siswa.
   Kode Holland pada kartu karier adalah rancangan awal yang perlu ditinjau ahli.
   Tautan diperiksa pada tanggal pada kolom v; periksa ulang secara berkala lewat menu Konten. */

const SN = { t: 'SNPMB (seleksi masuk PTN)', u: 'https://snpmb.id' };
const PD = { t: 'PDDikti (data program studi)', u: 'https://pddikti.kemdiktisaintek.go.id' };
const KIP = { t: 'KIP Kuliah', u: 'https://kip-kuliah.kemdiktisaintek.go.id' };
const KIPK = { t: 'KIP Kuliah PTKIN (Kemenag)', u: 'https://kip-kuliah.kemenag.go.id' };
const KH = { t: 'KarirHub Kemnaker', u: 'https://karirhub.kemnaker.go.id' };
const PK = { t: 'Kartu Prakerja', u: 'https://www.prakerja.go.id' };
const BN = { t: 'BNSP (sertifikasi kompetensi)', u: 'https://bnsp.go.id' };
const SS = { t: 'SSCASN BKN', u: 'https://sscasn.bkn.go.id' };
const V = '2026-11-22';
const T0 = Date.parse('2026-11-22T00:00:00+07:00');

const RAW = {
  R: ['Saya senang memperbaiki atau merakit benda, misalnya sepeda atau perangkat elektronik.',
      'Saya senang bekerja di luar ruangan dengan alat atau bahan.',
      'Saya senang menggunakan peralatan seperti obeng, bor, atau mesin untuk membuat sesuatu.',
      'Saya senang merawat tanaman, hewan, atau kebun.',
      'Saya senang mengendarai atau memperbaiki kendaraan.',
      'Saya senang praktik langsung daripada hanya mendengarkan penjelasan.',
      'Saya senang membangun atau menata sesuatu, misalnya rak, lemari, atau kandang.',
      'Saya senang kegiatan fisik seperti mendaki, berkemah, atau bekerja di lapangan.'],
  I: ['Saya senang mencari tahu penyebab suatu masalah sampai tuntas.',
      'Saya senang membaca data atau grafik untuk memahami suatu kejadian.',
      'Saya senang melakukan percobaan untuk membuktikan suatu dugaan.',
      'Saya senang membaca artikel atau buku tentang cara kerja sesuatu.',
      'Saya senang memecahkan soal logika atau teka-teki yang rumit.',
      'Saya senang menganalisis informasi sebelum mengambil kesimpulan.',
      'Saya senang mempelajari cara kerja tubuh manusia, alam, atau teknologi.',
      'Saya senang mencari pola dari angka atau data.'],
  A: ['Saya senang merancang atau menggambar.',
      'Saya senang menulis cerita atau membuat konten kreatif.',
      'Saya senang bermain musik, bernyanyi, atau membuat lagu.',
      'Saya senang mengedit foto atau video.',
      'Saya senang mendekorasi ruangan atau menata tampilan sesuatu agar indah.',
      'Saya senang tampil di depan orang, misalnya lewat drama, musik, atau tari.',
      'Saya senang mengungkapkan perasaan melalui tulisan, gambar, atau karya lain.',
      'Saya senang menciptakan ide baru yang berbeda dari kebiasaan.'],
  S: ['Saya senang membantu teman yang sedang kesulitan belajar.',
      'Saya senang menjadi relawan dalam kegiatan sosial.',
      'Saya senang mendengarkan teman yang sedang bercerita tentang masalahnya.',
      'Saya senang menjelaskan pelajaran kepada orang lain.',
      'Saya senang merawat atau menolong orang yang sedang sakit.',
      'Saya senang bekerja sama dalam kelompok untuk membantu orang lain.',
      'Saya senang menemani anak-anak belajar atau bermain.',
      'Saya senang membantu teman yang sedang berselisih agar kembali akur.'],
  E: ['Saya senang memimpin teman-teman dalam suatu kegiatan.',
      'Saya senang menyampaikan gagasan agar orang lain tertarik ikut serta.',
      'Saya senang menjual atau menawarkan sesuatu kepada orang lain.',
      'Saya senang mengambil keputusan dan bertanggung jawab atas hasilnya.',
      'Saya senang merencanakan dan menjalankan usaha kecil.',
      'Saya senang meyakinkan orang lain agar mau mendukung gagasan saya.',
      'Saya senang menjadi ketua dalam organisasi atau kepanitiaan.',
      'Saya senang mencoba tantangan baru meskipun ada risikonya.'],
  C: ['Saya senang menyusun catatan atau arsip agar rapi dan teratur.',
      'Saya senang memeriksa detail agar tidak ada kesalahan.',
      'Saya senang mengatur jadwal dan daftar tugas agar semuanya tepat waktu.',
      'Saya senang mencatat pemasukan dan pengeluaran uang dengan rapi.',
      'Saya senang mengerjakan tugas yang langkahnya jelas dan berurutan.',
      'Saya senang mengetik, merapikan dokumen, atau mengisi formulir dengan teliti.',
      'Saya senang mengikuti aturan atau prosedur supaya hasilnya tepat.',
      'Saya senang mengelompokkan dan memberi label pada barang atau data.']
};
/* Urutan tampil: R I A S E C berulang, sehingga 12 butir pertama sama dengan contoh pada Lampiran 7 proposal. */
const items = [];
for (let r = 0; r < 8; r++) for (const t of ['R', 'I', 'A', 'S', 'E', 'C']) items.push({ id: items.length + 1, t, x: RAW[t][r] });

const K = 'Lulusan SMA/sederajat. Periksa persyaratan khusus (jurusan asal, tes, portofolio) pada situs program studi.';
const SEL = 'Jalur SNBP, SNBT, dan seleksi mandiri; jadwal dan kuota ditetapkan tiap perguruan tinggi.';
const careers = [
  { id: 1, n: 'Desain Komunikasi Visual', c: 'AIE', p: ['Kuliah', 'Pelatihan', 'Usaha'], d: 'Merancang media visual, ilustrasi, dan identitas merek.', rq: 'Portofolio dasar membantu; ' + K, s: SEL, f: 'KIP Kuliah dan beasiswa kampus (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 2, n: 'Pendidikan Bahasa', c: 'SAC', p: ['Kuliah'], d: 'Mengajar dan mengembangkan bahan ajar bahasa.', rq: K, s: SEL, f: 'KIP Kuliah dan beasiswa kampus (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 3, n: 'Psikologi', c: 'SIA', p: ['Kuliah'], d: 'Mempelajari perilaku dan proses mental manusia.', rq: K, s: SEL, f: 'KIP Kuliah dan beasiswa PTN (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 4, n: 'Teknik Informatika', c: 'IRC', p: ['Kuliah', 'Pelatihan', 'Kerja'], d: 'Membangun perangkat lunak dan menganalisis sistem.', rq: K + ' Logika dan matematika dasar membantu.', s: SEL, f: 'KIP Kuliah; pelatihan vokasi dan Kartu Prakerja untuk jalur pelatihan.', l: [SN, PD, PK] },
  { id: 5, n: 'Keperawatan', c: 'SIR', p: ['Kuliah', 'Kerja'], d: 'Merawat dan mendampingi pasien di layanan kesehatan.', rq: K + ' Program kesehatan dapat mensyaratkan pemeriksaan kesehatan.', s: SEL, f: 'KIP Kuliah (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 6, n: 'Manajemen Bisnis', c: 'ECS', p: ['Kuliah', 'Usaha'], d: 'Mengelola usaha, pemasaran, dan tim.', rq: K, s: SEL, f: 'KIP Kuliah; program pelatihan wirausaha.', l: [SN, PD, KIP] },
  { id: 7, n: 'Akuntansi', c: 'CEI', p: ['Kuliah', 'Kerja'], d: 'Mencatat, memeriksa, dan melaporkan keuangan.', rq: K, s: SEL, f: 'KIP Kuliah (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 8, n: 'Teknik Mesin dan Otomotif', c: 'RIC', p: ['Kuliah', 'Pelatihan', 'Kerja'], d: 'Merawat, memperbaiki, dan merancang mesin.', rq: K + ' Minat pada praktik bengkel atau lapangan.', s: SEL + ' Pelatihan vokasi melalui lembaga pelatihan resmi.', f: 'KIP Kuliah; pelatihan vokasi.', l: [SN, PD, BN] },
  { id: 9, n: 'Pelatihan Kerja Vokasi', c: 'RCE', p: ['Pelatihan', 'Kerja'], d: 'Pelatihan keterampilan kerja jangka pendek untuk masuk dunia kerja.', rq: 'Umumnya lulusan SMA/sederajat; syarat tiap pelatihan berbeda.', s: 'Pendaftaran dan seleksi administrasi oleh penyelenggara pelatihan.', f: 'Sebagian program bersubsidi atau gratis; periksa tiap program.', l: [KH, PK, BN] },
  { id: 10, n: 'Wirausaha Kreatif dan Konten', c: 'AES', p: ['Usaha', 'Pelatihan'], d: 'Merintis usaha berbasis karya dan konten digital.', rq: 'Inisiatif dan kemauan belajar mandiri.', s: 'Tanpa seleksi masuk; pelatihan dapat melalui program resmi.', f: 'Modal mandiri; pelatihan lewat Kartu Prakerja bila memenuhi syarat.', l: [PK, KH] },
  { id: 11, n: 'Pendidikan Guru Sekolah Dasar', c: 'SEC', p: ['Kuliah'], d: 'Mendidik dan membimbing peserta didik sekolah dasar.', rq: K, s: SEL, f: 'KIP Kuliah dan beasiswa kampus (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 12, n: 'Bimbingan dan Konseling', c: 'SAI', p: ['Kuliah'], d: 'Mendampingi peserta didik memahami diri, belajar, dan merencanakan karier.', rq: K, s: SEL + ' Program di PTKIN juga melalui seleksi PTKIN.', f: 'KIP Kuliah (PTN) atau KIP Kuliah PTKIN (Kemenag).', l: [SN, PD, KIP, KIPK] },
  { id: 13, n: 'Pendidikan Agama Islam', c: 'SCA', p: ['Kuliah'], d: 'Mengajarkan nilai dan pengetahuan agama Islam di sekolah dan masyarakat.', rq: K, s: SEL + ' PTKIN memiliki jalur seleksi tersendiri.', f: 'KIP Kuliah PTKIN (Kemenag) atau beasiswa kampus.', l: [PD, SN, KIPK] },
  { id: 14, n: 'Ilmu Hukum', c: 'EIS', p: ['Kuliah'], d: 'Mempelajari aturan hukum, penyelesaian sengketa, dan keadilan.', rq: K, s: SEL, f: 'KIP Kuliah dan beasiswa kampus (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 15, n: 'Ilmu Komunikasi', c: 'AES', p: ['Kuliah', 'Kerja'], d: 'Mempelajari penyampaian pesan melalui media, humas, dan konten.', rq: K, s: SEL, f: 'KIP Kuliah dan beasiswa kampus (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 16, n: 'Arsitektur', c: 'AIR', p: ['Kuliah'], d: 'Merancang bangunan dan ruang yang fungsional dan estetis.', rq: K + ' Kemampuan menggambar dan berpikir ruang membantu.', s: SEL, f: 'KIP Kuliah (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 17, n: 'Teknik Sipil', c: 'RIE', p: ['Kuliah', 'Kerja'], d: 'Merencanakan dan membangun jalan, jembatan, dan gedung.', rq: K + ' Matematika dan fisika dasar membantu.', s: SEL, f: 'KIP Kuliah (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 18, n: 'Farmasi', c: 'ICR', p: ['Kuliah', 'Kerja'], d: 'Mempelajari obat, pembuatannya, dan penggunaannya yang aman.', rq: K + ' Kimia dan biologi dasar membantu.', s: SEL, f: 'KIP Kuliah (bila memenuhi syarat).', l: [SN, PD, KIP] },
  { id: 19, n: 'Statistika dan Sains Data', c: 'ICE', p: ['Kuliah', 'Pelatihan', 'Kerja'], d: 'Mengolah dan menafsirkan data untuk membantu pengambilan keputusan.', rq: K + ' Matematika dasar membantu.', s: SEL, f: 'KIP Kuliah; pelatihan melalui Kartu Prakerja untuk jalur pelatihan.', l: [SN, PD, PK] },
  { id: 20, n: 'Pariwisata dan Perhotelan', c: 'ESC', p: ['Kuliah', 'Pelatihan', 'Kerja'], d: 'Mengelola layanan wisata, hotel, dan acara.', rq: K + ' Kemampuan komunikasi dan bahasa asing membantu.', s: SEL + ' Pelatihan melalui lembaga pelatihan resmi.', f: 'KIP Kuliah; pelatihan vokasi.', l: [SN, PD, KH] },
  { id: 21, n: 'Sekolah Kedinasan dan ASN', c: 'CES', p: ['Kuliah', 'Kerja'], d: 'Pendidikan atau seleksi untuk bekerja sebagai aparatur sipil negara.', rq: 'Syarat usia, tinggi badan, dan administrasi berbeda tiap instansi; baca pengumuman resmi.', s: 'Seleksi nasional melalui portal SSCASN.', f: 'Sekolah kedinasan umumnya ikatan dinas; periksa ketentuan tiap instansi.', l: [SS] }
].map(c => ({ ...c, v: V }));

const SCORES = (R, I, A, S, E, C) => ({ R, I, A, S, E, C });
const stu = (cls, sc) => ({ cls, pin: '1234', scores: sc, filled: true, consent: true });
const seedStudents = {
  'CM-0101': stu('XII-IPA-1', SCORES(12, 26, 14, 18, 15, 20)), 'CM-0102': stu('XII-IPA-1', SCORES(22, 24, 10, 12, 14, 18)),
  'CM-0103': stu('XII-IPA-1', SCORES(10, 16, 27, 25, 20, 11)), 'CM-0104': stu('XII-IPA-1', SCORES(14, 20, 12, 28, 22, 16)),
  'CM-0105': stu('XII-IPA-1', SCORES(18, 15, 19, 21, 26, 24)), 'CM-0106': stu('XII-IPA-2', SCORES(20, 18, 16, 14, 12, 25))
};

export const CM_DATA = {
  classes: ['XII-IPA-1', 'XII-IPA-2', 'XII-IPS-1'],
  items, careers, students: seedStudents,
  consults: [
    { id: 'd1', code: 'CM-0101', cls: 'XII-IPA-1', topic: 'Pilihan jurusan', q: 'Bagaimana jika pilihan saya berbeda dengan saran keluarga?', shared: { profile: { scores: SCORES(12, 26, 14, 18, 15, 20) } }, status: 'Baru', note: '', ts: T0 },
    { id: 'd2', code: 'CM-0104', cls: 'XII-IPA-1', topic: 'Rencana cadangan', q: 'Apakah rencana B saya sudah realistis?', shared: {}, status: 'Baru', note: '', ts: T0 + 1 }
  ],
  announcements: [{ id: 1, t: 'Layanan klasikal karier kelas XII', d: 'Jadwal ditentukan Guru BK. Hubungi ruang BK untuk informasi.', ts: T0 }],
  staff: [
    { id: 's1', email: 'admin@demo.id', pw: 'demo123', role: 'admin', name: 'Admin Sekolah (demo)' },
    { id: 's2', email: 'guru@demo.id', pw: 'demo123', role: 'guru', name: 'Guru BK (demo)' }
  ]
};
