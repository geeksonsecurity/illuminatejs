import * as t from 'babel-types'
import * as u from './utils'

import * as arrays from './arrays'
import * as binaryExpressions from './binary-expressions'
import * as identifiers from './identifiers'
import * as callExpressions from './call-expressions'
import * as newExpressions from './new-expressions'
import * as memberExpressions from './member-expressions'
import * as unaryExpressions from './unary-expressions'

export function deobfuscateExpression (path) {
  if (path.isIdentifier() || (path.isLiteral() && !path.isStringLiteral())) {
    // Only replace identifiers that are part of a larger expression.
    return
  }
  if (path.removed) {
    return
  }
  const result = evaluateExpression(path)
  if (Array.isArray(result)) {
    path.replaceWithMultiple(result)
  } else {
    path.replaceWith(result)
  }
}

export function evaluateExpression (path): t.Expression {
  path.assertExpression()
  const evaluate = evaluator(path)
  return evaluate(path) || path.node
}

function evaluator (path): (path) => t.Expression | null {
  if (path.isStringLiteral()) {
    return evaluateStringLiteral
  } else if (path.isIdentifier()) {
    return identifiers.evaluate
  } else if (path.isMemberExpression()) {
    return memberExpressions.evaluate
  } else if (path.isCallExpression()) {
    return callExpressions.evaluate
  } else if (path.isNewExpression()) {
    return newExpressions.evaluate
  } else if (path.isBinary()) {
    return binaryExpressions.evaluate
  } else if (path.isConditionalExpression()) {
    return evaluateConditionalExpression
  } else if (path.isUnaryExpression()) {
    return unaryExpressions.evaluate
  } else if (path.isArrayExpression()) {
    return arrays.evaluateArrayExpression
  } else {
    return () => null
  }
}

const unescaped = Symbol('unescaped')
/** This will only unescape ASCII character escape sequences */
function evaluateStringLiteral (path) {
  if (path.node[unescaped] || !u.hasValue(path.node)) {
    return path.node
  }
  const node = t.stringLiteral(path.node.value)
  node[unescaped] = true
  return node
}

function evaluateConditionalExpression (path): t.Expression {
  path.assertConditionalExpression()

  const test = evaluateExpression(path.get('test'))
  if (u.hasValue(test)) {
    const result = evaluateExpression(path.get(test.value ? 'consequent' : 'alternate'))
    if (u.hasValue(result)) {
      return result
    }
  }
  return path.node
}
