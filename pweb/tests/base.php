<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
	<title>base.js test</title>
	<link rel="stylesheet" href="../css/unittest.css"/>
	<script language="JavaScript" src="../js/unilib/base.js"></script>
	<script language="JavaScript" src="../js/unilib/unittest.js"></script>
	<script language="JavaScript">
	 //prepare to test
	 unilib.include('testinclude.js', '../js/');
   test('base test', function() {
	    unilib.provideNamespace('foo');
	    assertTrue(foo, 'foo namespace created');
	    unilib.provideNamespace('foo.bar');
	    assertTrue(foo.bar, 'nested namespace cration');
	    foo.baz = 'baz';
	    unilib.provideNamespace('foo');
	    assertEqual(foo.baz, 'baz', 'no code override test');
	    assertTrue(importedStuff, 'include ok');
	  });
	</script>
</head>
<body>
  <div id="unittest"></div>
</body>
</html>