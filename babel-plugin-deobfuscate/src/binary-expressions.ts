import * as t from 'babel-types'
import * as u from './utils'
import { evaluateExpression } from './expressions'

export function evaluate (path): t.Expression {
  path.assertBinary()

  let { operator, left, right } = path.node

  if (!u.hasValue(left)) {
    left = evaluateExpression(path.get('left'))
  }
  if (!u.hasValue(right)) {
    right = evaluateExpression(path.get('right'))
  }

  if (t.isBinaryExpression(left) && u.hasValue(left.right) && u.hasValue(right)) {
    if (left.operator === operator && isAssociative(operator)) {
      const result = evaluateBinaryNodes(operator, left.right, right)
      if (result) {
        right = result
        left = left.left
        return t.binaryExpression(operator, left, right)
      }
    }
  }

  if (u.hasValue(left) && u.hasValue(right)) {
    return evaluateBinaryNodes(operator, left, right) || path.node
  }
  return path.node
}

function isAssociative (operator) {
  return operator === '+'
}

function evaluateBinaryNodes (operator, leftNode, rightNode) {
  const [ { value: left }, { value: right } ] = [ leftNode, rightNode ]
  switch (operator) {
    // Arithmetic
    case '+': return u.someLiteral(left + right)
    case '-': return u.someLiteral(left - right)
    case '*': return u.someLiteral(left * right)
    case '/': return u.someLiteral(left / right)
    case '%': return u.someLiteral(left % right)
    // Bitwise Shift
    case '<<': return u.someLiteral(left << right)
    case '>>': return u.someLiteral(left >> right)
    case '>>>': return u.someLiteral(left >>> right)
    // Relational
    case '<': return u.someLiteral(left < right)
    case '>': return u.someLiteral(left > right)
    case '<=': return u.someLiteral(left <= right)
    case '>=': return u.someLiteral(left >= right)
    // !!! case 'instanceof': return u.someLiteral(left instanceof right);
    // !!! case 'in': return u.someLiteral(left in right);
    // Equality
    case '==': /* tslint:disable */ return u.someLiteral(left == right) /* tslint:enable */
    case '!=': /* tslint:disable */ return u.someLiteral(left != right) /* tslint:enable */
    case '===': return u.someLiteral(left === right)
    case '!==': return u.someLiteral(left !== right)
    // Logic
    case '&&': return u.someLiteral(left && right)
    case '||': return u.someLiteral(left || right)
    // Binary Bitwise
    case '&': return u.someLiteral(left & right)
    case '^': return u.someLiteral(left ^ right)
    case '|': return u.someLiteral(left | right)
    default: return null
  }
}
