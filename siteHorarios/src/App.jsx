import { useState } from 'react'
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Header from './Header.jsx'
import './App.css'
import Homepage from './Pages/Homepage.jsx'

function App() {
  return (
    <div className='main'>
      <Header headerTitle="School Schedule"/>
      <Homepage />
    </div>
  )
}

export default App
