import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5KCoW3JX29DzYLfulCaREM57C7kEaqxk",
  authDomain: "trash-point-9d4dc.firebaseapp.com",
  databaseURL: "https://trash-point-9d4dc-default-rtdb.firebaseio.com",
  projectId: "trash-point-9d4dc",
  storageBucket: "trash-point-9d4dc.firebasestorage.app",
  messagingSenderId: "722873333520",
  appId: "1:722873333520:web:f5c32ccd73f35cbdbb1795"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };