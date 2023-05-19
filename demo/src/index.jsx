import React from "react"
import { createRoot } from 'react-dom/client';
import TimeLineU from 'mz-timeline';
// import TimeLineF from 'mz-timeline';
// import WidthAutoLabel from 'text-width-auto-label';
import './idnex.less'

const times = [
    "2018-12-19",
    "2019-02-19",
    "2019-10-01",
    "2020-10-01",
    "2020-10-10",
    "2020-11-10",
    "2021-08-08",
    "2021-10-16",
    "2021-12-08",
    "2021-12-16",
    "2022-01-11",
    "2022-09-09",
    "2022-09-11",
    "2022-11-09",
  ];
  

const App = () => {
    const handleChange =(time)=>{
        console.log(time);
    }
    return (
        <div className="container">
            <div className="text">
                <p>Demo</p><p>TimeLine</p>
            </div>
            <TimeLineU data = {times} onChange={handleChange}/>
        </div>
    );
}
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);