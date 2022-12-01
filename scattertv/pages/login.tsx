import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useRouter } from 'next/router'
import { initializeApp } from 'firebase/app';
import {getFirestore, doc,addDoc, setDoc, collection, Firestore, initializeFirestore, updateDoc } from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider , getAdditionalUserInfo} from "firebase/auth";

export async function getStaticProps() {
  return {
    props: { title: 'My Title', content: '...' }
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyCUccw8OTBookt1n9dN2zDu0Q_jNAEvIec",
  authDomain: "scattertv-b89bc.firebaseapp.com",
  projectId: "scattertv-b89bc",
  storageBucket: "scattertv-b89bc.appspot.com",
  messagingSenderId: "323125299537",
  appId: "1:323125299537:web:f2001ab206765c49546b70",
  measurementId: "G-656M6GP9TL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

async function initalUserSetup(uid){
  try {
    let userDoc = await doc(db, 'users', uid)
    await setDoc(userDoc, {
          shows: [],
        });
      
  } catch (e) {
    console.error("Error adding document: ", e);
  }

}

function firebaseSignUp(email,password): boolean{
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // Create firebase entry for user storage
      initalUserSetup(user.uid)
    
      return true
      
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode,errorMessage)
      return false
    });
    return false
}




function Home(title: String) {
  const router = useRouter()
  
  let [showSearch, setShowSearch] = useState<any>([])
  let [isLoading, setLoading] = useState(false);
  let [isSignedIn, setSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function firebaseSignIn(email,password): boolean{
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log("User Signed in!")

        router.push('/')
        return true
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage)
        return false
    });
  return false
}
  const searchShow = async (search: string) => {
    if (search.length === 0) {
      setShowSearch([])
    }
    if (search.length >= 2) {
      await axios("https://api.themoviedb.org/3/search/tv?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US&page=1&query=" + search + "&include_adult=false").then(
        (res) => {
          const json = res.data;
          let totalResults = 0
          let searchResults = []
          for (let i = 0; i < json.results.length; ++i) {
            if (totalResults === 5) {
              break
            }
            let showName = json.results[i]['name'];
            let showID = json.results[i]['id']
            let posterPath = "https://image.tmdb.org/t/p/w500" + json.results[i]['poster_path']
            searchResults.push([showName, showID, posterPath])
            totalResults += 1
          }
          setShowSearch(searchResults || [])
        }
      )

    }
    return 'Show Found!'
  }
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  auth.languageCode = 'en';
  provider.setCustomParameters({
    'login_hint': 'user@example.com'
  });

  return (
    <div>
      <div className={styles.container}>
        <Head>
          <title>ScatterTV</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <h1 className={styles.title}>
          <a>ScatterTV</a>
        </h1>

        <main className={styles.main}>
        <h1 className={styles.title}>
        </h1>
        <a>Sign In</a>
        <div className = {styles.loginBox}>
          <input type="text" placeholder="E-mail Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login__btn" onClick={()=> {
              firebaseSignIn(email,password);
              }} >
            Login
          </button>
          <button className="login__btn login__google" onClick={()=> {setSignIn(firebaseSignUp(email,password))}} >
            Sign Up
          </button>
          <button onClick={()=>{
              signInWithPopup(auth, provider)
              .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                const { isNewUser } = getAdditionalUserInfo(result)
                if(isNewUser){
                  initalUserSetup(user.uid)
                }
                router.push('/')
        
              }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log(error,errorMessage,errorCode)
                // ...
              });
            }}>
            sign in with google
          </button>
        </div>
        
        <a>No Account? Sign up below!</a>


        </main>

      </div>
      <div>
        <footer className={styles.footer}>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <span className={styles.logo}>
              <Image src="/tmdbLogo.svg" alt="TMDB Logo" width={72} height={16} />
            </span>
          </a>
        </footer>
      </div>
    </div>
  )
}
export default Home