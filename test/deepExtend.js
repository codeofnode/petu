import assert from 'assert'
const deepExtend = require(`../${process.env.TEST_DIR||'src'}/lib/deepExtend`)

describe('Deep Extend', () => {
  describe('length', () => {
    it('no arguments', () => {
      assert.equal(deepExtend(), undefined);
    });
  });
});
