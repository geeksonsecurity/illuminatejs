// @flow

import React, { Component } from 'react'
import CodeEditor from './CodeEditor'

import * as prettier from 'prettier-standalone' // Very large
import * as Babel from 'babel-standalone'
// $FlowFixMe
import deobfuscatePlugin from '../../babel-plugin-deobfuscate/'
import debounce from 'lodash.debounce'

type Props = {
  code: string,
  onCodeChange?: string => void
}

type State = {
  input: string,
  output: string
}

class Deobfuscator extends Component {
  props: Props
  state: State
  updateOutput: (input: string) => void

  constructor (props: Object) {
    super(props)
    this.updateOutput = debounce(code => {
      this.setState({ output: _deobfuscate(code) })
    }, 500)
    this.state = {
      input: props.code,
      output: _deobfuscate(props.code)
    }
  }

  render () {
    return (
      <div style={{display: 'flex', flexWrap: 'wrap', height: '100%'}}>
        <div className='horizontal-spacing' style={{flexBasis: '100%', marginTop: '15px', marginBottom: '5px', marginLeft: '15px'}}>
          <button onClick={this.format.bind(this)}>Format</button>
          <button disabled>De-Obfuscate</button> <small><i>Deobfuscation will happen on the fly, as you paste/type</i></small>
        </div>
        <CodeEditor placeholder="Enter your obfuscated code here..." style={{width: '50%'}} code={this.state.input} onCodeChange={this.onInputEditorChange.bind(this)} />
        <CodeEditor placeholder="The deobfuscated code will appear here" style={{width: '50%'}} code={this.state.output} />
      </div>
    )
  }

  componentWillReceiveProps (nextProps: Props) {
    const input = nextProps.code
    this.setState({ input }, () => {
      this.updateOutput(input)
    })
  }

  onInputEditorChange (input: string) {
    this.setState({ input }, () => {
      this.updateOutput(input)
      this.props.onCodeChange && this.props.onCodeChange(input)
    })
  }

  format () {
    if(this.state.input !== undefined && this.state.input !== ""){
      const input = prettier.format(this.state.input)
      this.props.onCodeChange && this.props.onCodeChange(input)
      this.setState({ input })
    }
  }
}

function _deobfuscate (code: string) {
  try {
    const deobfuscated = Babel.transform(code, { plugins: [ deobfuscatePlugin ] }).code
    return prettier.format(deobfuscated)
  } catch (e) {
    console.error(e)
    return code
  }
}

export default Deobfuscator
