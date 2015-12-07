(function () {
  'use strict';

  var INT_SEP = '--petu-->', MAX_DEEP = 9;

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


    fixOptions : function(options,bool){
      var mapping = { 'Number' : 'maxDeep' };
      if(this.isString(bool)) mapping['Boolean'] = bool;
      var opts = proto.getOptions(options,null,mapping);
      if(!proto.isNumber(opts.maxDeep)) opts.maxDeep = proto.isNumber(this.maxDeep) ? this.maxDeep : MAX_DEEP;
      return opts;
    },


    getOptions : function(opt, next, field, type){
      var def = {}, last = {};
      if(field && !this.isObject(opt)){
        if(typeof field === 'object'){
          def = field;
        } else if(this.isString(field)){
          def[this.isString(type) ? type : 'isString'] = field;
        }
        for(var key in def){
          if(this.isString(def[key]) && this.isFunction(this['is'+key])){
            if(this['is'+key](opt)){
              last[def[key]] = opt;
            }
          }
        }
      } else last = opt;
      if(next) return [last,next];
      else return last;
    },


    isBoolean : function(a){
      return (typeof a === 'boolean');
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


    walkInto : function(obj, fun, filter, options, root, key, path, count){
      var opts = this.fixOptions(options,'onlyOne');
      var pass = false;
      if(!this.isFunction(fun)) return pass;
      if(!this.isNumber(count)) count = 0;
      if(!Array.isArray(path)) path = ['$'];
      var isObj = this.isObject(obj,true,true);
      if((!opts.onlyObject || isObj) && (opts.addRoot || root || count)
          && (!this.isFunction(filter) || filter(obj, key, root, path, count))
          && (!this.isObject(filter,true,true) || this.isPassingFilter(obj, filter))){
        pass = true;
        fun(obj, key, root, path, count);
      }
      if(isObj && count < opts.maxDeep){
        count++;
        var keys = Object.keys(obj);
        for(var ok = false, z=0,len=keys.length;z<len;z++){
          ok = this.walkInto(obj[keys[z]], fun, filter, opts, obj, keys[z], path.concat(keys[z]), count);
          if(opts.onlyOne && ok) {
            break;
          }
        }
      }
      return pass;
    },


    removeProperties : function(obj, fields, options){
      var opts = this.fixOptions(options, 'over');
      if(!this.isString(fields)) return;
      var fields = fields.trim().split(' '), isNumber = this.isNumber.bind(this);
      if(!fields.length) return;
      this.walkInto(obj, function(obj){
        var isAr = Array.isArray(obj);
        for(var z=0,len=fields.length;z<len;z++){
          if(fields[z].length){
            if(isAr){
              var num = Number(fields[z]);
              if(isNumber(num)){
                obj.splice(num,1);
              }
            } else if(obj.hasOwnProperty(fields[z])){
              delete obj[fields[z]];
            }
          }
        }
      }, null,opts);
    },


    isPassingFilter : function(obj,filter){
      if(this.isObject(obj,true,true) && this.isObject(filter,true,true)){
        var keys = Object.keys(filter), len = keys.length;
        for(var z=0;z<len;z++){
          if(obj[keys[z]] !== filter[keys[z]]){
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


    together : function(obj, source, func, options,filter){
      var opts;
      if(!this.isFunction(func)) func = this.noop;
      if(this.isString(options)) opts = { sep : options };
      else opts = this.fixOptions(options, 'over');
      if(this.isObject(obj,true,true)){
        var sep=opts.sep||INT_SEP, ptrs = { $ : obj },
          isFunction = this.isFunction.bind(this), isFound = this.isFound.bind(this);
        this.walkInto(source,function(val,key,root,path){
          if(!isFunction(filter) || filter(val,key,root,path)){
            var np = null, prev = '';
            for(var z = path.length-2;z>=0;z--){
              prev = path[z] + (prev.length ? (sep + prev): '');
            }
            var prvPoint  = ptrs[prev], jPath = prev + sep + path[path.length-1], ifPrvFound = isFound(prvPoint);
            func(ptrs,jPath,ifPrvFound,prvPoint,val,key,root,path,opts);
          }
        }, null, opts);
      }
    },


    copy : function(obj, source, options,filter){
      var isObject = this.isObject.bind(this), isFound = this.isFound.bind(this);
      this.together(obj, source, function(ptrs,jPath,ifPrvFound,prvPoint,val,key,root,path,opts){
        if(isObject(val,true,true)){
          if(!isFound(ptrs[jPath])){
            var np = null;
            if(Array.isArray(val)) np = new Array(root.length);
            else np = {};
            ptrs[jPath] = np;
            if(ifPrvFound) {
              prvPoint[key] = np;
            }
          }
        } else {
          if(ifPrvFound && (opts.over || !prvPoint.hasOwnProperty(key))){
            prvPoint[key] = val;
          }
        }
      },options,filter);
    },


    chopRight : function(str,chr){
      if(this.isString(str) && this.isString(chr)){
        var lastInd = str.lastIndexOf(chr);
        return str.substring(0,lastInd);
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


    noop : function(){
    },


    each : function(array, forEach, callback){
      if(!this.isFunction(callback)) callback = this.noop;
      if(Array.isArray(array) && this.isFunction(forEach)){
        var eaching = this.eaching.bind(this);
        var arlen = array.length, results = new Array(arlen);
        var lastCall = function(z){
          if(z===arlen) callback(null,results);
        };
        for(var z =0;z<arlen;z++){
          eaching(array[z], forEach, callback, lastCall, results, z, true);
        }
      } else {
        return callback(true);
      }
    },


    parallel : function(array,callback){
      this.each(array,function(func,next){ func(next); },callback);
    },


    eaching : function(item, forEach, callback, next, saveResults, z, breakOnError, saveError){
      if(!this.isFunction(forEach)) forEach = this.noop;
      if(!this.isFunction(next)) next = this.noop;
      if(!this.isFunction(callback)) callback = this.noop;
      var isNumber = this.isNumber.bind(this), isFunction = this.isFunction.bind(this);
      forEach(item, function(errr){
        if(errr && breakOnError === true) return callback(errr, saveResults);
        else {
          if(errr && saveError){
            saveError.error = errr;
          }
          if(isNumber(z,true)){
            var res = Array.prototype.slice.call(arguments);
            res.shift();
            try {
              saveResults[z] = (res.length === 1 ? res[0] : res);
            } catch(er){ }
            if(isFunction(next)) {
              next(z+1);
            }
          }
        }
      },z);
    },


    eachSeries : function(array, forEach, breakOnError, callback){
      if(this.isFunction(breakOnError)){
        callback = breakOnError;
        breakOnError = true;
      } else if(this.isFunction(callback)){
        breakOnError = Boolean(breakOnError);
      } else callback = this.noop;
      if(Array.isArray(array) && this.isFunction(forEach)){
        var eaching = this.eaching.bind(this), saveError = { error : null };
        var arlen = array.length, results = new Array(arlen);
        var forEachAr = function(z){
          if(z === arlen) return callback(saveError.error, results);
          else eaching(array[z], forEach, callback, forEachAr, results, z, breakOnError, saveError);
        };
        forEachAr(0);
      } else {
        return callback(true);
      }
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


    escapeRegExp : function(string) {
      return this.stringify(string).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

  };

  function Petu(options){
    var opts = proto.getOptions(options, null, { 'Number' : 'maxDeep' });
    var allowed = ['maxDeep'];
    proto.copy(this,opts,true,function(val,key){
      return allowed.indexOf(key) !== -1;
    });
  }

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
