// @flow

import React, { Component } from 'react'
import type Session from './Session'

type Props = {
  session: Session
}

const inputStyle = {
  width: '100%'
}

export default class Login extends Component {
  props: Props
  state: { user: string, password: string } = { user: '', password: '' }

  render () {
    return <div style={{ position: 'relative', margin: 'auto', width: '400px' }}>
      <form onSubmit={this.logIn.bind(this)}>
        <label>
          User
          <input name='user' type='input' style={inputStyle} onChange={this.handleInputChange.bind(this)} />
        </label>
        <br />
        <label>
          Password
          <input name='password' type='input' style={inputStyle} onChange={this.handleInputChange.bind(this)} />
        </label>
        <div className='horizontal-spacing'>
          <button type='submit'>Log In</button>
          <button type='button' onClick={this.register.bind(this)}>Register</button>
        </div>
      </form>
    </div>
  }

  handleInputChange (event: Event & { target: HTMLInputElement }) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  logIn (event: Event) {
    console.log('Logging in : ' + this.state.user)
    event.preventDefault()

    this.props.session.logIn(this.state.user, this.state.password)
  }

  register () {
    this.props.session.registerAccount(this.state.user, this.state.password)
  }
}
