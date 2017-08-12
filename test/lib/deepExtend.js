import assert from 'assert'
const main = require(`../../${process.env.TEST_DIR||'src'}/lib/deepExtend`).default

describe('Deep Extend', function() {
  describe('not arguments', function() {
    it('should return false', function() {
      assert.equal(main(), false);
    });
  });
  describe('pojo tests', () => {
    it('copy',function(){
      const db = {}, abc = {a : 'b', c : [{ d : 'e', g : 'b' }], f: { g: 'h' } };
      main(db,abc);
      assert.deepEqual(db,abc);
    });
    it('array',function(){
      const db = new Array(2), abc = [{a : 'b', c : [{ d : 'e', g : 'b' }], f: { g: 'h' } },'b'];
      main(db,abc);
      assert.deepEqual(db,abc);
    });
  });

  const SourceObj = {
    b: 3,
    c: 5,
    d: {
      b: { first: 'one', second: 'two' },
      c: { test2: 222 }
    },
    e: { one: 1, two: 2 },
    f: [],
    g: (void 0),
    h: /abc/g,
    i: null,
    j: [3, 4]
  };

  describe('non pojo tests', () => {
    it('copy',function(){
      const obj1 = {
        a: 1,
        b: 2,
        d: {
          a: 1,
          b: [],
          c: { test1: 123, test2: 321 }
        },
        f: 5,
        g: 123,
        i: 321,
        j: [1, 2]
      };
      main(obj1, SourceObj);
      assert.deepEqual(obj1, { a: 1,
        b: 3,
        d:
         { a: 1,
           b: { first: 'one', second: 'two' },
           c: { test1: 123, test2: 222 } },
        f: [],
        g: undefined,
        c: 5,
        e: { one: 1, two: 2 },
        h: /abc/g,
        i: 321,
        j: [3, 4]
      });
    });
    it('delete an item array',function(){
      const obj1 = {
        d: {
          a: 1,
          b: [4,{},true],
          c: { test1: 123, test2: 321 }
        },
      };
      main(obj1, { d: { b: [null, '$del'] } });
      assert.deepEqual(obj1.d.b, [4,true]);
    });
    it('add an item array',function(){
      const obj1 = {
        d: {
          a: 1,
          b: [4,{},true],
          c: { test1: 123, test2: 321 }
        },
      };
      main(obj1, { d: { b: [null, null, null, 'ab'] } });
      assert.deepEqual(obj1.d.b[3], 'ab');
    });
    it('update an item array',function(){
      const obj1 = {
        d: {
          a: 1,
          b: [4,{bc:9},true],
          c: { test1: 123, test2: 321 }
        },
      };
      main(obj1, { d: { b: [null, { ab: 0 }] } });
      assert.deepEqual(obj1.d.b[1], { ab: 0, bc: 9 });
    });
    it('overwrite array',function(){
      const obj1 = {
        d: {
          a: 1,
          b: [4,{bc:9},true],
          c: { test1: 123, test2: 321 }
        },
      };
      main(obj1, { d: { b: ['$overwrite', 8,0] } });
      assert.deepEqual(obj1.d.b, [8,0]);
    });
  });
});
