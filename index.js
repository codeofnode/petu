(function () {
  'use strict';

  function Petu(){
  }

  var proto = {

    isNumber:function(input, plusZero, allowDec){
      var prev = String(input);
      return Boolean(typeof input === 'number' && !(isNaN(input)) && (plusZero || input > 0)
          && (allowDec || (prev === String(parseInt(prev,10)))));
    },


    isEmpty : function(input){
      return Boolean(typeof input === 'object' && input && !(Object.keys(input).length));
    },


    isString:function(input,allowEmpty){
      return Boolean(typeof input === 'string' && (allowEmpty || input.length));
    },


    isFound : function(a){
      return (a !== undefined && a !== null);
    },


    isObject : function(obj, allowEmpty, allowArray, allowNull){
      return Boolean((typeof obj === 'object') && (allowNull || obj) &&
        (allowArray || !Array.isArray(obj)) && (allowEmpty || Object.keys(obj).length));
    },


    isDate : function(date){
      return (date instanceof Date && !(isNaN(date.getTime())));
    },


    isFunction : function(inp){
      return typeof inp === 'function';
    },


    stringify : function(input,pretty,defMsg){
      if(this.isString(input,true)){
        return input;
      } else if(this.isObject(input,true,true)){
        try {
          return pretty ? JSON.stringify(input, undefined, 2) : JSON.stringify(input);
        } catch(e) {
          return this.isString(defMsg) ? defMsg : 'CIRCULAR_JSON_FOUND';
        }
      } else return String(input);
    },


    walkInto : function(obj, fun, filter, opts, maxCount, root, key, count){
      var pass = false;
      if(opts === true) opts = { onlyOne : true };
      else if(!this.isObject(opts)) opts = {};
      if(!this.isFunction(fun)) return pass;
      if(!this.isNumber(maxCount)) maxCount = 999;
      if(!this.isNumber(count)) count = 0;
      var isObj = this.isObject(obj,true,true);
      if((!opts.onlyObject || isObj) && (opts.addRoot || root || count) && (!this.isFunction(filter) || filter(obj, key, root, count))
          && (!this.isObject(filter,true,true) || this.isPassingFilter(obj, filter))){
        pass = true;
        fun(obj, key, root, count);
      }
      if(isObj && count < maxCount){
        count++;
        var keys = Object.keys(obj);
        for(var ok = false, z=0,len=keys.length;z<len;z++){
          ok = this.walkInto(obj[keys[z]], fun, filter, opts, maxCount, obj, keys[z], count);
          if(opts.onlyOne && ok) {
            break;
          }
        }
      }
      return pass;
    },


    removeProperties : function(obj, fields){
      if(!this.isString(fields)) return;
      var fields = fields.trim().split(' '), isNumber = this.isNumber.bind(this);
      if(!fields.length) return;
      this.walkInto(obj, function(obj,ind){
        var isAr = Array.isArray(obj);
        for(var z=0,len=fields.length;z<len;z++){
          if(fields[z].length){
            if(isAr){
              obj.splice(Number(ind),1);
            } else if(obj.hasOwnProperty(fields[z])){
              delete obj[fields[z]];
            }
          }
        }
      }, null,{ onlyObject : true, addRoot : true });
    },


    isPassingFilter : function(obj,filter){
      if(this.isObject(obj,true,true) && this.isObject(filter,true,true)){
        var keys = Object.keys(filter), len = keys.length;
        for(var z=0;z<len;z++){
          if(source[keys[z]] !== filter[keys[z]]){
            return false;
          }
        }
        return true;
      }
      return false;
    },


    getString : function(input, args){
      if(this.isFunction(input)){
        return this.stringify(input.apply(input, args));
      } else {
        return this.stringify(input);
      }
    },


    copy : function(source,obj,over,func){
      if(this.isObject(source,true,true)){
        var isObject = this.isObject.bind(this), pointer = source, isFunction = this.isFunction.bind(this);
        this.walkInto(source,function(val,key,root){
          if((over || !pointer.hasOwnProperty(key)) && (!isFunction(func) || func(val))){
            if(isObject(val,true,true)) {
              if(Array.isArray(val)) {
                pointer[key] = new Array(val.length);
              } else {
                pointer[key] = {};
              }
              pointer = pointer[key];
            } else {
              pointer[key] = val;
            }
          }
        });
      }
    },


    reachAtPath : function(obj, path, options) {
      var PATH_NOT_RESOLVED = 'PETU_PATH_NOT_RESOLVED';
      if(!this.isObject(options)) options = {};
      if(this.isFound(options.notFound)) PATH_NOT_RESOLVED = options.notFound;
      if(!this.isObject(obj)) return PATH_NOT_RESOLVED;
      if(!(/^[a-z_A-Z0-9\.\*\]\[]*$/.test(path))){
        return PATH_NOT_RESOLVED;
      }

      var chop = 0;
      if(path.charAt(0) === '$') {
        chop++;
        if(path.charAt(1) === '.') chop++;
      }
      path = path.substring(chop);

      var root = obj, point = obj, key = '', nextIndex, start=0, end=0, keys;

      while(path.length){
        nextIndex = start = end = 0; chop = 1;
        if(path.charAt(0) === '['){
          start++;
          nextIndex = path.indexOf(']');
          if(nextIndex === -1) break;
          end = nextIndex;
          if(path.charAt(nextIndex+1) === '.') nextIndex++;
          if(path.charAt(start) === "'" && path.charAt(end-1) === "'"){
            start++; end++;
          }
        } else {
          nextIndex = path.indexOf('.');
          chop = path.indexOf('[');
          if(chop !== -1 && nextIndex > chop){
            nextIndex = chop;
            chop = 0;
          } else {
            chop = 1
          }
          end = nextIndex;
        }
        nextIndex = (nextIndex + chop);
        if(end !== -1){
          key = path.substring(start,end);
          if(key.length) {
            if(!options.noStar && key === '*'){
              if(Array.isArray(point)){
                if(point.length){
                  key = 0;
                } else break;
              } else {
                keys = Object.keys(point);
                if(keys.length){
                   key = keys[0];
                }
              }
            }
          } else {
            break;
          }
        } else {
          key = path;
        }
        if(options.getRoot) root = point;
        point = point[key];
        if(end === -1) break;
        if(point === undefined) return PATH_NOT_RESOLVED;
        else path = path.substring(nextIndex);
      }
      if(options.getRoot) {
        return {
          point : point,
          root : root,
          key : key
        };
      } else {
        return point;
      }
    },


    cropString : function(input,count){
      if(!this.isString(input)) input = this.stringify(input);
      if(!this.isNumber(count)) return '';
      if(input.length >= count) return (input.substring(0,count - 4) + ' ...');
      else return input;
    },


    capitalize : function(word){
      if(!this.isString(word)) return this.stringify(word);
      return word.charAt(0).toUpperCase() + word.substr(1);
    },


    eachSeries : function(array, forEach, breakOnError, callback){
      if(this.isFunction(breakOnError)){
        callback = breakOnError;
        breakOnError = true;
      } else if(this.isFunction(callback)){
        breakOnError = Boolean(breakOnError);
      } else return;
      if(Array.isArray(array) && this.isFunction(forEach)){
        var err = null, arlen = array.length;
        var forEachAr = function(z){
          if(z === arlen) return callback(err);
          else {
            forEach(array[z], function(errr){
              if(errr && breakOnError === true) return callback(errr);
              else {
                err = errr;
                forEachAr(z+1);
              }
            },z);
          }
        };
        forEachAr(0);
      } else return callback(true);
    },


    series : function(array,breakOnError,callback){
      this.eachSeries(array,function(func,next){ func(next); },breakOnError,callback);
    },


    getOrderString : function(num){
      if(!this.isNumber(num)) return false;
      var ones = (num % 10), sf;
      var tens = Math.floor(num / 10) % 10;
      if (tens == 1) {
        sf = "th";
      } else {
        switch (ones) {
          case 1 : sf = "st"; break;
          case 2 : sf = "nd"; break;
          case 3 : sf = "rd"; break;
          default : sf = "th";
        }
      }
      return num + sf;
    },


    getReadableDate : function(inp,format){
      var date = new Date(inp);
      if(!this.isDate(date)) date = new Date();
      var dstr = String(date);
      if(dstr.length < 35) return dstr;
      switch (format){
        case 'D' :
          var day = this.getOrderString(dstr.substring(7,10));
          if(day === false) return date.toString();
          return (dstr.substring(4, 8) + day + ',' + dstr.substring(10, 15));
        case 'JS' :
          return dstr;
        case  'L' :
          var dj = date.toJSON();
          return dj.substring(5,7) + '/'+ dj.substring(8,10) + '/' + dj.substring(0,4);
        default :
          var ha = dstr.substring(16,17), hb = dstr.substring(17,18), hh = '', ps = 'am', hh = (Number(ha+hb)%12);;
          if(ha === '0') ha = '';
          else { if(ha === '1') { if(hb !== '1'){ ps = 'pm'; } } else ps = 'pm'; }
          return hh + dstr.substring(18,24) + ' ' + ps + ', ' + dstr.substring(4, 10) + ',' + dstr.substring(10, 15);
      }
    },


    errorInObject : function(obj, file){
      if(!this.isObject(obj,true,true)) return 'Object to validate not found';
      if(!this.isObject(file,true)) return 'Filing for object not found';
      for(var k in file){
        if(file[k]){
          if(typeof file[k] === 'string') file[k] = { type : file[k] };
          if(!obj.hasOwnProperty(k)) {
            if(file[k].notReq === true) return false;
            else return k + ' not found..!';
          }
          switch(file[k].type){
            case 'number' :
              if(typeof obj[k] !== 'number') return k + ' should be a number';
              if(typeof file[k].min === 'number' && obj[k] < file[k].min)
                return k + ' should be greater than '+file[k].min;
              if(typeof file[k].max === 'number' && obj[k] > file[k].max)
                return k + ' should be less than '+file[k].max;
              break;
            case 'boolean' :
              if(typeof obj[k] !== 'boolean') return k + ' should be true or false';
              if(typeof file[k].bool === 'boolean' && obj[k] !== file[k].bool) return k + ' should be '+file[k].bool;
              break;
            case 'array' :
              if(!Array.isArray(obj[k])) return k + ' shoule be an array.';
              if(typeof file[k].length === 'number' && obj[k].length !== file[k].length)
                return k + ' should have ' + file[k].length + ' records';
              if(typeof file[k].min === 'number' && file[k].length < file[k].min)
                return k + ' k should have greater than '+file[k].min + ' records';
              if(typeof file[k].max === 'number' && file[k].length > file[k].max)
                return k + ' keys should have less than '+file[k].max + ' records.';
              break;
            case 'object' :
              if(typeof obj[k] !== 'object') return k + ' should be a object';
              if(typeof file[k].length === 'number' && Object.keys(obj[k]).length !== file[k].length)
                return k + ' should have '+file[k].length + ' properties';
              var kl = Object.keys(obj[k]).length;
              if(typeof file[k].min === 'number' && kl < file[k].min)
                return k + ' keys length should be greater than '+file[k].min;
              if(typeof file[k].max === 'number' && kl > file[k].max)
                return k + ' keys length should be less than '+file[k].max;
              break;
            default :
              if(typeof obj[k] !== 'string') return k + ' should be a string';
              if(typeof file[k].length === 'number' && obj[k] !== file[k].length)
                return k + ' should be of length '+file[k].length;
              if(typeof file[k].min === 'number' && obj[k].length < file[k].min)
                return k+' length should be greater than '+file[k].min;
              if(typeof file[k].max === 'number' && obj[k].length > file[k].max)
                return k +' length should be less than '+file[k].max;
              if(typeof file[k].exact === 'string' && obj[k] !== file[k]) return k + ' must match '+file[k].max;
              if(file[k].regex && !file[k].regex.test(obj[k])) return k + ' should pass regex '+String(file[k].regex);
          }
        }
      }
      return false;
    },


    waitForData : function(ob, key, callback, error, timeout, interval){
      if(!this.isNumber(timeout)) timeout = 100;
      if(!this.isNumber(interval)) interval = 200;
      if(!this.isFunction(error)) error = function(){ };
      if(!this.isObject(ob,true,true)) return error('Source object not found.');
      if(!this.isString(key) && !this.isNumber(key,true)) return error('Key for the source not found.');
      var times = 0;
      var callme = function(){
        times++;
        var inter = function(){
          if(ob[key]) callback(ob[key]);
          else if(times > timeout) error('Timeout to load data..!');
          else callme();
        };
        if(times === 1){
          inter();
        } else {
          setTimeout(inter, interval);
        }
      };
      callme();
    },


    pluck : function(docs, prop, pre) {
      var o = {}, key = false;
      if(!Array.isArray(docs)) return [];
      for(var i = 0; i < docs.length; i++) {
        if(this.isFunction(docs[i][pre])) key = docs[i][pre](prop);
        key = this.stringify(key || docs[i][prop]);
        o[String(docs[i][prop])] = 1;
      }
      return Object.keys(o);
    },


    getNthIndex : function(str, substr, n){
      str = this.stringify(str);
      substr = this.stringify(substr);
      if(!this.isNumber(n, true)) return str.indexOf(substr);
      var times = 0, index = null;
      while (times < n && index !== -1) {
        index = str.indexOf(substr, index+1);
        times++;
      }
      return index;
    },


    plurify : function(base, n, addDot){
      var st = base;
      if(n > 1) st += 's';
      if(addDot) st += '.';
      return st;
    },


    countNoOfChars : function(word,letter){
      var count = 0;
      word = this.stringify(word);
      for (var i = 0; i < word.length; i++) {
        if (word.charAt(i) === letter) count++;
      }
      return count;
    },


    isRightPattern : function(actual, expected){
      if(this.isFunction(expected)){
        return expected(actual);
      } else {
        return actual === expected;
      }
    },


    extractPatterns : function(obj,expected) {
      if(!this.isObject(obj)) return {};
      var ar = {}; var path = '';
      var isRightPattern = this.isRightPattern;
      function inc(k,root) {
        if(Array.isArray(root)) path += ('[' + k + ']');
        else if(path) path += ('.' + k);
        else path = k;
      }
      function dec(root) {
        if(path) {
          path = path.substring(0, path.lastIndexOf(Array.isArray(root) ? '[' : '.'));
        }
      }
      function scan(obj) {
        var k,v;
        if (obj instanceof Object) {
          for (k in obj){
            if (obj.hasOwnProperty(k)){
              v = obj[k];
              if(typeof(v) === 'string') {
                if(isRightPattern(v,expected)) {
                  inc(k,obj);
                  ar[path] = v;
                  dec();
                }
              } else if(v && typeof(v) === 'object') {
                inc(k,obj);
                scan(obj[k]);
                dec(obj);
              }
            }
          }
        }
      }
      scan(obj);
      return ar;
    },


    escapeRegExp : function(string) {
      return this.stringify(string).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

  };

  Petu.prototype = proto;

  var petu = new Petu();

  // CommonJS module
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = petu;
    }
    exports.Petu = Petu;
    exports.petu = petu;
  }

  // Register as an anonymous AMD module
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return petu;
    });
  }

  // If there is a window object, that at least has a document property,
  // instantiate and define petu on the window
  if (typeof window === "object" && typeof window.document === "object") {
    window.Petu = Petu;
    window.petu = petu;
  }
})();
