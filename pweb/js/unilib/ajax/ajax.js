/**
 * @fileOverview strategy view that resolves HTML4 events to HTML5-like
 *  Drag and drop events
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/ajax/ajax.js');

/**
 * @namespace unilib.ajax
 */
unilib.provideNamespace('unilib.ajax', function() {
 
  /**
   * request method
   * @enum {string}
   */
  unilib.ajax.Method = {
    GET :'get',
    POST : 'post'
  };
  
  /**
   * request states
   * @enum {string}
   */
  unilib.ajax.ResponseStatus = {
    NOT_YET_INITIALISED : 0,
    CONNECTION_ESTABLISHED : 1,
    REQUEST_RECEIVED : 2,
    RESPONSE_RECEIVED : 3,
    COMPLETE : 4,
    ERROR : -1
  };
  
  /**
   * rsponse codes
   * @enum {string}
   */
  unilib.ajax.ResponseCode = {
    SUCCESS : 200,
    NOT_FOUND : 404
  };
 
  /**
   * Ajax request wrapper object
   * @class
   * @param {string} url
   * @param {unilib.ajax.Method} method
   * @param {unilib.ajax.Serializer} serializer 
   * used to send objects
   */
  unilib.ajax.Request = function(url, method, serializer) {
    
    /**
     * xmlHttpRequest object, if you have IE5 or 6
     * maybe it is time to update...
     * @type {XMLHttpRequest}
     * @protected
     */
    this.transport_ = new XMLHttpRequest();
    
    this.transport_.onreadystatechange = unilib.createCallback(this, 
      this.handleState_);
    
    /**
     * store requested URL
     * @type {string}
     * @protected
     */
    this.url_ = url;
    
    /**
     * store request method
     * default is POST because it is safer and
     * does not have length limitations
     * @type {unilib.ajax.Method}
     * @protected
     */
    this.method_ = (method === undefined) ? unilib.ajax.Method.POST : method;
    
    /**
     * callbacks for each state
     * @type {Object.<number, Array.<function(object, string)>>}
     * @protected
     */
    this.callbacks_ = {};
    
    /**
     * object serializer
     * @type {unilib.ajax.Serializer}
     * @protected
     */
    this.serializer_ = serializer;
      
    /**
     * store the status that is expected to be the next, 
     * this is used to fire callbacks for intermediate
     * statuses that are not supported by the browser
     * @type {number}
     * @private
     */
    this.ExpectedStatus_ = 0;
  };
  
  /**
   * add callback for given status
   * @param {unilib.ajax.ResponseStatus} status
   * @param {function(object, string)} cbk
   * @public
   */
  unilib.ajax.Request.prototype.addEventListener = function(status, cbk) {
    if (! this.callbacks_[status]) {
      this.callbacks_[status] = [];
    }
    if (this.callbacks_[status].indexOf(cbk) == -1) {
      this.callbacks_[status].push(cbk);
    }
  };
  
  /**
   * perform request
   * @param {Object} data key->value map to send to the server
   */
  unilib.ajax.Request.prototype.send = function(data) {
    switch (this.method_) {
      case unilib.ajax.Method.GET:
      this.get_(data);
      break;
      case unilib.ajax.Method.POST:
      this.post_(data);
      break;
    }
  };
  
  /**
   * send data using GET method
   * @param {Object} data key->value map to send to the server
   * @private
   */
  unilib.ajax.Request.prototype.get_ = function(data) {
    //serialize the data object into an url string
    var requestURL = "";
    for (key in data) {
      if (requestURL == "") {
        requestURL += "?";
      }
      else {
        requestURL += "&";
      }
      requestURL += key;
      requestURL += "=";
      requestURL += encodeURI(this.serializer_.serialize(data[key]));
    }
    //open, always async
    this.transport_.open(String(this.method_).toUpperCase(),
      this.url_ + requestURL, true);
    this.transport_.send();
  };
  
  /**
   * send data using POST method
   * @param {Object} data key->value map to send to the server
   * @private
   */
  unilib.ajax.Request.prototype.post_ = function(data) {
    this.transport_.open(String(this.method_).toUpperCase(),
      this.url_, true);
    this.transport_.setRequestHeader("Content-type", 
      "application/x-www-form-urlencoded");
    var body = "";
    for (key in data) {
      if (body != "") {
        body += "&";
      }
      body += key;
      body += "=";
      body += this.serializer_.serialize(data[key]);
    }
    //console.log(body);
    this.transport_.send(encodeURI(body));
  };
  
  /**
   * main callback
   * @private
   */
  unilib.ajax.Request.prototype.handleState_ = function() {
    var state = this.transport_.readyState;
    var code = 0;
    try {
      //IE8 can throw here
       code = this.transport_.status;
    }
    catch (e) {
      code = 0;
    }
    //console.log("enter ", state, " ", code, " ", this.ExpectedStatus_);
    //console.log(state, code, this.transport_.responseText, this.ExpectedStatus_);
    //check for missing statuses
    if (this.ExpectedStatus_ < state) {
      //call cbk for missing intermediate statuses in this case
      for (var i = this.ExpectedStatus_; i < state; i++) {
        var prevCode = (i < unilib.ajax.ResponseStatus.REQUEST_RECEIVED) ? 
          0 : code;
        this.invokeStatusCallbacks_(i, prevCode, null);
        this.ExpectedStatus_ += 1;
      }
    }
    //console.log("leave", state, " ", code, " ", this.ExpectedStatus_);
    if (this.ExpectedStatus_ == state) {
      //avoid duplicate statuses
      //update expected state
      this.ExpectedStatus_ = 
        (state == unilib.ajax.ResponseStatus.COMPLETE) ? 0 : state + 1;
      //call cbk for current status
      //check for errors
      if (state == unilib.ajax.ResponseStatus.COMPLETE &&
        code != unilib.ajax.ResponseCode.SUCCESS) {
        state = unilib.ajax.ResponseStatus.ERROR;
      }
      //exec handlers
      var response = null;
      try {
        if (this.transport_.responseText && 
          state == unilib.ajax.ResponseStatus.COMPLETE) {
            response = this.serializer_.unserialize(this.transport_.responseText);
        }
      }
      catch(e) {
        //IE8 can throw here too
        response = null;
      }
      this.invokeStatusCallbacks_(state, code, response);
    }
  };
  
  /**
   * main callback
   * @param {number} status
   * @param {number} code
   * @param {?Object} response
   * @private
   */
  unilib.ajax.Request.prototype.invokeStatusCallbacks_ = 
    function(status, code, response) {
    //get handlers
    var handlers = this.callbacks_[status.toString()];
    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i](status, code, response);
      }
    }
  };
  
  // ----------------------------------- Serializer ---------------------------
  
  /**
   * base serializer class
   * @class
   * @abstract
   */
  unilib.ajax.Serializer = function() {
  };

  /**
   * serialize object
   * @param {Object} obj object to process
   * @returns {string}
   */
  unilib.ajax.Serializer.prototype.serialize = function(obj) {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * unserialize data into an object represented by the data
   * @param {string} data
   * @returns {Object}
   */
  unilib.ajax.Serializer.prototype.unserialize = function(data) {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * basic serializer that does nothing
   */
  unilib.ajax.NOPSerializer = function() {
    
  };
  unilib.inherit(unilib.ajax.NOPSerializer,
     unilib.ajax.Serializer.prototype);
    
  /**
   * @see {unilib.ajax.Serializer#serialize}
   */
  unilib.ajax.NOPSerializer.prototype.serialize = function(obj) {
    return obj;
  };
  
  /**
   * @see {unilib.ajax.Serializer#unserialize}
   */
  unilib.ajax.NOPSerializer.prototype.unserialize = function(data) {
    return data;
  };
}, ['unilib/error.js']);
unilib.notifyLoaded();