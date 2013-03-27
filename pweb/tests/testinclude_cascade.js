/**
 * @fileOverview test content not suitable for production.
 * 	code depends on unilib/base.js
 * @author qwattash
 */

unilib.provideNamespace('baz', function() {
	baz.loadTime = true;
}, [['testinclude.js', './']]); 
/*
 * note that base is relative to testinclude_cascade.html
 * in library files should rely on unilib.config.jsBase
 */