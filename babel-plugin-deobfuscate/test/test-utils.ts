import * as babel from 'babel-core'
import * as prettier from 'prettier'
import deobfuscatePlugin from '../src/index'

const generatorOpts = { compact: false }

export function deobfuscate (code) {
  return format(babel.transform(code, { plugins: [ deobfuscatePlugin ], ast: false, generatorOpts }).code)
}

function format (code) {
  return prettier.format(code)
    .split('\n')
    .filter(line => line !== '')
    .join('\n')
}

// jest

import * as diff from 'jest-diff'
import * as chalk from 'chalk'

declare global {
  namespace jest {
    interface Matchers {
      deobfuscation: (expected: string) => void
    }
  }
}

expect.extend({
  deobfuscation (input: string, expected: string) {
    let result
    try {
      expected = format(expected)
      result = deobfuscate(input)
    } catch (e) {
      const message = () => `Exception occured during parsing or de-obfuscation:\n\n  ${e.stack}`
      return { pass: false, message }
    }

    const pass = result === expected
    if (pass) {
      return { pass, message: () => '' }
    } else {
      const difference = diff(expected, result) || [ chalk.green(`- ${expected}`), chalk.red(`+ ${result}`) ].join('\n')
      const message = () => `Expected de-obfuscation result difference:

${difference}

Input:

  ${chalk.bold(format(input))}`

      return { message, pass }
    }
  }
})
