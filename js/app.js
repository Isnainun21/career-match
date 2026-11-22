/* Career Match — antarmuka. Penyimpanan ada di store.js (mode demo atau Firebase). */
import { createStore } from './store.js';

const T = ['R', 'I', 'A', 'S', 'E', 'C'], TN = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const url = u => /^https:\/\//.test(u) ? esc(u) : '#';
const csvCell = x => { let t = String(x ?? ''); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"' };

let S;
try { S = await createStore() } catch (e) {
  $('#main').innerHTML = '<div class="card"><h2>Layanan tidak dapat dimuat</h2><p>Periksa koneksi internet, lalu muat ulang halaman.</p></div>'; throw e;
}
const DEMO = S.mode === 'demo';
let C = { classes: [], items: [], careers: [], ann: [] }, sess = null, me = null, staff = null, stu = null, X = {};
let charts = [], tab = 'A', gcls = null, acls = null, showAll = false, flt = 'Semua', q = '', lastBatch = [], fails = 0, lockUntil = 0, rt = 0;

const toast = m => { const t = $('#toast'); t.textContent = m; t.className = 'on'; setTimeout(() => t.className = '', 2600) };
const fail = e => { console.error(e); toast(S.errMsg(e)) };
const setSess = s => { sess = s; me = s?.kind === 'student' ? s.code : null; staff = s?.kind === 'staff' ? s : null };
const sc = a => { const s = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }; C.items.forEach(i => { const v = a?.[i.id]; if (v) s[i.t] += v }); return s };
const top3 = s => [...T].sort((a, b) => s[b] - s[a] || T.indexOf(a) - T.indexOf(b)).slice(0, 3);
const mx = t => C.items.filter(i => i.t === t).length * 4;
const allDone = () => C.items.length > 0 && C.items.every(i => stu.ans?.[i.id]);
const match = code => C.careers.map(c => { let s = 0; const w = [3, 2, 1], hit = []; code.forEach((l, i) => { if (c.c.includes(l)) { s += w[i]; hit.push(l) } }); return { c, s, hit } }).sort((a, b) => b.s - a.s);
const cat = s => s >= 5 ? ['Sangat dekat dengan minatmu', 'b1'] : s >= 3 ? ['Cukup dekat', 'b2'] : ['Dapat dijelajahi', ''];
const ROLE = { guru: ['guru'], konten: ['admin'], akun: ['admin'] };
const STU_R = ['minat', 'profil', 'match', 'pustaka', 'rencana', 'konsultasi', 'privasi'];
const TTL = { minat: 'Eksplorasi Minat', profil: 'Profil Minat Sementara', match: 'Career Match', pustaka: 'Pustaka Karier', rencana: 'Perencana Karier A/B/C', konsultasi: 'Pojok Konsultasi', privasi: 'Privasi dan Data Saya', 'admin-login': 'Login Staf Layanan', guru: 'Panel Guru BK', konten: 'Pengelolaan Konten', akun: 'Akun, Kode Siswa, dan Data', tentang: 'Tentang Layanan', panduan: 'Panduan dan Pertanyaan Umum', pengumuman: 'Pengumuman Layanan', cetak: 'Lembar Cetak Eksplorasi Minat' };
const head = r => `<div class="pagehead"><div class="in"><div class="crumb"><a href="#/beranda">Beranda</a> &rsaquo; ${TTL[r] || ''}</div><h1>${TTL[r] || ''}</h1></div></div>`;
const dt = x => new Date(x.ts || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const killCharts = () => { charts.forEach(c => c.destroy()); charts = [] };
const shTxt = (profile, plan) => {
  let h = '';
  if (profile) { const o = profile.scores; h += `<p><b>Profil (dibagikan siswa):</b> ${top3(o).join('-')} · ${T.map(t => t + ' ' + o[t]).join(', ')}</p>` }
  if (plan) h += '<p><b>Rencana (dibagikan siswa):</b> ' + (Object.entries(plan.plans || {}).map(([k, p]) => `${k}: ${esc(p.goal)} (${esc(p.path)})`).join('; ') || 'belum diisi') + '</p>';
  return h || '<p>Tidak ada data dibagikan.</p>';
};

const NI = { home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', info: 'M12 8h.01M11 12h1v5h1M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0', book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13', bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 20a2 2 0 0 0 4 0', lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2', target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8', plan: 'M9 4h6v3H9zM6 5H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M8 12h8M8 16h5', chat: 'M4 5h16v11H9l-5 4z', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', users: 'M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6', edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4', out: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9' };
const ICO = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${NI[k]}"/></svg>`;
const route = () => (location.hash || '#/beranda').replace('#/', '') || 'beranda';
function nav() {
  const r = route(), L = [['beranda', 'Beranda', 'home']];
  if (me) L.push(['minat', 'Minat', 'edit'], ['profil', 'Profil', 'chart'], ['match', 'Career Match', 'target'], ['pustaka', 'Pustaka', 'book'], ['rencana', 'Perencana', 'plan'], ['konsultasi', 'Konsultasi', 'chat'], ['privasi', 'Privasi', 'shield'], ['panduan', 'Panduan', 'info']);
  else if (staff) { if (staff.role === 'guru') L.push(['guru', 'Panel Guru BK', 'users']); if (staff.role === 'admin') L.push(['konten', 'Konten', 'edit'], ['akun', 'Akun dan Kode Siswa', 'users']) }
  else L.push(['tentang', 'Tentang Layanan', 'info'], ['panduan', 'Panduan', 'book'], ['pengumuman', 'Pengumuman', 'bell'], ['cetak', 'Lembar Cetak', 'plan'], ['admin-login', 'Login Staf', 'lock']);
  $('#nav').innerHTML = L.map(([k, t, i]) => `<a href="#/${k}" class="${r === k ? 'on' : ''}">${ICO(i)}${t}</a>`).join('') + ((me || staff) ? `<a href="#" data-act="out">${ICO('out')}Keluar</a>` : '');
}
const deny = m => `<div class="in pb"><div class="card"><h2>Akses ditolak</h2><p>${m}</p><a class="btn" href="#/beranda">Ke Beranda</a></div></div>`;
const noChart = '<p class="note w">Grafik tidak dapat dimuat (pustaka grafik membutuhkan koneksi internet).</p>';

const V = {
  beranda() {
    const a = C.ann.slice(0, 3).map(x => `<article><time>${dt(x)}</time><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></article>`).join('');
    const side = me ? `<h3>Selamat datang</h3><p>Kode <b>${esc(me)}</b> · Kelas ${esc(stu.cls)}</p><a class="btn" href="#/minat">Lanjutkan Eksplorasi Minat</a>` :
      staff ? `<h3>${esc(staff.name)}</h3><p>Anda masuk sebagai staf layanan.</p><a class="btn" href="#/${staff.role === 'guru' ? 'guru' : 'konten'}">Buka Dasbor</a>` :
        `<div class="ph">${ICO('lock')}<div><b>Masuk Siswa</b><small>Gunakan kode samaran dari Guru BK</small></div></div><form id="login"><label style="margin-top:0">Kode Samaran</label><div class="fi">${ICO('users')}<input name="code" placeholder="Contoh: CM-0412" maxlength="7" autocomplete="off" required></div><label>PIN (4 digit)</label><div class="fi">${ICO('lock')}<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="4 digit dari Guru BK" autocomplete="off" required></div><label>Kelas</label><div class="fi">${ICO('book')}<select name="cls">${C.classes.map(c => `<option>${esc(c)}</option>`).join('')}</select></div>
 <label class="i" style="margin-top:14px"><input type="checkbox" name="ok"><span>Saya memahami tujuan layanan dan menyetujui jawaban saya disimpan untuk layanan BK (UU No. 27 Tahun 2022). Data tidak dibagikan kecuali atas pilihan saya; persetujuan dapat ditarik kapan saja.</span></label>
 <label class="i" style="margin-top:10px"><input type="checkbox" name="wali"><span>Orang tua/wali saya telah mengetahui dan menyetujui penggunaan layanan ini (persetujuan orang tua/wali diperlukan untuk data peserta didik di bawah 18 tahun; sekolah dapat membantu memastikannya).</span></label>
 <p style="margin:16px 0 0"><button class="btn" id="go" disabled>Masuk</button><button type="button" class="lnk" data-act="decline">Saya tidak setuju</button></p></form>
 <ul class="chips"><li>Tanpa NIK dan nilai rapor</li><li>Kode samaran</li><li>Data dapat dihapus</li></ul>${DEMO ? '<p class="note">Mode demo: kode <b>CM-0101</b>, PIN <b>1234</b>, kelas XII-IPA-1.</p>' : '<p class="note">Kode dan PIN dibagikan oleh Guru BK atau Admin sekolah. Lupa PIN? Hubungi mereka untuk reset.</p>'}`;
    const T6 = [['minat', 'Eksplorasi Minat', 'Inventori aktivitas RIASEC untuk menyusun profil minat sementara.'], ['match', 'Career Match', 'Pencocokan minat dengan bidang studi dan profesi beserta alasannya.'], ['pustaka', 'Pustaka Karier', 'Katalog bidang dengan persyaratan, jalur seleksi, pembiayaan, dan sumber resmi.'], ['rencana', 'Perencana A/B/C', 'Rencana utama, alternatif, dan cadangan dengan langkah bertahap.'], ['konsultasi', 'Pojok Konsultasi', 'Konsultasi sukarela dengan Guru BK; Anda memilih data yang dibagikan.'], ['privasi', 'Privasi dan Data Saya', 'Kelola persetujuan dan ajukan penghapusan data.']];
    return `<section class="portal"><div class="in pg"><div><span class="eyebrow">Layanan Bimbingan dan Konseling</span><h1>Eksplorasi dan Perencanaan Karier Peserta Didik Kelas XII SMA</h1><p>Media bantu layanan BK untuk mengenali minat, menelusuri pilihan studi dan pekerjaan dari sumber resmi, serta menyusun rencana setelah lulus bersama Guru BK.</p>
 <div class="lim"><b>Batas media:</b> bukan tes psikologi resmi; tidak untuk diagnosis atau pelabelan tetap; keputusan akhir tetap pada siswa bersama Guru BK.</div></div><div class="plogin">${side}</div></div></section>
 <div class="in">${C.items.length || C.careers.length ? '' : '<p class="note w" style="margin-top:16px">Konten layanan belum diisi. Admin sekolah perlu masuk ke menu Konten dan memilih Impor data awal.</p>'}<div class="stats"><div><b data-n="6">0</b><span>Layanan digital</span></div><div><b data-n="${C.careers.length}">0</b><span>Bidang dalam Pustaka Karier</span></div><div><b data-n="${C.items.length}">0</b><span>Butir Eksplorasi Minat</span></div><div><b data-n="3">0</b><span>Rencana (A, B, C)</span></div></div><section class="sec"><h2 class="st">Layanan</h2><div class="svc">${T6.map(([k, t, d]) => `<a class="tile" href="#/${k}"><div class="ic">${t.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><b>${t}</b><p>${d}</p><span>${me ? 'Buka layanan' : 'Masuk diperlukan'}</span></a>`).join('')}</div></section>
 <section class="sec"><h2 class="st">Alur Layanan</h2><div class="flow"><div><b>1. Kenali Minat</b><small>Isi inventori aktivitas dan lihat profil minat sementara.</small></div><div><b>2. Cari Informasi</b><small>Telusuri bidang studi dan profesi dari sumber resmi.</small></div><div><b>3. Susun Rencana</b><small>Buat Rencana A, B, dan C, lalu konsultasikan dengan Guru BK.</small></div></div></section>
 <section class="sec"><h2 class="st">Pengumuman</h2><div class="news">${a || '<p>Belum ada pengumuman.</p>'}</div><p style="margin-top:14px"><a href="#/pengumuman">Lihat semua pengumuman</a></p></section><section class="sec"><h2 class="st">Sumber Informasi Resmi</h2><div class="links"><a href="https://snpmb.id" target="_blank" rel="noopener noreferrer">SNPMB</a><a href="https://kip-kuliah.kemdiktisaintek.go.id" target="_blank" rel="noopener noreferrer">KIP Kuliah</a><a href="https://karirhub.kemnaker.go.id" target="_blank" rel="noopener noreferrer">KarirHub Kemnaker</a><a href="https://www.prakerja.go.id" target="_blank" rel="noopener noreferrer">Kartu Prakerja</a></div></section></div>`;
  },
  tentang() {
    return `<div class="grid g2"><section class="card"><h2>Tujuan Layanan</h2><p>Career Match membantu peserta didik kelas XII mengenali minat, mencari informasi pilihan setelah lulus, dan menyusun rencana tindakan secara bertahap. Media ini mendukung, dan tidak menggantikan, peran Guru BK.</p><h3>Dasar Layanan</h3><p>Permendikbud Nomor 111 Tahun 2014 tentang Bimbingan dan Konseling pada Pendidikan Dasar dan Menengah (layanan peminatan dan perencanaan individual) serta UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.</p></section>
<section class="card"><h2>Kerangka Teori</h2><p>Eksplorasi minat memakai enam tipe RIASEC (Holland) sebagai pemicu refleksi. Tahap perencanaan mengacu pada teori perkembangan karier Super dan Social Cognitive Career Theory (keyakinan diri, dukungan, dan hambatan).</p><div class="note w"><b>Batas media:</b> bukan tes psikologi resmi; tidak untuk diagnosis atau pelabelan tetap; keputusan akhir tetap pada siswa bersama Guru BK.</div></section></div>`;
  },
  panduan() {
    const f = [['Apa hasil yang diperoleh dari Eksplorasi Minat?', 'Profil minat sementara berupa kode tiga huruf. Profil ini bahan refleksi dan dapat berubah, bukan label atau keputusan.'], ['Apakah Career Match menentukan jurusan saya?', 'Tidak. Layanan hanya menampilkan pilihan yang dekat dengan minat beserta alasannya, dan Anda dapat menelusuri bidang lain di luar profil.'], ['Data apa yang disimpan?', 'Kode samaran, kelas, jawaban inventori, rencana, dan daftar bidang tersimpan. NIK, alamat, kata sandi, dan nilai rapor tidak diminta.'], ['Siapa yang dapat melihat data saya?', 'Hanya Anda. Guru BK dapat melihat profil atau rencana hanya jika Anda memilih membagikannya saat mengajukan konsultasi atau pada menu Privasi. Admin sekolah tidak dapat membaca isi refleksi atau rencana. Guru BK hanya melihat grafik kelas bila minimal 5 siswa telah mengisi.'], ['Bagaimana menarik persetujuan atau menghapus data?', 'Buka menu Privasi, lalu tarik persetujuan atau minta penghapusan data kapan saja.'], ['Bagaimana jika saya tidak memiliki akses internet?', 'Hubungi Guru BK atau gunakan <a href="#/cetak">lembar cetak Eksplorasi Minat</a>; hasilnya dapat dihitung dan dibahas bersama Guru BK dalam diskusi kelas.'], ['Saya lupa PIN.', 'Hubungi Admin sekolah atau Guru BK untuk meminta PIN baru.']];
    return f.map(([qq, a]) => `<details><summary>${qq}</summary><p>${a}</p></details>`).join('');
  },
  pengumuman() { return `<div class="news">${C.ann.map(x => `<article><time>${dt(x)}</time><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></article>`).join('') || '<p>Belum ada pengumuman.</p>'}</div>` },
  cetak() {
    const key = T.map(t => `<tr><td>${t} – ${TN[t]}</td><td>${C.items.map((i, n) => i.t === t ? n + 1 : null).filter(Boolean).join(', ')}</td><td></td></tr>`).join('');
    return `<section class="card cetak"><p class="note">Alternatif tanpa internet. Bukan tes psikologi resmi; hasil hanya bahan refleksi dan dibahas bersama Guru BK. Tidak perlu menuliskan nama lengkap.</p><p><b>Petunjuk:</b> bacalah setiap pernyataan, lalu lingkari satu angka sesuai seberapa kamu menyukai kegiatan tersebut: 1 = tidak suka, 2 = kurang suka, 3 = suka, 4 = sangat suka. Tidak ada jawaban benar atau salah.</p><p class="noprint"><button class="btn" onclick="print()">Cetak lembar ini</button></p>
 <table class="tbl"><tr><th>No.</th><th>Pernyataan</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>${C.items.map((i, n) => `<tr><td>${n + 1}</td><td>${esc(i.x)}</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>`).join('')}</table>
 <h3 style="margin-top:20px">Lembar Skor</h3><p>Jumlahkan angka yang kamu lingkari untuk nomor butir pada tiap tipe. Tiga tipe dengan jumlah tertinggi membentuk kode minat sementaramu (contoh: A-I-S). Tulis hasilnya di bawah, lalu telusuri bidang yang kodenya memuat huruf yang sama bersama Guru BK.</p>
 <table class="tbl"><tr><th>Tipe</th><th>Nomor butir</th><th>Jumlah skor</th></tr>${key}</table><p style="margin-top:12px">Kode minat sementara: ……… - ……… - ………</p></section>`;
  },
  minat() {
    const n = C.items.length; if (!n) return '<div class="card"><p>Bank butir belum diisi.</p></div>';
    const i = Math.min(stu.idx || 0, n - 1), it = C.items[i], v = stu.ans?.[it.id], lb = ['Tidak suka', 'Kurang suka', 'Suka', 'Sangat suka'], done = allDone();
    return `<section class="card"><h2>Eksplorasi Minat</h2><div class="row" style="justify-content:space-between"><span>Butir ${i + 1} dari ${n}</span><span>${Math.round((i + 1) / n * 100)}%</span></div><div class="bar2"><i style="width:${(i + 1) / n * 100}%"></i></div>
 <p style="font-size:1.15rem;margin:20px 0 6px"><b>${esc(it.x)}</b></p><p class="note">Tidak ada jawaban benar atau salah. Jawaban tersimpan otomatis dan dapat dilanjutkan kapan saja.</p>
 ${lb.map((l, k) => `<label class="opt ${v === k + 1 ? 'sel' : ''}"><input type="radio" name="a" value="${k + 1}" ${v === k + 1 ? 'checked' : ''} data-act="ans"> ${k + 1} = ${l}</label>`).join('')}
 <div class="row"><button class="btn sec" data-act="prev" ${i ? '' : 'disabled'}>Kembali</button>${i < n - 1 ? `<button class="btn" data-act="next" ${v ? '' : 'disabled'}>Lanjut</button>` : `<button class="btn" data-act="fin" ${done ? '' : 'disabled'}>Lihat Profil</button>`}</div>
 <p class="note" style="margin-top:12px">Inventori ${n} butir (${T.map(t => t + ' ' + C.items.filter(x => x.t === t).length).join(', ')}). Bank butir disusun sendiri dan belum merupakan instrumen tervalidasi; isinya perlu ditelaah ahli BK.</p></section>`;
  },
  profil() {
    if (!stu.scores) return `<div class="card"><h2>Profil belum tersedia</h2><p>Selesaikan Eksplorasi Minat terlebih dahulu.</p><a class="btn" href="#/minat">Ke Eksplorasi Minat</a></div>`;
    const sco = stu.scores, code = top3(sco);
    return `<section class="card"><h2>Profil Minat Sementara</h2><div class="code">${code.join('-')}</div><p class="note">Bahan refleksi, bukan label tetap, dan dapat berubah seiring waktu.</p><div class="cv"><canvas id="rd"></canvas></div>
 <table class="tbl">${T.map(t => `<tr><td>${t} – ${TN[t]}</td><td>${sco[t] ?? 0} / ${mx(t)}</td></tr>`).join('')}</table>
 <p style="margin-top:14px"><a class="btn" href="#/match">Lihat Career Match</a> <a class="btn sec" href="#/minat">Ubah jawaban</a></p></section>`;
  },
  match() {
    if (!stu.scores) return `<div class="card"><h2>Career Match belum tersedia</h2><p>Selesaikan Eksplorasi Minat terlebih dahulu.</p><a class="btn" href="#/minat">Ke Eksplorasi Minat</a></div>`;
    const code = top3(stu.scores), list = match(code).filter(x => x.s > 0 || showAll);
    return `<section class="card"><h2>Career Match</h2><p>Profil minat sementaramu: <b>${code.join('-')}</b>. Kecocokan dihitung dari huruf profilmu (urutan ke-1, 2, 3 berbobot 3, 2, 1) terhadap kode kartu bidang. Bobot dan ambang masih rancangan yang perlu ditinjau ahli.</p>
 ${list.map(({ c, s, hit }) => { const [l, k] = cat(s); return `<div class="card"><div class="row" style="justify-content:space-between"><b>${esc(c.n)}</b><span class="badge ${k}">${l}</span></div><small>Kode ${esc(c.c)} · ${s ? 'Cocok pada huruf ' + hit.join(' dan ') : 'Di luar profil'}</small></div>`; }).join('') || '<p>Belum ada bidang yang cocok. Coba jelajahi bidang lain.</p>'}
 <p class="note w">Bila hasil ini terasa membingungkan, menimbulkan rasa cemas, atau memicu tekanan dari keluarga, bahaslah bersama Guru BK. <a href="#/konsultasi">Ajukan konsultasi</a></p><button class="btn sec" data-act="all">${showAll ? 'Tampilkan yang sesuai profil saja' : 'Jelajahi bidang lain di luar profil'}</button> <a class="btn" href="#/pustaka">Buka Pustaka Karier</a></section>`;
  },
  pustaka() {
    const b = stu.bm || [], L = C.careers.filter(c => (flt === 'Semua' || c.p.includes(flt)) && (c.n + c.d).toLowerCase().includes(q.toLowerCase()));
    return `<div class="card"><input id="q" placeholder="Cari bidang studi atau profesi" value="${esc(q)}"><div class="row" style="margin-top:10px">${['Semua', 'Kuliah', 'Pelatihan', 'Kerja', 'Usaha'].map(f => `<button class="btn ${f === flt ? '' : 'sec'} sm" data-act="flt" data-v="${f}">${f}</button>`).join('')}<span class="badge">Tersimpan: ${b.length}</span></div></div>
 <div class="grid g2">${L.map(c => `<article class="card"><div class="row" style="justify-content:space-between"><h3>${esc(c.n)}</h3><span class="badge">Holland ${esc(c.c)}</span></div><p>${esc(c.d)}</p>
 <p><b>Jalur:</b> ${c.p.map(esc).join(', ')}<br><b>Persyaratan:</b> ${esc(c.rq)}<br><b>Seleksi:</b> ${esc(c.s)}<br><b>Pembiayaan:</b> ${esc(c.f)}</p>
 <p><b>Sumber resmi:</b> ${(c.l || []).map(k => `<a href="${url(k.u)}" target="_blank" rel="noopener noreferrer">${esc(k.t)}</a>`).join(' · ')}<br><small>Tanggal akses: ${esc(c.v)}</small></p><button class="btn ${b.includes(c.id) ? '' : 'sec'} sm" data-act="bm" data-v="${c.id}">${b.includes(c.id) ? 'Tersimpan' : 'Simpan'}</button></article>`).join('') || '<p>Tidak ada hasil.</p>'}</div>
 <p class="note">Ringkasan ini bersifat umum. Persyaratan, jadwal, dan biaya dapat berubah; periksa selalu pada sumber resmi sebelum mengambil keputusan.</p>`;
  },
  rencana() {
    const p = stu.plans?.[tab] || {}, f = (k, l, t = 'input') => `<label>${l}</label>${t === 'ta' ? `<textarea name="${k}" rows="2">${esc(p[k])}</textarea>` : `<input name="${k}" value="${esc(p[k])}">`}`;
    return `<div class="tabs">${['A', 'B', 'C'].map(x => `<button class="btn ${x === tab ? '' : 'sec'}" data-act="tab" data-v="${x}">Rencana ${x} (${{ A: 'Utama', B: 'Alternatif', C: 'Cadangan' }[x]})</button>`).join('')}</div>
 <form class="card" id="plan">${f('goal', 'Bidang atau tujuan pilihan *')}<label>Jalur</label><select name="path">${['Kuliah', 'Pelatihan', 'Kerja', 'Usaha'].map(x => `<option ${p.path === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
 ${f('why', 'Alasan tertarik', 'ta')}${f('need', 'Informasi yang masih perlu dicari', 'ta')}${f('m1', 'Langkah Bulan 1')}${f('m3', 'Langkah Bulan 3')}${f('m6', 'Langkah Bulan 6')}
 <label>Tingkat keyakinan diri: <b id="cv">${esc(p.conf || 5)}</b>/10</label><input type="range" name="conf" min="1" max="10" value="${esc(p.conf || 5)}" oninput="cv.textContent=this.value">
 ${f('yak', 'Apa yang membuat saya yakin', 'ta')}${f('sup', 'Dukungan yang dimiliki', 'ta')}${f('bar', 'Hambatan yang diperkirakan', 'ta')}${f('help', 'Orang atau sumber yang dapat membantu', 'ta')}<label>Tanggal tinjau ulang</label><input type="date" name="rev" value="${esc(p.rev)}">${f('qbk', 'Pertanyaan untuk Guru BK', 'ta')}
 <p><button class="btn">Simpan Rencana ${tab}</button> <button type="button" class="btn sec" onclick="print()">Cetak</button></p></form>`;
  },
  konsultasi() {
    const c = X.my || [];
    return `<div class="grid g2"><form class="card" id="cons"><h2>Ajukan Konsultasi (sukarela)</h2><label>Topik</label><select name="topic">${['Pilihan jurusan', 'Rencana cadangan', 'Informasi studi/kerja', 'Kendala dukungan/biaya'].map(x => `<option>${x}</option>`).join('')}</select>
 <label>Pertanyaan *</label><textarea name="q" rows="4" minlength="10" required></textarea><label>Informasi yang dibagikan</label>
 <label class="i"><input type="checkbox" name="profile" data-act="sh"> Profil Minat</label><label class="i"><input type="checkbox" name="plan" data-act="sh"> Rencana A/B/C</label><label class="i"><input type="checkbox" name="none" checked data-act="sh"> Tidak membagikan data dulu</label>
 <p><button class="btn">Kirim Permintaan</button></p></form>
 <section class="card"><h2>Permintaan Saya</h2>${c.map(x => `<p><b>${esc(x.topic)}</b> <span class="badge">${esc(x.status)}</span><br>${esc(x.q)}${x.note ? `<br><small>Catatan Guru BK: ${esc(x.note)}</small>` : ''}</p>`).join('') || '<p>Belum ada permintaan.</p>'}</section></div>`;
  },
  privasi() {
    const s = stu;
    return `<section class="card"><h2>Privasi dan Data Saya</h2><p>Data tersimpan: kode samaran, kelas, jawaban inventori, rencana, daftar simpan. Admin sekolah tidak dapat membaca isi refleksi atau rencana.</p>
 <h3 style="margin-top:16px">Berbagi data ke Guru BK</h3><label class="i"><input type="checkbox" data-act="shp" ${s.share?.profile ? 'checked' : ''}> Bagikan profil minat saya</label><label class="i" style="margin-top:6px"><input type="checkbox" data-act="shl" ${s.share?.plan ? 'checked' : ''}> Bagikan Rencana A/B/C saya</label><p class="note">Pilihan ini dapat diubah kapan saja. Tanpa pilihan ini, Guru BK tidak melihat data pribadi Anda.</p><label class="i" style="margin-top:16px"><input type="checkbox" checked data-act="wd"> Persetujuan penggunaan data aktif (hapus centang untuk menarik persetujuan)</label>
 <p class="note">Menarik persetujuan menghentikan berbagi data dan mengeluarkan Anda dari ringkasan kelas. Meminta penghapusan menghapus seluruh jawaban, rencana, dan permintaan konsultasi Anda, lalu Admin sekolah menutup kode Anda.</p>
 <p class="row" style="margin-top:14px"><button class="btn dan" data-act="del">Minta Penghapusan Data</button></p></section>`;
  },
  'admin-login'() {
    return `<div class="stf"><form class="card sform" id="slogin"><div class="ph">${ICO('lock')}<div><b>Login Staf Layanan</b><small>Guru BK dan Admin Sekolah</small></div></div>
 <label style="margin-top:0">Email</label><div class="fi">${ICO('users')}<input name="e" type="email" autocomplete="username" required></div><label>Kata sandi</label><div class="fi">${ICO('lock')}<input name="p" id="pw" type="password" autocomplete="current-password" required></div>
 <label class="i" style="margin-top:10px"><input type="checkbox" data-act="eye"> Tampilkan kata sandi</label><p style="margin-top:16px"><button class="btn" style="width:100%;height:46px">Masuk</button></p>
 ${DEMO ? '<p class="note">Mode demo: admin@demo.id atau guru@demo.id, sandi <b>demo123</b>.</p>' : ''}</form>
 <aside class="roles"><h3>Hak akses per peran</h3><div class="r"><b>Guru BK</b><span>Ringkasan agregat kelas (min. 5 siswa), permintaan konsultasi, catatan tindak lanjut. Melihat profil atau rencana hanya bila siswa membagikannya.</span></div><div class="r"><b>Admin Sekolah</b><span>Membuat dan menonaktifkan akun dan kode siswa, memproses penghapusan data, serta mengelola konten. Tidak dapat membaca isi refleksi atau rencana.</span></div></aside></div>`;
  },
  guru() {
    const ent = X.ent || [], shMap = Object.fromEntries((X.sh || []).map(s => [s.code, s])), eff = c => ({ profile: c.shared?.profile || shMap[c.code]?.profile, plan: c.shared?.plan || shMap[c.code]?.plan });
    const shl = (X.sh || []).filter(x => x.cls === gcls).map(x => `<div class="note"><b>${esc(x.code)}</b>${shTxt(x.profile, x.plan)}</div>`).join('');
    return `<div class="card"><div class="row"><select id="gc" style="max-width:200px">${C.classes.map(c => `<option ${c === gcls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><span class="badge">${ent.length} siswa mengisi</span><button class="btn sec sm" data-act="csv">Ekspor CSV</button><button class="btn sec sm" onclick="print()">Cetak</button></div>
 ${ent.length >= 5 ? '<div class="cv"><canvas id="bc"></canvas></div>' : '<p class="note w">Grafik distribusi hanya ditampilkan bila minimal 5 siswa telah mengisi, untuk menjaga anonimitas.</p>'}</div>
 <div class="card"><h3>Permintaan Konsultasi</h3><table class="tbl"><tr><th>Kode</th><th>Topik dan pertanyaan</th><th>Data dibagikan</th><th>Status dan catatan</th></tr>${(X.cons || []).map(c => `<tr><td>${esc(c.code)}<br><small>${esc(c.cls)}</small></td><td><b>${esc(c.topic)}</b><br>${esc(c.q)}</td>
 <td>${eff(c).profile || eff(c).plan ? `<button class="btn sec sm" data-act="vw" data-v="${esc(c.id)}">Lihat</button>` : 'Tidak ada'}</td>
 <td><select data-act="stt" data-v="${esc(c.id)}">${['Baru', 'Diproses', 'Selesai'].map(x => `<option ${c.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select><textarea data-act="nt" data-v="${esc(c.id)}" rows="2" placeholder="Catatan tindak lanjut">${esc(c.note)}</textarea></td></tr>`).join('') || '<tr><td colspan="4">Belum ada permintaan.</td></tr>'}</table><div id="vwbox"></div></div>
 <div class="card"><h3>Data yang Dibagikan Siswa (${esc(gcls)})</h3>${shl || '<p>Belum ada siswa yang membagikan data.</p>'}</div>`;
  },
  konten() {
    const cnt = T.map(t => `${t} ${C.items.filter(i => i.t === t).length}`).join(' · ');
    return `<div class="note w">Peran ini tidak dapat melihat jawaban atau rencana siswa.</div>
 ${!C.items.length && !C.careers.length && !DEMO ? '<div class="card"><h3>Konten belum diisi</h3><p>Impor bank butir (48), Pustaka Karier (21 kartu), kelas, dan pengumuman awal ke Firestore.</p><button class="btn" data-act="seed">Impor data awal</button></div>' : ''}
 <div class="card"><h3>Pustaka Karier (${C.careers.length})</h3><p class="note" style="margin-top:0">Periksa ulang tautan secara berkala dan perbarui tanggal akses setelah Anda membukanya sendiri. Kode Holland bersifat rancangan dan perlu ditinjau ahli.</p><table class="tbl"><tr><th>Bidang</th><th>Kode</th><th>Tautan utama</th><th>Tanggal akses</th><th></th></tr>${C.careers.map(c => `<tr><td>${esc(c.n)}</td><td>${esc(c.c)}</td><td><input data-act="cu" data-v="${c.id}" value="${esc(c.l?.[0]?.u || '')}"></td><td><input type="date" data-act="cd" data-v="${c.id}" value="${esc(c.v)}"></td><td><button class="btn dan sm" data-act="dc" data-v="${c.id}">Hapus</button></td></tr>`).join('')}</table>
 <form id="nc"><h3 style="margin-top:14px">Tambah Kartu</h3><div class="grid g3"><input name="n" placeholder="Nama bidang" required><input name="c" placeholder="Kode Holland (mis. AIS)" pattern="[RIASEC]{3}" required><input name="u" type="url" placeholder="https://... (sumber resmi)" required></div><textarea name="d" rows="2" placeholder="Deskripsi" required></textarea><div class="grid g3"><input name="rq" placeholder="Persyaratan"><input name="s" placeholder="Jalur seleksi"><input name="f" placeholder="Pembiayaan"></div><label>Jalur</label><div class="row">${['Kuliah', 'Pelatihan', 'Kerja', 'Usaha'].map(x => `<label class="i"><input type="checkbox" name="p" value="${x}">${x}</label>`).join('')}</div><button class="btn" style="margin-top:8px">Tambah</button></form></div>
 <div class="card"><h3>Bank Butir (${C.items.length}) <small>${cnt}</small></h3><form id="ni" class="row"><input name="x" placeholder="Pernyataan aktivitas" style="flex:3" required><select name="t" style="flex:1">${T.map(t => `<option>${t}</option>`).join('')}</select><button class="btn">Tambah</button></form><table class="tbl" style="margin-top:10px">${C.items.map((i, n) => `<tr><td>${n + 1}</td><td>[${i.t}] ${esc(i.x)}</td><td><button class="btn dan sm" data-act="di" data-v="${i.id}">Hapus</button></td></tr>`).join('')}</table></div>
 <div class="card"><h3>Pengumuman</h3><form id="na" class="row"><input name="t" placeholder="Judul" required style="flex:1"><input name="d" placeholder="Isi" required style="flex:2"><button class="btn">Publikasikan</button></form><table class="tbl" style="margin-top:10px">${C.ann.map(a => `<tr><td>${esc(a.t)}<br><small>${esc(a.d)}</small></td><td><button class="btn dan sm" data-act="da" data-v="${a.id}">Hapus</button></td></tr>`).join('')}</table></div>`;
  },
  akun() {
    acls = acls || C.classes[0]; const R = X.roster || [], mine = R.filter(r => r.cls === acls && !r.delReq), dels = R.filter(r => r.delReq);
    const stat = r => r.off ? '<span class="badge b2">nonaktif</span>' : r.filled ? 'Sudah mengisi' : 'Belum mengisi';
    return `<div class="card"><h3>Kode Siswa</h3><p class="note" style="margin-top:0">Kode dan PIN dibuat di sini lalu dibagikan langsung kepada siswa. Aplikasi tidak menyimpan nama; pasangan kode dan nama dicatat sekolah di luar aplikasi. PIN hanya tampil sekali, saat dibuat atau direset.</p>
 <div class="row"><select id="ac" style="max-width:200px">${C.classes.map(c => `<option ${c === acls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
 <form id="gen" class="row" style="margin-top:10px"><input name="n" type="number" min="1" max="40" value="10" style="max-width:110px" required><button class="btn">Buat kode baru</button>${lastBatch.length ? '<button type="button" class="btn sec" data-act="psheet">Cetak lembar kode</button>' : ''}</form>
 <table class="tbl" style="margin-top:10px"><tr><th>Kode</th><th>Status</th><th></th></tr>${mine.map(r => `<tr><td>${esc(r.code)}</td><td>${stat(r)}</td><td><button class="btn sec sm" data-act="rpin" data-v="${esc(r.code)}">Reset PIN</button> <button class="btn sec sm" data-act="off" data-v="${esc(r.code)}">${r.off ? 'Aktifkan' : 'Nonaktifkan'}</button></td></tr>`).join('') || '<tr><td colspan="3">Belum ada kode.</td></tr>'}</table></div>
 ${lastBatch.length ? `<div class="card" id="cs"><h3>Lembar Kode (cetak dan potong per siswa)</h3><div class="slips">${lastBatch.map(b => `<div class="slip"><b>Career Match</b><span>Kelas ${esc(b.cls)}</span><div>Kode: <b>${esc(b.code)}</b></div><div>PIN: <b>${esc(b.pin)}</b></div></div>`).join('')}</div></div>` : ''}
 <div class="card"><h3>Permintaan Penghapusan Data Siswa</h3>${dels.map(r => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:8px 0"><span><b>${esc(r.code)}</b> · ${esc(r.cls)} · ${new Date(r.delReq).toLocaleDateString('id-ID')}</span><button class="btn dan sm" data-act="pdel" data-v="${esc(r.code)}">Selesaikan dan tutup kode</button></div>`).join('') || '<p>Tidak ada permintaan.</p>'}<p class="note">Isi jawaban dan rencana siswa sudah dihapus otomatis saat siswa mengajukan. Admin hanya melihat kode dan kelas, tidak pernah isi refleksi.</p></div>
 <div class="card"><h3>Akun Staf</h3><table class="tbl">${(X.staff || []).map(s => `<tr><td>${esc(s.name)}${s.off ? ' <span class="badge b2">nonaktif</span>' : ''}<br><small>${esc(s.email)}</small></td><td>${esc(s.role)}</td><td>${s.id === staff.id ? '<small>akun Anda</small>' : `<button class="btn sec sm" data-act="tg" data-v="${esc(s.id)}">${s.off ? 'Aktifkan' : 'Nonaktifkan'}</button> <button class="btn dan sm" data-act="ds" data-v="${esc(s.id)}">Hapus</button>`}</td></tr>`).join('')}</table>
 <form id="ns" class="row" style="margin-top:10px"><input name="e" type="email" placeholder="Email" required><input name="nm" placeholder="Nama" required><select name="r"><option value="guru">Guru BK</option><option value="admin">Admin Sekolah</option></select><input name="p" type="password" minlength="6" placeholder="Sandi awal (min. 6)" autocomplete="new-password" required><button class="btn">Tambah</button></form></div>
 <div class="card"><h3>Kelas Aktif</h3><p>${C.classes.map(esc).join(', ')}</p><form id="nk" class="row"><input name="k" placeholder="XII-IPS-2" pattern="XII-[A-Z0-9-]{2,10}" required><button class="btn">Tambah Kelas</button></form></div>`;
  }
};

const AFTER = {
  profil() { if (!stu.scores) return; if (typeof Chart === 'undefined') { $('.cv').outerHTML = noChart; return } const s = stu.scores; charts.push(new Chart($('#rd'), { type: 'radar', data: { labels: T.map(t => TN[t]), datasets: [{ data: T.map(t => Math.round((s[t] ?? 0) / (mx(t) || 1) * 100)), backgroundColor: 'rgba(15,118,110,.18)', borderColor: '#0F766E' }] }, options: { scales: { r: { min: 0, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } } })) },
  guru() {
    const el = $('#bc'); if (!el) return; if (typeof Chart === 'undefined') { el.parentElement.outerHTML = noChart; return }
    const ss = X.ent; charts.push(new Chart(el, { type: 'bar', data: { labels: T, datasets: [{ label: 'Rata-rata (%)', data: T.map(t => Math.round(ss.reduce((a, s) => a + (s.scores[t] ?? 0) / (mx(t) || 1) * 100, 0) / ss.length)), backgroundColor: '#0F766E' }] }, options: { scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } } }));
  }
};

async function load(r) {
  if (r === 'konsultasi' && me && !X.my) X.my = await S.myConsults(stu);
  if (r === 'guru' && staff?.role === 'guru') { gcls = gcls || C.classes[0]; [X.cons, X.ent, X.sh] = await Promise.all([S.consults(), S.entries(gcls), Promise.all(C.classes.map(k => S.shares(k))).then(a => a.flat())]) }
  if (r === 'akun' && staff?.role === 'admin') [X.roster, X.staff] = await Promise.all([S.roster(), S.staffList()]);
}
let lastR = '';
async function render() {
  const my = ++rt; killCharts(); nav(); const r = route(), m = $('#main'), same = r === lastR; lastR = r; if (!same) $('#nav').classList.remove('open'); document.body.classList.toggle('land', r === 'beranda');
  const need = STU_R.includes(r) ? 's' : ROLE[r] ? 't' : '';
  if (need === 's' && !me) { m.innerHTML = deny('Silakan masuk sebagai siswa dari Beranda.'); return }
  if (need === 't' && !(staff && ROLE[r].includes(staff.role))) { m.innerHTML = deny('Peran Anda tidak memiliki akses ke halaman ini.'); return }
  try { await load(r) } catch (e) { fail(e) }
  if (my !== rt) return;
  document.body.classList.toggle('cetakpg', r === 'cetak');
  const o = (V[r] || V.beranda)(); m.innerHTML = r === 'beranda' || !V[r] ? o : head(r) + `<div class="in pb">${o}</div>`;
  AFTER[r]?.(); fx(same); if (!same) scrollTo(0, 0); window.parent !== window && parent.postMessage({ cmHeight: document.body.scrollHeight }, '*');
}

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
function fx(same) {
  const cs = [...document.querySelectorAll('#main [data-n]')], fin = () => cs.forEach(e => e.textContent = e.dataset.n);
  if (same || RM || !('IntersectionObserver' in window)) { fin(); return }
  const els = [...document.querySelectorAll('#main .card,#main .tile,#main .news article,#main .stats div,#main .flow div,#main details,#main .st,#main .links a')];
  const cnt = e => { const n = +e.dataset.n, t0 = performance.now(), f = t => { const k = Math.min(1, (t - t0) / 900); e.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); k < 1 && requestAnimationFrame(f) }; requestAnimationFrame(f) };
  const io = new IntersectionObserver(es => es.forEach(x => { if (!x.isIntersecting) return; const t = x.target; t.classList.add('vis'); if (t.dataset.n) cnt(t); setTimeout(() => t.style.transitionDelay = '', 900); io.unobserve(t) }), { threshold: .1 });
  els.forEach((e, i) => { e.classList.add('rv'); e.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(e) }); cs.forEach(e => io.observe(e));
}
addEventListener('scroll', () => { const u = $('#up'); u && u.classList.toggle('on', scrollY > 320) }, { passive: true });
document.addEventListener('keydown', e => { if (e.target.id === 'gs' && e.key === 'Enter') { if (!me) { toast('Masuk sebagai siswa untuk membuka Pustaka Karier'); return } q = e.target.value.trim(); flt = 'Semua'; $('#sbar').classList.remove('on'); if (route() === 'pustaka') render(); else location.hash = '#/pustaka' } });

/* ── aksi siswa ── */
const save = async (share) => { try { await S.putStudent(stu); if (share) await S.syncShare(stu) } catch (e) { fail(e) } };
async function finish() { stu.scores = sc(stu.ans); await S.publish(stu); await S.putStudent(stu); await S.syncShare(stu) }
const reload = async () => { C = await S.loadContent() };
const mut = async fn => { try { await fn(); await reload() } catch (e) { fail(e) } render() };
async function signOut(msg) { try { await S.logout() } catch (e) { } setSess(null); stu = null; X = {}; lastBatch = []; location.hash = '#/beranda'; await render(); if (msg) toast(msg) }
const nextId = list => list.reduce((m, x) => Math.max(m, +x.id || 0), 0) + 1;

const A = {
  async out(b, e) { e.preventDefault(); await signOut() },
  decline() { toast('Tanpa persetujuan, tidak ada data yang disimpan.') },
  async ans(b) { stu.ans = stu.ans || {}; stu.ans[C.items[stu.idx || 0].id] = +b.value; render(); try { if (stu.scores && allDone()) await finish(); else await S.putStudent(stu) } catch (e) { fail(e) } },
  async prev() { stu.idx = Math.max(0, (stu.idx || 0) - 1); render(); save() },
  async next() { stu.idx = (stu.idx || 0) + 1; render(); save() },
  async fin() { try { await finish(); location.hash = '#/profil' } catch (e) { fail(e) } },
  all() { showAll = !showAll; render() }, flt(b) { flt = b.dataset.v; render() }, tab(b) { tab = b.dataset.v; render() },
  async bm(b) { const id = +b.dataset.v; stu.bm = stu.bm || []; stu.bm = stu.bm.includes(id) ? stu.bm.filter(x => x !== id) : [...stu.bm, id]; render(); save() },
  sh(b) { const f = b.form; if (b.name === 'none' && b.checked) { f.profile.checked = f.plan.checked = false } else if (b.name !== 'none' && b.checked) f.none.checked = false; if (!f.profile.checked && !f.plan.checked) f.none.checked = true },
  async shp(b) { stu.share = { ...(stu.share || {}), profile: b.checked }; await save(true); toast('Pilihan berbagi tersimpan') },
  async shl(b) { stu.share = { ...(stu.share || {}), plan: b.checked }; await save(true); toast('Pilihan berbagi tersimpan') },
  async wd(b) { if (!b.checked && confirm('Tarik persetujuan? Berbagi data dihentikan, Anda keluar dari ringkasan kelas, dan Anda akan keluar dari layanan.')) { try { await S.withdraw(stu); await signOut('Persetujuan ditarik') } catch (e) { fail(e); render() } } else render() },
  async del() { if (confirm('Hapus seluruh jawaban, rencana, dan permintaan konsultasi Anda? Tindakan ini tidak dapat dibatalkan. Admin sekolah akan menutup kode Anda.')) { try { await S.requestDelete(stu); await signOut('Data Anda telah dihapus') } catch (e) { fail(e) } } },
  /* tampilan umum */
  fs() { const d = document; (d.fullscreenElement ? d.exitFullscreen() : d.documentElement.requestFullscreen()).catch(() => toast('Layar penuh tidak tersedia pada tampilan tersemat')) },
  srch() { const b = $('#sbar'); b.classList.toggle('on'); b.classList.contains('on') && $('#gs').focus() }, top() { scrollTo({ top: 0, behavior: 'smooth' }) },
  acc() { const on = document.documentElement.classList.toggle('big'); toast(on ? 'Ukuran huruf diperbesar' : 'Ukuran huruf normal') },
  eye(b) { $('#pw').type = b.checked ? 'text' : 'password' }, menu() { $('#nav').classList.toggle('open') },
  psheet() { document.body.classList.add('psheet'); print(); document.body.classList.remove('psheet') },
  /* guru */
  async stt(b) { await S.updateConsult(b.dataset.v, { status: b.value }); const c = X.cons.find(c => c.id === b.dataset.v); if (c) c.status = b.value },
  async nt(b) { await S.updateConsult(b.dataset.v, { note: b.value.slice(0, 500) }); const c = X.cons.find(c => c.id === b.dataset.v); if (c) c.note = b.value.slice(0, 500) },
  vw(b) {
    const c = X.cons.find(c => c.id === b.dataset.v), sh = (X.sh || []).find(s => s.code === c.code);
    $('#vwbox').innerHTML = '<div class="note">' + shTxt(c.shared?.profile || sh?.profile, c.shared?.plan || sh?.plan) + '</div>';
  },
  csv() {
    const rows = [['Kode', 'Kelas', 'Topik', 'Status', 'Catatan'], ...(X.cons || []).map(c => [c.code, c.cls, c.topic, c.status, c.note])];
    if ((X.ent || []).length >= 5) { rows.push([], ['Ringkasan minat kelas ' + gcls, 'n=' + X.ent.length], T, T.map(t => Math.round(X.ent.reduce((a, s) => a + (s.scores[t] ?? 0) / (mx(t) || 1) * 100, 0) / X.ent.length) + '%')) }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map(r => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'ringkasan-career-match.csv'; a.click();
  },
  /* admin */
  async rpin(b) { try { lastBatch = [await S.resetPin(b.dataset.v)]; toast('PIN baru dibuat; cetak atau catat sekarang') } catch (e) { fail(e) } render() },
  async off(b) { const r = X.roster.find(x => x.code === b.dataset.v); try { await S.setOff(r.code, !r.off) } catch (e) { fail(e) } render() },
  async pdel(b) { if (confirm('Tutup kode ' + b.dataset.v + ' secara permanen?')) { try { await S.finalize(b.dataset.v); toast('Kode ditutup') } catch (e) { fail(e) } render() } },
  async tg(b) { const u = X.staff.find(s => s.id === b.dataset.v); try { await S.setStaffOff(u.id, !u.off) } catch (e) { fail(e) } render() },
  async ds(b) { if (confirm('Hapus akun staf ini?')) { try { await S.removeStaff(b.dataset.v) } catch (e) { fail(e) } render() } },
  seed() { if (confirm('Impor data awal ke Firestore?')) mut(async () => { await S.seed(); toast('Data awal diimpor') }) },
  cu(b) { if (!/^https:\/\//.test(b.value)) return toast('Tautan harus diawali https://'); const c = C.careers.find(c => c.id == b.dataset.v); c.l = [{ t: c.l?.[0]?.t || 'Sumber resmi', u: b.value }, ...(c.l || []).slice(1)]; mut(async () => { await S.saveCareer(c); toast('Tautan diperbarui') }) },
  cd(b) { const c = C.careers.find(c => c.id == b.dataset.v); c.v = b.value; mut(async () => { await S.saveCareer(c); toast('Tanggal diperbarui') }) },
  dc(b) { if (confirm('Hapus kartu ini?')) mut(() => S.deleteCareer(b.dataset.v)) },
  di(b) { if (confirm('Hapus butir ini?')) mut(() => S.deleteItem(b.dataset.v)) },
  da(b) { mut(() => S.deleteAnn(b.dataset.v)) }
};
const act = (fn, ...a) => Promise.resolve().then(() => fn(...a)).catch(fail);
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || ['SELECT', 'TEXTAREA'].includes(b.tagName) || b.type === 'date' || (b.tagName === 'INPUT' && b.type === 'text')) return; if (A[b.dataset.act]) act(A[b.dataset.act], b, e) });
document.addEventListener('change', e => {
  const b = e.target; if (b.dataset?.act && ['stt', 'cu', 'cd', 'nt'].includes(b.dataset.act)) act(A[b.dataset.act], b);
  if (b.id === 'gc') { gcls = b.value; render() } if (b.id === 'ac') { acls = b.value; render() }
  if (b.closest('#login') && b.type === 'checkbox') { const f = b.form; $('#go').disabled = !(f.ok.checked && f.wali.checked) }
});
document.addEventListener('input', e => {
  const b = e.target; if (b.id === 'q') { q = b.value; const p = b.selectionStart; render().then(() => { const n = $('#q'); n.focus(); n.setSelectionRange(p, p) }) }
  if (b.closest('#login')) { const f = b.form; $('#go').disabled = !(f.ok.checked && f.wali.checked) }
});
document.addEventListener('submit', e => { e.preventDefault(); act(onSubmit, e.target) });
async function onSubmit(f) {
  const d = Object.fromEntries(new FormData(f)), id = f.id;
  if (id === 'login') {
    const c = d.code.trim().toUpperCase(); if (!f.ok.checked || !f.wali.checked) return toast('Kedua persetujuan wajib dicentang'); if (!/^CM-\d{4}$/.test(c)) return toast('Format kode: CM-0412');
    if (Date.now() < lockUntil) return toast('Terlalu banyak percobaan. Coba lagi beberapa saat.');
    try { setSess(await S.studentLogin(c, d.pin, d.cls)); stu = await S.getStudent(); fails = 0; if (stu.consent !== true) { stu.consent = true; await save(true) } X = {}; location.hash = '#/minat'; render() }
    catch (e) { setSess(null); if (++fails >= 5) { lockUntil = Date.now() + 30000; fails = 0 } toast(e.message || 'Gagal masuk') }
  }
  if (id === 'slogin') {
    try { setSess(await S.staffLogin(d.e.trim().toLowerCase(), d.p)); X = {}; location.hash = staff.role === 'admin' ? '#/konten' : '#/guru'; render() } catch (e) { setSess(null); toast(e.message) }
  }
  if (id === 'plan') { if (!d.goal?.trim()) return toast('Tujuan wajib diisi'); stu.plans = stu.plans || {}; stu.plans[tab] = d; await save(true); toast('Rencana ' + tab + ' tersimpan') }
  if (id === 'cons') {
    if (d.q.trim().length < 10) return toast('Pertanyaan minimal 10 karakter');
    const shared = {}; if (d.profile && stu.scores) shared.profile = { scores: stu.scores }; if (d.plan) shared.plan = { plans: stu.plans || {} };
    const cid = await S.addConsult(stu, { topic: d.topic, q: d.q.trim(), shared }); stu.cids = [...(stu.cids || []), cid]; await save(); X.my = null; render(); toast('Permintaan terkirim');
  }
  if (id === 'nc') mut(() => S.saveCareer({ id: nextId(C.careers), n: d.n.trim(), c: d.c.toUpperCase(), p: new FormData(f).getAll('p'), d: d.d.trim(), rq: d.rq || '-', s: d.s || '-', f: d.f || '-', l: [{ t: 'Sumber resmi', u: d.u }], v: new Date().toISOString().slice(0, 10) }));
  if (id === 'ni') mut(() => S.saveItem({ id: nextId(C.items), t: d.t, x: d.x.trim() }));
  if (id === 'na') mut(() => S.saveAnn({ id: Date.now(), t: d.t.trim(), d: d.d.trim(), ts: Date.now() }));
  if (id === 'ns') { try { await S.createStaff(d.e.trim(), d.nm.trim(), d.r, d.p); toast('Akun staf dibuat') } catch (e) { fail(e) } render() }
  if (id === 'gen') {
    const n = Math.max(1, Math.min(40, +d.n || 0)); toast('Membuat ' + n + ' kode...');
    try { lastBatch = await S.createCodes(acls, n); toast(n + ' kode dibuat; cetak lembar kode sekarang') } catch (e) { fail(e) } render();
  }
  if (id === 'nk') mut(() => S.addClass(d.k));
}
addEventListener('hashchange', render);

/* ── mulai ── */
try {
  C = await S.loadContent(); setSess(await S.restore());
  if (me) stu = await S.getStudent();
} catch (e) { fail(e) }
render();
