import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged , signOut} from "firebase/auth";
import { initializeApp } from 'firebase/app';
import {getFirestore, doc,addDoc, setDoc,getDoc, collection, Firestore, initializeFirestore, updateDoc } from "firebase/firestore"; 

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
const auth = getAuth(app);
const db = getFirestore(app);



function Home(title: String) {
  const router = useRouter()
  let [showSearch, setShowSearch] = useState<any>([])
  let [userShows, setUserShows] = useState<any>([])
  let [isLoading, setLoading] = useState(false);
  let [isSignedIn, setSignin] = useState(false);
  let [uid,setUID] = useState('')

  // Check if user is signed in with firebase
  useEffect(()=>{
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        console.log("signed in!")
        setSignin(true)
        setUID(uid)
        let firstDoc = await doc(db, "users", uid);
        const docSnap = await getDoc(firstDoc);
        let showsReceived = docSnap.data();
        let addShow = true;
        let scrubbedShows = []
        const result = showsReceived.shows.map((obj) => {
          scrubbedShows.push([obj.showName,obj.showID,obj.posterPath])
        })
        setUserShows(scrubbedShows)

      } else {
        setSignin(false)
        console.log("signed out")
      }
    });
  
  },[])
  async function removeShow (showID)  {
    try {
      let firstDoc = doc(db, "users", uid);
      const docSnap = await getDoc(firstDoc);
      let showsReceived = docSnap.data();
      let newListOfShows = []
      const result = showsReceived.shows.map((obj) => {
        if(obj.showID !== showID){
          newListOfShows.push(obj)
        }
      });
      let docRef = await setDoc(doc(db, "users", uid), {
        shows:newListOfShows
      });
      
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    try{
      let firstDoc = doc(db, "users", uid);
      const docSnap = await getDoc(firstDoc);
      let showsReceived = docSnap.data();
      let addShow = true;
      let scrubbedShows = []
      const result = showsReceived.shows.map((obj) => {
        scrubbedShows.push([obj.showName,obj.showID,obj.posterPath])
      })
      setUserShows(scrubbedShows)
    } catch (e) {
      console.log("Error Repopulating Shows!")
    }
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
  var showRes = showSearch
  return (
    <div>
      <div className={styles.container}>
      <Head>
        <title>ScatterTV</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.showHeader}>
        <a className={styles.returnButton} onClick={()=>{
            router.push('/')
        }}> &lt; return to homepage</a>

        <h1 className={styles.title}>
          <a>ScatterTV</a>
        </h1>
        {isSignedIn ? 
          <div className={styles.signedOnButtons}>
              <a className={styles.profileButton} onClick={()=>{
                    router.push('/profile')
                }}>my profile</a>
                <a className={styles.profileButton} onClick={()=>{      
                  signOut(auth).then(() => {
                    // Sign-out successful.
                  }).catch((error) => {
                    // An error happened.
                  });
                }}>signout</a>
          </div>   
          :
           <a className={styles.signOnButton} onClick={()=>{
            router.push('/login')
        }}> sign on</a>
        }
      </div>

      <main className={styles.main}>
        <input
          placeholder="Search..."
          type="text"
          onChange={(e) => {
            searchShow(e.target.value)
          }
          }
        />


        <div className="hidden lg:block">
        {isLoading ? <p>Loading Show...</p> :
          <table>
            <tbody>
              {showRes.map(emp => (
                <tr key={emp}>
                  <td className={styles.resultCellImg} onClick={() => {
                  }}><img width='75px' src={emp[2]}></img></td>
                  <td className={styles.resultCellName} onClick={() => {
                    setLoading(true)
                    router.push('/shows/'+emp[1])
                  }}>{emp[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
        </div>

        <div className ={styles.topShows}>
          <h1>
            my shows
          </h1>
        <div className={styles.showListContainer}>
            {
            userShows.map(show => (
              <div className={styles.individualShow} key={show}>
                <div className={styles.showButton} onClick={()=>{
                  router.push('/shows/'+show[1])
                }}>
                  <Image width={288} height={430} src={show[2]} alt={show[0]}/>
                  <br></br>
                  {show[0]}
                  <br></br>
                </div>
                {isSignedIn ? 
                  <div className={styles.removeShow}>
                    <a  onClick={()=>{
                      removeShow(show[1])
                      }}> remove from library</a>
                  </div> :
                  <div className={styles.addtoLibrary}>
                  <a  onClick={()=>{
                      router.push('/login/')
                    }}> sign in to add show</a>
                </div>
                  }
                </div>
                  ))}
        </div>
      </div>



        <div className={styles.grid}>

        <a className={styles.card} onClick={()=>{
                  router.push('/top100/')
            }}>
              <h2>Top 100 Shows &rarr;</h2>
              <p>A list of the most popular shows from around the world.</p>
            </a>
          <a
            href="https://cs484-website.pages.dev/syllabus"
            className={styles.card}
          >
            <h2>Project  &rarr;</h2>
            <p>This project was developed for CS484; a Secure Web App Development Course</p>
          </a>
        </div>
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