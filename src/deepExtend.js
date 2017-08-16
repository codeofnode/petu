
import isNoPOJO from './isNoPOJO';
import cloneNoPOJO from './cloneNoPOJO';

let DEL_KEY = '$del';
let OVER_KEY = '$overwrite';

/**
 * @module deepExtend
 */

class DeepExtend {

  /**
   * the delete key  - if found, that value must be removed from root. whether its array or object
   * @example
   * // returns [0,2];
   * petu.deepExtend([0,1,2],[0,'$del',2]);
   */
  static get DelKey() {
    return DEL_KEY;
  }

  /**
   * the overwrite key - if found at index 0 for array, the rest of array valued will be overwrriten
   * @example
   * // returns [3,4];
   * petu.deepExtend([0,1,2],['$overwrite',3,4]);
   */
  static get OverKey() {
    return OVER_KEY;
  }

  /*
   * Set the del key
   * @param {string} vl - the new del key
   */
  static set DelKey(vl) {
    DEL_KEY = vl;
  }

  /*
   * Set the over key
   * @param {string} vl - the new del key
   */
  static set OverKey(vl) {
    OVER_KEY = vl;
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
    for (let on = 0, item, z = 0; z < ln; z += 1, on += 1) {
      item = arr[z];
      if ((item === null || item === undefined) && Array.isArray(def)) {
        clone[on] = (typeof def[z] !== 'object' || def[z] === null) ? def[z] : DeepExtend.deepExtend({}, def[z]);
      } else if (item === DeepExtend.DelKey) {
        clone.splice(on, 1);
        on -= 1;
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          clone[on] = DeepExtend.deepCloneArray(item, (def[z] && def[z]));
        } else if (isNoPOJO(item)) {
          clone[on] = cloneNoPOJO(item);
        } else {
          clone[on] = DeepExtend.deepExtend(((Array.isArray(def) && typeof def[z] === 'object') ? def[z] : {}), item);
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
  static deepExtend(...args) {
    if (args.length < 1 || typeof args[0] !== 'object') {
      return false;
    }
    if (args.length < 2) {
      return args[0];
    }

    const target = args[0];
    let val;
    let src;

    args.forEach((obj) => {
      // skip argument if isn't an object, is null, or is an array
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      const objkys = Object.keys(obj);
      const obagl = objkys.length;
      let minus = 0;

      for (let key, y = 0; y < obagl; y += 1) {
        key = objkys[y];
        src = target[key]; // source value
        val = obj[key]; // new value

        // recursion prevention
        if (val === target || val === null) {

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        } else if (val === DeepExtend.DelKey) {
          if (Array.isArray(target)) {
            target.splice(key - minus, 1);
            minus += 1;
          } else {
            delete target[key];
          }

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        } else if (typeof val !== 'object') {
          target[key] = val;

        // just clone arrays (and recursive clone objects inside)
        } else if (Array.isArray(val)) {
          if (val[0] === DeepExtend.OverKey) {
            target[key] = val.slice(1);
          } else {
            target[key] = DeepExtend.deepCloneArray(val, target[key]);
          }

        // custom cloning and overwrite for specific objects
        } else if (isNoPOJO(val)) {
          target[key] = cloneNoPOJO(val);

        // overwrite by new value if source isn't object or array
        } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
          target[key] = DeepExtend.deepExtend({}, val);

        // source value and new value is objects both, extending...
        } else {
          target[key] = DeepExtend.deepExtend(src, val);
        }
      }
    });
    return target;
  }
}

export default DeepExtend.deepExtend;
export { DeepExtend };
