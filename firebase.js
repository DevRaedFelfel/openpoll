import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQ1Q-iaQFXSdsQTdqXXuHlWBkJTfYf3yE",
  authDomain: "openpolsdb.firebaseapp.com",
  projectId: "openpolsdb",
  storageBucket: "openpolsdb.firebasestorage.app",
  messagingSenderId: "823980646431",
  appId: "1:823980646431:web:fa1086963820c2eff9352a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
