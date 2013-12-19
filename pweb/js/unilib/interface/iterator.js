/**
 * @fileOverview iterator interface implementation
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.interfaces.iterator
 */
unilib.provideNamespace('unilib.interfaces.iterator', function() {
  
  /**
   * base error for iterators
   * @class
   * @extends {unilib.error.UnilibError}
   */
  unilib.interfaces.iterator.IterationError = function(message) {
    errorMessage = 'IterationError: ' + message;
    unilib.error.UnilibError.apply(this, [errorMessage]);
  };
  unilib.inherit(unilib.interfaces.iterator.IterationError,
      unilib.error.UnilibError.prototype);
  
  /**
   * iterator interface
   * @abstract
   * @class
   */
  unilib.interfaces.iterator.Iterator = function() {};
  
  /**
   * reset iterator item pointer to beginning
   */
  unilib.interfaces.iterator.Iterator.prototype.begin = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * reset iterator item pointer to the end
   */
  unilib.interfaces.iterator.Iterator.prototype.finish = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * check if iterator has reached the end
   * @returns {boolean}
   */
  unilib.interfaces.iterator.Iterator.prototype.end = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * advance iterator to next item
   */
  unilib.interfaces.iterator.Iterator.prototype.next = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * get current pointed element
   * @returns {*}
   * @throws {unilib.interfaces.iterator.IterationError}
   */
  unilib.interfaces.iterator.Iterator.prototype.item = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  // implementation of Array Iterator-----------------------------------
  /**
   * iterator for Array like structures 
   * @class
   * @extends unilib.interfaces.iterator.Iterator
   * @param {Array.<*>} vector array to iterate
   */
  unilib.interfaces.iterator.ArrayIterator = function(vector) {
    /** wrapped array
     * @type {Array.<*>}
     * @private
     */
    this.vector_ = vector;
     
    /**
     * flag indicating if the iterator has reached the end
     * @type {boolean}
     * @private
     */
    this.endFlag_ = false;
    
    /** current vector item index
     *  @type {number}
     *  @private
     */
    this.index_ = -1;
    this.begin();
  };
  
  unilib.inherit(unilib.interfaces.iterator.ArrayIterator,
      unilib.interfaces.iterator.Iterator.prototype);
  
  /**
   * reset iterator item pointer to beginning
   */
  unilib.interfaces.iterator.ArrayIterator.prototype.begin = function() {
    this.index_ = 0;
    this.endFlag_ = (this.vector_.length == 0) ? true : false;
  };
  
  /**
   * reset iterator item pointer to the end
   */
  unilib.interfaces.iterator.ArrayIterator.prototype.finish = function() {
    this.index_ = this.vector_.length - 1;
    this.endFlag_ = (this.vector_.length == 0) ? true : false;
  };
  
  /**
   * check if iterator has reached the end
   * @returns {boolean}
   */
  unilib.interfaces.iterator.ArrayIterator.prototype.end = function() {
    return this.endFlag_ || (this.vector_.length == 0);
  };
  
  /**
   * advance iterator to next item
   */
  unilib.interfaces.iterator.ArrayIterator.prototype.next = function() {
    if (this.index_ < this.vector_.length - 1) {
      this.index_++;
    }
    else {
      this.endFlag_ = true;
    }
  };
  
  /**
   * get current pointed element
   * @returns {*}
   * @throws {unilib.interfaces.iterator.IterationError}
   */
  unilib.interfaces.iterator.ArrayIterator.prototype.item = function() {
    if (this.endFlag_) 
      throw new unilib.interfaces.iterator.IterationError('End of Iterator');
    return this.vector_[this.index_];
  };
  
}, ['unilib/error.js']);
unilib.notifyLoaded();