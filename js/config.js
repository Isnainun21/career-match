/* Konfigurasi Firebase.
   Selama apiKey masih berawalan "ISI", aplikasi berjalan dalam MODE DEMO (data di localStorage).
   Untuk produksi: Firebase Console -> Project settings -> Your apps -> Web app -> salin firebaseConfig ke sini.
   Nilai ini memang publik (bukan rahasia); keamanan data ditegakkan oleh firestore.rules. */
export const firebaseConfig = {
  apiKey: 'ISI_API_KEY',
  authDomain: 'ISI_PROJECT_ID.firebaseapp.com',
  projectId: 'ISI_PROJECT_ID',
  storageBucket: 'ISI_PROJECT_ID.appspot.com',
  messagingSenderId: 'ISI',
  appId: 'ISI'
};
