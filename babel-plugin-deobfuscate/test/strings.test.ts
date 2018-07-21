import './test-utils'

test('Number.prototype.toString', () => {
  expect(`1.0.toString()`).deobfuscation(`"1"`)
  expect(`1.0["toString"]()`).deobfuscation(`"1"`)

  expect(`const x = 1; x.toString();`).deobfuscation(`const x = 1; "1";`)
  expect(`720094129.0.toString(2 << 4)`).deobfuscation(`"length"`)
})

test('Array.prototype.toString', () => {
  expect(`[7].toString()`).deobfuscation(`"7"`)
  expect(`[].toString()`).deobfuscation(`""`)
})

test('String.fromCharCode', () => {
  expect(`String.fromCharCode(0x6f,98)`).deobfuscation(`"ob"`)
  expect(`const a = 100; String.fromCharCode(a,a)`).deobfuscation(`const a = 100; "dd"`)
})

test('String.prototype.split', () => {
  expect(`'abc'.split('')`).deobfuscation(`['a', 'b', 'c']`)
})

test('String.prototype.replace', () => {
  expect(`'abc'.replace('a', '1')`).deobfuscation(`'1bc'`)
  expect(`var s = 'a'; 'abc'.replace(s, '1')`).deobfuscation(`const s = 'a'; '1bc'`)
})

test('consequitive prototype functions', () => {
  expect(`'abc'.split('').reverse().join('').toUpperCase()`).deobfuscation(`'CBA'`)
})

it('evaluate replace with regular expression', () => {
  expect(`'abc ABC'.replace(/[a-z]/g, '1')`).deobfuscation(`'111 ABC'`)
})

test('replace with arrow function argument', () => {
  expect(`'abc'.replace('a', () => 'b')`).deobfuscation(`'bbc'`)
  expect(`'abc'.replace('a', m => m + m)`).deobfuscation(`'aabc'`)
})

test('replace with function argument', () => {
  expect(`'abc'.replace('a', function () { return 'b' })`).deobfuscation(`'bbc'`)
  expect(`'abc'.replace('a', function (m) { return m + m })`).deobfuscation(`'aabc'`)
})

it('evaluate replace with regular expression and function argument', () => {
  expect(`'abc ABC'.replace(/[a-z]/gi, function (s) { return s + s })`).deobfuscation(`'aabbcc AABBCC'`)
})

test('replace with function argument and captures', () => {
  expect(`var out = 'test'; 'abc'.replace('a', function (m) { return out + m })`).deobfuscation(`const out = 'test'; 'testabc'`)
})

test('string functions in function expression', () => {
  expect(`(function (s) {
      return String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13));
    })('f')`)
    .deobfuscation(`'s'`)
})

test('complex replace', () => {
  expect(`const w = 'f-dh';
    (w + '').replace(/[a-z]/gi, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13));
    });`)
    .deobfuscation(`const w = 'f-dh';\n\n's-qu';`)
})

test('indexOf', () => {
  expect(`'abc'.indexOf('b')`).deobfuscation(`1`)
  expect(`''.indexOf('a')`).deobfuscation(`-1`)
  expect(`'abc'.indexOf('z')`).deobfuscation(`-1`)
})

test('charAt', () => {
  expect(`'abc'.charAt(1)`).deobfuscation(`'b'`)
  expect(`'abc'.charAt(9)`).deobfuscation(`''`)
  expect(`''.charAt(0)`).deobfuscation(`''`)
  expect(`'abc'.charAt(-1)`).deobfuscation(`''`)
  expect(`var s = 'asdf'; s.charAt(1)`).deobfuscation(`const s = 'asdf'; 's'`)
})

test('toLowerCase', () => {
  expect(`'abc'.toLowerCase()`).deobfuscation(`'abc'`)
  expect(`'aBC'.toLowerCase()`).deobfuscation(`'abc'`)
  expect(`const s = 'ABC'; s.toLowerCase()`).deobfuscation(`const s = 'ABC'; 'abc'`)
})

test('parseInt', () => {
  expect(`parseInt('1234')`).deobfuscation(`1234`)
})

test('string functions inside binary expression', () => {
  expect(`var fn = ws.ExpandEnvironmentStrings("%TEMP%") + String.fromCharCode(92) + Math.round(Math.random() * 100000000) + ".exe";`)
    .deobfuscation(`const fn = ws.ExpandEnvironmentStrings("%TEMP%") + '\\\\' + Math.round(Math.random() * 100000000) + ".exe";`)
})

describe('string literals', () => {
  test('ASCII escape sequences', () => {
    expect(`f('\\x3F')`).deobfuscation(`f('?')`)
    expect(`f('\\u0020')`).deobfuscation(`f(' ')`)
    expect(`f('\\x09')`).deobfuscation(`f('\\t')`)
    expect(`f('\\u0008')`).deobfuscation(`f('\\b')`)
    expect(`f('\\u005C')`).deobfuscation(`f('\\\\')`)
  })

  it('does not evaluate non-ASCII escape sequences', () => {
    expect(`f('\\xA9')`).deobfuscation(`f('\\xA9')`) // ©
    expect(`f('\\uD83D\\uDD25')`).deobfuscation(`f('\\uD83D\\uDD25')`) // 🔥
  })
})
