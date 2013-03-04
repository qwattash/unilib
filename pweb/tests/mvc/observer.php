<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html encoding='UTF-8'>
<head>
<link rel="stylesheet" type="text/css" href="../css/unittest.css"/>
<script language="JavaScript" src="../../js/unittest.js"></script>
<script language="JavaScript" src="../../js/mvc/observer.js"></script>
<script language="JavaScript" src="../../js/mvc/error.js"></script>
<script language="JavaScript">
test('observable basics', function(){
	expect(3);
	var observer1 = new Observer();
	function update(event) {
		assertTrue(event, 'notify() dispatched');
	};
	observer1.update = update;
	var observable = new Observable();
	observable.attachObserver(observer1);
	//must access a protected var to check
	assertEqual(observable.observers.length, 1, 'observer registered');
	observable.detachObserver(observer1);
	assertEqual(observable.observers.length, 0, 'observer deregistered');
	observable.notify("event");
});
test('observable error scenarios', function() {
	var observer = new Observer();
	var observable = new Observable();
	assertThrow(new Call(observable.detachObserver, [observer]),
		ObserverNotFoundException, 'detaching unexisting observer');
	assertThrow(new Call(observable.detachObserver, [null]),
		InvalidObserverException, 'detaching null');
	assertThrow(new Call(observable.attachObserver, [null]),
		InvalidObserverException, 'attaching null');
});
</script>
</head>
<body>
<div id='unittest'></div>
</body>
</html>