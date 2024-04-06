import { initializeApp } from "firebase/app";
import {getDatabase} from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQJEIoHkhJBHUaC-YteBeiepSCzcVM51s",
  authDomain: "web---vocabulary.firebaseapp.com",
  projectId: "web---vocabulary",
  storageBucket: "web---vocabulary.appspot.com",
  messagingSenderId: "528485547653",
  appId: "1:528485547653:web:3aecc60029dbc7063073ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database };