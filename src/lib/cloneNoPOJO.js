
/**
 * @module cloneNoPOJO
 */

class CloneNoPOJO {

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
    }
    if (val instanceof Date) {
      return new Date(val.getTime());
    }
    if (val instanceof RegExp) {
      return new RegExp(val);
    }
    throw new Error('Unexpected situation');
  }
}

export default CloneNoPOJO.cloneSpecificValue;
export { CloneNoPOJO };
