/**
 * @author qwattash (Alfredo Mazzinghi)
 */

unilib.include('unilib/mvc/boolean_circuit_graph/boolean_circuit_controller.js');

/*
 * global var holding the controller
 */
var ctrl;

var __init__ = function() {
  var container = document.getElementById('container');
  //create the controller
  ctrl = new unilib.mvc.bc.controller.BooleanCircuitController(container, 
    "loader.php", CURRENT_PROJECT_ID, true);
  //create style provider, the style provider is used to set the style of
  //the item rendered in the canvas
  var styleProvider = ctrl.styleProvider;
  //create style for labels' text
  var textStyle = new unilib.graphics.StyleInformations();
  textStyle.textSize = 10;
  //create style for the menu text
  var mTextStyle = new unilib.graphics.StyleInformations();
  mTextStyle.textSize = 10;
  mTextStyle.textColor = '#FFFFFF';
  mTextStyle.backgroundColor = '#3B5998';
  //create style for the menu
  var menuStyle = new unilib.graphics.StyleInformations();
  menuStyle.lineWidth = 1;
  menuStyle.backgroundColor = '#3B5998';
  //create style for each node
  //NOT
  var notNodeStyle = new unilib.graphics.StyleInformations();
  notNodeStyle.backgroundColor = '#FFFFFF';
  notNodeStyle.backgroundImage = 'url("../resources/not.png")';
  var notNodeFocusStyle = new unilib.graphics.StyleInformations();
  notNodeFocusStyle.backgroundColor = '#FFFFFF';
  notNodeStyle.backgroundImage = 'url("../resources/not.png")';
  //AND
  var andNodeStyle = new unilib.graphics.StyleInformations();
  andNodeStyle.backgroundColor = '#FFFFFF';
  andNodeStyle.backgroundImage = 'url("../resources/and.png")';
  var andNodeFocusStyle = new unilib.graphics.StyleInformations();
  andNodeFocusStyle.backgroundColor = '#FFFFFF';
  andNodeStyle.backgroundImage = 'url("../resources/and.png")';
  //OR
  var orNodeStyle = new unilib.graphics.StyleInformations();
  orNodeStyle.backgroundColor = '#FFFFFF';
  orNodeStyle.backgroundImage = 'url("../resources/or.png")';
  var orNodeFocusStyle = new unilib.graphics.StyleInformations();
  orNodeFocusStyle.backgroundColor = '#FFFFFF';
  orNodeStyle.backgroundImage = 'url("../resources/or.png")';
  //NOR
  var norNodeStyle = new unilib.graphics.StyleInformations();
  norNodeStyle.backgroundColor = '#FFFFFF';
  norNodeStyle.backgroundImage = 'url("../resources/nor.png")';
  var norNodeFocusStyle = new unilib.graphics.StyleInformations();
  norNodeFocusStyle.backgroundColor = '#FFFFFF';
  norNodeStyle.backgroundImage = 'url("../resources/nor.png")';
  //NAND
  var nandNodeStyle = new unilib.graphics.StyleInformations();
  nandNodeStyle.backgroundColor = '#FFFFFF';
  nandNodeStyle.backgroundImage = 'url("../resources/nand.png")';
  var nandNodeFocusStyle = new unilib.graphics.StyleInformations();
  nandNodeFocusStyle.backgroundColor = '#FFFFFF';
  nandNodeStyle.backgroundImage = 'url("../resources/nand.png")';
  //XOR
  var xorNodeStyle = new unilib.graphics.StyleInformations();
  xorNodeStyle.backgroundColor = '#FFFFFF';
  xorNodeStyle.backgroundImage = 'url("../resources/xor.png")';
  var xorNodeFocusStyle = new unilib.graphics.StyleInformations();
  xorNodeFocusStyle.backgroundColor = '#FFFFFF';
  xorNodeStyle.backgroundImage = 'url("../resources/xor.png")';
  //XNOR
  var xnorNodeStyle = new unilib.graphics.StyleInformations();
  xnorNodeStyle.backgroundColor = '#FFFFFF';
  xnorNodeStyle.backgroundImage = 'url("../resources/xnor.png")';
  var xnorNodeFocusStyle = new unilib.graphics.StyleInformations();
  xnorNodeFocusStyle.backgroundColor = '#FFFFFF';
  xnorNodeStyle.backgroundImage = 'url("../resources/xnor.png")';
  //INPUT
  var inNodeStyle = new unilib.graphics.StyleInformations();
  inNodeStyle.backgroundColor = '#FFFFFF';
  inNodeStyle.backgroundImage = 'url("../resources/in.png")';
  var inNodeFocusStyle = new unilib.graphics.StyleInformations();
  inNodeFocusStyle.backgroundColor = '#FFFFFF';
  inNodeStyle.backgroundImage = 'url("../resources/in.png")';
  //OUTPUT
  var outNodeStyle = new unilib.graphics.StyleInformations();
  outNodeStyle.backgroundColor = '#FFFFFF';
  outNodeStyle.backgroundImage = 'url("../resources/out.png")';
  var outNodeFocusStyle = new unilib.graphics.StyleInformations();
  outNodeFocusStyle.backgroundColor = '#FFFFFF';
  outNodeStyle.backgroundImage = 'url("../resources/out.png")';
  //create style for the pin
  //INPUT PIN
  var inPinStyle = new unilib.graphics.StyleInformations();
  inPinStyle.backgroundColor = '#228022';
  var inPinFocusStyle = new unilib.graphics.StyleInformations();
  inPinFocusStyle.backgroundColor = '#22A022';
  //OUTPUT PIN
  var outPinStyle = new unilib.graphics.StyleInformations();
  outPinStyle.backgroundColor = '#9F2F28';
  var outPinFocusStyle = new unilib.graphics.StyleInformations();
  outPinFocusStyle.backgroundColor = '#AF4F48';
  //create style for the edges
  var edgeStyle = new unilib.graphics.StyleInformations();
  edgeStyle.lineColor = '#222222';
  edgeStyle.lineWidth = 5;
  var edgeFocusStyle = new unilib.graphics.StyleInformations();
  edgeFocusStyle.lineColor = '#555555';
  edgeFocusStyle.lineWidth = 5;
  //register styles
  //NOT
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOT_NODE, unilib.mvc.bc.StyleType.BODY, notNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOT_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOT_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, notNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOT_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //AND
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.AND_NODE, unilib.mvc.bc.StyleType.BODY, andNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.AND_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.AND_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, andNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.AND_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //OR
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OR_NODE, unilib.mvc.bc.StyleType.BODY, orNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OR_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OR_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, orNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OR_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //NOR
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOR_NODE, unilib.mvc.bc.StyleType.BODY, norNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOR_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOR_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, norNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NOR_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //NAND
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NAND_NODE, unilib.mvc.bc.StyleType.BODY, nandNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NAND_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NAND_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, nandNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.NAND_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //XOR
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XOR_NODE, unilib.mvc.bc.StyleType.BODY, xorNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XOR_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XOR_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, xorNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XOR_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //XNOR
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XNOR_NODE, unilib.mvc.bc.StyleType.BODY, xnorNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XNOR_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XNOR_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, xnorNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.XNOR_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //IN
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_NODE, unilib.mvc.bc.StyleType.BODY, inNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, inNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //OUT
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_NODE, unilib.mvc.bc.StyleType.BODY, outNodeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_NODE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_NODE, unilib.mvc.bc.StyleType.BODY_FOCUS, outNodeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_NODE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  
  //IN PIN
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_PIN, unilib.mvc.bc.StyleType.BODY, inPinStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_PIN, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_PIN, unilib.mvc.bc.StyleType.BODY_FOCUS, inPinFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.INPUT_PIN, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //OUT PIN
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_PIN, unilib.mvc.bc.StyleType.BODY, outPinStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_PIN, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_PIN, unilib.mvc.bc.StyleType.BODY_FOCUS, outPinFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.OUTPUT_PIN, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //EDGE
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.EDGE, unilib.mvc.bc.StyleType.BODY, edgeStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.EDGE, unilib.mvc.bc.StyleType.TEXT, textStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.EDGE, unilib.mvc.bc.StyleType.BODY_FOCUS, edgeFocusStyle);
  styleProvider.registerStyle(unilib.mvc.bc.GraphElementType.EDGE, unilib.mvc.bc.StyleType.TEXT_FOCUS, textStyle);
  //MENU
  styleProvider.registerStyle(unilib.mvc.menu.MenuType.MENU, unilib.mvc.bc.StyleType.BODY, menuStyle);
  styleProvider.registerStyle(unilib.mvc.menu.MenuType.MENU, unilib.mvc.bc.StyleType.TEXT, mTextStyle);
};

unilib.dependencyManager.addEventListener('load', __init__);

/*
 * save callback from the menu
 */
function save() {
  ctrl.loader.save(ctrl.graphModel);
}

/*
 * logout callback from menu
 */
function logout() {
  var lastSeparator = location.href.lastIndexOf("/");
  var base = location.href.substr(0, lastSeparator);
  location.href = base + "/logout.php";
}
