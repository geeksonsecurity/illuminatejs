import * as t from 'babel-types'
import * as builtIns from './built-ins'
import { evaluateExpression } from './expressions'

export function evaluateArrayExpression (path): t.Expression | null {
  path.assertArrayExpression()
  const elements = path.get('elements').map(evaluateExpression)
  if (elements.some((e, i) => e !== path.node.elements[i])) {
    return t.arrayExpression(elements)
  }

  return null
}

export function getMutatorCalls (binding): any[] {
  return binding.referencePaths
    .map(p => p.parentPath)
    .filter(p => t.isCallExpression(p.parent) && p.key === 'callee' && builtIns.isArrayMutatorFunctionCall(p.parent))
    .map(p => p.parentPath)
}
