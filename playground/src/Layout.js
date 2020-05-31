// @flow

import React, { Component } from 'react'

export default class Layout extends Component {
  render () {
    return (
      <div>
        <div className="container">
          {this.props.children}
        </div>
      </div>
    )
  }
}
