import assert from 'assert'
const main = require(`../${process.env.TEST_DIR||'src'}`)

describe('commulative require', () => {
  describe('length', () => {
    it('should be 1', () => {
      assert(Object.keys(main).length,1);
    });
  });
})
