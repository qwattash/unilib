<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="../../css/unittest.css"/>
<script type="text/JavaScript" src="../../js/unilib/base.php"></script>
<script type="text/JavaScript" src="../../js/unilib/unittest.js"></script>
<script type="text/JavaScript">
unilib.include('unilib/interface/observer.js');
test('observable basics', function(){
	//expect(5);
	var observer1 = new unilib.interfaces.observer.Observer();
	function update(event) {
		assertTrue(event, 'notify() dispatched');
		assertEqual(event.eventType, unilib.interfaces.observer.ObserverEventType.UNKNOWN, 'default eventType ok');
		assertDeepEqual(event.source, [], 'default source ok');
	};
	observer1.update = update;
	var observable = new unilib.interfaces.observer.Observable();
	observable.attachObserver(observer1);
	//must access a protected var to check
	assertEqual(observable.observers_.length, 1, 'observer registered');
	observable.notify();
	observable.detachObserver(observer1);
	assertEqual(observable.observers_.length, 0, 'observer deregistered');
});
test('observable error scenarios', function() {
	var observer = new unilib.interfaces.observer.Observer();
	var observable = new unilib.interfaces.observer.Observable();
	//assertThrow(new Call(observable.detachObserver, [observer]),
	//	ObserverNotFoundException, 'detaching unexisting observer');
	assertThrow(new Call(observable, observable.detachObserver, [null]),
		unilib.interfaces.observer.InvalidObserverError, 'detaching null');
	assertThrow(new Call(observable, observable.attachObserver, [null]),
		unilib.error.UnilibError, 'attaching null');
});
</script>
</head>
<body>
<div id='unittest'></div>
</body>
</html>