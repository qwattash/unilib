/**
 * @author qwattash (Alfredo Mazzinghi)
 */

unilib.include("unilib/UI/popup.js");
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
  var nodeBG = '#DDDDDD';
  var nodeFocusBG = '#AAAAAA';
  var nodeBorderWidth = 1;
  var nodeFocusBorderWidth = 1;
  var nodeBorderCol = '#000000';
  var nodeFocusBorderCol = '#3B5998';
  //NOT
  var notNodeStyle = new unilib.graphics.StyleInformations();
  notNodeStyle.lineWidth = nodeBorderWidth;
  notNodeStyle.lineColor = nodeBorderCol;
  notNodeStyle.backgroundColor = nodeBG;
  notNodeStyle.backgroundImage = 'url("../resources/not_65x50.png")';
  var notNodeFocusStyle = new unilib.graphics.StyleInformations();
  notNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  notNodeFocusStyle.lineColor = nodeFocusBorderCol;
  notNodeFocusStyle.backgroundColor = nodeFocusBG;
  notNodeFocusStyle.backgroundImage = 'url("../resources/not_65x50.png")';
  //AND
  var andNodeStyle = new unilib.graphics.StyleInformations();
  andNodeStyle.lineWidth = nodeBorderWidth;
  andNodeStyle.lineColor = nodeBorderCol;
  andNodeStyle.backgroundColor = nodeBG;
  andNodeStyle.backgroundImage = 'url("../resources/and_65x50.png")';
  var andNodeFocusStyle = new unilib.graphics.StyleInformations();
  andNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  andNodeFocusStyle.lineColor = nodeFocusBorderCol;
  andNodeFocusStyle.backgroundColor = nodeFocusBG;
  andNodeFocusStyle.backgroundImage = 'url("../resources/and_65x50.png")';
  //OR
  var orNodeStyle = new unilib.graphics.StyleInformations();
  orNodeStyle.lineWidth = nodeBorderWidth;
  orNodeStyle.lineColor = nodeBorderCol;
  orNodeStyle.backgroundColor = nodeBG;
  orNodeStyle.backgroundImage = 'url("../resources/or_65x50.png")';
  var orNodeFocusStyle = new unilib.graphics.StyleInformations();
  orNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  orNodeFocusStyle.lineColor = nodeFocusBorderCol;
  orNodeFocusStyle.backgroundColor = nodeFocusBG;
  orNodeFocusStyle.backgroundImage = 'url("../resources/or_65x50.png")';
  //NOR
  var norNodeStyle = new unilib.graphics.StyleInformations();
  norNodeStyle.lineWidth = nodeBorderWidth;
  norNodeStyle.lineColor = nodeBorderCol;
  norNodeStyle.backgroundColor = nodeBG;
  norNodeStyle.backgroundImage = 'url("../resources/nor_65x50.png")';
  var norNodeFocusStyle = new unilib.graphics.StyleInformations();
  norNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  norNodeFocusStyle.lineColor = nodeFocusBorderCol;
  norNodeFocusStyle.backgroundColor = nodeFocusBG;
  norNodeFocusStyle.backgroundImage = 'url("../resources/nor_65x50.png")';
  //NAND
  var nandNodeStyle = new unilib.graphics.StyleInformations();
  nandNodeStyle.lineWidth = nodeBorderWidth;
  nandNodeStyle.lineColor = nodeBorderCol;
  nandNodeStyle.backgroundColor = nodeBG;
  nandNodeStyle.backgroundImage = 'url("../resources/nand_65x50.png")';
  var nandNodeFocusStyle = new unilib.graphics.StyleInformations();
  nandNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  nandNodeFocusStyle.lineColor = nodeFocusBorderCol;
  nandNodeFocusStyle.backgroundColor = nodeFocusBG;
  nandNodeFocusStyle.backgroundImage = 'url("../resources/nand_65x50.png")';
  //XOR
  var xorNodeStyle = new unilib.graphics.StyleInformations();
  xorNodeStyle.lineWidth = nodeBorderWidth;
  xorNodeStyle.lineColor = nodeBorderCol;
  xorNodeStyle.backgroundColor = nodeBG;
  xorNodeStyle.backgroundImage = 'url("../resources/xor_65x50.png")';
  var xorNodeFocusStyle = new unilib.graphics.StyleInformations();
  xorNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  xorNodeFocusStyle.lineColor = nodeFocusBorderCol;
  xorNodeFocusStyle.backgroundColor = nodeFocusBG;
  xorNodeFocusStyle.backgroundImage = 'url("../resources/xor_65x50.png")';
  //XNOR
  var xnorNodeStyle = new unilib.graphics.StyleInformations();
  xnorNodeStyle.lineWidth = nodeBorderWidth;
  xnorNodeStyle.lineColor = nodeBorderCol;
  xnorNodeStyle.backgroundColor = nodeBG;
  xnorNodeStyle.backgroundImage = 'url("../resources/xnor_65x50.png")';
  var xnorNodeFocusStyle = new unilib.graphics.StyleInformations();
  xnorNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  xnorNodeFocusStyle.lineColor = nodeFocusBorderCol;
  xnorNodeFocusStyle.backgroundColor = nodeFocusBG;
  xnorNodeFocusStyle.backgroundImage = 'url("../resources/xnor_65x50.png")';
  //INPUT
  var inNodeStyle = new unilib.graphics.StyleInformations();
  inNodeStyle.lineWidth = nodeBorderWidth;
  inNodeStyle.lineColor = nodeBorderCol;
  inNodeStyle.backgroundColor = nodeBG;
  inNodeStyle.backgroundImage = 'url("../resources/in_65x50.png")';
  var inNodeFocusStyle = new unilib.graphics.StyleInformations();
  inNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  inNodeFocusStyle.lineColor = nodeFocusBorderCol;
  inNodeFocusStyle.backgroundColor = nodeFocusBG;
  inNodeFocusStyle.backgroundImage = 'url("../resources/in_65x50.png")';
  //OUTPUT
  var outNodeStyle = new unilib.graphics.StyleInformations();
  outNodeStyle.lineWidth = nodeBorderWidth;
  outNodeStyle.lineColor = nodeBorderCol;
  outNodeStyle.backgroundColor = nodeBG;
  outNodeStyle.backgroundImage = 'url("../resources/out_65x50.png")';
  var outNodeFocusStyle = new unilib.graphics.StyleInformations();
  outNodeFocusStyle.lineWidth = nodeFocusBorderWidth;
  outNodeFocusStyle.lineColor = nodeFocusBorderCol;
  outNodeFocusStyle.backgroundColor = nodeFocusBG;
  outNodeFocusStyle.backgroundImage = 'url("../resources/out_65x50.png")';
  //create style for the pin
  //INPUT PIN
  var inPinStyle = new unilib.graphics.StyleInformations();
  inPinStyle.backgroundColor = '#228022';
  var inPinFocusStyle = new unilib.graphics.StyleInformations();
  inPinFocusStyle.backgroundColor = '#112011';
  //OUTPUT PIN
  var outPinStyle = new unilib.graphics.StyleInformations();
  outPinStyle.backgroundColor = '#9F2F28';
  var outPinFocusStyle = new unilib.graphics.StyleInformations();
  outPinFocusStyle.backgroundColor = '#3F1010';//'#AF4F48';
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
  
  //popup creation handling
  var popupContainer = document.getElementById("help_popup");
  var popup = new unilib.ui.Popup(popupContainer, "in_button");
  popup.bind("click", document.getElementById("menu_help"));
  
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

/*
 * help popup callbak
 */
function openHelp() {
  
}