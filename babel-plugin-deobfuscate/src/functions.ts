import * as t from 'babel-types'
import * as u from './utils'
import { evaluateExpression } from './expressions'

/** Using param bindings, infer more bindings */
const bindingInferrer = () => ({
  VariableDeclarator (path) {
    const evaluated = evaluateExpression(path.get('init'))
    const binding = path.scope.getBinding(path.node.id.name)
    if (evaluated && u.hasValue(evaluated)) {
      binding.setValue(evaluated.value)
    } else {
      binding.clearValue()
    }
  },
  AssignmentExpression (path) {
    const assignment: t.AssignmentExpression = path.node
    if (assignment.operator !== '=' || !t.isIdentifier(assignment.left)) {
      return
    }
    const evaluated = evaluateExpression(path.get('right'))
    const binding = path.scope.getBinding(assignment.left.name)
    if (evaluated && u.hasValue(evaluated)) {
      binding.setValue(evaluated.value)
    } else {
      binding.clearValue()
    }
  }
})

export function evaluate (path, paramBindings): t.Expression | null {
  paramBindings = paramBindings || { }

  const body = path.get('body')
  const functionScope = body.scope
  let result: t.Expression | null = null

  setParamBindings(functionScope, paramBindings)

  if (t.isExpression(body.node)) {
    if (u.hasValue(body.node)) {
      result = u.someLiteral(body.node.value)
    } else {
      result = evaluateExpression(body)
    }
  } else if (t.isBlockStatement(body.node)) {
    if (!isEvaluable(path, body.node)) {
      return null
    }
    body.traverse(bindingInferrer())
    const resultPath = body.get('body')
      .filter(p => p.isReturnStatement())[0]
      .get('argument')
    const resultNode = evaluateExpression(resultPath)
    if (resultNode) {
      if (u.hasValue(resultNode) || (t.isIdentifier(resultNode) && !functionScope.getOwnBinding(resultNode.name))) {
        result = resultNode
      }
    }
  }

  clearParamBindings(functionScope, paramBindings)
  return result
}

export function evaluatedArguments (path): t.Expression[] {
  if (!path.isCallExpression() && !path.isNewExpression()) {
    throw new Error('Expected call or new expression, not ' + path.type)
  }
  return path.get('arguments').map(arg => evaluateExpression(arg))
}

/** Determine if the implementation can evaluate the function */
function isEvaluable (path, body: t.BlockStatement): boolean {
  t.assertBlockStatement(body)
  const returns = body.body.filter((s) => t.isReturnStatement(s))
  if (returns.length !== 1) {
    return false
  }

  return body.body.every(statement =>
    t.isReturnStatement(statement) ||
    t.isVariableDeclaration(statement) ||
    u.isAssignmentExpressionStatement(statement))
}

function setParamBindings (scope, paramBindings) {
  Object.keys(paramBindings).forEach(name => {
    const binding = scope.getBinding(name)
    if (binding) {
      binding.setValue(paramBindings[name])
    }
  })
}

function clearParamBindings (scope, paramBindings) {
  Object.keys(paramBindings).forEach(name => {
    const binding = scope.getBinding(name)
    if (binding) {
      binding.clearValue()
    }
  })
}
