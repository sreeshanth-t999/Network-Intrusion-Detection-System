// src/componets/Home.jsx
import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Menubar from './Menubar'
import Dashboard  from './Dashboard'
import  Simulate   from './Simulate'
import Traffic from './Traffic'
import Warning   from './Warning'
import AutoGenarate from './AutoGenarate'
import Dataset   from './Dataset'
const Home = () => {
  return (
    <Router >
      <div className="home">
        <Menubar/>
        <div className="dashboard">
            <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/traffic" element={<Traffic />} />
            <Route path="/warning" element={<Warning />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/autoSimulate" element={<AutoGenarate/>} />
            </Routes>
        </div>
      </div>
    </Router>
  )
}

export default Home