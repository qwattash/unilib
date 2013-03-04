/**
 * @fileOverview Simple unit test framework
 * @author qwattash (Alfredo Mazzinghi)
 * @license GNU General Public License
 * @version 1.0
 */

/* 
 * @todo: Refactoring notes:
 * refactor exception using custom exceptions
 * may need an Async test support for ajax callbacks
 */

/**
 * @private
 * @description convert value to a string representation of the value, 
 * 	 including null, undefined, empty string etc.
 * @param {Object} value
 * @return {string}
 */
function stringRepr(value) {
	if (value === undefined) {
		return 'undefined';
	}
	if (value === null) {
		return 'null';
	}
	if (typeof value == 'string' || value instanceof String) {
		return '"' + value.toString() + '"';
	}
	if (value instanceof Array) {
		return '[' + value.toString() + ']';
	}
	if (typeof value == 'function') {
		var stringFunction = value.toString();
		var nameExtractor = new RegExp("");
	}
	return value.toString();
}

/**
 * @description enumeration defining allowed result values inside AssertionResult.result
 * @enum {string}
 */
Result = {
	PASS: 'passed',
	FAIL: 'failed',
	GLOBAL_FAIL: 'globalfailure',
	MESSAGE: 'warning'
};

/**
 * @private
 * @class AssertionResult is an helper for storing assertion results
 */
function AssertionResult(result, value, expected, message, errMessage){
	/** value available in enum RESULT
	 * @type {RESULT}
	 */
	this.resultCode = result || Result.FAIL;
	
	/** value given to assert function 
	 * @type {Object}
	 */
	this.value = value || null;
	
	/** expected value to test in assertion
	 * @type {Object}
	 */
	this.expected = expected || null;
	
	/** message passed to assert function
	 * @type {String}
	 */
	this.message = message || '';
	
	/** error message produced by the assert function
	 * @type {String}
	 */
	this.errorMessage = errMessage || '';
}
/**
 * @private
 * @description global test manager is used to handle communication of test results
 * @namespace
 */
testManager = {
	/** @description where to put test reports
	 * @type {Element}
	 * @private
	 */
	display: null,
	
	/** @description current test report area
	 * @type {Element}
	 * @private
	 */
	testDisplay: null,
	
	/** @description tests registered on the testManager, stored for future reruns
	 * @type {Array.<Test>}
	 * @private
	 */
	tests: [],
	
	/** @description reference to test currently running
	 * @type {Test}
	 * @private
	 */
	current: null,
	
	/**
	 * @description get index of given test inside this.tests
	 * @param {Test} test
	 * @return {Number} index || -1 if not found
	 * @private
	 */
	getTestIndex_: function(test) {
		for (var i = 0; i < this.tests.length; i++) {
			if (this.tests[i] == test) {
				return i;
			}
		}
		return -1;
	},
	
	/**
	 * @public
	 * @description properly displays assertion results inside the display element
	 * @param {AssertionResult} assertResult: results of an assertion  display
	 */
	handleAssertion: function(assertResult){
		if (this.display != null) {
			var item = document.createElement('li');
			var box = document.createElement('span');
			switch (assertResult.resultCode) {
			case Result.FAIL:
				item.setAttribute('class', 'test-assert test-assert-failure');
				box.setAttribute('class', 'test-icon test-icon-failure');
				this.current.failed++;
				break;
			case Result.PASS:
				item.setAttribute('class', 'test-assert test-assert-success');
				box.setAttribute('class', 'test-icon test-icon-success');
				this.current.passed++;
				break;
			case Result.GLOBAL_FAIL:
				item.setAttribute('class', 'test-assert test-assert-message');
				box.setAttribute('class', 'test-icon test-icon-message');
				this.current.failed++;
				break;
			default:
				item.setAttribute('class', 'test-assert test-assert-message');
				box.setAttribute('class', 'test-icon test-icon-message');
				this.current.failed++;
			}
			this.current.total++;
			item.appendChild(box);
			//create report
			var report = document.createElement('span');
			report.setAttribute('class', 'test-report');
			//user message
			var span = document.createElement('span');
			span.setAttribute('class', 'test-report-message');
			span.appendChild(document.createTextNode(assertResult.message));
			report.appendChild(span);
			//expected value
			report.appendChild(document.createTextNode(' => Expected: '));
			span = document.createElement('span');
			span.setAttribute('class', 'test-report-expected');
			span.appendChild(document.createTextNode(
					assertResult.expected.toString()));
			report.appendChild(span);
			//found value
			report.appendChild(document.createTextNode(' Found: '));
			span = document.createElement('span');
			span.setAttribute('class', 'test-report-value');
			span.appendChild(document.createTextNode(
					assertResult.value.toString()));
			report.appendChild(span);
			//optional error message
			if (assertResult.errorMessage) {
				report.appendChild(document.createTextNode(' Error: '));
				span = document.createElement('span');
				span.setAttribute('class', 'test-report-error');
				span.appendChild(document.createTextNode(
						assertResult.errorMessage));
				report.appendChild(span);
			}
			//put everything in place 
			item.appendChild(report);
			this.testDisplay.appendChild(item);
		}
		else {
			console.log('unable to find div#unittest element.');
		}
	},
	
	/**
	 * @public
	 * @description add test to tests list
	 * @param {Test} test
	 */
	registerTest: function(test) {
		//prevent duplicates, even if it is unlikely that there will be any
		var found = false;
		for (var i = 0; i < test.length; i++) {
			if (this.tests[i] == test) {
				found = true;
				break;
			}
		}
		if (!found) {
			this.tests.push(test);
		}
	},
	
	/**
	 * @public
	 * @description initialise display entry for the test
	 * @param {Test} test
	 */
	startTest: function(test){
		var testId = 'test#' + this.getTestIndex_(test);
		var container = document.createElement('div');
		container.setAttribute('class', 'test-container');
		container.setAttribute('id', testId);
		var header = document.createElement('p');
		header.setAttribute('class', 'test-header');
		//folding feature, default unfolded
		var fold = document.createElement('span');
		fold.setAttribute('class', 'test-icon test-fold-icon');
		//default unfolded sign
		fold.appendChild(document.createTextNode('-'));
		header.appendChild(fold);
		//append text content
		var text = document.createElement('span');
		text.setAttribute('class', 'test-header-text');
		text.appendChild(document.createTextNode('Test ' + test.name + ':'));
		header.appendChild(text);
		//put everything in place
		container.appendChild(header);
		var assertsContainer = document.createElement('ul');
		assertsContainer.setAttribute('class', 'test-asserts');
		container.appendChild(assertsContainer);
		this.testDisplay = assertsContainer;
		this.display.appendChild(container);
		this.unfoldTestReport(testId);
	},
	
	/**
	 * @public
	 * @description add test summary to the container and unset test-specific variables
	 */
	endTest: function(){
		var footer = document.createElement('p');
		var container = this.testDisplay.parentNode;
		footer.setAttribute('class', 'test-footer');
		if (this.current.expected){
			if (this.current.total != this.current.expected) {
				var assertResult = new AssertionResult(Result.FAIL, 
						this.current.total,
						this.current.expected,
						'unexpected number of assertions');
				this.handleAssertion(assertResult);
			}
		}
		footer.appendChild(document.createTextNode('Summary => Passed: '));
		var span = document.createElement('span');
		span.setAttribute('class', 'test-footer-field-success');
		span.appendChild(document.createTextNode(this.current.passed));
		footer.appendChild(span);
		footer.appendChild(document.createTextNode(' Failed: '));
		span = document.createElement('span');
		span.setAttribute('class', 'test-footer-field-failure');
		span.appendChild(document.createTextNode(this.current.failed));
		footer.appendChild(span);
		footer.appendChild(document.createTextNode(' Total: '));
		span = document.createElement('span');
		span.setAttribute('class', 'test-footer-field-total');
		span.appendChild(document.createTextNode(this.current.total));
		footer.appendChild(span);
		container.appendChild(footer);
		//manage folding for the test
		if (this.current.failed == 0) {
			//fold all-passed tests
			this.foldTestReport(container.id);
		}
		this.testDisplay = null;
	},
	
	/**
	 * @public
	 * @description notify an unexpected global failure
	 * @param {Object} reason exception causing global test failure
	 */
	globalFailure: function(reason){
		var results = new AssertionResult(Result.GLOBAL_FAIL, 
			reason.toString(), 'assert #' + String(this.current.total + 1));
		this.handleAssertion(results);
	},
	
	/**
	 * @public
	 * @description handle an expect call in current test
	 * @param {number} expectedAssertNum number of expected assertions
	 */
	handleExpect: function(expectedAssertNum) {
		if (this.current) {
			this.current.expect(expectedAssertNum)
		}
		else {
			console.log('cannot set expected assertion if ' + 
					'no current test is running');
		}
	},
	
	/**
	 * @public
	 * @description execute registered tests
	 */
	execute: function() {
		this.display = document.getElementById('unittest');
		try {
			for (var i = 0; i < this.tests.length; i++) {
				this.current = this.tests[i];
				this.tests[i].run();
			}
		}
		catch(ex) {
				this.globalFailure('on ' + this.current.name + ' ' 
						+ ex.toString());
			}
		this.current = null;
	},
	
	/**
	 * @public
	 * @description fold test assertions for given test container
	 * @param {String} testContainerId
	 */
	foldTestReport: function(testContainerId) {
		var container = document.getElementById(testContainerId);
		var asserts = container.getElementsByTagName('ul')[0];
		asserts.setAttribute('class', asserts.getAttribute('class') + ' test-asserts-fold');
		var header = container.getElementsByClassName('test-header')[0];
		var fold = header.getElementsByClassName('test-fold-icon')[0];
		fold.firstChild.nodeValue = '+';
		/* WARNING
		 * here it is not needed to double encapsulate the function since 
		 * 	testId is not changed by anyone. Otherwise it would need to
		 * (function (tempId) {
		 * 	return function() {
		 * 		doStuffWith(tempId);
		 * 	};
		 * })(testId);
		 * */
		fold.onclick = function() {
			testManager.unfoldTestReport(testContainerId);
		}
	},
	
	/**
	 * @param
	 * @description unfold test assertions for given test container
	 * @param {String} testContainerId
	 */
	unfoldTestReport: function(testContainerId) {
		var container = document.getElementById(testContainerId);
		var asserts = container.getElementsByTagName('ul')[0];
		var assertClass = asserts.getAttribute('class');
		var index = assertClass.indexOf('test-asserts-fold');
		// length of 'test-asserts-fold' is 17
		if (index >= 0) {
			var newClass = assertClass.substr(0, index) + assertClass.substr(index + 17);
			asserts.setAttribute('class', newClass);
		}
		var header = container.getElementsByClassName('test-header')[0];
		var fold = header.getElementsByClassName('test-fold-icon')[0];
		fold.firstChild.nodeValue = '-';
		/* WARNING
		 * here it is not needed to double encapsulate the function since 
		 * 	testId is not changed by anyone. Otherwise it would need to
		 * (function (tempId) {
		 * 	return function() {
		 * 		doStuffWith(tempId);
		 * 	};
		 * })(testId);
		 * or not??
		 * */
		fold.onclick = function() {
			testManager.foldTestReport(testContainerId);
		}
	}
};
/**
 * @private
 * @description Test is a test module that uses testManager to organise its output
 * @class Test
 * @param {String} testName
 * @param {Function} body
 */
function Test(testName, body){
	/** 
	 * name of the test
	 * @default Test
	 * @type {String} */
	this.name = testName || 'Test';
	
	/** number of assertions to expect in this test, null value means any
	 * @type {number}
	 * @default null
	 */
	this.expected = null;
	
	/** number of passed assertions
	 * @type {number}
	 * @default 0
	 */
	this.passed = 0;
	
	/** number of failed assertions
	 * @type {number}
	 * @default 0
	 */
	this.failed = 0;
	
	/** total number of assertions encountered in the test
	 * @type {number}
	 * @default 0
	 */
	this.total = 0;
	
	if (typeof body === "function") {
		/**
		 * executable body of the test 
		 * @type {Function} */
		this.body = body;
	}
	else {
		throw "test: Body field must be a function.";
	}
};

/**
 * @public
 * @description run the test
 */
Test.prototype.run = function() {
	this.passed = 0;
	this.failed = 0;
	this.total = 0;
	testManager.startTest(this);
	try {
		this.body();
	}
	catch(ex){
		testManager.globalFailure(ex);
	}
	testManager.endTest();
};

/**
 * @public
 * @description set a number of expected assertions to be invoked,
 *  this prevent the test to fail silently when dealing with callbacks
 * @param {number} expected the number of assertions to expect
 */
Test.prototype.expect = function(expected) {
	if (expected < 0) throw "can't expect a negative number of assertions";
	this.expected = expected;
};

/**
 * @private
 * @description encapsulate logic for assertions evaluation
 * @namespace
 */
assertion = {
		/**
		 * @public
		 * @description <p>test if value evaluates to true or false, 
		 * 	fill an AssertionResult properly, modify:</p>
		 * <ul>
		 * <li> AssertionResult.value
		 * <li>AssertionResult.expected
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} value object to be evaluated
		 * @param {boolean} expected boolean value to match against
		 * @param {AssertionResult} result where to put results of the test
		 */
		testBool: function(value, expected, result) {
			result.value = stringRepr(value);
			result.expected = stringRepr(expected);
			if (value) {
				result.resultCode = (expected == true) ? Result.PASS : Result.FAIL;
				result.errorMessage = (expected == false) ? 
						result.value + ' is not False' : '';
			}
			else {
				result.resultCode = (expected == true) ? Result.FAIL : Result.PASS;
				result.errorMessage = (expected == true) ? 
						result.value + ' is not True' : '';
			}
		},
		/**
		 * @public
		 * @description <p>test if value == expected without checking types,
		 * 	fill an AssertionResult properly, modify:</p>
		 * <ul>
		 * <li> AssertionResult.value
		 * <li>AssertionResult.expected
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} value object to be evaluated
		 * @param {object} expected value to expect
		 * @param {AssertionResult} result where to put results of the test
		 */
		testEqual: function(value, expected, result) {
			result.value = stringRepr(value);
			result.expected = stringRepr(expected);
			if (value == expected) {
				result.resultCode = Result.PASS;
			}
			else if (isNaN(expected) && typeof expected == 'number') {
				//special case since NaN == NaN would return false
				if (isNaN(value) && typeof value == 'number') {
					result.resultCode = Result.PASS;
				}
				else {
					result.resultCode = Result.FAIL;
				}
			}
			else {
				result.resultCode = Result.FAIL;
				result.errorMessage = 'value does not match expected';
			}
		},
		/**
		 * @public
		 * @description <p>test if value === expected (checking types), 
		 * 	fill an AssertionResult properly, modify :</p>
		 * <ul>
		 * <li> AssertionResult.value
		 * <li>AssertionResult.expected
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} value object to be evaluated
		 * @param {object} expected value to expect
		 * @param {AssertionResult} result where to put results of the test
		 */
		testStrictEqual: function(value, expected, result) {
			assertion.testEqual(value, expected, result);
			if (result.resultCode == Result.PASS) {
				//test type
				if (typeof value != typeof expected) {
					result.resultCode = Result.FAIL;
					result.errorMessage = 'value is not stricly ' +
						'equal to expected';
				}
			}
		},
		/**
		 * @private
		 * @description <p>test if two arrays has same internal structure</p>
		 * <ul>
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} value object to be evaluated
		 * @param {object} expected value to expect
		 * @param {AssertionResult} result where to put results of the test
		 * @throws {string} if value or expected are not Arrays
		 */
		testDeepEqualArray: function(value, expected, result){
			if (value instanceof Array && expected instanceof Array) {
				//traverse array elements
				if (value.length == expected.length) {
					var equal = true;
					for (var i = 0; i < value.length; i++) {
						if (value[i] != expected[i]) {
							equal = false;
							break;
						}
					}
					if (equal) {
						result.resultCode = Result.PASS;
					}
					else {
						result.resultCode = Result.FAIL;
						result.errorMessage = 'different values' +
							'found in the array';
					}
				}
				else {
					result.resultCode = Result.FAIL;
					result.errorMessage = 'array length is different';
				}
			}
			else {
				throw 'value or expected are not Array instances';
			}
		},
		/**
		 * @private
		 * @description <p>test if two objects has same internal structure</p>
		 * <ul>
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} value object to be evaluated
		 * @param {object} expected value to expect
		 * @param {AssertionResult} result where to put results of the test
		 * @throws {string} if value or expected are not objects
		 */
		testDeepEqualObject: function(value, expected, result) {
			if (typeof value == 'object' && typeof expected == 'object') {
				//traverse key value pairs
				var ok = true;
				for (key in value) {
					if (expected[key]) {
						if (expected[key] != value[key]) {
							ok = false;
							result.errorMessage = 'different values for ' + key;
							break;
						}
					}
					else {
						ok = false;
						result.errorMessage = 'value has extra property ' + key;
						break;
					}
				
				}
				result.resultCode = (ok)? Result.PASS : Result.FAIL;
			}
			else {
				throw 'value or expected are not objects';
			}
		},
		/**
		 * @public
		 * @description <p>test if value == expected descending 
		 * 	in arrays and objects, fill an AssertionResult 
		 * 	properly, modify :</p>
		 * <ul>
		 * <li> AssertionResult.value
		 * <li>AssertionResult.expected
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} value object to be evaluated
		 * @param {object} expected value to expect
		 * @param {AssertionResult} result where to put results of the test
		 */
		testDeepEqual: function(value, expected, result) {
			assertion.testEqual(value, expected, result);
			if (result.resultCode == Result.FAIL) {
				if (value instanceof Array && expected instanceof Array) {
					assertion.testDeepEqualArray(value, expected, result)
				}
				else if (typeof value == 'object' && typeof expected == 'object') {
					assertion.testDeepEqualObject(value, expected, result);
				}
			}
		},
		/**
		 * @public
		 * @description <p>test if an exception match expected</p>
		 * <ul>
		 * <li> AssertionResult.value
		 * <li>AssertionResult.expected
		 * <li>AssertionResult.resultCode
		 * <li>AssertionResult.errorMessage
		 * </ul>
		 * @param {object} exception exception to be checked
		 * @param {object} expected value to expect
		 * @param {AssertionResult} result where to put results of the test
		 */
		testException: function(exception, expected, result) {
			result.value = stringRepr(exception);
			if (expected == null) {
				//expect any exception
				result.resultCode = Result.PASS;
			}
			else if (expected instanceof RegExp) {
				//match a regexp
				if (expected.test(exception.toString())) {
					result.resultCode = Result.PASS;
				}
				else {
					result.resultCode = Result.FAIL;
					result.errorMessage = 'exception does not match RegExp';
				}
			}
			else if (typeof expected == 'function') {
				//if expected is a constructor
				//check if exception is instance of custom exception type
				if (exception instanceof expected) {
					result.resultCode = Result.PASS;
				}
				else {
					result.resultCode = Result.FAIL;
					result.errorMessage = 'exception does not match ' +
						'given type';
				}
			}
			else if (expected == exception) {
				//match number and string exceptions
				result.resultCode = Result.PASS;
			}
			else {
				result.resultCode = Result.FAIL;
				result.errorMessage = 'exception does not match expected';
			}
		}
};

/* functions intended for public use
 * Assertions are globals so they can be used everywhere.
 * Note that if an assertion is called when no test is running it will throw an
 * 	exception for missing test context
*/
/**
 * @public
 * @description wraps exception handling for functions passed via this
 * 	object to assertions
 * @class Call
 * @param {Array} params parameters to pass to function
 * @param {function} callable function to call to obtain value
 */
function Call(callable, params) {
	/** function to be called
	 * @type {function}
	 */
	this.callable = callable;
	/** parameters to pass to callable
	 * @type {Array}
	 */
	this.params = params || [];
	/** value generated by executing callable
	 * @type {Object}
	 * @private
	 */
	this.generatedValue_ = null;
	/** error generated by executing callable
	 * @type {AssertionResult}
	 * @private
	 */
	this.generatedError_ = null;;
	/* call function
	 */
	this.exec();
}

/**
 * @public
 * @description execute function, fill result properly
 * @returns {boolean} true if a value is generated successfully,
 * 	false if an exception is raised
 */
Call.prototype.exec = function() {
	try {
		this.generatedValue_ = this.callable.apply(null, this.params);
		this.generatedError_ = null;
	}
	catch (ex) {
		this.generatedError_ = ex;
		this.generatedValue_ = null;
	}
};

/**
 * @public
 * @description get value generated by Call.exec()
 * @returns {object} value generated by exec or the exception object raised
 */
Call.prototype.getValue = function(){
	return this.generatedValue_;
};

/**
 * @public
 * @description get error generated by Call.exec()
 * @returns {AssertionResult} result object filled properly or null 
 * 	if value is correctly generated
 */
Call.prototype.getError = function(){
	return this.generatedError_;
};

/**
 * @description this assertion pass if value evaluates to True.
 * @param {Object} value the value to be tested or a Call object
 * @param {string} message assertion description
 * @example
 * //normal call
 * assertTrue(foo(bar), "baz");
 * //using Call object
 * assertTrue(new Call(foo, [bar]), "baz");
 */
function assertTrue(value, message) {
	var result = new AssertionResult();
	result.message = message || '';
	if (value instanceof Call) {
		if (value.getError() == null) {
			assertion.testBool(value.getValue(), true, result);
		}
		else {
			// specific case, fill result manually
			var err = value.getError();
			result.expected = 'true';
			result.value = stringRepr(err);
			result.errorMessage = 'exception raised';
			result.resultCode = Result.FAIL;
		}
	}
	else {
		assertion.testBool(value, true, result);
	}
	testManager.handleAssertion(result);
}

/**
 * @description this assertion pass if value evaluates to False
 * @param {Object} value the value to be tested or a Call object
 * @param {string} message
 * @example
 * //normal call
 * assertFalse(foo(bar), "baz");
 * //using Call object
 * assertFalse(new Call(foo, [bar]), "baz");
 */
function assertFalse(value, message) {
	var result = new AssertionResult();
	result.message = message || '';
	if (value instanceof Call) {
		if (value.getError() == null) {
			assertion.testBool(value.getValue(), false, result);
		}
		else {
			// specific case, fill result manually
			result.expected = 'false';
			result.value = value.getError();
			result.errorMessage = 'exception raised';
			result.resultCode = Result.FAIL;
		}
	}
	else {
		assertion.testBool(value, false, result);
	}
	testManager.handleAssertion(result);
}

/**
 * @description this assertion pass if value equals expected
 * @param {Object} value the value to be tested or a Call object
 * @param {Object} expected the value expected
 * @param {string} message
 * @example
 * //normal call
 * assertEqual(foo(bar), baz, "must be baz");
 * //using Call object
 * assertEqual(new Call(foo, [bar]), baz, "must be baz");
 */
function assertEqual(value, expected, message) {
	var result = new AssertionResult();
	result.message = message || '';
	if (value instanceof Call) {
		if (value.getError() == null) {
			assertion.testEqual(value.getValue(), expected, result);
		}
		else {
			// specific case, fill result manually
			result.expected = stringRepr(expected);
			result.value = value.getError();
			result.errorMessage = 'exception raised';
			result.resultCode = Result.FAIL;
		}
	}
	else {
		assertion.testEqual(value, expected, result);
	}
	testManager.handleAssertion(result);
}

/**
 * @description this assertion pass if value is strictly equal 
 * 	(===) to expected
 * @param {Object} value the value to be tested or a Call object
 * @param {Object} expected
 * @param {string} message
 * @example
 * //normal call
 * assertStrictEqual(foo(bar), baz, "must be baz");
 * //using Call object
 * assertStrictEqual(new Call(foo, [bar]), baz, "must be baz");
 */
function assertStrictEqual(value, expected, message) {
	var result = new AssertionResult();
	result.message = message || '';
	if (value instanceof Call) {
		if (value.getError() == null) {
			assertion.testStrictEqual(value.getValue(), expected, result);
		}
		else {
			// specific case, fill result manually
			result.expected = stringRepr(expected);
			result.value = value.getError();
			result.errorMessage = 'exception raised';
			result.resultCode = Result.FAIL;
		}
	}
	else {
		assertion.testStrictEqual(value, expected, result);
	}
	testManager.handleAssertion(result);
}



/**
 * @description this assertion pass if an exception is thrown by callable
 * @param {Call} call a Call object
 * @param {Object} expected
 * 	<ul> 
 * 	<li>null: accept any exception, 
 * 	<li>RegExp: test string exception, string or number
 * 	</ul>
 * @param {string} message
 */
function assertThrow(call , expected, message) {
	var result = new AssertionResult();
	result.expected = (expected != null)? stringRepr(expected) : 'exception';
	result.message = message || '';
	if (call instanceof Call) {
		if (call.getError() == null) {
			result.value = 'no exception';
			result.resultCode = Result.FAIL;
			result.errorMessage = 'no exception raised';
		}
		else {
			assertion.testException(call.getError(), expected, result);
		}
	}
	else {
		throw 'call must be an istance of Call';
	}
	testManager.handleAssertion(result);
}

/**
 * @description this assertion pass if value == expected and in case of Array or Object
 * 	if every element inside the Array and every key->value pair inside Object matches in both
 * 	position and value
 * @param {Object} value the value to be tested or a Call object
 * @param {Object} expected
 * @param {string} message
 */
function assertDeepEqual(value, expected, message){
	var result = new AssertionResult();
	result.message = message || '';
	if (value instanceof Call) {
		if (value.getError() == null) {
			assertion.testDeepEqual(value.getValue(), expected, result);
		}
		else {
			// specific case, fill result manually
			result.expected = stringRepr(expected);
			result.value = value.getError();
			result.errorMessage = 'exception raised';
			result.resultCode = Result.FAIL;
		}
	}
	else {
		assertion.testDeepEqual(value, expected, result);
	}
	testManager.handleAssertion(result);
}

/**
 * @description set properly the number of expected assertions
 * @param {number} expectedAssertNum
 */
function expect(expectedAssertNum) {
	testManager.handleExpect(expectedAssertNum);
}

/**
 * @description creates a Test and add it to testManager
 * @param {string} testName
 * @param {function} body
 */
function test(testName, body) {
	var testObject = new Test(testName, body);
	testManager.registerTest(testObject);
}

/*
 * add onload listener to document body to start tests 
 * 	as soon as everything is loaded
 */
window.onload = function() {
	testManager.execute();
}