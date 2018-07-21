import './test-utils'

test('Array constructor with elements', () => {
  expect(`const a = new Array(1, 2, 3)`).deobfuscation(`const a = [1, 2, 3]`)
  expect(`const a = new Array(2)`).deobfuscation(`const a = new Array(2)`)
})

test('Array.protoype.indexOf', () => {
  expect(`['a', 'b', 'c'].indexOf('b')`).deobfuscation(`1`)
  expect(`[].indexOf('z')`).deobfuscation(`-1`)
})

test('Array.prototype.push', () => {
  expect(`var d=[];d.push("13");d.push("10");d.push("13");`).deobfuscation(`const d = ["13", "10", "13"]`)
})

test('array expression inside function', () => {
  expect(`(function (x) { return [x, x * x]; })(2)`).deobfuscation(`[2, 4]`)
  expect(`(function (x) { var a = [x, x * x]; return a; })(2)`).deobfuscation(`[2, 4]`)
})

test('indexed array assignment', () => {
  expect(`const a = ['a', 'b']; a[0] = 'c'; a[0] + a[1];`)
    .deobfuscation(`const a = ['a', 'b']; a[0] = 'c'; 'cb';`)
})

test('multiple array assignments', () => {
  expect(`const a = ['a', 'b']; a[0] = 'c'; a[0] = 'd'; a[0] + a[1];`)
    .deobfuscation(`const a = ['a', 'b']; a[0] = 'c'; a[0] = 'd'; 'db';`)
})

test('cascading array assigments', () => {
  expect(`const a = ['a', 'b']; a[0] = 'c'; a[0] = a[0] + a[0]; a[0] + a[1];`)
    .deobfuscation(`const a = ['a', 'b']; a[0] = 'c'; a[0] = 'cc'; 'ccb';`)
})

it('detects array mutator call', () => {
  expect(`const a = ['a', 'b']; a.reverse(); a[0] + a[1];`)
    .deobfuscation(`const a = ['a', 'b']; a.reverse(); a[0] + a[1];`)
})

test('Array.prototype.reverse used as function', () => {
  expect(`["d", "t", "-", "x"].reverse()`)
    .deobfuscation(`[ 'x', '-', 't', 'd' ]`)
})

test('Array.prototype.pop used as function', () => {
  expect(`["d", "t", "-", "x"].pop()`)
    .deobfuscation(`'x'`)
})

test('array assigment in child scope and bails', () => {
  expect(`const a = ['a', 'b']; function f() { a[0] = 'c' }; a[0] + a[1];`)
    .deobfuscation(`\
const a = ['a', 'b'];
function f() {
a[0] = 'c';
}; a[0] + 'b';`)
})

it('ignores later re-assignment', () => {
  expect(`
    var i = ['a'];
    var s = i[0] + 'b';
    i[0] = unknown;
  `)
    .deobfuscation(`
      const i = ['a'];
      const s = 'ab';
      i[0] = unknown;
    `)
})
