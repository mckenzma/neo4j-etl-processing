import logo from './logo.svg';
import './App.css';
// import data from './data.json';
import data from './data_1.json';
// import data from '../../etl-config.json';
// import data from 'etl-config.json';

import BasicTable from './BasicTable';

function App() {
  console.log(data);
  return (
    <div className="App">
      <p>{data.name}</p>
      <p>{data.description}</p>
      {/* <header className="App-header"> */}
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p> */}
        {/* <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        {/* <>
          {data !== undefined && data.array.map((obj,index) => {
            return <p>{obj.property}</p>;
          })}
        </> */}
      {/* </header> */}

      {/* <>
        {data !== undefined && data.queries.map((obj,index) => {
          return <p id={obj.name}>{obj.name}</p>;
        })}
      </> */}

      <BasicTable queries={data.queries}></BasicTable>
    </div>
  );
}

export default App;