import * as t from 'babel-types'
import * as babylon from 'babylon'
import * as u from './utils'
import * as builtIns from './built-ins'
import * as functions from './functions'
import { evaluateExpression } from './expressions'

/** Evaluate or inline a call expression. */
export function evaluate (path): t.Expression | null {
  path.assertCallExpression()

  let result: t.Expression | null = null

  let callee: t.Expression = path.node.callee
  if (t.isMemberExpression(callee) && t.isIdentifier(callee.object, { name: 'window' })) {
    const property = evaluateExpression(path.get('callee.property'))
    if (t.isStringLiteral(property)) {
      callee = t.identifier(property.value)
      result = t.callExpression(callee, path.node.arguments)
    }
  }

  if (t.isMemberExpression(callee)) {
    if (t.isThisExpression(callee.object)) {
      const property = evaluateExpression(path.get('callee.property'))
      result = evaluateThisMemberCall(path, property)
    } else {
      const object = evaluateExpression(path.get('callee.object'))
      result = evaluateMemberCall(path, object)
    }
  } else if (t.isFunction(callee)) {
    const paramBindings = evaluateParamBindings(path, callee)
    result = functions.evaluate(path.get('callee'), paramBindings)
  } else if (t.isIdentifier(callee)) {
    result = evaluateFunctionCall(path, callee)
  }

  return result
}

/** Inline if the function is a procedure, called inside a statement, only for its side-effects. */
export function inlineProcedure (path, traverse: (ast, visitor, scope?) => void): void {
  path.assertCallExpression()
  if (!t.isIdentifier(path.node.callee) || !path.parentPath.isExpressionStatement()) {
    return
  }

  const functionDeclaration = getFunctionDeclaration(path, path.node.callee.name)
  if (!functionDeclaration) {
    return
  }

  const bodyStatements: t.Statement[] = functionDeclaration.node.body.body
  const returnStatements = bodyStatements.filter((s) => t.isReturnStatement(s))
  if (returnStatements.length !== 0) {
    return
  }

  const params: t.Identifier[] = functionDeclaration.node.params
  if (hasShadowing(path.scope, params)) {
    return
  }
  if (params.length > 0) {
    // Replace procedure parameters
    const args = params.map((p, i) => path.node.arguments[i] || t.identifier('undefined'))
    const procedure = babylon.parse(functionDeclaration.get('body').getSource())
    traverse(procedure, {
      Identifier (path) {
        params.forEach((p, i) => {
          if (path.node.name === p.name) {
            path.replaceWith(args[i])
          }
        })
      }
    })
    replaceWithStatements(procedure.program.body[0].body)
  } else {
    replaceWithStatements(bodyStatements)
  }

  function replaceWithStatements (statements: t.Statement[]) {
    const functionBinding = path.scope.getBinding(path.node.callee.name)
    functionBinding.referencePaths = functionBinding.referencePaths.filter(p => p !== path.get('callee'))
    functionBinding.dereference()

    traverse(statements, {
      Identifier (path) {
        const binding = path.scope.getBinding(path.node.name)
        if (binding) {
          binding.reference(path)
        }
      }
    }, path.scope)
    path.replaceWithMultiple(statements)
  }
}

/** Returns `true` if inlining `indentifiers` into `targetScope` would cause indentifiers to clash. */
function hasShadowing (targetScope, indentifiers: t.Identifier[]): boolean {
  return indentifiers.map(p => p.name).some(name => targetScope.getBinding(name))
}

function evaluateFunctionCall (path, callee: t.Identifier): t.Expression | null {
  t.assertIdentifier(callee)

  const args = functions.evaluatedArguments(path)
  if (callee.name === 'eval' && args.length === 1 && u.hasValue(args[0])) {
    return evaluateEvalCall(path, args[0]['value'])
  }

  const functionDeclaration = getFunctionDeclaration(path, callee.name)
  if (functionDeclaration) {
    const paramBindings = evaluateParamBindings(path, functionDeclaration.node)
    return functions.evaluate(functionDeclaration, paramBindings)
  }

  return evaluateGlobalFunction(callee, args)
}

function evaluateGlobalFunction (callee: t.Identifier, args: t.Expression[]): t.Expression | null {
  if (builtIns.isEvaluableGlobalFunctionCall(callee.name)) {
    const argumentValues = u.withValues(args)
    if (argumentValues) {
      return u.someLiteral(global[callee.name](...argumentValues.map(a => a.value)))
    }
  }
  return null
}

function evaluateMemberCall (path, object: t.Expression): t.Expression | null {
  const call: t.CallExpression = path.node

  const args = functions.evaluatedArguments(path)

  if (isEvaluableReplaceWithFunctionArgument(call, object, args[0])) {
    return evaluateReplaceWithFunctionArgumentResult(path, object, args[0])
  }

  const argumentsWithValues = u.withValues(args)
  if (!argumentsWithValues) {
    return null
  }

  // Allow mutators if the object is an expression that will be discarded. I.e. chained calls or literal objects.
  const allowMutators = t.isCallExpression(path.node.callee.object) || u.hasValue(path.node.callee.object)
  if (builtIns.isEvaluableInstanceFunctionCall(call, object, allowMutators)) {
    return evaluateInstanceFunctionCall(call, object, argumentsWithValues)
  } else if (builtIns.isEvaluableStaticFunctionCall(call, object)) {
    return evaluateStaticFunctionCall(call, object, argumentsWithValues)
  }

  return null
}

function evaluateThisMemberCall (path, property: t.Expression): t.Expression | null {
  if (!u.hasValue(property)) {
    return null
  }

  const functionDeclaration = getFunctionDeclaration(path, property.value.toString())
  if (!functionDeclaration) {
    return null
  }

  const paramBindings = evaluateParamBindings(path, functionDeclaration.node)
  return functions.evaluate(functionDeclaration, paramBindings)
}

function getFunctionDeclaration (path, name: string): any & { node: t.FunctionDeclaration } | null {
  const binding = path.scope.getBinding(name)
  if (binding && t.isFunctionDeclaration(binding.path.node)) {
    return binding.path
  }
  return null
}

function isEvaluableReplaceWithFunctionArgument (call: t.CallExpression, object: t.Expression, patternArgument: t.Expression): boolean {
  return u.hasValue(object) &&
    t.isMemberExpression(call.callee) &&
    call.callee.property['name'] === 'replace' &&
    call.arguments.length === 2 &&
    u.hasValue(patternArgument) &&
    t.isFunction(call.arguments[1])
}

/** Fairly aggressive evaluation that can be incorrect if member functions are overriden in the input code. */
function evaluateInstanceFunctionCall (call: t.CallExpression, object: u.HasValue, _arguments) {
  t.assertCallExpression(call)
  t.assertMemberExpression(call.callee)

  try {
    const objectValue = object.value
    const functionName = (call.callee as t.MemberExpression).property['name']
    const argumentValues = _arguments.map(arg => arg.value)
    const result = objectValue[functionName](...argumentValues)
    return u.someLiteral(result)
  } catch (e) {
    console.warn(e)
    return call
  }
}

function evaluateStaticFunctionCall (call, object, _arguments) {
  t.assertCallExpression(call)
  t.assertMemberExpression(call.callee)

  try {
    const staticObject = global[object.name]
    const functionName = call.callee.property.name
    const argumentValues = _arguments.map(arg => arg.value)
    const result = staticObject[functionName](...argumentValues)
    return u.someLiteral(result)
  } catch (e) {
    console.warn(e)
    return call
  }
}

/**
 * Allows for function as second argument.
 * This can't resolve nested functions. Nodes can't be replaced since the parameter bindings
 * are different as the function is called multiple times. Therefore we can't recursively traverse the function argument.
 */
function evaluateReplaceWithFunctionArgumentResult (path, object, patternArgument) {
  path.assertCallExpression()
  let bail = false

  const result = object.value.replace(patternArgument.value, (...replaceArguments) => {
    if (bail) {
      return ''
    }
    const replacementFunctionArgument = path.get('arguments.1')
    const paramBindings = replacementFunctionArgument.node.params
      .map((param, i) => ({ [param.name]: replaceArguments[i] }))
      .reduce((Object as any).assign, { })

    const result = functions.evaluate(replacementFunctionArgument, paramBindings)

    if (result && u.hasValue(result)) {
      return result.value
    } else {
      bail = true
      console.warn('Can\'t evaluate string replace: ', path.getSource())
      return ''
    }
  })

  if (bail) {
    return path.node
  }
  return u.someLiteral(result) || path.node
}

function evaluateEvalCall (path, argument: string) {
  try {
    const ast = babylon.parse(argument)
    return ast.program.body
  } catch (e) {
    console.warn('Could not parse eval argument: ' + argument)
    return null
  }
}

function evaluateParamBindings (callPath, functionExpression: t.Function) {
  callPath.assertCallExpression()

  const args = u.withValues(functions.evaluatedArguments(callPath))
  if (!args) {
    return { }
  }

  return functionExpression.params
    .map((p, i) => {
      const value = args[i] ? args[i].value : undefined
      return { [p['name']]: value }
    })
    .reduce((Object as any).assign, {})
}
