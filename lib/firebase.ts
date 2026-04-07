// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIbDMRkAIzUGrUTVzoj67MY8N1d4dyRd8",
  authDomain: "college-pyq-hub-8f723.firebaseapp.com",
  projectId: "college-pyq-hub-8f723",
  storageBucket: "college-pyq-hub-8f723.firebasestorage.app",
  messagingSenderId: "928761975266",
  appId: "1:928761975266:web:6db7623f8c5cc1d344a9bb",
  measurementId: "G-4906LN4V1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const db = getFirestore(app);        // Firestore Database
const storage = getStorage(app);     // Storage (PDF files ke liye)

export { db, storage, app };