import * as t from 'babel-types'
import * as u from './utils'

import { evaluateExpression } from './expressions'

export function evaluate (path): t.Expression | null {
  t.assertIdentifier(path.node)

  const binding = path.scope.getBinding(path.node.name)
  if (!binding) {
    return null
  }

  const memberAssignments = u.getMemberAssignments(binding)
    .filter(a => a.scope === path.scope)
    .filter(a => a.getStatementParent().key < path.getStatementParent().key)

  if (binding.hasValue && memberAssignments.length === 0) {
    return u.someLiteral(binding.value)
  }

  if (binding.constant && binding.path.parentKey === 'declarations' && !isSelfReferencingInDeclaration(path, binding)) {
    let init = evaluateInit(path, binding)

    // Handle member assigments
    if (init && u.hasValue(init)) {
      init = t['cloneDeep'](init) as t.ArrayExpression // TODO declare typescript types
      for (const assignment of memberAssignments) {
        const property = evaluateExpression(assignment.get('left.property'))
        if (!(u.hasValue(property) && typeof property.value !== 'boolean')) {
          return null
        }
        const right = evaluateExpression(assignment.get('right'))
        if (!u.hasValue(right)) {
          return null
        }
        if (t.isArrayExpression(init) && u.hasValue(init)) {
          init.elements[property.value] = right
          init.value[property.value] = right.value
        } else {
          return null
        }
      }
    }
    return init
  }

  // Single assignment after declaration
  if (
    binding.constantViolations.length === 1 &&
    t.isVariableDeclarator(binding.path.node) &&
    path.findParent(p => p === binding.constantViolations[0].parentPath) &&
    !isSelfReferencingInDeclaration(path, binding)
  ) {
    const init = binding.path.get('init')
    if (!init.findParent(p => t.isLoop(p))) {
      return evaluateInit(path, binding)
    }
  }

  // Try resolving variable within local scope
  if (binding === path.scope.getOwnBinding(path.node.name)) {
    if (hasAssignmentsInChildScope(binding, path.scope)) {
      return null
    }
    const statementKey = path.getStatementParent().key
    const latestAssignment = binding.constantViolations.filter(a => a.getStatementParent().key < statementKey).pop()
    if (latestAssignment && latestAssignment.node.operator === '=') {
      return evaluateExpression(latestAssignment.get('right'))
    } else {
      return null // TODO evaluateInit(path, binding, evaluateExpression)
    }
  }

  return null
}

function evaluateInit (path, binding): t.Expression | null {
  if (!t.isVariableDeclarator(binding.path.node) || isSelfReferencingInDeclaration(path, binding)) {
    return null
  }
  const init = binding.path.get('init')
  return evaluateExpression(init)
}

/** This occurs bindings are shadowed and is required to break infinite recursion. */
function isSelfReferencingInDeclaration (path, binding): boolean {
  return getDeclaration(path) === getDeclaration(binding.path)
}

function getDeclaration (path): t.VariableDeclaration | null {
  const parent = path.findParent(path => t.isVariableDeclaration(path.node))
  return parent ? parent.node : null
}

function hasAssignmentsInChildScope (binding, scope) {
  binding.constantViolations.some(p => {
    if (!t.isAssignmentExpression(p.node)) {
      return true
    }
    if (p.scope !== scope) {
      if (p.scope.path.isFunctionDeclaration()) {
        return p.scope.getBinding(p.scope.path.node.id.name).referenced
      }
      return true
    }
  })
}
