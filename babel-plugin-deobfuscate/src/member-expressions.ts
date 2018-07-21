import * as t from 'babel-types'
import * as u from './utils'
import * as arrays from './arrays'
import { evaluateExpression } from './expressions'

export function evaluate (path): t.Expression | null {
  path.assertMemberExpression()

  if (t.isAssignmentExpression(path.parent) && path.key === 'left') {
    return null
  }

  let memberExpression: t.MemberExpression = path.node
  let propertyValue: Object
  if (memberExpression.computed && t.isExpression(memberExpression.property)) {
    const evaluated = evaluateExpression(path.get('property'))
    if (u.hasValue(evaluated)) {
      propertyValue = evaluated.value
      const transformedExpression = transformComputedMemberExpression(memberExpression, propertyValue, path.scope)
      if (!t.isMemberExpression(transformedExpression)) {
        return transformedExpression
      }
      memberExpression = transformedExpression
    } else {
      return memberExpression
    }
  } else if (t.isIdentifier(memberExpression.property)) {
    propertyValue = memberExpression.property.name
  } else {
    return memberExpression
  }

  if (t.isIdentifier(memberExpression.object)) {
    const binding = path.scope.getBinding(memberExpression.object.name)
    if (!binding) {
      return memberExpression
    }
    const object = evaluateExpression(path.get('object'))
    if (!object || !u.hasValue(object)) {
      return memberExpression
    }

    if (arrays.getMutatorCalls(binding).length > 0) {
      // TODO potential for improvement here
      return memberExpression
    }

    const assignments = u.getMemberAssignments(binding, { propertyValue })
    if (assignments.some(p => p.scope !== path.scope)) {
      // Out of scope mutation
      return memberExpression
    }

    const previousAssignments = assignments.filter(p => p.getStatementParent().key < path.getStatementParent().key)
    if (previousAssignments.length > 0) {
      // Find value of most recent previous assignment
      const lastAssignment = previousAssignments[previousAssignments.length - 1]
      const result = evaluateExpression(lastAssignment.get('right'))
      if (result && u.hasValue(result)) {
        return u.someLiteral(result.value)
      }
    } else {
      return getMemberExpressionValue(path, object, propertyValue) || memberExpression
    }
  } else if (u.hasValue(memberExpression.object)) {
    return getMemberExpressionValue(path, memberExpression.object, propertyValue) || memberExpression
  }

  return memberExpression
}

function getMemberExpressionValue (path, object: u.HasValue, propertyValue: any): u.HasValue | null {
  const value = object.value[propertyValue]
  return u.someLiteral(value)
}

function transformComputedMemberExpression (memberExpression: t.MemberExpression, propertyValue: any, scope): t.Expression {
  if (u.isNumeric(propertyValue) && typeof propertyValue !== 'number') {
    const property = t.numericLiteral(parseFloat(propertyValue))
    return t.memberExpression(memberExpression.object, property, true)
  } else if (typeof propertyValue === 'string') {
    if (t.isThisExpression(memberExpression.object) && isGlobalScope(scope)) {
      return t.identifier(propertyValue)
    }
    return t.memberExpression(memberExpression.object, t.identifier(propertyValue), false)
  } else {
    return memberExpression
  }
}

function isGlobalScope (scope) {
  return !scope.parent
}
