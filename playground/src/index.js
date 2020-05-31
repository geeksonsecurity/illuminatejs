import React from 'react'
import {BrowserRouter,Route} from 'react-router-dom';
import ReactDOM from 'react-dom'
import './index.css'
import Home from './Home'
import HowItWorks from './HowItWorks'
import Header from './Header'
import Footer from './Footer'


ReactDOM.render((
  <BrowserRouter>
    <Header/>
    <Route exact path="/" component={Home}/>
    <Route exact path="/how-it-works" component={HowItWorks}/>
    <Footer/>
  </BrowserRouter>
), document.getElementById('root'))
