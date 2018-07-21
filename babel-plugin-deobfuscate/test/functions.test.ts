import './test-utils'

describe('function expressions', () => {
  it('evaluates constant return', () => {
    expect('(function () { return "foo" })();').deobfuscation('"foo";')
    expect('(() => { return "foo"; })();').deobfuscation('"foo";')
    expect('(() => "foo")();').deobfuscation('"foo";')
  })

  it('evaluates function with variables', () => {
    expect('(function () { const s = "foo"; return s; })();').deobfuscation('"foo";')
    expect('(function () { const s = "foo"; return s; })();').deobfuscation('"foo";')

    expect(`(function () {
        const a = "ject";
        const b = "ob";
        return b + a;
      }())`)
      .deobfuscation(`"object"`)
  })

  it('evaluates call in variable declaration', () => {
    expect(`const a = (function () { return "foo"; })();`).deobfuscation(`const a = "foo"`)
  })

  it('evaluates function with variable declarations', () => {
    expect(`(function (x) { var a = 2 * x; return a + 2; })(20)`).deobfuscation(`42`)
  })

  it('evaluates nested function expression calls', () => {
    expect(`(function () { var x = (function () { return "a" } )(); return x + "b" })()`).deobfuscation(`"ab"`)
    expect(`(function (n) {
      var x = n + (function () {
        return (() => "a")()
      })();
      return x + "b" })('x')`).deobfuscation(`"xab"`)
  })

  it('evaluates function with ternary expression', () => {
    expect(`(function (x) { return x > 0 ? true : false })(1)`).deobfuscation(`true`)

    expect(`(x => (x > 0 ? true : false))(1)`).deobfuscation(`true`)
  })

  it('does not inline impure function expression', () => {
    expect(`(function () { console.log("side effect"); return "foo"; })()`)
      .deobfuscation(`(function () { console.log("side effect"); return "foo"; })()`)
  })

  it('evaluates constant captures', () => {
    expect('const s = "foo"; (function () { return s + "bar"; })();').deobfuscation('const s = "foo"; "foobar";')

    expect('const s = "foo"; (() => { return s + "bar"; })();').deobfuscation('const s = "foo"; "foobar";')
  })

  it('evaluates constant arguments', () => {
    expect('(function (x) { return x * x })(2)').deobfuscation('4')
    expect('(function (x) { return x * x })(2 + 2)').deobfuscation('16')
    expect('(function (x, y) { return x * y })(3, 4)').deobfuscation('12')

    expect('(x => x * x)(2)').deobfuscation('4')
    expect('(x => x * x)(2 + 2)').deobfuscation('16')
    expect('((x, y) => x * y)(3, 4)').deobfuscation('12')
  })

  it('evaluates function expression in argument', () => {
    expect(`f((function () { return 'val' })())`).deobfuscation(`f('val')`)

    expect(`f((() => 'val')())`).deobfuscation(`f('val')`)
  })

  it('does not evaluate anonymous function without call', () => {
    expect(`(function () { return 'val' })`).deobfuscation(`(function () { return 'val' })`)
    expect(`f((function () { return 'val' }))`).deobfuscation(`f((function () { return 'val' }))`)

    expect(`(() => 'val')`).deobfuscation(`(() => 'val')`)
    expect(`f(() => 'val')`).deobfuscation(`f(() => 'val')`)

    expect(`(function (n) { var x = n + (function () { return (() => "a")(); })(); return x + "b"; })`)
      .deobfuscation(`(function (n) { const x = n + "a"; return n + "ab"; })`)
  })
})

describe('functions', () => {
  it('evaluates call to function reference', () => {
    expect(`\
      function f(x) { return x; }
      f('string')
    `)
    .deobfuscation(`\
      function f(x) { return x; }
      'string'
    `)
  })

  it('replaces call with symbolic result', () => {
    expect(`
      function f() { return a; }
      f();
    `)
    .deobfuscation(`
      function f() { return a; }
      a;
    `)
  })

  it('inlines procedure call', () => {
    expect(`
      function f() { global = 'value'; console.log('something'); }
      f();
    `)
    .deobfuscation(`
      function f() { global = 'value'; console.log('something'); }
      global = 'value'; console.log('something');
    `)
  })

  it('inlines procedure call with arguments', () => {
    expect(`
      function p(x, y) { global = x + y; }
      p(5, a);
    `)
    .deobfuscation(`
      function p(x, y) { global = x + y; }
      global = 5 + a;
    `)
  })
})
