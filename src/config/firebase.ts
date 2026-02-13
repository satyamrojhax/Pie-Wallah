// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, User } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsMoRJAfinXMAqU-Lm7KDYOm-6qrZ4-_I",
  authDomain: "piewallahapp.firebaseapp.com",
  databaseURL: "https://piewallahapp-default-rtdb.firebaseio.com",
  projectId: "piewallahapp",
  storageBucket: "piewallahapp.firebasestorage.app",
  messagingSenderId: "997945838389",
  appId: "1:997945838389:web:3c3e0f6ae050624d971a7c",
  measurementId: "G-XBB469EE8M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth with LOCAL persistence for reliable mobile storage
let auth: ReturnType<typeof getAuth>;

try {
  auth = getAuth(app);
  // Set persistence to LOCAL for reliable storage on mobile devices
  // This ensures auth state persists even when app is closed on mobile
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Failed to set auth persistence:', error);
  });
} catch (error) {
  console.warn('Firebase Auth already initialized or failed to initialize:', error);
  auth = getAuth(app);
}

// Auth state change listener
let authStateChangeUnsubscribe: (() => void) | null = null;

export const initializeAuthListener = (callback: (user: User | null) => void): (() => void) => {
  if (authStateChangeUnsubscribe) {
    authStateChangeUnsubscribe();
  }
  authStateChangeUnsubscribe = onAuthStateChanged(auth, callback);
  return () => {
    if (authStateChangeUnsubscribe) {
      authStateChangeUnsubscribe();
      authStateChangeUnsubscribe = null;
    }
  };
};

export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

export { app, analytics, auth };
