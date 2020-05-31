// @flow

import React, { Component } from 'react'

import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'

import 'codemirror/lib/codemirror.css'
import './CodeEditor.css'
import 'codemirror/addon/display/placeholder.js'

type Props = {
  code: string,
  onCodeChange?: string => void,
  style?: Object,
  placeholder?: string,
  readOnly?: boolean
}

class CodeEditor extends Component {
  props: Props
  editor: CodeMirror
  textarea: HTMLTextAreaElement

  componentDidMount () {
    this.editor = CodeMirror.fromTextArea(this.textarea, {
      mode: 'text/javascript',
      lineNumbers: true,
      viewportMargin: Infinity,
      readOnly: this.props.readonly || false
    })
    this.editor.on('change', this.onCodeMirrorChange.bind(this))
  }

  onCodeMirrorChange (codeMirror: CodeMirror, change: { origin: bool }) {
    if (change.origin === 'setValue') {
      return
    }

    const code = codeMirror.getValue()

    if (this.props.onCodeChange) {
      this.props.onCodeChange(code)
    }
  }

  shouldComponentUpdate (nextProps: Props) {
    const value = nextProps.code || ''
    if (this.editor) {
      if (this.editor.getValue() !== value) {
        this.editor.setValue(value)
      }
      return false
    } else {
      return true
    }
  }

  render () {
    const value = this.props.code || ''
    const placeholder = this.props.placeholder || ''
    return (
      <div className='code-editor' style={this.props.style}>
        <textarea placeholder={placeholder} defaultValue={value} ref={textarea => { this.textarea = textarea }} />
      </div>
    )
  }
}

export default CodeEditor
