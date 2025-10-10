// Import the functions you need from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "replace with your key",
  authDomain: "replace with your key",
  databaseURL: "replace with your key",
  projectId: "replace with your key",
  storageBucket: "lreplace with your key",
  messagingSenderId: "replace with your key",
  appId: "1:replace with your key",
  measurementId: "G-replace with your key"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app); // Firebase Authentication instance

// Export Firestore and Authentication instances
export { db, auth };


// This is to be modified 