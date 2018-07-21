import * as t from 'babel-types'
import * as u from './utils'
import { evaluatedArguments } from './functions'

export function evaluate (path): t.Expression | null {
  path.assertNewExpression()
  if (!t.isIdentifier(path.node.callee)) {
    return null
  }
  const constructor: string = path.node.callee.name

  switch (constructor) {
    case 'Array': return evaluateArrayConstructor(path)
    default: return null
  }
}

function evaluateArrayConstructor (path): t.Expression | null {
  const args = u.withValues(evaluatedArguments(path))
  if (!args) {
    return null
  }
  if (
    args.length === 1 &&
    typeof args[0].value === 'number' &&
    Number.isInteger(args[0].value)
  ) {
    // If the only argument passed to the Array constructor is an integer, this returns a new array with its length property set to that number (Note: this implies an array of arrayLength empty slots, not slots with actual undefined values).
    return null
  }
  try {
    return u.someLiteral(new Array(...args.map(a => a.value)))
  } catch (e) {
    console.warn('Cannot evaluate array constructor', path.getSource())
    return null
  }
}
