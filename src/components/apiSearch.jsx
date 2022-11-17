import React, { useLayoutEffect } from 'react'
import CanvasJSReact from '../canvasjs.react';
import axios from "axios";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
let counter=0;
function searchShow(show) {
    counter+=1;
    console.log("test", counter);
}

export default searchShow