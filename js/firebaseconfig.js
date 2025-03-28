import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhI_N0bPlhaBaNXiyIHHWX5KzIznPD9fs",
  authDomain: "leadershipg-v1.firebaseapp.com",
  projectId: "leadershipg-v1",
  storageBucket: "leadershipg-v1.firebasestorage.app",
  messagingSenderId: "1069669847032",
  appId: "1:1069669847032:web:db299884387f59c58b500d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
