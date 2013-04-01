<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html encoding='UTF-8'>
<head>
 <meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="../css/unittest.css"/>
<script type='text/JavaScript' src='../js/unilib/base.js'></script>
<script type="text/JavaScript" src="../js/unilib/unittest.js"></script>
<script type="text/JavaScript">
test('assertTrue [PASS]', function(){
	assertTrue(true, 'given true');
	assertTrue(1, 'given 1');
	assertTrue('1', 'given "1"');
	assertTrue(new Object(), 'given new Object()');
	assertTrue(function(){}, 'given function');
});
test('assertTrue [FAIL]', function(){
	assertTrue(false, 'given false');
	assertTrue(0, 'given 0');
	assertTrue('', 'given empty string');
	assertTrue(null, 'given null');
	assertTrue(undefined, 'given undefined');
	assertTrue(NaN, 'given NaN');
});
test('assertFalse [PASS]', function(){
	//these should succeed
	assertFalse(false, 'given false');
	assertFalse(0, 'given 0');
	assertFalse('', 'given empty string');
	assertFalse(null, 'given null');
	assertFalse(undefined, 'given undefined');
	assertFalse(NaN, 'given NaN');
});
test('assertFalse [FAIL]', function(){
	//these should fail
	assertFalse(true, 'given true');
	assertFalse(1, 'given 1');
	assertFalse('1', 'given "1"');
	assertFalse(new Object(), 'given new Object()');
	assertFalse(function(){}, 'given function');
});
test('assertEqual [PASS]', function(){
	assertEqual(true, true, 'given true');
	assertEqual(10, 10, 'given 10');
	assertEqual('a_string', 'a_string', 'given "a_string"');
	assertEqual(10, '10', 'given number and string 10');
	assertEqual('10', 10, 'given string and number 10');
	var obj = new Object();
	assertEqual(obj, obj, 'given same Object');
	var f = function(){};
	assertEqual(f, f, 'given same function');
	assertEqual(null, null, 'given null');
	assertEqual(undefined, undefined, 'given undefined');
	//this is a special case, NaN == NaN evaluate to false
	assertEqual(NaN, NaN, 'given NaN');
	//you wouldn't say it
	assertEqual(null, undefined, 'given null/undefined (shall pass)');
	
});
test('assetEqual [FAIL]', function() {
	//these should fail
	assertEqual(['1', '2'], ['1', '2'], 'given two arrays with same content'); 
	assertEqual(['1', 2], [1, '2'], 'given arrays with matching mixed string/number values');
	assertEqual({a:'a', b:'b'}, {a:'a', b:'b'}, 'given two Objects with same key->value');
	assertEqual({1:'a', 2:3}, {'1':'a', 2:'3'}, 'given Objects with matching mixed string/number key->values');
	assertEqual(true, false, 'given true/false');
	assertEqual('true', true, 'given "true"/true');
	assertEqual('a_string', 'b_string', 'given two != strings');
	assertEqual('20', 10, 'given string and number with != value');
	assertEqual(new Object(), new Object, 'given two random objects');
	assertEqual(function(){}, function(){}, 'given two random functions');
	assertEqual([1, 2], [2, 1], 'given arrays with != members');
	assertEqual([1, '2'], ['2', 1], 'given arrays with != string/number members');
	assertEqual({a:'c', b:'b'}, {b:'a', b:'b'}, 'given two Objects with != key->value');
	assertEqual({1:'a', 2:3}, {2:3, 1:'b'}, 'given Objects with != mixed string/number key->values');
	assertEqual(undefined, NaN, 'given undefined/NaN');
	assertEqual(NaN, null, 'given NaN/null');
});
test('assertStrictEqual [PASS]', function(){
	assertStrictEqual(true, true, 'given true');
	assertStrictEqual(10, 10, 'given 10');
	assertStrictEqual('a_string', 'a_string', 'given "a_string"');
	var obj = new Object();
	assertStrictEqual(obj, obj, 'given same Object');
	var f = function(){};
	assertStrictEqual(f, f, 'given same function');
	assertStrictEqual(null, null, 'given null');
	assertStrictEqual(undefined, undefined, 'given undefined');
	//this is a special case, NaN == NaN evaluate to false
	assertStrictEqual(NaN, NaN, 'given NaN');
});
test('assertStrictEqual [FAIL]', function() {
	//these should fail
	assertStrictEqual(['1', '2'], ['1', '2'], 'given two arrays with same content');
	assertStrictEqual({a:'a', b:'b'}, {a:'a', b:'b'}, 'given two Objects with same key->value');
	//this time this should fail
	assertStrictEqual(null, undefined, 'given null/undefined (shall fail)');
	assertStrictEqual(['1', 2], [1, '2'], 'given arrays with matching mixed string/number values');
	assertStrictEqual({1:'a', 2:3}, {'1':'a', 2:'3'}, 'given Objects with matching mixed string/number key->values');
	assertStrictEqual(10, '10', 'given number and string 10');
	assertStrictEqual('10', 10, 'given string and number 10');
	//these should fail as failing in assertEqual
	assertStrictEqual(true, false, 'given true/false');
	assertStrictEqual('true', true, 'given "true"/true');
	assertStrictEqual('a_string', 'b_string', 'given two != strings');
	assertStrictEqual('20', 10, 'given string and number with != value');
	assertStrictEqual(new Object(), new Object, 'given two random objects');
	assertStrictEqual(function(){}, function(){}, 'given two random functions');
	assertStrictEqual([1, 2], [2, 1], 'given arrays with != members');
	assertStrictEqual([1, '2'], ['2', 1], 'given arrays with != string/number members');
	assertStrictEqual({a:'c', b:'b'}, {b:'a', b:'b'}, 'given two Objects with != key->value');
	assertStrictEqual({1:'a', 2:3}, {2:3, 1:'b'}, 'given Objects with != mixed string/number key->values');
	assertStrictEqual(undefined, NaN, 'given undefined/NaN');
	assertStrictEqual(NaN, null, 'given NaN/null');
});
test('assertDeepEqual [PASS]', function(){
	assertDeepEqual(true, true, 'given true');
	assertDeepEqual(10, 10, 'given 10');
	assertDeepEqual('a_string', 'a_string', 'given "a_string"');
	var obj = new Object();
	assertDeepEqual(obj, obj, 'given same Object');
	var f = function(){};
	assertDeepEqual(f, f, 'given same function');
	assertDeepEqual(null, null, 'given null');
	assertDeepEqual(undefined, undefined, 'given undefined');
	assertDeepEqual(null, undefined, 'given null/undefined (shall fail)');
	assertDeepEqual(10, '10', 'given number and string 10');
	assertDeepEqual('10', 10, 'given string and number 10');
	//this is a special case, NaN == NaN evaluate to false
	assertDeepEqual(NaN, NaN, 'given NaN');
	//these should now pass
	assertDeepEqual(['1', '2'], ['1', '2'], 'given two arrays with same content');
	assertDeepEqual({a:'a', b:'b'}, {a:'a', b:'b'}, 'given two Objects with same key->value');
	assertDeepEqual(['1', 2], [1, '2'], 'given arrays with matching mixed string/number values');
	assertDeepEqual({1:'a', 2:3}, {'1':'a', 2:'3'}, 'given Objects with matching mixed string/number key->values');
	assertDeepEqual(new Object(), new Object, 'given two random objects');
});
test('assertDeepEqual [FAIL]', function() {
	//these should fail
	assertDeepEqual(true, false, 'given true/false');
	assertDeepEqual('true', true, 'given "true"/true');
	assertDeepEqual('a_string', 'b_string', 'given two != strings');
	assertDeepEqual('20', 10, 'given string and number with != value');
	assertDeepEqual(function(){}, function(){}, 'given two random functions');
	assertDeepEqual([1, 2], [2, 1], 'given arrays with != members');
	assertDeepEqual([1, '2'], ['2', 1], 'given arrays with != string/number members');
	assertDeepEqual({a:'c', b:'b'}, {b:'a', b:'b'}, 'given two Objects with != key->value');
	assertDeepEqual({1:'a', 2:3}, {2:3, 1:'b'}, 'given Objects with != mixed string/number key->values');
	assertDeepEqual(undefined, NaN, 'given undefined/NaN');
	assertDeepEqual(NaN, null, 'given NaN/null');
});
test('assertThrow [PASS]', function(){
	//these shall pass
	assertThrow(new Call(function() {
		throw 'string_exception';
	}), null, 'given string expect anything');
	assertThrow(new Call(function() {
		throw 10;
	}), null, 'given number expect anything');
	assertThrow(new Call(function() {
		throw new Object();
	}), null, 'given Object expect anything');
	assertThrow(new Call(function() {
		throw 'string_exception';
	}), 'string_exception', 'given string expected same');
	assertThrow(new Call(function() {
		throw 0;
	}), 0, 'given 0 expect 0');
	assertThrow(new Call(function() {
		throw 'regexpable_exception';
	}), new RegExp('_'), 'testing a passing regexp');
	assertThrow(new Call(function() {
		throw 10;
	}), '10', 'given 10 expected "10"');
	assertThrow(new Call(function() {
		throw new Object();
	}), Object, 'given 10 expected "10"');
	
});
test('assertThrow [FAIL]', function(){
	//these should fail
	assertThrow(new Call(function() {
		throw 10;
	}), 0, 'given 10 expected 0');
	assertThrow(new Call(function() {
		throw 'a_string';
	}), 'another_string', 'given string expected another_string');
	assertThrow(new Call(function() {
		throw 10;
	}), '2', 'given 10 expected "2"');
	assertThrow(new Call(function() {
		throw 'string_ex';
	}), 0, 'given string expected 0');
	assertThrow(new Call(function() {
		throw 10;
	}), 'a_string', 'given string expected 0');
	assertThrow(new Call(function() {
		throw 'regexpable_string';
	}), new RegExp('some_weird_pattern'), 'given unmatching regexp');
	assertThrow(new Call(function() {
		return;
	}), null, 'given no exception expected any');
	assertThrow(new Call(function() {
		return;
	}), 10, 'given no exception expected 10');
	assertThrow(new Call(function() {
		return;
	}), 'a_string', 'given no exception expected a_string');
	assertThrow(new Call(function() {
		return;
	}), new RegExp('some_weird_pattern'), 'given no exception expected RegExp');
	assertThrow(new Call(function() {
		return;
	}), Object, 'given no exception expected object constuctor');
	assertThrow(new Call(function() {
		throw new Object();
	}), new Object(), 'given random obj try to match with random obj');
});
test('auto folding test', function() {
	assertTrue(true, 'true, so test should fold');
});
test('test expect', function() {
	expect(2);
	assertTrue(true, 'assert number one, miss number two');
});
test('test expect #2', function() {
	expect(-1);
	assertTrue(true, 'assert number one, miss number two');
});
test('test Call [PASS]', function() {
	var call_1 = new Call(function(a_param){
		return a_param;
	}, [true]);
	var call_3 = new Call(function(a_param){
		return a_param;
	}, [1, 2, 3]);
	assertTrue(call_1, 'test main success scenario');
	assertTrue(call_3, 'test wrong number of args');
	assertFalse(new Call(function(){return false;}), 'assertFalse');
	assertEqual(new Call(function(){return "something";}), "something", 'assertEqual');
	assertStrictEqual(new Call(function(){return "something";}), "something", 'assertStrictEqual');
	assertDeepEqual(new Call(function(){return ["something"];}), ["something"], 'assertDeepEqual');
});
test('test Call [FAIL]', function() {
	var call_2 = new Call(function(){
			throw 'Not Yet Implemented (example)';
		});
	assertTrue(call_2, 'test main failure scenario');
	assertFalse(new Call(function(){return true;}), 'assertFalse');
	assertEqual(new Call(function(){return "something";}), "else", 'assertEqual');
	assertStrictEqual(new Call(function(){return "10";}), 10, 'assertStrictEqual');
	assertDeepEqual(new Call(function(){return ["something"];}), [10], 'assertDeepEqual');
});
</script>
</head>
<body>
<div id='unittest'></div>
</body>
</html>