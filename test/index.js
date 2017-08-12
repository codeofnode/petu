import assert from 'assert'
const main = require(`../${process.env.TEST_DIR||'src'}`)

describe('commulative require', function() {
  describe('length', function() {
    it('should be 3', function() {
      assert(Object.keys(main).length,3);
    });
  });
})
