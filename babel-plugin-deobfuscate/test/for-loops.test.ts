import './test-utils'

it('evaluates assignement in loop body', () => {
  expect(`
    var c = 0
    for (var i = 0; i<10; i++) {
      c = i
    }
    c
  `)
  .deobfuscation(`
    var c = 0;
    c = 9;
    c;
  `)
})

it('evaluates self-referential assignment in loop body', () => {
  expect(`
    var c = 1
    for (var i = 0; i<3; i++) {
      c = c * 2
    }
  `)
  .deobfuscation(`
    var c = 1;
    c = 8;
  `)
})

it('evaluates += in loop update expression', () => {
  expect(`
    var c = 0
    for (var i = 0; i<6; i += 2) {
      c += i
    }
  `)
  .deobfuscation(`
    var c = 0;
    c = 6;
  `)
})

it('evaluates += assignment in loop body', () => {
  expect(`
    var c = 0
    for (var i = 0; i<3; i++) {
      c += 4
    }
  `)
  .deobfuscation(`
    var c = 0;
    c = 12;
  `)
})

it('evaluates increment operator in loop body', () => {
  expect(`
    var c = 0
    for (var i = 0; i < 3; i++) {
      c++
    }
  `)
  .deobfuscation(`
    var c = 0;
    c = 3;
  `)
})

it('evaluates procedure call in loop body', () => {
  expect(`
    function inc () { c++ }
    var c = 1
    for (var i = 0; i < 3; i++) {
      inc()
    }
  `)
  .deobfuscation(`
    function inc () { c++ }
    var c = 1;
    c = 4;
  `)
})

it('inserts comment before unevaluable loops', () => {
  expect(`
    for (;;) { }
  `)
  .deobfuscation(`
    // Unknown loop control variable
    for (;;) { }
  `)
})

it('evaluates member assignment in loop body', () => {
  expect(`
    const i = ['a', 'b', 'c']
    for (var z = 0; z < 3; z++) {
      const s = i[z] + i[z].toUpperCase();
      i[z] = s;
    }
  `)
  .deobfuscation(`
    const i = ['a', 'b', 'c']
    i = ['aA','bB', 'cC']
  `)
})

it('tmp', () => {
  expect(`
    var i = ['qg-k', 'inw/', 'rtnz', 'fryv', '.n8o', 'graf', 'c'];
    for (var z = 0; z < i.length; z++) {
      var s = i[z];
      i[z] = s.split('').reverse().join('');
    }
  `)
  .deobfuscation(`
    const i = ["qg-k", "inw/", "rtnz", "fryv", ".n8o", "graf", "c"];
    i = ["k-gq", "/wni", "zntr", "vyrf", "o8n.", "farg", "c"];
  `)
  // TODO through transformation, i is actually not `const` anymore...
})

test('string construction loop', () => {
  expect(`
    var rafaayey = "";
    const zkrhrrbt = "77696e646f772e6f6e6c6f6164203d20";

    for (var ezatyrfi = 0; ezatyrfi < zkrhrrbt.length; ezatyrfi += 2) {
      rafaayey = rafaayey + parseInt(zkrhrrbt.substring(ezatyrfi, ezatyrfi + 2), 16) + ',';
    }
  `)
  .deobfuscation(`
    var rafaayey = "";
    const zkrhrrbt = "77696e646f772e6f6e6c6f6164203d20";
    rafaayey = "119,105,110,100,111,119,46,111,110,108,111,97,100,32,61,32,";
  `)
})
