import './test-utils'

describe(`binary expressions`, () => {
  test(`arithmetic operators`, () => {
    expect(`1 + 1;`).deobfuscation(`2;`)
    expect(`2 * 2;`).deobfuscation(`4;`)
    expect(`1 / 2 - 3;`).deobfuscation(`-2.5;`)
    expect(`2 * (2 + 3);`).deobfuscation(`10;`)
    expect(`7 % 2;`).deobfuscation(`1;`)

    expect(`-10 + 10`).deobfuscation(`0`)
    expect(`-10 * -10`).deobfuscation(`100`)
  })

  test(`bitwise shift operators`, () => {
    expect(`16 << 2;`).deobfuscation(`64;`)
    expect(`16 >> 2;`).deobfuscation(`4;`)
  })

  test(`relational operators`, () => {
    expect(`1 < 2;`).deobfuscation(`true;`)
    expect(`1 > 2;`).deobfuscation(`false;`)
    expect(`9 >= 10;`).deobfuscation(`false;`)
    expect(`9 <= 10;`).deobfuscation(`true;`)
  })

  test(`equality operators`, () => {
    expect(`"1" == 1;`).deobfuscation(`true;`)
    expect(`"1" === 1;`).deobfuscation(`false;`)
    expect(`"1" != 1;`).deobfuscation(`false;`)
    expect(`"1" !== 1;`).deobfuscation(`true;`)
  })

  test(`logic operators`, () => {
    expect(`true && false;`).deobfuscation(`false;`)
    expect(`true || false;`).deobfuscation(`true;`)
    expect(`(1 == 1) || (2 == 2);`).deobfuscation(`true;`)
  })

  test(`binary bitwise operators`, () => {
    expect(`1 & 0;`).deobfuscation(`0;`)
    expect(`1 ^ 0;`).deobfuscation(`1;`)
    expect(`1 | 0;`).deobfuscation(`1;`)
  })

  test(`string expressions`, () => {
    expect(`"1" + "2";`).deobfuscation(`"12";`)
  })

  // https://www.destroyallsoftware.com/talks/wat
  test(`wat expressions`, () => {
    expect(`[] + []`).deobfuscation(`""`)
    expect(`[1] + [2]`).deobfuscation(`"12"`)
    expect(`[1] - [2]`).deobfuscation(`-1`)
    expect(`[1] * [2]`).deobfuscation(`2`)
  })

  test(`identifier associativity`, () => {
    // `x` can't be evaluated, but because of the associativity property of some operators,
    // evaluation order can be changed to allow partional evaluation.
    expect(`x + 1 + 2`).deobfuscation(`x + 3`)
    expect(`1 + 2 + x`).deobfuscation(`3 + x`)
  })
})

describe(`unary expressions`, () => {
  // TODO this is actually wrong for number types
  // test(`should symbolically evaluate double not`, () => {
  //   expect(`!a;`).deobfuscation(`!a;`)
  //   expect(`!!a;`).deobfuscation(`a;`)
  //   expect(`!!!a;`).deobfuscation(`!a;`)
  // })

  test(`! operator`, () => {
    expect(`!true`).deobfuscation(`false`)
  })

  test(`~ operator`, () => {
    expect(`~16`).deobfuscation(`-17`)
    expect(`~[]`).deobfuscation(`-1`)
    expect(`~true`).deobfuscation(`-2`)
    expect(`~false`).deobfuscation(`-1`)
  })

  test(`- operator`, () => {
    expect(`-7`).deobfuscation(`-7`)
    expect(`const n = -4; -n;`).deobfuscation(`const n = -4; 4`)
    expect(`-true`).deobfuscation(`-1`)
  })

  test(`+ operator`, () => {
    expect(`+[]`).deobfuscation(`0`)
  })
})

describe('ternary expressions', () => {
  test('conditional expression', () => {
    expect(`false ? 'nope' : 'yes'`).deobfuscation(`'yes'`)
    expect(`var a = null; a ? 'nope' : 'yes'`).deobfuscation(`const a = null; 'yes'`)
    expect(`1 ? 'yep' : ''`).deobfuscation(`'yep'`)
  })
})
