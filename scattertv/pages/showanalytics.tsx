import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged , signOut} from "firebase/auth";
import { initializeApp } from 'firebase/app';
import {getFirestore, doc,getDocs, setDoc,getDoc, collection} from "firebase/firestore"; 


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


async function getData(setUserShows){
    let scrubbedShows = []

    const querySnapshot = await getDocs(collection(db, "showStats"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.data().showName)
      console.log(doc.data().showID)
      let posterPath = "https://image.tmdb.org/t/p/w500" + doc.data().posterPath
      scrubbedShows.push([doc.data().showName,doc.data().showID,posterPath,doc.data().clickCount,doc.data().addedCount])
    });
    setUserShows(scrubbedShows)

}
async function showStats(showName,showID,posterPath,isAddingToAccount){
  let showSnap = await getDoc(doc(db,"showStats",String(showID)))
  let showReceived = showSnap.data();
  if(showReceived === undefined){
    await setDoc(doc(db, "showStats", String(showID)), {
      showID:showID,
      showName:showName,
      posterPath:posterPath,
      clickCount : 1,
      addedCount : 0,
    });
  }else if(isAddingToAccount){
    let showClickCount = showReceived.clickCount
    let showAddedCount = showReceived.addedCount+1
    await setDoc(doc(db, "showStats", String(showID)), {
      showID:showID,
      showName:showName,
      posterPath:posterPath,
      clickCount : showClickCount,
      addedCount : showAddedCount,
    });
    return
  }else{
    let showClickCount = showReceived.clickCount+1
    let showAddedCount = showReceived.addedCount
    await setDoc(doc(db, "showStats", String(showID)), {
      showID:showID,
      showName:showName,
      posterPath:posterPath,
      clickCount : showClickCount,
      addedCount : showAddedCount,
    });
    return
  }
}

function Analytics(title: String) {
  const router = useRouter()
  let [showSearch, setShowSearch] = useState<any>([])
  let [userShows, setUserShows] = useState<any>([])
  let [isLoading, setLoading] = useState(false);
  let [isSignedIn, setSignin] = useState(false);
  let [uid,setUID] = useState('')
  async function addShow (showName,showID,posterPath)  {
    try {

      console.log(uid)
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
        showStats(showName,showID,posterPath,true)

      }
      let docRef = await setDoc(doc(db, "users", uid), {
        shows:showsReceived.shows
      },{ merge: true });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  // Check if user is signed in with firebase
  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          setUID(uid)
          console.log("signed in!")
          setSignin(true)
        } else {
          setSignin(false)
          console.log("signed out")
        }
      })
  
      getData(setUserShows)
  
  },[])


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
  console.log(userShows);
  let userShowsClone = userShows.map((x) => x);
  let userShowsViewsSorted = userShows.sort((a, b) => {
    return b[3]- a[3] ;
  });

  let userShowsAddsSorted = userShowsClone.sort((a, b) => {
    return b[4]- a[4] ;
  });
  userShowsAddsSorted = userShowsAddsSorted.filter((data)=>{
    return data[4] !== 0
  })
  
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
            most viewed
          </h1>
        <div className={styles.showListContainer}>
            {
            userShowsViewsSorted.map(show => (
              <div className={styles.individualShow} key={show}>
                <div className={styles.showButton} onClick={()=>{
                  router.push('/shows/'+show[1])
                }}>
                  <Image width={288} height={430} src={show[2]} alt={show[0]}/>
                  <br></br>
                  {show[0]}
                  <br></br>
                  {show[3]} {show[3] === 1 ? <a>view</a> : <a>views</a>}
                </div>
                {isSignedIn ? 
                  <div className={styles.addtoLibrary}>
                    <a  onClick={()=>{
                        addShow(show[0],show[1],show[2])
                        router.push('/profile/')
                      }}> add to library</a>
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
        <h1>
          most saved
        </h1>
        <div className={styles.showListContainer}>
            {
            userShowsAddsSorted.map(show => (
              <div className={styles.individualShow} key={show}>
                <div className={styles.showButton} onClick={()=>{
                  router.push('/shows/'+show[1])
                }}>
                  <Image width={288} height={430} src={show[2]} alt={show[0]}/>
                  <br></br>
                  {show[0]}
                  <br></br>
                  {show[4]} {show[4] === 1 ? <a>save</a> : <a>saves</a>}
                </div>
                {isSignedIn ? 
                  <div className={styles.addtoLibrary}>
                    <a  onClick={()=>{
                        addShow(show[0],show[1],show[2])
                        router.push('/profile/')
                      }}> add to library</a>
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
export default Analytics