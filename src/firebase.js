// Import the functions you need from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSnf-CaGqx7agSl9mUaK6E5KaTek0KUjY",
  authDomain: "library-management-syste-26a50.firebaseapp.com",
  databaseURL: "https://library-management-syste-26a50-default-rtdb.firebaseio.com",
  projectId: "library-management-syste-26a50",
  storageBucket: "library-management-syste-26a50.firebasestorage.app",
  messagingSenderId: "832389142943",
  appId: "1:832389142943:web:30e477a638e6cf463d85aa",
  measurementId: "G-JL6CBWQGXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app); // Firebase Authentication instance

// Export Firestore and Authentication instances
export { db, auth };
