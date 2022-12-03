import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyCUccw8OTBookt1n9dN2zDu0Q_jNAEvIec",
    authDomain: "scattertv-b89bc.firebaseapp.com",
    projectId: "scattertv-b89bc",
    storageBucket: "scattertv-b89bc.appspot.com",
    messagingSenderId: "323125299537",
    appId: "1:323125299537:web:f2001ab206765c49546b70",
    measurementId: "G-656M6GP9TL"
  };

  // Initialize Firebase
export let app = initializeApp(firebaseConfig);
export let auth = getAuth(app);
export let db = getFirestore(app);
