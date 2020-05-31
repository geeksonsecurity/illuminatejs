import React, { Component } from 'react'
import Deobfuscator from './Deobfuscator'
import Layout from './Layout'
export default class Home extends Component {

  render() {
    return <Layout><Deobfuscator/></Layout>
  }
}
