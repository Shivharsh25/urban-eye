import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACoL8CQEkpXq-HnUTvoVX0zinAhzSxvuU",
  authDomain: "urban-eye-bddbb.firebaseapp.com",
  projectId: "urban-eye-bddbb",
  storageBucket: "urban-eye-bddbb.firebasestorage.app",
  messagingSenderId: "554050111934",
  appId: "1:554050111934:web:87a358a385b73193f291ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
