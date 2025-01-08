// Importujemy niezbędne funkcje z Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Importujemy funkcję do logowania użytkowników
import { getFirestore } from "firebase/firestore";  // Importujemy Firestore

// Konfiguracja Twojej aplikacji Firebase - używamy zmiennych środowiskowych
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicjalizujemy aplikację Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizujemy Firebase Authentication
const auth = getAuth(app);  // Uzyskujemy dostęp do funkcji logowania

// Inicjalizujemy Firestore
const db = getFirestore(app);

// Eksportujemy auth i db, aby używać ich w innych plikach (np. w Login, Register)
export { auth, db };
