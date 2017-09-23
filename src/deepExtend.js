
import isNoPOJO from './isNoPOJO';
import cloneNoPOJO from './cloneNoPOJO';

let DEL_KEY = '$del';
let REP_KEY = '$rep';

/**
 * @module deepExtend
 */

class DeepExtend {

  /**
   * the delete key - if found, that value must be removed from root. whether its array or object
   * @example
   * // returns [0,2];
   * petu.deepExtend([0,1,2],[0,'$del',2]);
   */
  static get DelKey() {
    return DEL_KEY;
  }

  /**
   * the rep key - the next record will be as it is as given.
   * @example
   * // returns [[],1,2];
   * petu.deepExtend([{},1,2],['$rep',[]]);
   */
  static get RepKey() {
    return REP_KEY;
  }

  /*
   * Set the del key
   * @param {string} vl - the new del key
   */
  static set DelKey(vl) {
    DEL_KEY = vl;
  }

  /*
   * Set the rep key
   * @param {string} vl - the new del key
   */
  static set RepKey(vl) {
    REP_KEY = vl;
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

    for (let on = 0, minus = 0, item, z = 0, defi; z < ln; z += 1, on += 1) {
      item = arr[z];
      defi = z - minus;
      if (clone[on - 1] === DeepExtend.RepKey) {
        clone[on] = item;
        on -= 1;
        clone.splice(on, 1);
      } else if (item === null || item === undefined) {
        if (defi < defln && Array.isArray(def)) {
          clone[on] = (typeof def[defi] !== 'object' || def[defi] === null)
            ? def[defi]
            : DeepExtend.deepExtend({}, def[defi]);
        }
      } else if (item === DeepExtend.DelKey) {
        clone.splice(on, 1);
        on -= 1;
      } else if (item === DeepExtend.RepKey) {
        clone[on] = arr[z];
        ln += 1;
        minus += 1;
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          clone[on] = DeepExtend.deepCloneArray(item, def[defi] && def[defi]);
        } else if (isNoPOJO(item)) {
          clone[on] = cloneNoPOJO(item);
        } else {
          clone[on] = DeepExtend.deepExtend(Array.isArray(def) && typeof def[defi] === 'object' ? def[defi] : {}, item);
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

    let target = args[0];
    let val;
    let src;

    args.forEach((obj, ind) => {
      // skip argument if isn't an object, is null, or is an array
      if (!ind || typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(target) && Array.isArray(obj)) {
        target = DeepExtend.deepCloneArray(obj, target);
        return;
      }

      Object.keys(obj).forEach((key) => {
        src = target[key]; // source value
        val = obj[key]; // new value

        if (val === target || val === null) {
          // recursion prevention
          // ignore

        } else if (val === DeepExtend.DelKey) {
          delete target[key];

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        } else if ((typeof val !== 'object') || (val[DeepExtend.RepKey] === DeepExtend.RepKey)) {
          if (typeof val === 'object') {
            delete val[DeepExtend.RepKey];
          }
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
      });
    });
    return target;
  }
}

export default DeepExtend.deepExtend;
export { DeepExtend };
