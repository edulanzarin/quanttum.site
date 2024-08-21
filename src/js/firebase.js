import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWgjOPqQZr4A8YlnwOQpr3n_JWncLZOmk",
  authDomain: "quanttum-site.firebaseapp.com",
  projectId: "quanttum-site",
  storageBucket: "quanttum-site.appspot.com",
  messagingSenderId: "223565529814",
  appId: "1:223565529814:web:d992bd60cba7aadb54ff77",
  measurementId: "G-5RZM4HERL8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, createUserWithEmailAndPassword, sendEmailVerification };
