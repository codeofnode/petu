
/**
 * @module isNoPOJO
 */

class IsNoPOJO {
  /**
   * if a special value
   * @param {val} val - the input value
   * @return {boolean} bool - whether a special value
   */
  static isNoPOJO(val) {
    return (val instanceof Buffer || val instanceof Date || val instanceof RegExp);
  }
}

export default IsNoPOJO.isNoPOJO;
export { IsNoPOJO };
