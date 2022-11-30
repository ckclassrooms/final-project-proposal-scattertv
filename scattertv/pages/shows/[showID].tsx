import {useRouter} from 'next/router'
import axios from 'axios'
import Image from 'next/image'

import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import {getFirestore, doc,addDoc, setDoc,getDoc, collection, Firestore, initializeFirestore, updateDoc } from "firebase/firestore"; 
var gen = require('color-generator');

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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import {Line} from "react-chartjs-2"
import { cc, ad } from 'chart.js/dist/chunks/helpers.core'
import { async } from '@firebase/util'
ChartJS.register(
  {
    id: 'graphCursor',

    afterInit: (chart, args, opts) => {
      chart['graphCursor'] = {
        x: 0,
        y: 0,
      }
    },
    afterEvent: (chart, args) => {
      const {inChartArea} = args
      const {type,x,y} = args.event

      chart['graphCursor'] = {x, y, draw: inChartArea}
      chart.draw()
    },
    afterDraw: (chart, args, opts) => {
      let {ctx} = chart
      const {top, bottom, left, right} = chart.chartArea
      const {x, y, draw} = chart['graphCursor']
      if (!draw) return

      ctx.save()
      
      ctx.beginPath()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#57B282'
      ctx.setLineDash([3, 3]) 
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
      ctx.stroke()
      
      ctx.restore()
    }
  },
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export let options = {
  annotation: {
    annotations: [
      {
        type: "line",
        mode: "vertical",
        borderColor: "red",
      }
    ]
  },
  showToolTips:false,
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      type: 'linear',
      ticks: {
        display: false
      },
      grid:{
        display:false
     }
    },
    y:{    //remove gridLines from y-axis
      grid:{
          display:false
        },
        max:10,
       }
  },
  tooltip: { 
    callbacks: {
                  label: function(tooltipItem, data) {
                      return "Daily Ticket Sales: $ " + tooltipItem.yLabel;
                  },
              }
      },
  plugins: {
    legend: {
      position: 'bottom' as const,
    },

  },
} as const;



function ShowGraph(props: { res: any; data: cc<"line", (number | ad)[], unknown> }) {
  const router = useRouter()
  let [showSearch, setShowSearch] = useState<any>([])
  let [isSignedIn, setSignin] = useState(false);
  let [uid,setUID] = useState('')
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
      console.log("Document written with ID: ", docRef);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  

  if (router.isFallback){
    return <div>Loading...</div>
  }



  let showData = props.res
  let posterPath = "https://image.tmdb.org/t/p/w500" + showData.poster_path
  // Query TMDB to get search results of a search string
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
            if (totalResults === 3) {
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
      <div className={styles.containerShowPage}>
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
            <table>
              <tbody>
                {showRes.map(emp => (
                  <tr key={emp}>
                    <td className={styles.resultCellImg} onClick={() => {
                    }}><img width='75px' src={emp[2]}></img></td>
                    <td className={styles.resultCellName} onClick={() => {
                      setShowSearch([])
                      router.push('/shows/'+emp[1])
                    }}>{emp[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </main>

        <div className={styles.graphSite}>
            <div className={styles.posterContainer}>
                <img width={400} src={posterPath}></img>
            </div>
            <div className={styles.bioContainer}>
                <div className={styles.bio}>
                    {showData.overview}
                </div>
                <div className={styles.graph}>
                  <Line className={styles.graphID} data={props.data} height="500px" options={options} />
                </div>
                {
                  isSignedIn ?              
                  <a className={styles.profileButton} onClick={()=>{
                    let showID = props['showID'];
                    let posterPath = "https://image.tmdb.org/t/p/w500" + showData.poster_path        
                    let showName = showData.name
                    console.log(showID,posterPath)
                    console.log(isSignedIn)
                    addShow(showName,showID,posterPath)
                    router.push('/profile')
    
                  }}>add to library</a> : <a>sign in to add this show to your library!</a>
                }

            </div>
        </div>
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

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps(context: { params: any }) {
  const {params} = context

  // Fetch inital show data from TMDB
  const res = await fetch("https://api.themoviedb.org/3/tv/"+params.showID+"?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US")
  const data = await res.json()
  let sznNumbers = data.number_of_seasons
  let epCounter = 1
  let labels = [];

  let graphData = {
    labels:labels,
    datasets: []
  };
  // Fetch individual season data
  for(var i =1; i <= sznNumbers; ++i){
    const seasonRes = await fetch("https://api.themoviedb.org/3/tv/"+params.showID+"/season/"+String(i)+"?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US")
    const seasonData = await seasonRes.json()
    // Random coloring for each season
    const color = gen().rgbString();
    
    let seasonGraphData = {
      label: 'Season ' + String(i),
      data: [],
      pointHitRadius: 20,
      pointHoverRadius: 10,
      borderColor: color,
      backgroundColor: color,
      tension: 0.4,
    }
    if(seasonData.episodes.length === 0){
      continue
    }
    // Assign datapoints based on each episode in season
    for(var j = 0; j < seasonData.episodes.length; ++j){
      let epData = seasonData.episodes[j]
      if (epData.vote_average!== 0){
        let dataSet= { x:epCounter, y:epData.vote_average}
        seasonGraphData.data.push(dataSet)
        epCounter+=1 
      }
    }
    graphData.datasets.push(seasonGraphData)
  }
  console.log(graphData)
  return{
    props:{
      showID: params.showID,
      res: data,
      data:graphData
    },
    revalidate: 10, // In seconds
  }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  // Get the paths we want to pre-render based on posts
  return { 
    paths:[
      {
        params: {showID:'1396'}
      }
    ],
     fallback:true
    }
}

export default ShowGraph