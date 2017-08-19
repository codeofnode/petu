import assert from 'assert'
const main = require(`../${process.env.TEST_DIR||'src'}/deepExtend`).default

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
      assert.deepEqual(main(db,abc),abc);
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
      main(obj1, { d: { b: ['$del','$del','$del', 8 ,0] } });
      assert.deepEqual(obj1.d.b, [8,0]);
    });
    it('special keys',function(){
      const ab = {a:[1,2,3,4]};
      assert.deepEqual(main(ab,{a:['$rep',2,'$rep',1]}), { a: [ 2, 1, 3, 4 ] });
      assert.equal(ab.a.length, 4);

      assert.deepEqual(main(ab,{a:['$del','$rep',9,'$rep',8]}), { a: [ 9, 8, 4 ] });
      assert.equal(ab.a.length, 3);

      assert.deepEqual(main(ab,{a:[null, '$del']}), { a: [ 9, 4 ] });
      assert.equal(ab.a.length, 2);
    });
  });
  describe('root arrays', function() {
    it('should work on del key',function(){
      let ab = [1,2,3,4];
      ab = main(ab,[null, '$del']);
      assert.deepEqual(ab, [1, 3, 4]);
      assert.equal(ab.length, 3);
    });
    it('should work on rep key',function(){
      let ab = [1,{},3,4];
      ab = main(ab,[null, '$rep', []]);
      assert.deepEqual(ab, [1, [], 3, 4]);
      assert.equal(ab.length, 4);
    });
    it('should work on del+add key',function(){
      let ab = [1,2,3,4];
      ab = main(ab,[null, '$rep', 9, '$del']);
      assert.deepEqual(ab, [1, 9, 4]);
      assert.equal(ab.length, 3);
    });
  });
});
