import * as t from 'babel-types'

export type HasValue = t.Expression & { value: any }

export function hasValue (node: t.Node): node is HasValue {
  if (!t.isExpression(node)) {
    return false
  }

  if (t.isLiteral(node)) {
    if (t.isRegExpLiteral(node)) {
      node['value'] = new RegExp(node.pattern, node.flags)
    }
    if (t.isNullLiteral(node)) {
      node['value'] = null
    }
    return true
  }

  if (t.isArrayExpression(node)) {
    if (node.elements.every(e => t.isExpression(e) && hasValue(e))) {
      node['value'] = node.elements.map((e) => e['value'])
      return true
    }
  }

  if (t.isIdentifier(node)) {
    if (node.name === 'undefined') {
      node['value'] = undefined
      return true
    } else if (node.name === 'NaN') {
      node['value'] = NaN
      return true
    }
  }

  return false
}

export function withValues (expressions: t.Expression[]): HasValue[] | null {
  return expressions.every(arg => hasValue(arg)) ? expressions as HasValue[] : null
}

export function isNumeric (object): boolean {
  return !isNaN(object - parseFloat(object))
}

// TODO Template literals?
export function someLiteral (value): HasValue | null {
  const node: t.Expression | null = (() => {
    switch (typeof value) {
      case 'undefined': return t.identifier('undefined')
      case 'boolean': return t.booleanLiteral(value)
      case 'string': return t.stringLiteral(value)
      case 'number': return t.numericLiteral(value)
      case 'object':
        if (Array.isArray(value)) {
          const values = value.map(someLiteral)
          return t.arrayExpression(values as any[])
        } else if (value instanceof RegExp) {
          return t.regExpLiteral(value.source, value['flags'])
        }
        return t.nullLiteral()
      default: return null
    }
  })()
  if (node) {
    node['value'] = value
    return node as HasValue
  }
  return null
}

export function isAssignmentExpressionStatement (statement: t.Statement): boolean {
  t.assertStatement(statement)

  return t.isExpressionStatement(statement) &&
    t.isAssignmentExpression(statement.expression, { operator: '=' }) &&
    t.isIdentifier(statement.expression.left)
}

/**
 * This could be done symbolically if it makes for better de-obfuscation.
 * I.e. generate a binary expression node instead of a literal.
 */
export function assignmentValue (operator, oldValue, value): any {
  switch (operator) {
    case '=': return value
    case '+=': return oldValue + value
    case '-=': return oldValue - value
    case '*=': return oldValue * value
    case '/=': return oldValue / value
    default: throw new Error('Unexpected operator in assignment: ' + operator)
  }
}

/**
 * This could be done symbolically if it makes for better de-obfuscation.
 * I.e. generate a binary expression node instead of a literal.
 */
export function updateValue (operator, value): any {
  switch (operator) {
    case '++': return value + 1
    case '--': return value - 1
    default: throw new Error('Unexpected operator in update expression: ' + operator)
  }
}

/** Find paths where a property gets assigned. */
export function getMemberAssignments (binding, option?: { propertyValue }): any[] {
  return binding.referencePaths
    .map(p => p.parentPath)
    .filter(p => t.isAssignmentExpression(p.parent) && p.key === 'left')
    .filter(p => option ? p.node.property.value === option.propertyValue : true)
    .map(p => p.parentPath)
}
