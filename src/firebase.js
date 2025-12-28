import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "svntex-75775092-35813",
  appId: "1:494769609592:web:a356b5ef723f9adb7c868d",
  storageBucket: "svntex-75775092-35813.appspot.com",
  apiKey: "AIzaSyAgiGyBKmN9dXnPTqxWa6ZP9hIkC19JhsQ",
  authDomain: "svntex-75775092-35813.firebaseapp.com",
  messagingSenderId: "494769609592",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export all the Firebase services your app uses
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export all services for use throughout the application
export { db, auth, storage };
