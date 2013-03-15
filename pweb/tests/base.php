<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
	<title>base.js test</title>
	<link rel="stylesheet" href="../css/unittest.css"/>
	<script language="JavaScript" src="../js/unilib/base.js"></script>
	<script language="JavaScript" src="../js/unilib/unittest.js"></script>
	<script language="JavaScript">
	 /*
	  * here must use this workaround since tests are started after page has loaded
	  * but callbacks happens while page is loading
	  */
	 var ck1 = false, ck2 = false, ck3 = false;
	 function cbk1() {
	   ck1 = true;
	 }
	 function cbk2() {
	   ck2 = true;
	 }
	 function cbk3() {
	   //check that cbk2 has not been called yet
	   ck3 = (ck2)? false : true;
	 }
	 var grp = unilib.createIncludeGroup(cbk2);
	 grp.addScript('testinclude.js', './');
	 grp.addScript('testinclude2.js', './');
	 grp.include();
   test('base test', function() {
	    unilib.provideNamespace('foo');
	    assertTrue(foo, 'foo namespace created');
	    unilib.provideNamespace('foo.bar');
	    assertTrue(foo.bar, 'nested namespace cration');
	    foo.baz = 'baz';
	    unilib.provideNamespace('foo');
	    assertEqual(foo.baz, 'baz', 'no code override test');
	    assertTrue(importedStuff, 'include ok');
	    assertThrow(new Call(unilib.include, 
	      ['testinclude.js', '../js/']), Error, 'include in document complete');
	    assertFalse(unilib.loadCallbacks_['../js/testinclude.js'], 'used callback removed correctly from callback map');
	    assertTrue(ck2, 'script group callback invoked');
	  });
	</script>
</head>
<body>
  <div id="unittest"></div>
</body>
</html>