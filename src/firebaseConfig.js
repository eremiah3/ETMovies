import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCrGGNqhHql4MTkq2NRATKCPPJYuNBAriw",
  authDomain: "etmovies-7f6b4.firebaseapp.com",
  projectId: "etmovies-7f6b4",
  storageBucket: "etmovies-7f6b4.firebasestorage.app",
  messagingSenderId: "238818413800",
  appId: "1:238818413800:web:f64a42cbc422b16cb94d5d",
  measurementId: "G-P9Z45SYP1E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };
