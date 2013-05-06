/**
 * @fileOverview test content not suitable for production
 * @author qwattash
 */
unilib.provideNamespace('testAB', function() {
	testAB.foundA = testA.a;
	testAB.foundB = testB.b;
}, [['includeA.js', './'], ['includeB.js', './']]);
unilib.notifyLoaded();