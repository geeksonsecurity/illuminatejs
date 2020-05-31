import React, { Component } from 'react'
import { Link } from 'react-router-dom'

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#222',
  color: '#E8E6E8',
  paddingLeft: '15px'
}

export default class Header extends Component {

  render() {
    return <div className='horizontal-spacing' style={headerStyle}>
      <h2 className="logo"><span className="main">illuminate</span><sub>js</sub> playground</h2>
      <Link to="/">Home</Link>
      <Link to="/how-it-works">How it works</Link>
    </div>
  }
}
