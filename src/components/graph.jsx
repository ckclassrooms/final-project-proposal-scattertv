import React,{ useState, useEffect } from "react";
import axios from "axios";
import CanvasJSReact from '../canvasjs.react';
import './graph.css';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

function Graph({setShow,showInput}) {
    let [showDesc, setShowDesc] = useState('');
    let [showName, setShowName] = useState('');
    let [posterPath, setPosterPath] = useState('');
    let [showID, setShowID] = useState('');
    let [totalSeasons, setSeasonCount] = useState();
    const [isLoading, setLoading] = useState(true);
    let [dataset, setDataSet] = useState([])

    function addToDataset(dataSet) {
        setDataSet(dataset => [...dataset, dataSet])
    }

    function clearShow(){
        setShow('')
        setShowDesc('')
        setShowName('')
        setPosterPath('')
        setShowID('')
        setSeasonCount(0)
        setDataSet([])
    }
    

    let options = {
        width:"900",
        animationEnabled: true,
        title:{
            text: showName
        },
        theme:"dark2",
        data: dataset,
        axisY : {title: "Rating", gridThickness: 0, maximum: 10.3},
        axisX : {
                title: "Episode", gridThickness: 0,
                labelFormatter: function () {
                    return " ";
                },
            },
        legend:{
            cursor:"pointer",
            itemclick : function(e){
                alert( "Legend item clicked with type : " + e.dataSeries.name);
                if (e.dataSeries.visible ){
                    e.dataSeries.visible = false;
                  } else {
                    e.dataSeries.visible = true;
                  }
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  useEffect(() => {    
                      // Update the document title using the browser API 
                        chart.render()
                    });
                }
            }

    }

    var chart = new CanvasJSChart("chartContainer", options);

    async function getShowInfo  (showInput) {
        await axios("https://api.themoviedb.org/3/search/tv?api_key="+process.env.REACT_APP_TMDBKEY+"&language=en-US&page=1&query="+showInput+"&include_adult=false")
        .then((res) =>{
            const json = res.data;
            setShowDesc(json.results[0]['overview']);
            setShowName(json.results[0]['name']);
            setPosterPath("https://image.tmdb.org/t/p/w500"+json.results[0]['poster_path'])
            setShowID(json.results[0]['id']);

        })
        if (!showID){
            return
        }
        await axios("https://api.themoviedb.org/3/tv/"+showID+"?api_key="+process.env.REACT_APP_TMDBKEY+"&language=en-US")
        .then((res) =>{
            const json = res.data
            setSeasonCount(json['number_of_seasons'])
        })
        let epCounter = 1;
        for(let i = 1; i <= totalSeasons; ++i){
            await axios("https://api.themoviedb.org/3/tv/"+showID+"/season/"+String(i)+"?api_key="+process.env.REACT_APP_TMDBKEY+"&language=en-US")
            // eslint-disable-next-line no-loop-func
            .then((res) =>{
                    const json = res.data;
                    let allEps = json.episodes
                    let datapoints = []
                    
                    allEps.forEach(episode => {
                        datapoints.push({label: episode.name, x: epCounter, y:episode.vote_average})
                        epCounter+=1
                    });
                    let dataset = {
                        showInLegend:true,
                        name: 'Season '+i,
                        type: "spline",
                        label: 'Season '+i,
                        dataPoints: datapoints
                    }
                    addToDataset(dataset)
                    chart.render()
                    setLoading(false);
                    }
                )
        }
    }
    function searchShow() {
        if(!showInput){
            return
        }
        setShow(showInput)
        // Clear out old show
        setDataSet([])
        setSeasonCount(0)
        getShowInfo(showInput)
    }

    if  (isLoading) {
        getShowInfo("Avatar")
    } else {
        return (
            <>
            <button onClick={() => searchShow()} >Search Show</button>
            <br></br>
                <div class="graphAndPoster">
                    <div class="poster">
                        <img src={posterPath} alt="posterImg"></img>
                    </div>
                    <div class="chart">
                        <br></br>
                        <CanvasJSChart options={options} />
                    </div>
                </div>
              <div id="showOverview">
                <h1>Overview</h1>
                <p>{showDesc}</p>
            </div>
            </>
        )
    
    }
}

export default Graph