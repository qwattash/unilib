/**
 * @fileOverview observer pattern base implementation
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

unilib.include('unilib/error.js');
unilib.provideNamespace('unilib.mvc');

/**
 * base observer implementation
 * @class
 */
unilib.mvc.Observer = function() {
  /** store reference to observable observed, 
   *  note that in that way only one observable can be observed 
   * @type {Observable}
   */
  this.observed_ = null; //@todo: is it useless/damaging?
};

/**
 * notify update on the observed object
 * @param {ObserverEvent} evt notification info
 */
unilib.mvc.Observer.prototype.update = function(evt) {
  throw new unilib.error.NotYetImplementedError();
};

/**
 * base observable implementation
 * @class
 */
unilib.mvc.Observable = function() {
  /** store observers references
   * @type {Array.<Observer>}
   */
  this.observers_ = [];
};

/**
 * register an observer to this observable
 * @param {Observer} observer
 */
unilib.mvc.Observable.prototype.attachObserver = function(observer) {
  if (this.observers_.indexOf(observer) == -1) {
    this.observers_.push(observer);
  }
};

/**
 * unregister given observer form this observable
 * @param {Observable} observable observable to remove
 */
unilib.mvc.Observable.prototype.detachObserver = function(observable) {
  var index = -1;
  if ((index = this.observers_.indexOf(observable)) != -1) {
    delete this.observers_[index];
    this.observers_.splice(index, 1);
  }
};

/**
 * notify observers of a change
 * @param {ObserverEvent} evt
 */
unilib.mvc.Observable.prototype.notify = function(evt) {
  for (var i = 0; i < this.observers_.length; i++) {
    this.observers_[i].update(evt);
  }
};
