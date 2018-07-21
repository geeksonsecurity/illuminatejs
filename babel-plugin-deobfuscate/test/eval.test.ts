import './test-utils'

describe('eval', () => {
  it('deobfucates eval with static string', () => {
    expect(`eval('1 + 1')`).deobfuscation(`2`)
    expect(`const s = '1 + 1'; eval(s)`).deobfuscation(`const s = '1 + 1'; 2;`)
  })
})
