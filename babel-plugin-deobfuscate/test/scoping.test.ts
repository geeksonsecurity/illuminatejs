import './test-utils'

test('re-assignment in child scope', () => {
  expect(`
    var a = '';
    function f () { a = 'foo' }
    f();
    a + 'bar';
    a = 'test'
  `)
  .deobfuscation(`
    var a = "";
    function f() { a = "foo" }
    a = "foo";
    "foobar";
    a = 'test'
  `)
})

test('re-assignment across scopes', () => {
  expect(`
    function g () { return a; }
    function f () { a = 'foo'; return g(); }
    var a = 'test'
    f()
  `)
  .deobfuscation(`
    function g () { return a; }
    function f () { a = 'foo'; return a; }
    var a = 'test'
    'foo'
  `)
})

test('shadowing parameter', () => {
  expect(`
    function f (a) {
      var a = a + 1
      return a
    }
    f(1)
  `)
  .deobfuscation(`
    function f (a) {
      const a = a + 1
      return a
    }
    2
  `)
})
