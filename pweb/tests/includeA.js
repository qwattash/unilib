/**
 * @fileOverview test content not suitable for production
 * @author qwattash
 */
unilib.notifyStart("includeA.js", ".");

unilib.provideNamespace('testA', function() {
	testA.a = 'A foo';
});

unilib.notifyLoaded();