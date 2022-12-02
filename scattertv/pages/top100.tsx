import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useRouter } from 'next/router'
import { initializeApp } from 'firebase/app';
import {getFirestore, doc, setDoc,getDoc} from "firebase/firestore"; 

import { getAuth , signOut, onAuthStateChanged} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUccw8OTBookt1n9dN2zDu0Q_jNAEvIec",
  authDomain: "scattertv-b89bc.firebaseapp.com",
  projectId: "scattertv-b89bc",
  storageBucket: "scattertv-b89bc.appspot.com",
  messagingSenderId: "323125299537",
  appId: "1:323125299537:web:f2001ab206765c49546b70",
  measurementId: "G-656M6GP9TL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function TopShows(props) {
  let showList = props.topShows
  const router = useRouter()
  let [isSignedIn, setSignin] = useState(false);
  let [uid, setUID] = useState('')
  // Check if user is signed in with firebase
  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log("signed in!")
        setUID(uid)
        setSignin(true)
        // ...
      } else {
        setSignin(false)
        console.log("signed out")
      }
    })
  },[])
  async function addShow (showName,showID,posterPath)  {
    try {
      let firstDoc = doc(db, "users", uid);

      const docSnap = await getDoc(firstDoc);
      let showsReceived = docSnap.data();
      let showToAdd = {showID:showID,posterPath:posterPath,showName:showName};
      let addShow = true;
      const result = showsReceived.shows.map((obj) => {
        if(obj.showName === showName){
          addShow = false;
        }
      });
      if(addShow){
        showsReceived.shows.push(showToAdd)
      }
      let docRef = await setDoc(doc(db, "users", uid), {
        shows:showsReceived.shows
      },{ merge: true });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  let [showSearch, setShowSearch] = useState([])
  let [isLoading, setLoading] = useState(false);


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
          // className="md:w-1/2"
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
          <div className={styles.showListContainer}>
            {showList.map(show => (
              <div className={styles.individualShow} key={show}>
                <div className={styles.showButton} onClick={()=>{
                  router.push('/shows/'+show.id)
                }}>
                  <Image width={288} height={430} src={show.poster_path} alt={show.showName}/>
                  {show.name}
                  <br></br>
                  {show.vote_count} Likes on TMDB
                </div>
                {isSignedIn ? 
                  <div className={styles.addtoLibrary}>
                    <a  onClick={()=>{
                        addShow(show.name,show.id,show.poster_path)
                        router.push('/profile/')
                      }}> add to library</a>
                  </div> :
                  <div className={styles.addtoLibrary}>
                  <a  onClick={()=>{
                      router.push('/profile/')
                    }}> sign in to add show</a>
                </div>
                  }
                </div>
                  ))}
          </div>
          

      </main>

    </div>
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

  )
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps(context: { params: any }) {
  const {params} = context
  const topShows = async ()=>{
    let searchResults = []
    let showCount = 1;
    let page = 1
    // While we only use 100 of these shows, we query the top 3000
    // due to tmdb not organizing responses based on vote counts
    
    // This should be alright to do. TMDB has stated they don't have
    // Query limits
    while (showCount < 3000){
      const top100 = await fetch("https://api.themoviedb.org/3/tv/popular?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US&page="+page)
      const data100 = await top100.json()
      page+=1
      for (let i = 0; i < data100.results.length; ++i){
          showCount+=1
          let posterPath = "https://image.tmdb.org/t/p/w500" + data100.results[i].poster_path
          searchResults.push({name:data100.results[i].name, id:data100.results[i].id, poster_path:posterPath, vote_count: data100.results[i].vote_count})
      }
    }
      
      searchResults.sort((a, b) => {
        return b.vote_count- a.vote_count ;
    });
    searchResults.splice(100,2900)
    return searchResults;
  }
  let searchRes = await topShows()

  return{
    props:{
      topShows: searchRes,
    },
  }
}

export default TopShows