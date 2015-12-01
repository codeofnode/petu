var assert = require('assert'),
  petu = require('./../index');

// TODO for many APIs

var test = function(func,args,exp,perf){
  if(!Array.isArray(args)) args = [args];
  for(var z=0,len=test.length;z<len;z++){
    assert[perf || 'equal'](petu[func].apply(petu,args),exp);
  }
};

describe('petu', function() {
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
        func([undefined,function(){ ok = false; }],undefined);
        assert(ok);
      });
      it('normal test',function(){
        var ok = false;
        func([{a : 'b', c : [{ d : 'e' }], f: { g: 'h' } },function(a,b,c,d){
          ok = true;
        }],undefined);
        assert(ok);
      });
    });
  })();
});
