import * as t from 'babel-types'
import * as u from './utils'
import * as arrays from './arrays'

const deobfuscated = Symbol('deobfuscated')

export function transformDeclaration (path) {
  if (path.node[deobfuscated] || t.isLoop(path.parent)) {
    return
  }
  const declarations = transformVariableDeclaration(path.node, path.scope)
  declarations.forEach((it) => { it[deobfuscated] = true })
  const declarationKey = path.key

  declarations
    .map(d => d.declarations[0])
    .map(d => [path.scope.getBinding(d.id.name), d.init])
    .forEach(([binding, init]) => {
      if (binding) {
        foldConsecutiveArrayPush(binding, init, declarationKey)
        checkArrayMutatorCalls(binding)
      }
    })

  if (declarations.length === 1) {
    path.replaceWith(declarations[0])
  } else {
    // TODO This marks the path as `removed`, but continues traversal which can cause problems down the line...
    path.replaceWithMultiple(declarations)
  }
}

// - Split declarators into separate declarations.
// - Mark constants with `const` keyword.
function transformVariableDeclaration (node, scope) {
  t.assertVariableDeclaration(node)
  return node.declarations.map(declarator => {
    if (t.isIdentifier(declarator.id)) {
      const binding = scope.getBinding(declarator.id.name)
      if (binding && binding.constant && declarator.init) {
        return t.variableDeclaration('const', [declarator])
      }
    }

    return t.variableDeclaration('var', [declarator])
  })
}

function checkArrayMutatorCalls (binding) {
  if (!binding.hasValue || !Array.isArray(binding.value)) {
    return
  }
  const mutatorCalls = arrays.getMutatorCalls(binding)
  if (mutatorCalls.length === 0) {
    return
  }

  if (mutatorCalls.some(m => m.node.callee.property.name !== 'push')) {
    binding.deoptValue()
  }
}

// Simplify a very specific case where an array declaration is followed by `push` calls.
function foldConsecutiveArrayPush (binding, init, declarationKey) {
  const mutatorCalls = arrays.getMutatorCalls(binding)
  if (mutatorCalls.length === 0) {
    return
  }

  for (const call of mutatorCalls) {
    const statementPath = call.getStatementParent()
    if ((declarationKey + 1) !== statementPath.key || call.node.callee.property.name !== 'push') {
      binding.deoptValue()
      break
    }
    init.elements.push(...call.node.arguments)
    statementPath.remove()
  }

  if (init.elements.every(e => u.hasValue(e))) {
    binding.setValue(init.elements.map(e => e.value))
  } else {
    binding.deoptValue()
  }
}
