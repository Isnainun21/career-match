/* Lapisan penyimpanan Career Match. Dua implementasi dengan API yang sama:
   - demo     : localStorage (fallback memori bila storage diblokir, mis. dalam iframe Google Sites)
   - firebase : Firebase Authentication + Cloud Firestore (aktif bila js/config.js sudah diisi)
   app.js hanya memakai objek `S` dari createStore(); tidak peduli mode mana yang aktif. */
import { CM_DATA as D } from './data.js';
import { firebaseConfig } from './config.js';

export const FB = !!(firebaseConfig && firebaseConfig.apiKey && !/^ISI/.test(firebaseConfig.apiKey));
const BAD = 'Kode, PIN, atau kelas tidak cocok. Hubungi Admin sekolah atau Guru BK.';
const DOM = 'siswa.career-match.id'; // domain palsu untuk email siswa (tidak ada email yang dikirim)
const clone = x => JSON.parse(JSON.stringify(x));
const rnd = m => crypto.getRandomValues(new Uint32Array(1))[0] % m;
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(15)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
const byTs = (a, b) => (b.ts || 0) - (a.ts || 0);

/* ───────────────────────── MODE DEMO ───────────────────────── */
function demoStore() {
  const KEY = 'cm_demo_v2', mem = {};
  const LS = { g(k) { try { return localStorage.getItem(k) } catch (e) { return mem[k] ?? null } }, s(k, v) { try { localStorage.setItem(k, v) } catch (e) { mem[k] = v } } };
  let db; try { db = JSON.parse(LS.g(KEY)) } catch (e) { db = null }
  if (!db) db = { classes: clone(D.classes), items: clone(D.items), careers: clone(D.careers), ann: clone(D.announcements), students: clone(D.students), consults: clone(D.consults), staff: clone(D.staff) };
  const save = () => LS.s(KEY, JSON.stringify(db));
  let code = null;
  const me = () => db.students[code];
  const upsert = (list, o) => { const i = list.findIndex(x => String(x.id) === String(o.id)); i < 0 ? list.push(clone(o)) : list[i] = clone(o); save() };
  const newPin = () => String(rnd(9000) + 1000);
  return {
    mode: 'demo',
    async loadContent() { return clone({ classes: db.classes, items: [...db.items].sort((a, b) => a.id - b.id), careers: [...db.careers].sort((a, b) => a.id - b.id), ann: [...db.ann].sort(byTs) }) },
    async restore() { return null },
    async studentLogin(c, pin, cls) {
      const x = db.students[c];
      if (!x || x.pin !== pin || x.cls !== cls || x.off || x.delReq) throw new Error(BAD);
      x.consent = true; save(); code = c; return { kind: 'student', code: c, cls: x.cls };
    },
    async staffLogin(e, p) {
      const u = db.staff.find(s => s.email === e && s.pw === p);
      if (!u) throw new Error('Email atau kata sandi salah.');
      if (u.off) throw new Error('Akun dinonaktifkan. Hubungi Admin sekolah.');
      return { kind: 'staff', role: u.role, name: u.name, email: u.email, id: u.id };
    },
    async logout() { code = null },
    async getStudent() { const { pin, off, delReq, filled, ...o } = clone(me()); return o },
    async putStudent(o) { Object.assign(me(), clone(o)); save() },
    async publish() { me().filled = true; save() },
    async syncShare() { },
    async addConsult(o, c) { const id = 'c' + Date.now(); db.consults.push({ id, code, cls: o.cls, topic: c.topic, q: c.q, shared: clone(c.shared || {}), status: 'Baru', note: '', ts: Date.now() }); save(); return id },
    async myConsults() { return clone(db.consults.filter(c => c.code === code)).sort(byTs) },
    async withdraw() { const x = me(); x.consent = false; x.share = {}; x.filled = false; db.consults.filter(c => c.code === code).forEach(c => c.shared = {}); save() },
    async requestDelete() {
      const x = me(); ['ans', 'idx', 'scores', 'plans', 'bm', 'share', 'cids'].forEach(k => delete x[k]);
      x.filled = false; x.delReq = Date.now(); db.consults = db.consults.filter(c => c.code !== code); save();
    },
    /* guru */
    async consults() { return clone(db.consults).sort(byTs) },
    async updateConsult(id, patch) { Object.assign(db.consults.find(c => c.id === id), patch); save() },
    async shares(cls) {
      return Object.entries(db.students).filter(([, x]) => x.cls === cls && x.consent !== false && !x.delReq && (x.share?.profile || x.share?.plan))
        .map(([k, x]) => clone({ code: k, cls, profile: x.share.profile && x.scores ? { scores: x.scores } : null, plan: x.share.plan && x.plans ? { plans: x.plans } : null }));
    },
    async entries(cls) { return Object.values(db.students).filter(x => x.cls === cls && x.filled && x.consent !== false && !x.delReq && x.scores).map(x => ({ scores: clone(x.scores) })) },
    /* admin */
    async roster() { return Object.entries(db.students).map(([k, x]) => ({ code: k, cls: x.cls, filled: !!x.filled, off: !!x.off, delReq: x.delReq || null })).sort((a, b) => a.code.localeCompare(b.code)) },
    async createCodes(cls, n) {
      const out = [];
      for (let i = 0; i < n; i++) { let c; do { c = 'CM-' + (rnd(9000) + 1000) } while (db.students[c]); const pin = newPin(); db.students[c] = { cls, pin }; out.push({ code: c, pin, cls }) }
      save(); return out;
    },
    async resetPin(c) { const pin = newPin(); db.students[c].pin = pin; save(); return { code: c, pin, cls: db.students[c].cls } },
    async setOff(c, off) { db.students[c].off = off; save() },
    async finalize(c) { delete db.students[c]; db.consults = db.consults.filter(x => x.code !== c); save() },
    async staffList() { return db.staff.map(({ pw, ...s }) => ({ ...s })) },
    async createStaff(email, name, role, pw) { db.staff.push({ id: 's' + Date.now(), email: email.toLowerCase(), name, role, pw, off: false }); save() },
    async setStaffOff(id, off) { db.staff.find(s => s.id === id).off = off; save() },
    async removeStaff(id) { db.staff = db.staff.filter(s => s.id !== id); save() },
    /* konten */
    async saveCareer(c) { upsert(db.careers, c) }, async deleteCareer(id) { db.careers = db.careers.filter(c => c.id != id); save() },
    async saveItem(i) { upsert(db.items, i) }, async deleteItem(id) { db.items = db.items.filter(i => i.id != id); save() },
    async saveAnn(a) { upsert(db.ann, a) }, async deleteAnn(id) { db.ann = db.ann.filter(a => a.id != id); save() },
    async addClass(k) { if (!db.classes.includes(k)) { db.classes.push(k); save() } },
    async seed() { }, async resetDemo() { try { localStorage.removeItem(KEY) } catch (e) { } delete mem[KEY]; location.reload() },
    errMsg: e => e.message
  };
}

/* ───────────────────────── MODE FIREBASE ───────────────────────── */
async function firebaseStore() {
  const B = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const [{ initializeApp }, A, F] = await Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')]);
  const app = initializeApp(firebaseConfig), auth = A.getAuth(app), fs = F.getFirestore(app);
  try { await A.setPersistence(auth, A.browserSessionPersistence) } catch (e) { try { await A.setPersistence(auth, A.inMemoryPersistence) } catch (_) { } }
  const d = (...p) => F.doc(fs, ...p), col = n => F.collection(fs, n);
  const em = (c, pin) => `${c.toLowerCase()}-${pin}@${DOM}`, pw = (c, pin) => `cm${pin}${c.slice(3)}`;
  let code = null, cls = null, secAuth = null;
  /* Akun dibuat lewat aplikasi Firebase kedua agar sesi admin yang sedang masuk tidak terganti. */
  async function mk(email, password) {
    if (!secAuth) { secAuth = A.getAuth(initializeApp(firebaseConfig, 'secondary')); try { await A.setPersistence(secAuth, A.inMemoryPersistence) } catch (e) { } }
    const c = await A.createUserWithEmailAndPassword(secAuth, email, password); await A.signOut(secAuth); return c.user.uid;
  }
  const rows = async q => (await F.getDocs(q)).docs.map(s => ({ id: s.id, ...s.data() }));
  async function checkRoster(c, uid) {
    const s = await F.getDoc(d('roster', c)); const r = s.exists() ? s.data() : null;
    if (!r || r.uid !== uid || r.off || r.delReq) throw new Error(BAD);
    return r;
  }
  async function staffSession(u) {
    const s = await F.getDoc(d('staff', u.uid)); const x = s.exists() ? s.data() : null;
    if (!x || x.off) { await A.signOut(auth); throw new Error('Akun ini bukan akun staf aktif.') }
    return { kind: 'staff', role: x.role, name: x.name || x.email, email: x.email, id: u.uid };
  }
  return {
    mode: 'firebase',
    async loadContent() {
      const [classes, items, careers, ann] = await Promise.all(['classes', 'items', 'careers', 'announcements'].map(n => rows(col(n))));
      return { classes: classes.map(c => c.id).sort(), items: items.sort((a, b) => a.id - b.id), careers: careers.sort((a, b) => a.id - b.id), ann: ann.sort(byTs) };
    },
    async restore() {
      await auth.authStateReady(); const u = auth.currentUser; if (!u) return null;
      try {
        if ((u.email || '').endsWith('@' + DOM)) {
          const m = /^cm-(\d{4})-\d{4}@/.exec(u.email); const c = 'CM-' + m[1]; const r = await checkRoster(c, u.uid);
          code = c; cls = r.cls; return { kind: 'student', code: c, cls };
        }
        return await staffSession(u);
      } catch (e) { await A.signOut(auth); return null }
    },
    async studentLogin(c, pin, k) {
      try { await A.signInWithEmailAndPassword(auth, em(c, pin), pw(c, pin)) } catch (e) { throw new Error(BAD) }
      try { const r = await checkRoster(c, auth.currentUser.uid); if (r.cls !== k) throw new Error(BAD); code = c; cls = r.cls; return { kind: 'student', code: c, cls } }
      catch (e) { await A.signOut(auth); throw new Error(BAD) }
    },
    async staffLogin(e, p) {
      try { await A.signInWithEmailAndPassword(auth, e, p) } catch (x) { throw new Error('Email atau kata sandi salah.') }
      return staffSession(auth.currentUser);
    },
    async logout() { code = null; cls = null; await A.signOut(auth) },
    async getStudent() {
      const s = await F.getDoc(d('students', code));
      if (s.exists()) return { ans: {}, idx: 0, plans: {}, bm: [], share: {}, cids: [], ...s.data(), cls };
      const o = { cls, consent: true, ans: {}, idx: 0, plans: {}, bm: [], share: {}, cids: [] }; await F.setDoc(d('students', code), o); return o;
    },
    async putStudent(o) { await F.setDoc(d('students', code), clone(o)) },
    async publish(o) {
      o.eid = o.eid || rid();
      await F.setDoc(d('entries', o.eid), { cls: o.cls, scores: clone(o.scores), ts: Date.now() });
      await F.updateDoc(d('roster', code), { filled: true });
    },
    async syncShare(o) {
      const sh = o.share || {};
      if (!o.consent || (!sh.profile && !sh.plan)) return F.deleteDoc(d('shares', code));
      await F.setDoc(d('shares', code), clone({ code, cls: o.cls, profile: sh.profile && o.scores ? { scores: o.scores } : null, plan: sh.plan && o.plans ? { plans: o.plans } : null, ts: Date.now() }));
    },
    async addConsult(o, c) {
      const r = await F.addDoc(col('consults'), clone({ code, cls: o.cls, topic: c.topic, q: c.q, shared: c.shared || {}, status: 'Baru', note: '', ts: Date.now() })); return r.id;
    },
    async myConsults(o) {
      const l = await Promise.all((o.cids || []).map(id => F.getDoc(d('consults', id))));
      return l.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() })).sort(byTs);
    },
    async withdraw(o) {
      if (o.eid) await F.deleteDoc(d('entries', o.eid));
      await F.deleteDoc(d('shares', code));
      await Promise.all((o.cids || []).map(id => F.updateDoc(d('consults', id), { shared: {} })));
      await F.setDoc(d('students', code), clone({ ...o, consent: false, share: {}, eid: null }));
      await F.updateDoc(d('roster', code), { filled: false });
    },
    async requestDelete(o) {
      await Promise.all((o.cids || []).map(id => F.deleteDoc(d('consults', id))));
      if (o.eid) await F.deleteDoc(d('entries', o.eid));
      await F.deleteDoc(d('shares', code)); await F.deleteDoc(d('students', code));
      await F.updateDoc(d('roster', code), { delReq: Date.now(), filled: false });
    },
    async consults() { return (await rows(col('consults'))).sort(byTs) },
    async updateConsult(id, patch) { await F.updateDoc(d('consults', id), patch) },
    async shares(k) { return (await rows(F.query(col('shares'), F.where('cls', '==', k)))).map(x => ({ ...x, code: x.code || x.id })) },
    async entries(k) { return rows(F.query(col('entries'), F.where('cls', '==', k))) },
    async roster() { return (await rows(col('roster'))).map(r => ({ code: r.id, cls: r.cls, filled: !!r.filled, off: !!r.off, delReq: r.delReq || null })).sort((a, b) => a.code.localeCompare(b.code)) },
    async createCodes(k, n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        let c; for (; ;) { c = 'CM-' + (rnd(9000) + 1000); if (!out.some(x => x.code === c) && !(await F.getDoc(d('roster', c))).exists()) break }
        const pin = String(rnd(9000) + 1000), uid = await mk(em(c, pin), pw(c, pin));
        await F.setDoc(d('roster', c), { cls: k, uid, filled: false, off: false, ts: Date.now() }); out.push({ code: c, pin, cls: k });
      }
      return out;
    },
    async resetPin(c) {
      const r = (await F.getDoc(d('roster', c))).data(), pin = String(rnd(9000) + 1000), uid = await mk(em(c, pin), pw(c, pin));
      await F.updateDoc(d('roster', c), { uid }); return { code: c, pin, cls: r.cls };
    },
    async setOff(c, off) { await F.updateDoc(d('roster', c), { off }) },
    async finalize(c) { await F.deleteDoc(d('roster', c)) },
    async staffList() { return rows(col('staff')) },
    async createStaff(email, name, role, p) { const uid = await mk(email, p); await F.setDoc(d('staff', uid), { email: email.toLowerCase(), name, role, off: false }) },
    async setStaffOff(id, off) { await F.updateDoc(d('staff', id), { off }) },
    async removeStaff(id) { await F.deleteDoc(d('staff', id)) },
    async saveCareer(c) { await F.setDoc(d('careers', String(c.id)), clone(c)) }, async deleteCareer(id) { await F.deleteDoc(d('careers', String(id))) },
    async saveItem(i) { await F.setDoc(d('items', String(i.id)), clone(i)) }, async deleteItem(id) { await F.deleteDoc(d('items', String(id))) },
    async saveAnn(a) { await F.setDoc(d('announcements', String(a.id)), clone(a)) }, async deleteAnn(id) { await F.deleteDoc(d('announcements', String(id))) },
    async addClass(k) { await F.setDoc(d('classes', k), { name: k }) },
    async seed() {
      const b = F.writeBatch(fs);
      D.classes.forEach(k => b.set(d('classes', k), { name: k }));
      D.items.forEach(i => b.set(d('items', String(i.id)), clone(i)));
      D.careers.forEach(c => b.set(d('careers', String(c.id)), clone(c)));
      D.announcements.forEach(a => b.set(d('announcements', String(a.id)), clone(a)));
      await b.commit();
    },
    async resetDemo() { },
    errMsg(e) {
      if (!e) return 'Terjadi kesalahan.';
      if (e.code === 'permission-denied') return 'Akses ditolak oleh aturan keamanan.';
      if (e.code === 'unavailable' || /network/i.test(e.code || '')) return 'Tidak ada koneksi internet.';
      if (e.code === 'auth/email-already-in-use') return 'Email atau kode sudah terdaftar.';
      if (e.code === 'auth/weak-password') return 'Kata sandi minimal 6 karakter.';
      return e.message || 'Terjadi kesalahan.';
    }
  };
}

export async function createStore() { return FB ? firebaseStore() : demoStore() }
