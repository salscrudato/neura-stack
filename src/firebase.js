import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
    apiKey: "AIzaSyDPs5n69ryf3gcxLYha7_iRwXnVp29twUA",
    authDomain: "hackenchat.firebaseapp.com",
    projectId: "hackenchat",
    storageBucket: "hackenchat.firebasestorage.app",
    messagingSenderId: "28711770337",
    appId: "1:28711770337:web:2979812c226c9ec08effa0"
  };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const auth = getAuth(app);