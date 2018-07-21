import './test-utils'

test('escape', () => {
  expect(`escape('äöü')`).deobfuscation(`'%E4%F6%FC'`)
})

test('unescape', () => {
  expect(`unescape('%20%3F%21')`).deobfuscation(`' ?!'`)
})

test('isNaN', () => {
  expect(`isNaN(NaN)`).deobfuscation(`true`)
  expect(`isNaN('123ABC')`).deobfuscation(`true`)
})

test('parseFloat', () => {
  expect(`parseFloat('0.0314E+2')`).deobfuscation(`3.14`)
  expect(`parseFloat('FF2')`).deobfuscation(`NaN`)
})

test('parseInt', () => {
  expect(`parseInt('FXX123', 16)`).deobfuscation(`15`)
  expect(`parseInt('Hello', 8)`).deobfuscation(`NaN`)
})
