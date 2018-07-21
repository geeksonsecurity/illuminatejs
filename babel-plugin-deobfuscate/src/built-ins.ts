import * as t from 'babel-types'
import * as u from './utils'

const globalFunctions = new Set([
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'unescape'
])

export function isEvaluableGlobalFunctionCall (functionName: string) {
  return globalFunctions.has(functionName)
}

const evaluableStaticFunctions = {
  String: new Set(['fromCharCode'])
}

export function isEvaluableStaticFunctionCall (call: t.Node, object: t.Node): boolean {
  if (
    !t.isCallExpression(call) ||
    !t.isMemberExpression(call.callee) ||
    !t.isIdentifier(call.callee.property) ||
    !t.isIdentifier(object)
  ) {
    t.assertCallExpression(call)
    return false
  }

  const functions = evaluableStaticFunctions[object.name]
  return functions && functions.has(call.callee.property.name)
}

const arrayMutatorMethods = new Set(['fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'])

export function isArrayMutatorFunctionCall (call: t.Node): boolean {
  if (
    !t.isCallExpression(call) ||
    !t.isMemberExpression(call.callee) ||
    !t.isIdentifier(call.callee.property)
  ) {
    t.assertCallExpression(call)
    return false
  }
  return arrayMutatorMethods.has(call.callee.property.name)
}

const evaluableInstanceFunctions = {
  number: new Set(['toString']),
  string: new Set(['replace', 'charAt', 'charCodeAt', 'indexOf', 'toLowerCase', 'toUpperCase', 'split', 'substring']),
  array: new Set(['toString', 'indexOf', 'join'])
}

/** Check if callee and argument values required for evaluation are available */
export function isEvaluableInstanceFunctionCall (call: t.CallExpression, object: t.Expression, allowMutators: boolean): object is u.HasValue {
  if (
    !t.isCallExpression(call) ||
    !t.isMemberExpression(call.callee) ||
    !t.isIdentifier(call.callee.property) ||
    !u.hasValue(object)
  ) {
    return false
  }

  let evaluables = new Set()
  if (typeof object.value === 'number') {
    evaluables = evaluableInstanceFunctions.number
  } else if (typeof object.value === 'string') {
    evaluables = evaluableInstanceFunctions.string
  } else if (Array.isArray(object.value)) {
    evaluables = allowMutators ? union(evaluableInstanceFunctions.array, arrayMutatorMethods) : evaluableInstanceFunctions.array
  }

  return evaluables.has(call.callee.property.name)
}

function union<T> (lhs: Set<T>, rhs: Set<T>): Set<T> {
  const union = new Set(lhs)
  rhs.forEach(e => union.add(e))
  return union
}
