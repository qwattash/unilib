/**
 * @fileOverview test content not suitable for production
 * @author qwattash
 */
unilib.notifyStart("includeB.js", ".");

unilib.provideNamespace('testB', function() {
	//require testA to simulate possibly breaking code
	testB.b = (testA) ? testA.a : 'B: testA not found';
}, [['includeA.js', './']]);

unilib.notifyLoaded();