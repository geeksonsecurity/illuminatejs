import './test-utils'

describe('constant propagation', () => {
  it('Empty variable declaration is not converted to const', () => {
    expect('var a;').deobfuscation('var a;')
  });

  it('splits declarations', () => {
    expect('var a = "foo", b = "bar"; f(a, b);').deobfuscation('const a = "foo"; const b = "bar"; f(a, b)')
  })

  it('detects constant var', () => {
    expect('var a = "foo"; f(a)').deobfuscation('const a = "foo"; f(a)')
  })

  it('does not change var', () => {
    expect('var a = "foo"; a += "bar";').deobfuscation('var a = "foo"; a += "bar";')
  })

  it('propagates constants in expressions', () => {
    expect('const a = 1; a + a + a;').deobfuscation('const a = 1; 3;')
    expect('var a = 1; var b = a + 1;').deobfuscation('const a = 1; const b = 2;')
    expect('var a = 1; var b = 2; var c = a + b').deobfuscation('const a = 1; const b = 2; const c = 3')
  })

  it('does not propagate constant references', () => {
    expect('var a = 1; var b = a; f(b);').deobfuscation('const a = 1; const b = a; f(b);')
  })
})

describe('member expressions', () => {
  it('propagates constant members', () => {
    expect(`const a = [1, 2]; a[0] + a[1];`).deobfuscation(`const a = [1, 2]; 3;`)
    expect(`const a = [1, 2]; const i = 0; a[i];`).deobfuscation(`const a = [1, 2]; const i = 0; 1;`)
  })

  it('transforms member expressions', () => {
    expect(`
      function f () { return 'b' }
      a[f()]
    `)
    .deobfuscation(`
      function f () { return 'b' }
      a.b
    `)
  })
})

test('member assignment', () => {
  expect(`
    const a = ['a', 'b']
    a[1] = 'z'
    a.toString()
  `)
  .deobfuscation(`
    const a = ['a', 'b']
    a[1] = 'z'
    'a,z'
  `)
})
