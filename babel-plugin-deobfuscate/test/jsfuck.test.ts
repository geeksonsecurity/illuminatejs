import './test-utils'

test('numbers', () => {
  expect(`+[]`).deobfuscation(`0`)
  expect(`[+[]]+[]`).deobfuscation(`'0'`)

  expect(`+!+[]`).deobfuscation(`1`)
  expect(`[+!+[]]+[]`).deobfuscation(`'1'`)

  expect(`!+[]+!+[]`).deobfuscation(`2`)
  expect(`[!+[]+!+[]]+[]`).deobfuscation(`'2'`)

  expect(`[+!+[]]+[+[]]`).deobfuscation(`'10'`)
})

test('booleans', () => {
  expect(`!![]`).deobfuscation(`true`)
  expect(`[!![]]+[]`).deobfuscation(`'true'`)
})

test('identifiers', () => {
  expect(`+[![]]`).deobfuscation(`NaN`)
  expect(`[+[![]]]+[]`).deobfuscation(`'NaN'`)

  expect(`[][[]]`).deobfuscation(`undefined`)
})
