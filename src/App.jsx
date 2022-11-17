import './App.css';
/* App.js */
import React, { Component , useState} from 'react';
import Graph from './components/graph'
import { TextField } from '@mui/material';
function App() {
  let [showInput, setShow] = useState('');
  return (
    <div className="App">
      <header className="App-header">
        <h4>
          ScatterTV
        </h4>

      </header>
		<div className="showInfo">
			<>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <TextField id="showInput" onChange={(showInput) => setShow(showInput.target.value)} label="Search Show" variant="outlined" />
				<Graph showInput={showInput} setShow={setShow}/>
			</>
		</div>
      
    </div>
  );
}

export default App;
