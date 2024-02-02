import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import {BrowserRouter as Router, Route,Routes} from 'react-router-dom'
import UserInterface from './pages/UserInterface'
import './App.css'
export default function App() {
  return (
   <Router>
    <Routes>
   <Route exact path="/" element={<Login/>}/>
   <Route exact path="/register" element={<Register/>}/>
   <Route exact path='/user' element={<UserInterface/>}/>
   </Routes>
   </Router>
  )
}
