/**
 * @fileOverview test content not suitable for production.
 * 	code depends on unilib/base.js
 * @author qwattash
 */
unilib.notifyStart("./testinclude_cascade.js");

unilib.provideNamespace('baz', function() {
	baz.loadTime = new Date();
}, [['testinclude.js', './']]);
unilib.notifyLoaded();
/*
 * note that base is relative to testinclude_cascade.html
 * in library files should rely on unilib.config.jsBase
 */