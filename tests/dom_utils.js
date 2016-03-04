/*global ActiveXObject, DOMParser, XMLSerializer, XPathResult, window, document, is_ignorable*/

var ELEMENT_NODE = 1,
ATTRIBUTE_NODE = 2,
TEXT_NODE = 3,
CDATA_SECTION_NODE = 4,
ENTITY_REFERENCE_NODE = 5,
ENTITY_NODE = 6,
PROCESSING_INSTRUCTION_NODE = 7,
COMMENT_NODE = 8,
DOCUMENT_NODE = 9,
DOCUMENT_TYPE_NODE = 10,
DOCUMENT_FRAGMENT_NODE = 11,
NOTATION_NODE = 12;

function cloneArray(array) {
	var clone = [];
        var i = array.length;
        while (i--) {
		clone[i] = array[i];
	}
	return clone;
}

/*
 applies a xpath expression from the domNode.
 The xpath expression must begin by "."
 example : .//textarea|.//select
 */

function applyXpath(domNode,xpath) {
    var inputs = [];
    // code for IE
    if (window.ActiveXObject) {
        domNode.ownerDocument.setProperty("SelectionLanguage","XPath");
        inputs = domNode.selectNodes(xpath);
    }
    // code for Mozilla, Firefox, Opera, etc.
    else if (document.implementation && document.implementation.createDocument) {
        var nodes = document.evaluate(xpath, domNode, null, XPathResult.ANY_TYPE,null);
        var result = nodes.iterateNext();
        while (result) {
            inputs.push(result);
            result = nodes.iterateNext();
        }
    }
    return inputs;
}

/*
 get the first ancestor with that tag name and that class name
 */
function getFirstAncestorByTagAndClass(domNode,tagName,className) {
    var ancestor = domNode.parentNode;
    while (ancestor) {
        if ((ancestor.tagName) && (ancestor.tagName.toLowerCase() === tagName) &&
            (ancestor.className) && (ancestor.className.toLowerCase() === className)) {
            return ancestor;
        }
        ancestor = ancestor.parentNode;
    }
    return null;
}

/*
 sets the selection of that <select> to 'selectionName'
 returns true when the selection has been made, false otherwise
 */
function setSelected(select,optionName) {
    var optionTags = select.getElementsByTagName('option');
    for (var i=0 ; i<optionTags.length ; i++) {
        if (optionTags[i].getAttribute("value") === optionName) {
            select.selectedIndex = i;
            return true;
        }
    }
    return false;
}

/*
 function in order to retrieve easily the text of the selected option in
 the <select> whose id is selectElementId
 */
function getSelected(selectId) {
    var select = document.getElementById(selectId);
    return select.options[select.selectedIndex].value;
}

/*
 returns true if that domNode is actually displayed in the web page
 checks that all the <div> ancestors of that node are also displayed.
 */
function isDisplayed(domNode) {
    if (domNode.style && domNode.style.display && domNode.style.display === 'none') {
        return false;
    }
    //checks that all the <div> ancestors of this node are really displayed
    var ancestor = domNode.parentNode;
    while (ancestor) {
        if ((ancestor.tagName) && (ancestor.tagName.toLowerCase() === 'div') &&
            (ancestor.style) && (ancestor.style.display) && 
            (ancestor.style.display === 'none')) {
            return false;
        }
        ancestor = ancestor.parentNode;
    }
    return true;
}

/*
 retrieves the DOM elements under oElm with tag name 'strTagName', attribute name
 'strTagName', and the value of that attribute is 'strAttributeValue'
  Copyright Robert Nyman, http://www.robertnyman.com
  Free to use if this text is included
 */
function getElementsByAttribute(oElm, strTagName, strAttributeName, strAttributeValue) {
    var arrElements = (strTagName === "*" && document.all)? document.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = [];
    //MODIFIED to be visible (and understandable)
    //var oAttributeValue = (typeof strAttributeValue !== "undefined")? new RegExp("(^|\\s)" + strAttributeValue + "(\\s|$)") : null;
    var oAttributeValue = null;
    if (typeof strAttributeValue !== "undefined") {
        oAttributeValue = new RegExp("^" + strAttributeValue + "$");
    }
    var oCurrent;
    var oAttribute;
    for(var i=0; i<arrElements.length; i++) {
        oCurrent = arrElements[i];
        oAttribute = oCurrent.getAttribute(strAttributeName);
        if (typeof oAttribute === "string" && oAttribute.length > 0) {
            if (typeof strAttributeValue === "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))){
                arrReturnElements.push(oCurrent);
            }
        }
    }
    return arrReturnElements;
}

function getElementByTagClassRefs(parentNode, tagName, classValue, refsValue) {
	var elems = parentNode.getElementsByTagName(tagName);
	for (var i in elems) {
		var elem = elems[i];
		if (elem.getAttribute && elem.getAttribute("class") === classValue && elem.getAttribute("refs") === refsValue) {
			return elem;
		}
	}
    return null;
}

/*
 comes from http://www.w3schools.com/dom/tryit.asp?filename=note_parsertest2
 */
function createDocumentFromText(text) {
    var doc;
    // code for IE
    if (window.ActiveXObject) {
        doc=new ActiveXObject("Microsoft.XMLDOM");
        doc.async="false";
        doc.loadXML(text);
    }
    // code for Mozilla, Firefox, Opera, etc.
    else if (window.DOMParser) {
        var parser=new DOMParser();
        doc=parser.parseFromString(text,"text/xml");
    }
    else {
        throw 'Your browser does not support the parsing needed to perform this function.';
    }
    return doc;
}

function createDocument() {
    var doc;
    // code for IE
    if (window.ActiveXObject) {
        doc=new ActiveXObject("Microsoft.XMLDOM");
        doc.async="false";
    }
    // code for Mozilla, Firefox
    else {
        doc = document.implementation.createDocument(null, "", null);
    }
    return doc;
}

function textContent(node) {
    //code for Firefox
    if (node.textContent) {
        return node.textContent;
    }
    var result = "";
    for (var i = 0; i < node.childNodes.length; i++) {
        switch (node.childNodes[i].nodeType) {
            case 1:
            case 5:
                result += textContent(node.childNodes[i]);
                break;
            case 2:
            case 3:
            case 4:
                result += node.childNodes[i].nodeValue;
                break;
            default:
                break;
        }
    }
    return result;
}

function getPreviousSiblingElement(node, tagName) {
    node = node.previousSibling;
    while (node && node.nodeType !== ELEMENT_NODE) {
        node = node.previousSibling;
    }
    if (node && tagName && tagName.toLowerCase() !== node.tagName.toLowerCase()) {
        return getPreviousSiblingElement(node, tagName);
    }
    return node;
}

function getNextSiblingElement(node, tagName) {
    node = node.nextSibling;
    while (node && node.nodeType !== ELEMENT_NODE) {
        node = node.nextSibling;
    }
    if (node && tagName && tagName.toLowerCase() !== node.tagName.toLowerCase()) {
        return getNextSiblingElement(node, tagName);
    }
    return node;
}

function getNextSiblingElementRefs(node, tagName, refsValue) {
	node = getNextSiblingElement(node, tagName);
	while (node) {
		if (node.getAttribute("refs") === refsValue) {
			return node;
		}
		node = getNextSiblingElement(node, tagName);
	}
    return null;
}

function getFirstChildElement(parentNode, tagName) {
    var node = parentNode.firstChild;
    while (node && node.nodeType !== ELEMENT_NODE) {
        node = node.nextSibling;
    }
    if (tagName && node && node.tagName && node.tagName.toLowerCase() !== tagName.toLowerCase()) {
        node = getNextSiblingElement(node, tagName);
    }
    return node;
}

function removeChildren(node) {
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
}

function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
}

function insertAfter(node, ref) {
    var pn = ref.parentNode;
    if (ref === pn.lastChild) {
        pn.appendChild(node);
    } else {
        pn.insertBefore(node,ref.nextSibling);
    }
}

function innerXML(node) {
    if (node.innerXML) {
        return node.innerXML;
    } else {
        if (node.xml) {
            return node.xml;
        } else {
            if (typeof window.XMLSerializer !== "undefined") {
                var serializer = new XMLSerializer();
                return serializer.serializeToString(node);
            }
            else {
                throw 'XML serialization is apparently not supported by your browser.';
            }
        }
    }
}

function removePrefix(nodeName) {
    if (nodeName.match(":")) {
        return nodeName.split(":")[1];
    }
    return nodeName;
}

function getDefaultNamespace(namespaces) {
    //default namespace can have been defined as prefix ""
    if (namespaces[""]) {
        return namespaces[""];
    }
    //returning null namespace
    return null;
}

function getNamespaceURI(prefix,namespaces) {
    if (namespaces[prefix]) {
        return namespaces[prefix];
    }
	if (prefix === 'xml') {
        return 'http://www.w3.org/XML/1998/namespace';
    }
	if (prefix === 'xmlns') {
		return 'http://www.w3.org/2000/xmlns/';
	}
    return getDefaultNamespace(namespaces);
}

function getNamespaceURIFromNodeName(nodeName,namespaces) {
    if (nodeName.match(":")) {
        return getNamespaceURI(nodeName.split(":")[0],namespaces);
    }
    return getDefaultNamespace(namespaces); 
}

function getFirstChildTextNode(domNode) {
    var result = domNode.firstChild;
    while (result) {
        //keeps text node which are not white spaces
        if (result.nodeType === TEXT_NODE && !is_ignorable(result)) {
            return result;
        }
        result = result.nextSibling;
    }
    return null;
}
