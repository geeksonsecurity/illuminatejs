import * as t from 'babel-types'
import * as u from './utils'
import { evaluateExpression } from './expressions'

export function deobfuscateLoop (path) {
  path.assertLoop()
  if (!t.isForStatement(path.node) || !isLoopBodyEvaluable(path)) {
    return
  }

  try {
    const statements = evaluateLoop(path, path.node)
    path.replaceWithMultiple(statements)
  } catch (e) {
    console.warn(e.message)
    if (!path.node.leadingComments || path.node.leadingComments.length === 0) {
      path.addComment('leading', ' ' + e.message, true)
    }
  }
}

function isLoopBodyEvaluable (path): boolean {
  return getBodyStatements(path).every(p =>
    t.isVariableDeclaration(p.node) ||
    t.isExpressionStatement(p.node) && (t.isAssignmentExpression(p.node.expression) || t.isUpdateExpression(p.node.expression)))
}

const error = {
  body: (path) => new Error('Unevaluable statement in loop: ' + path.type),
  init: () => new Error('Unevaluable loop init expression'),
  test: () => new Error('Unevaluable loop test expression'),
  update: () => new Error('Unevaluable loop update expression')
}

function evaluateLoop (path, loop: t.ForStatement): (t.Statement|t.Noop)[] {
  t.assertForStatement(loop)
  const control = findControlVariable(path, loop)
  if (!control) {
    throw new Error('Unknown loop control variable')
  }

  let statements = getBodyStatements(path)
  let evaluatedNodes: (t.Statement|t.Noop)[] = []
  evaluateLoopWithControlVariable(path, loop, control, controlValue => {
    evaluatedNodes = statements
      .map(path => {
        if (t.isExpressionStatement(path.node)) {
          const expression = path.get('expression')
          if (t.isAssignmentExpression(expression.node)) {
            return evaluateAssignmentExpression(expression, expression.node)
          } else if (t.isUpdateExpression(expression.node)) {
            return evaluateUpdateExpression(expression, expression.node)
          } else {
            throw error.body(path)
          }
        } else if (t.isVariableDeclaration(path.node)) {
          return t.noop()
        } else {
          throw error.body(path)
        }
      })
      .map(result =>
        t.isExpression(result) ? t.expressionStatement(result) : result
      )
  })

  return evaluatedNodes
}

type ControlVariableInfo = { name: string, init: ControlVariable }
type ControlVariable = u.HasValue

function findControlVariable (path, loop: t.ForStatement): ControlVariableInfo | null {
  let name: string | undefined
  let init: ControlVariable | undefined
  if (t.isVariableDeclaration(loop.init) && loop.init.declarations.length === 1) {
    const declaration = loop.init.declarations[0]
    if (t.isIdentifier(declaration.id)) {
      name = declaration.id.name
      const evaluatedInit = evaluateExpression(path.get('init.declarations.0.init'))
      if (t.isLiteral(evaluatedInit) && u.hasValue(evaluatedInit)) {
        init = evaluatedInit
      }
    }
  }

  if (name !== undefined && init !== undefined) {
    return { name, init }
  } else {
    return null
  }
}

function evaluateLoopWithControlVariable (path, loop: t.ForStatement, controlInfo: ControlVariableInfo, evaluateIteration: (control: ControlVariable) => void): void | never {
  t.assertForStatement(loop)

  function isControlIdentifier (node: t.Expression | t.LVal): node is t.Identifier {
    return t.isIdentifier(node, { name: controlInfo.name })
  }

  let test: (control: ControlVariable) => boolean
  test = control => {
    const result = evaluateExpression(path.get('test'))
    if (u.hasValue(result)) {
      return result.value ? true : false
    } else {
      throw error.test()
    }
  }

  let update: ((control: ControlVariable) => ControlVariable) | undefined
  if (t.isUpdateExpression(loop.update) && isControlIdentifier(loop.update.argument)) {
    switch (loop.update.operator) {
      case '++':
        update = control => u.someLiteral(control.value + 1) as ControlVariable
        break
      case '--':
        update = control => u.someLiteral(control.value - 1) as ControlVariable
        break
      default: throw error.update()
    }
  } else if (t.isAssignmentExpression(loop.update) && isControlIdentifier(loop.update.left)) {
    const assignment = loop.update
    const rightPath = path.get('update.right')
    update = control => {
      const evaluatedRight = evaluateExpression(rightPath)
      if (u.hasValue(evaluatedRight)) {
        const value = u.assignmentValue(assignment.operator, control.value, evaluatedRight.value)
        return u.someLiteral(value) as ControlVariable
      } else {
        throw error.update()
      }
    }
  }
  if (update === undefined) {
    return
  }

  let control = controlInfo.init
  const binding = path.scope.getBinding(controlInfo.name)
  binding.setValue(control.value)
  try {
    while (test(control)) {
      evaluateIteration(control)
      control = update(control)
      binding.setValue(control.value)
    }
  } catch (e) {
    binding.clearValue()
    throw e
  }
}

function getBodyStatements (path): (any & { node: t.Statement })[] {
  if (t.isBlockStatement(path.node.body)) {
    return path.get('body.body')
  } else if (t.isStatement(path.node.body)) {
    return [ path.get('body') ]
  } else {
    throw error.body(path)
  }
}

function evaluateAssignmentExpression (path, assignment: t.AssignmentExpression): t.AssignmentExpression {
  if (t.isMemberExpression(assignment.left)) {
    return evaluateMemberAssignmentExpression(path, assignment)
  } if (!t.isIdentifier(assignment.left)) {
    throw error.body(path)
  }

  const evaluated = evaluateExpression(path.get('right'))
  if (u.hasValue(evaluated)) {
    const binding = path.scope.getBinding(assignment.left.name)
    const value = updateValue(evaluated.value, binding)
    if (binding) {
      binding.setValue(value)
    }

    return t.assignmentExpression('=', assignment.left, u.someLiteral(value) as any)
  } else {
    throw error.body(path)
  }

  /**
   * This could be done symbolically if it makes for better de-obfuscation.
   * I.e. generate a binary expression node instead of a literal.
   */
  function updateValue (value, binding) {
    if (!binding && assignment.operator !== '=') {
      throw error.body(path)
    }
    if (!binding.hasValue) {
      if (binding.constantViolations.length === 1 && path.findParent(p => p === binding.constantViolations[0].parentPath)) {
        const evaluated = evaluateExpression(binding.path.get('init'))
        if (u.hasValue(evaluated)) {
          binding.setValue(evaluated.value)
        }
      }
    }
    return u.assignmentValue(assignment.operator, binding.value, value)
  }
}

function evaluateMemberAssignmentExpression (path, assignment: t.AssignmentExpression): t.AssignmentExpression {
  if (!(t.isMemberExpression(assignment.left, {computed: true}) && t.isIdentifier(assignment.left.object))) {
    throw error.body(path)
  }

  const property = evaluateExpression(path.get('left.property'))
  if (!(u.hasValue(property) && u.isNumeric(property.value))) {
    throw error.body(path)
  }
  if (typeof property.value === 'boolean') {
    throw error.body(path)
  }

  const evaluated = evaluateExpression(path.get('right'))
  if (u.hasValue(evaluated)) {
    const binding = path.scope.getBinding(assignment.left.object.name)
    if (!binding || !binding.hasValue) {
      throw error.body(path)
    }
    binding.value[property.value] = u.assignmentValue(assignment.operator, binding.value[property.value], evaluated.value)
    return t.assignmentExpression('=', assignment.left.object, u.someLiteral(binding.value) as any)
  } else {
    throw error.body(path)
  }
}

function evaluateUpdateExpression (path, update: t.UpdateExpression): t.AssignmentExpression {
  if (!t.isIdentifier(update.argument)) {
    throw error.body(path)
  }
  const evaluated = evaluateExpression(path.get('argument'))
  if (u.hasValue(evaluated)) {
    const value = u.updateValue(update.operator, evaluated.value)
    if (t.isIdentifier(update.argument)) {
      path.scope.getBinding(update.argument.name).setValue(value)
    }
    return t.assignmentExpression('=', update.argument, u.someLiteral(value) as any)
  } else {
    throw error.body(path)
  }
}
