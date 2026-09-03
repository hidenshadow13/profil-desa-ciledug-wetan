// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBigy4fysARSa3ZZC_NOtt8lus7XsOjlF0",
  authDomain: "profil-ciledug-wetan.firebaseapp.com",
  projectId: "profil-ciledug-wetan",
  storageBucket: "profil-ciledug-wetan.firebasestorage.app",
  messagingSenderId: "907646347611",
  appId: "1:907646347611:web:9aa241144a333e9d26127e",
  measurementId: "G-S8XXFEFDWJ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };