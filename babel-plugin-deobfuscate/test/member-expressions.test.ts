import './test-utils'

test('member of this', () => {
  expect(`new this['Object']()`).deobfuscation(`new Object()`)
})

test('member function', () => {
  expect(`var m = 'toString'; s[m]()`).deobfuscation(`const m = "toString"; s.toString()`)
})

test('member of string literal', () => {
  expect(`"true"[3]`).deobfuscation(`'e'`)
})

test('nested member expression', () => {
  expect(`[[1, 2]][0][1]`).deobfuscation(`2`)
})

test('member function of this', () => {
  expect(`
    function f() { return 'r' }
    this['f']()
  `).deobfuscation(`
    function f() { return 'r' }
    'r'
  `)
})
