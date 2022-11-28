import {useRouter} from 'next/router'
import axios from 'axios'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { IconLoader, IconArrowLeft, Button } from '@supabase/ui'
var gen = require('color-generator');

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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  annotation: {
    annotations: [
      {
        type: "line",
        mode: "vertical",
        borderColor: "red",
      }
    ]
  },
  showToolTips:true,
  maintainAspectRatio: false,
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
        }
       }
  },
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },

  },
} as const;



function ShowGraph(props: { res: any; data: cc<"line", (number | ad)[], unknown> }) {
  const router = useRouter()
  if (router.isFallback){
    return <div>Loading...</div>
  }

  let showData = props.res
  let posterPath = "https://image.tmdb.org/t/p/w500" + showData.poster_path
  let backdropPath = "https://image.tmdb.org/t/p/original" +showData.backdrop_path
  


  return (
    <div className={styles.containerShowPage}>
      <Head>
        <title>ScatterTV</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.header}>
          <Button
                  className={styles.btn}
                  size="large"
                  icon={<IconArrowLeft /> }
                  onClick={() => {
                    router.push('/')
                  }}
          />
            <h4>ScatterTV</h4>
      </div>
      <div className={styles.graphSite}>
          <div className={styles.posterContainer}>
              <img width={400} src={posterPath}></img>
          </div>
          <div className={styles.bioContainer}>
              <div className={styles.bio}>
                  {showData.overview}
              </div>
              <div className={styles.graph}>
                <Line  className={styles.graphID} data={props.data} height="500px" options={options}/>
              </div>
          </div>
      </div>
    </div>
  )

}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps(context: { params: any }) {
  
  const {params} = context
  const res = await fetch("https://api.themoviedb.org/3/tv/"+params.showID+"?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US")
  const data = await res.json()
  let sznNumbers = data.number_of_seasons
  let epCounter = 1
  let graphData = {
    datasets: [{}]
  };
  for(var i =1; i <= sznNumbers; ++i){
    const seasonRes = await fetch("https://api.themoviedb.org/3/tv/"+params.showID+"/season/"+String(i)+"?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US")
    const seasonData = await seasonRes.json()
    const color = gen().rgbString();
    let seasonGraphData = {
      label: 'Season ' + String(i),
      data: [{}],
      pointHitRadius: 40,
      pointHoverRadius: 10,
      borderColor: color,
      backgroundColor: color,
      tension: 0.4,
    }


    for(var j = 0; j < seasonData.episodes.length; ++j){
      let epData = seasonData.episodes[j]
      if (epData.vote_average!== 0){
        let dataSet= {x:epCounter, y:epData.vote_average}
        seasonGraphData.data.push(dataSet)
        epCounter+=1  
      }
    }
    graphData.datasets.push(seasonGraphData)

  }



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

  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths:[{
    params: {showID:'1396'}
  }], fallback:true }
}

export default ShowGraph