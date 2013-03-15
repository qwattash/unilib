<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html encoding='UTF-8'>
<head>
<link rel="stylesheet" type="text/css" href="../../css/unittest.css"/>
<script language="JavaScript" src="../../js/unilib/base.js"></script>
<script language="JavaScript" src="../../js/unilib/unittest.js"></script>
<script language="JavaScript" src="../../js/unilib/mvc/observer.js"></script>
<script language="JavaScript">
test('observable basics', function(){
	//expect(5);
	var observer1 = new unilib.mvc.Observer();
	function update(event) {
		assertTrue(event, 'notify() dispatched');
		assertEqual(event.eventType, unilib.mvc.ObserverEventType.UNKNOWN, 'default eventType ok');
		assertEqual(event.source, null, 'default source ok');
	};
	observer1.update = update;
	var observable = new unilib.mvc.Observable();
	observable.attachObserver(observer1);
	//must access a protected var to check
	assertEqual(observable.observers_.length, 1, 'observer registered');
	observable.notify();
	observable.detachObserver(observer1);
	assertEqual(observable.observers_.length, 0, 'observer deregistered');
});
test('observable error scenarios', function() {
	var observer = new unilib.mvc.Observer();
	var observable = new unilib.mvc.Observable();
	//assertThrow(new Call(observable.detachObserver, [observer]),
	//	ObserverNotFoundException, 'detaching unexisting observer');
	assertThrow(new Call(observable.detachObserver, [null]),
		unilib.mvc.InvalidObserverError, 'detaching null');
	assertThrow(new Call(observable.attachObserver, [null]),
		unilib.mvc.InvalidObserverError, 'attaching null');
});
</script>
</head>
<body>
<div id='unittest'></div>
</body>
</html>