var assert = require('assert'),
  petu = require('./../index');

// TODO for many APIs

var test = function(func,args,exp,perf){
  if(!Array.isArray(args)) args = [args];
  if(Array.isArray(exp)){
    for(var z=0,len=exp.length;z<len;z++){
      assert[perf || 'equal'](petu[func].apply(petu,args),exp[z]);
    }
  } else assert[perf || 'equal'](petu[func].apply(petu,args),exp);
};

describe('petu', function() {
  (function(){
    var now = 'isEmpty';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([[]],true);
      });
      it('empty object',function(){
        func([{}],true);
      });
    });
  })();

  (function(){
    var now = 'isNumber';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],false);
      });
      it('string',function(){
        func('osjier',false);
      });
      it('NaN',function(){
        func(Number('osier'),false);
      });
      it('normal integer',function(){
        func(1,true);
      });
      it('-ve',function(){
        func(-1,false);
      });
      it('-ve with allowZero',function(){
        func([-1,true],true);
      });
      it('decimal ',function(){
        func(1.1,false);
      });
      it('decimal with decmal true',function(){
        func([1.1,true,true],true);
      });
    });
  })();

  (function(){
    var now = 'isString';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],false);
      });
      it('number',function(){
        func(1,false);
      });
      it('normal string',function(){
        func('1',true);
      });
      it('empty',function(){
        func('',false);
      });
      it('empty with allowEmpty',function(){
        func(['',true],true);
      });
    });
  })();

  (function(){
    var now = 'stringify';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],'undefined');
      });
      it('string',function(){
        func('a','a');
      });
      it('empty string',function(){
        func('','');
      });
      it('object',function(){
        func({a:'b'},'{"a":"b"}');
      });
      it('empty object',function(){
        func({},'{}');
      });
      it('array',function(){
        func([[]],'[]');
      });
      it('pretty object',function(){
        func([{a:'b'},true],'{\n  "a": "b"\n}');
      });
      it('circular object',function(){
        var b = {a : 'd'};
        b.c = b;
        func(b,'CIRCULAR_JSON_FOUND');
      });
      it('circular object with message',function(){
        var b = {a : 'd'};
        b.c = b;
        func([b,false,'message'],'message');
      });
      it('circular object with message not string',function(){
        var b = {a : 'd'};
        b.c = b;
        func([b,false,2],'CIRCULAR_JSON_FOUND');
      });
    });
  })();

  (function(){
    var now = 'isEmpty';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],false);
      });
      it('string',function(){
        func('a',false);
      });
      it('null',function(){
        func(null,'');
      });
      it('object',function(){
        func({a:'b'},false);
      });
      it('empty object',function(){
        func({},true);
      });
      it('array',function(){
        func([[1,2,3]],false);
      });
      it('empty array',function(){
        func([[]],true);
      });
    });
  })();

  (function(){
    var now = 'walkInto';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        var ok = true;
        func([undefined,function(){ ok = false; }],false);
        assert(ok);
      });
      it('normal test',function(){
        var ok = 0;
        func([{a : 'b', c : [{ d : 'e' }], f: { g: 'h' } },function(a,b,c,d){
          ok++;
        }],false);
        assert.equal(ok,6);
      });
      it('normal test with root',function(){
        var ok = 0;
        func([{a : 'b', c : [{ d : 'e' }], f: { g: 'h' } },function(a,b,c,d){
          ok++;
        },null,null,null,true],true);
        assert.equal(ok,7);
      });
      it('normal test with only one',function(){
        var ok = 0;
        func([{a : 'b', c : [{ d : 'e' }], f: { g: 'h' } },function(a,b,c,d){
          ok++;
        },null,true],false);
        assert.equal(ok,1);
      });
    });
  })();

  (function(){
    var now = 'removeProperties';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],undefined);
      });
      it('simple object',function(){
        var abc = {a : 'b', c : [{ d : 'e', g : 'b' }], f: { g: 'h' } };
        func([abc,'g'],undefined);
        assert.deepEqual(abc,{a : 'b', c : [{ d : 'e' }], f: { } });
      });
      it('simple array',function(){
        var abc = {a : 'b', c : [{ d : 'e' }, { g : 'b' }, 3], n : [1,2,3,4], f: { g: 'h' } };
        func([abc,'1'],undefined);
        assert.deepEqual(abc,{a : 'b', c : [{ d : 'e' },3], n: [1,3,4], f: { g: 'h' } });
      });
    });
  })();

  (function(){
    var now = 'isPassingFilter';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],false);
      });
      it('simple object',function(){
        var abc = {a : 'b', f: { g: 'h' } };
        func([abc,{ a: 'b' }],true);
      });
      it('simple object falsy',function(){
        var abc = {a : 'b', f: { g: 'h' } };
        func([abc,{ a: 'b3' }],false);
      });
    });
  })();

  (function(){
    var now = 'copy';
    var func = test.bind(undefined,now);
    describe(now, function() {
      it('no parameter passed',function(){
        func([],undefined);
      });
      it('copy',function(){
        var db = {}, abc = {a : 'b', c : [{ d : 'e', g : 'b' }], f: { g: 'h' } };
        func([db,abc],undefined);
        assert.deepEqual(db,abc);
      });
    });
  })();
});
