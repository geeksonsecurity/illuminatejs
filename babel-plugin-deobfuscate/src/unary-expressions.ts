import * as t from 'babel-types'
import * as u from './utils'
import { evaluateExpression } from './expressions'

export function evaluate (path): t.Expression | null {
  path.assertUnaryExpression()

  let argument = path.node.argument
  if (!u.hasValue(argument)) {
    argument = evaluateExpression(path.get('argument'))
  }

  if (u.hasValue(argument)) {
    return evaluateUnaryNode(path.node.operator, argument)
  }

  return null
}

function evaluateUnaryNode (operator, argument) {
  switch (operator) {
    case '!': return u.someLiteral(!argument.value)
    case '~': return u.someLiteral(~argument.value)
    case '-': return u.someLiteral(-argument.value)
    case '+': return u.someLiteral(+argument.value)
    default: return null
  }
}
