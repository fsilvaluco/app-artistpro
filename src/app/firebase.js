// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlW7wIreRWCVbJgbadgDeE8AZhCh2hHHQ",
  authDomain: "artista-v2.firebaseapp.com",
  projectId: "artista-v2",
  storageBucket: "artista-v2.firebasestorage.app",
  messagingSenderId: "515521218662",
  appId: "1:515521218662:web:ab6799d3756989baab45a7",
  measurementId: "G-GTVCPS891Q"
};

// Inicializa la app de Firebase
const app = initializeApp(firebaseConfig);

// Exporta Auth, Firestore y el provider de Google
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
