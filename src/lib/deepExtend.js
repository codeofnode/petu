
/**
 * @module extend
 */

class Extend {
  /**
   * if a special value
   * @param {val} val - the input value
   * @return {boolean} bool - whether a special value
   */
  static isSpecificValue(val) {
    return (val instanceof Buffer || val instanceof Date || val instanceof RegExp);
  }

  /**
   * the delete key  - if found, that value must be removed from root. whether its array or object
   * @example
   * // returns [0,2];
   * petu.extend([0,1,2],[0,'$del',2]);
   */
  static get DelKey(){
    return '$del';
  }

  /**
   * the overwrite key - if found at index 0 for array, the rest of array valued will be overwrriten
   * @example
   * // returns [3,4];
   * petu.extend([0,1,2],['$overwrite',3,4]);
   */
  static get OverKey(){
    return '$overwrite';
  }

  /**
   * clone value from specific value
   * @param {val} val - the input value
   * @return {boolean} bool - whether a special value
   */
  static cloneSpecificValue(val) {
    if (val instanceof Buffer) {
      const xy = new Buffer(val.length);
      val.copy(xy);
      return xy;
    } else if (val instanceof Date) {
      return new Date(val.getTime());
    } else if (val instanceof RegExp) {
      return new RegExp(val);
    } else {
      throw new Error('Unexpected situation');
    }
  }

  /**
   * Recursive cloning array.
   * @param {Object[]} arr - the target array
   * @param {Object[]} def - the default, source array
   * @return {Object[]} ret - the cloned array
   */
  static deepCloneArray(arr, def) {
    let ln = arr.length;
    const clone = new Array(ln);
    const defln = Array.isArray(def) ? def.length : 0;
    if (ln < defln) {
      ln = defln;
    }
    for(let on = 0, item, z = 0; z < ln; z++, on++) {
      item = arr[z];
      if ((item === null || item === undefined) && Array.isArray(def)) {
        clone[on] = (typeof def[z] !== 'object' || def[z] === null) ? def[z] : Extend.deepExtend({}, def[z]);
      } else if (item === DEL_KEY) {
        clone.splice(on,1);
        on--;
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          clone[on] = Extend.deepCloneArray(item, (def[z] && def[z]));
        } else if (Extend.isSpecificValue(item)) {
          clone[on] = Extend.cloneSpecificValue(item);
        } else {
          clone[on] = Extend.deepExtend(((Array.isArray(def) && typeof def[z] === 'object') ? def[z] : {}), item);
        }
      } else {
        clone[on] = item;
      }
    }
    return clone;
  }

  /**
   * Extening object that entered in first argument.
   *
   * Returns extended object or false if have no target object or incorrect type.
   *
   * If you wish to clone source object (without modify it), just use empty new
   * object as first argument, like this:
   *   deepExtend({}, yourObj_1, [yourObj_N]);
   *
   * @param {...object} n number of arguments
   * @return {object} ret - the extended and new target
   */
  static deepExtend(...args){
    if (args.length < 1 || typeof args[0] !== 'object') {
      return false;
    }
    if (args.length < 2) {
      return args[0];
    }

    let target = args[0];
    let val;
    let src;
    let clone;

    args.forEach((obj) => {
      // skip argument if isn't an object, is null, or is an array
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      Object.keys(obj).forEach((key) => {
        src = target[key]; // source value
        val = obj[key]; // new value

        // recursion prevention
        if (val === target || val === null) {
          return;

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        } else if (val === Extend.DelKey) {
          delete target[key];
          return;

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        } else if (typeof val !== 'object') {
          target[key] = val;
          return;

        // just clone arrays (and recursive clone objects inside)
        } else if (Array.isArray(val)) {
          if (val[0] === Extend.OverKey) {
            target[key] = val.slice(1);
          } else {
            target[key] = Extend.deepCloneArray(val, target[key]);
          }
          return;

        // custom cloning and overwrite for specific objects
        } else if (Extend.isSpecificValue(val)) {
          target[key] = Extend.cloneSpecificValue(val);
          return;

        // overwrite by new value if source isn't object or array
        } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
          target[key] = Extend.deepExtend({}, val);
          return;

        // source value and new value is objects both, extending...
        } else {
          target[key] = Extend.deepExtend(src, val);
          return;
        }
      });
    });
    return target;
  }
}

export default Extend.deepExtend;
