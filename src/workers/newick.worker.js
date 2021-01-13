import { tree } from 'd3';
import _ from 'lodash';

// worker written in vanilla javascript 
export function process(newickFile) {
    var trees = getTreesFromString(newickFile);
    var firstTree = trees[0];
    firstTree.sortNodes();
    firstTree.leafCount = firstTree.getLeafList().length;
    return firstTree;
};


/**
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2014  Tim Vaughan
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 */
/**
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2014  Tim Vaughan
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 */

// Node constructor

function Node(id) {
    this.id = id;

    this.parent = undefined;
    this.children = [];
    this.height = undefined;
    this.branchLength = undefined;
    this.label = undefined;
    this.annotation = {};
    this.hybridID = undefined;
}

// Node methods

// Ensure nodes with unique IDs have unique hashes.
Node.prototype.toString = function () {
    return "node#" + this.id;
};

Node.prototype.addChild = function (child) {
    this.children.push(child);
    child.parent = this;
};

Node.prototype.removeChild = function (child) {
    var idx = this.children.indexOf(child);
    this.children.splice(idx, 1);
};

Node.prototype.isRoot = function () {
    return (this.parent === undefined);
};

Node.prototype.isLeaf = function () {
    return (this.children.length === 0);
};

Node.prototype.isSingleton = function () {
    return (this.children.length === 1);
};

Node.prototype.isHybrid = function () {
    return (this.hybridID !== undefined);
};

Node.prototype.getAncestors = function () {
    if (this.isRoot())
        return [this];
    else
        return [this].concat(this.parent.getAncestors());
};

// Returns true if this node is left of the argument on the
// tree.  If one node is the direct ancestor of the other,
// the result is undefined.
Node.prototype.isLeftOf = function (other) {
    var ancestors = this.getAncestors().reverse();
    var otherAncestors = other.getAncestors().reverse();

    var i;
    for (i = 1; i < Math.min(ancestors.length, otherAncestors.length); i++) {
        if (ancestors[i] != otherAncestors[i]) {
            var mrca = ancestors[i - 1];

            return mrca.children.indexOf(ancestors[i]) <
                mrca.children.indexOf(otherAncestors[i]);
        }
    }

    return undefined;
};

// Produce a deep copy of the clade below this node
Node.prototype.copy = function () {

    var nodeCopy = new Node(this.id);
    nodeCopy.height = this.height;
    nodeCopy.branchLength = this.branchLength;
    nodeCopy.label = this.label;
    for (var key in this.annotation)
        nodeCopy.annotation[key] = this.annotation[key];
    nodeCopy.id = this.id;
    nodeCopy.hybridID = this.hybridID;

    nodeCopy.collapsed = this.collapsed;
    nodeCopy.cartoon = this.cartoon;

    for (var i = 0; i < this.children.length; i++)
        nodeCopy.addChild(this.children[i].copy());

    return nodeCopy;
};

// Apply f() to each node in subtree
Node.prototype.applyPreOrder = function (f) {
    var res = [];

    var thisRes = f(this);
    if (thisRes !== null)
        res = res.concat(thisRes);

    for (var i = 0; i < this.children.length; i++)
        res = res.concat(this.children[i].applyPreOrder(f));

    return res;
};


// Tree constructor

function Tree(root) {
    this.root = root;
    this.computeNodeAges();
}

// Tree methods

// Compute node ages
Tree.prototype.computeNodeAges = function () {
    var heights = this.root.applyPreOrder(function (node) {
        if (node.parent === undefined)
            node.height = 0.0;
        else {
            if (node.branchLength !== undefined)
                node.height = node.parent.height - node.branchLength;
            else {
                node.height = NaN;
            }
        }

        return node.height;
    });
    var youngestHeight = Math.min.apply(null, heights);

    this.isTimeTree = !Number.isNaN(youngestHeight) && (heights.length > 1 || this.root.branchLength !== undefined);

    for (var i = 0; i < this.getNodeList().length; i++)
        this.getNodeList()[i].height -= youngestHeight;
};

// Assign new node IDs (use with care!)
Tree.prototype.reassignNodeIDs = function () {
    var nodeID = 0;
    for (var i = 0; i < this.getNodeList().length; i++)
        this.getNodeList()[i].id = nodeID++;
};

// Clear various node caches:
Tree.prototype.clearCaches = function () {
    this.nodeList = undefined;
    this.nodeIDMap = undefined;
    this.leafList = undefined;
    this.recombEdgeMap = undefined;
};

// Retrieve list of nodes in tree.
// (Should maybe use accessor function for this.)
Tree.prototype.getNodeList = function () {
    if (this.nodeList === undefined && this.root !== undefined) {
        this.nodeList = this.root.applyPreOrder(function (node) {
            return node;
        });
    }

    return this.nodeList;
};

// Obtain node having given string representation:
Tree.prototype.getNode = function (nodeID) {
    if (this.nodeIDMap === undefined && this.root !== undefined) {
        this.nodeIDMap = {};
        for (var i = 0; i < this.getNodeList().length; i++) {
            var node = this.getNodeList()[i];
            this.nodeIDMap[node] = node;
        }
    }

    return this.nodeIDMap[nodeID];
};

// Retrieve list of leaves in tree, in correct order.
Tree.prototype.getLeafList = function () {
    if (this.leafList === undefined && this.root !== undefined) {
        this.leafList = this.root.applyPreOrder(function (node) {
            if (node.isLeaf())
                return node;
            else
                return null;
        });
    }

    return this.leafList;
};

// Retrieve map from recomb edge IDs to src/dest node pairs
Tree.prototype.getRecombEdgeMap = function () {
    if (this.recombEdgeMap === undefined) {

        var node, i;
        var hybridNodeList;
        if (this.root !== undefined) {
            hybridNodeList = this.root.applyPreOrder(function (node) {
                if (node.isHybrid())
                    return node;
                else
                    return null;
            });
        } else {
            hybridNodeList = [];
        }

        var srcHybridIDMap = {};
        var destHybridIDMap = {};
        for (i = 0; i < hybridNodeList.length; i++) {
            node = hybridNodeList[i];
            if (node.isLeaf()) {
                if (node.hybridID in destHybridIDMap)
                    destHybridIDMap[node.hybridID].push(node);
                else
                    destHybridIDMap[node.hybridID] = [node];
            } else
                srcHybridIDMap[node.hybridID] = node;
        }

        var hybridID;

        this.recombEdgeMap = {};
        for (hybridID in srcHybridIDMap) {
            if (hybridID in destHybridIDMap)
                this.recombEdgeMap[hybridID] = [srcHybridIDMap[hybridID]].concat(destHybridIDMap[hybridID]);
            else
                throw "Extended Newick error: hybrid nodes must come in groups of 2 or more.";
        }

        // Edge case: leaf recombinations

        for (hybridID in destHybridIDMap) {
            if (!(hybridID in this.recombEdgeMap))
                this.recombEdgeMap[hybridID] = [].concat(destHybridIDMap[hybridID]);
        }
    }

    return this.recombEdgeMap;
};

Tree.prototype.isRecombSrcNode = function (node) {
    return node.isHybrid() && this.getRecombEdgeMap()[node.hybridID][0] == node;
};

Tree.prototype.isRecombDestNode = function (node) {
    return node.isHybrid() && this.getRecombEdgeMap()[node.hybridID][0] != node;
};

Tree.prototype.isNetwork = function () {
    return Object.keys(this.getRecombEdgeMap()).length > 0;
};

// Sort nodes according to clade sizes.
Tree.prototype.sortNodes = function (decending) {
    if (this.root === undefined)
        return;

    function sortNodesRecurse(node) {
        var size = 1;
        var childSizes = {};
        for (var i = 0; i < node.children.length; i++) {
            var thisChildSize = sortNodesRecurse(node.children[i]);
            size += thisChildSize;
            childSizes[node.children[i]] = thisChildSize;
        }

        node.children.sort(function (a, b) {
            if (decending)
                return childSizes[b] - childSizes[a];
            else
                return childSizes[a] - childSizes[b];
        });

        return size;
    }

    sortNodesRecurse(this.root);

    // Clear out-of-date leaf list
    this.leafList = undefined;
};

// Shuffle nodes
Tree.prototype.shuffleNodes = function () {
    if (this.root === undefined)
        return;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function shuffleNodesRecurse(node) {
        for (let i = 0; i < node.children.length; i++)
            shuffleNodesRecurse(node.children[i]);

        shuffleArray(node.children);
    }

    shuffleNodesRecurse(this.root)
}

// Minimize distance between hybrid pairs
Tree.prototype.minimizeHybridSeparation = function () {

    var recombEdgeMap = this.getRecombEdgeMap();

    for (var recombID in recombEdgeMap) {
        var srcNode = recombEdgeMap[recombID][0];

        for (var i = 1; i < recombEdgeMap[recombID].length; i++) {
            var destNode = recombEdgeMap[recombID][i];
            var destNodeP = destNode.parent;

            destNodeP.removeChild(destNode);
            if (srcNode.isLeftOf(destNodeP)) {
                destNodeP.children.splice(0, 0, destNode);
            } else {
                destNodeP.children.push(destNode);
            }
        }
    }
};

// Collapse zero-length edges:
Tree.prototype.collapseZeroLengthEdges = function () {

    this.root.applyPreOrder(function (node) {

        var childrenToConsider = node.children.slice();
        while (childrenToConsider.length > 0) {
            var child = childrenToConsider.pop();

            if (child.height == node.height) {
                node.removeChild(child);

                // Does this do the right thing for polytomy dummy nodes?
                node.annotation = child.annotation;
                node.label = child.label;

                for (var j = 0; j < child.children.length; j++) {
                    var grandChild = child.children[j];
                    node.addChild(grandChild);
                    childrenToConsider.push(grandChild);
                }
            }
        }

    });

    // Invalidate cached leaf and node lists
    this.clearCaches();
};

// Re-root tree:
Tree.prototype.reroot = function (edgeBaseNode) {

    this.recombEdgeMap = undefined;
    var currentRecombEdgeMap = this.getRecombEdgeMap();

    var oldRoot = this.root;
    this.root = new Node();

    var edgeBaseNodeP = edgeBaseNode.parent;
    edgeBaseNodeP.removeChild(edgeBaseNode);
    this.root.addChild(edgeBaseNode);

    if (edgeBaseNode.branchLength !== undefined)
        edgeBaseNode.branchLength /= 2;

    var node = edgeBaseNodeP;
    var prevNode = this.root;
    var BL = edgeBaseNode.branchLength;
    var nodeP;

    var usedHybridIDs = {};
    for (var recombID in currentRecombEdgeMap) {
        usedHybridIDs[recombID] = true;
    }

    function recurseReroot(node, prevNode, seenNodes, BL) {
        if (node === undefined)
            return;

        if (node in seenNodes) {

            // Handle creation of hybrid nodes

            var newHybrid = new Node();
            if (node.isHybrid())
                newHybrid.hybridID = node.hybridID;
            else {
                var newHybridID = 0;
                while (newHybridID in usedHybridIDs) {
                    newHybridID += 1;
                }
                node.hybridID = newHybridID;
                newHybrid.hybridID = newHybridID;
                usedHybridIDs[newHybridID] = true;
            }

            newHybrid.branchLength = BL;
            prevNode.addChild(newHybrid);

            return;
        } else {
            seenNodes[node] = true;
        }

        var nodeP = node.parent;

        if (nodeP !== undefined)
            nodeP.removeChild(node);
        prevNode.addChild(node);

        var tmpBL = node.branchLength;
        node.branchLength = BL;
        BL = tmpBL;

        recurseReroot(nodeP, node, seenNodes, BL);

        if (node.isHybrid()) {
            var destNodes = [];
            var destNodePs = [];

            destNodes = currentRecombEdgeMap[node.hybridID].slice(1);
            destNodePs = destNodes.map(function (destNode) {
                return destNode.parent;
            });

            // Node will no longer be hybrid
            node.hybridID = undefined;

            for (var i = 0; i < destNodes.length; i++) {
                destNodePs[i].removeChild(destNodes[i]);

                recurseReroot(destNodePs[i], node, seenNodes, destNodes[i].branchLength);
            }
        }

    }

    recurseReroot(node, prevNode, {}, BL);

    // Delete singleton node left by old root

    if (oldRoot.children.length == 1 && !oldRoot.isHybrid()) {
        var child = oldRoot.children[0];
        var parent = oldRoot.parent;
        parent.removeChild(oldRoot);
        oldRoot.removeChild(child);
        parent.addChild(child);

        child.branchLength = child.branchLength + oldRoot.branchLength;
    }

    // Clear out-of-date leaf and node lists
    this.clearCaches();

    // Recompute node ages
    this.computeNodeAges();

    // Create new node IDs:
    this.reassignNodeIDs();

    // Ensure destNode leaf heights match those of corresponding srcNodes
    for (recombID in this.getRecombEdgeMap()) {
        var srcNode = this.getRecombEdgeMap()[recombID][0];
        for (i = 1; i < this.getRecombEdgeMap()[recombID].length; i++) {
            var destNode = this.getRecombEdgeMap()[recombID][i];
            destNode.branchLength += destNode.height - srcNode.height;
        }
    }
};

// Retrieve list of traits defined on tree.  Optional filter function can
// be used to disregard traits defined on a particular subset of nodes.
Tree.prototype.getTraitList = function (filter) {
    if (this.root === undefined)
        return [];

    var trait; // Define iteration variable

    var traitSet = {};
    for (var i = 0; i < this.getNodeList().length; i++) {
        var thisNode = this.getNodeList()[i];
        for (trait in thisNode.annotation) {
            if (filter !== undefined && !filter(thisNode, trait))
                continue;
            traitSet[trait] = true;
        }
    }

    // Create list from set
    var traitList = [];
    for (trait in traitSet)
        traitList.push(trait);

    return traitList;
};


// Return deep copy of tree:
Tree.prototype.copy = function () {
    return new Tree(this.root.copy());
};


// Translate labels using provided map:
Tree.prototype.translate = function (tmap) {

    var nodeList = this.getNodeList();
    for (var i = 0; i < nodeList.length; i++) {
        if (tmap.hasOwnProperty(nodeList[i].label))
            nodeList[i].label = tmap[nodeList[i].label];
    }
};

// Get total length of all edges in tree
Tree.prototype.getLength = function () {
    var totalLength = 0.0;
    for (var i = 0; i < this.getNodeList().length; i++) {
        var node = this.getNodeList()[i];
        if (node.isRoot())
            continue;
        totalLength += node.parent.height - node.height;
    }

    return totalLength;
};

// Return list of nodes belonging to monophyletic groups involving
// the provided node list
Tree.prototype.getCladeNodes = function (nodes) {

    function getCladeMembers(node, nodes) {

        var cladeMembers = [];

        var allChildrenAreMembers = true;
        for (var cidx = 0; cidx < node.children.length; cidx++) {
            var child = node.children[cidx];

            var childCladeMembers = getCladeMembers(child, nodes);
            if (childCladeMembers.indexOf(child) < 0)
                allChildrenAreMembers = false;

            cladeMembers = cladeMembers.concat(childCladeMembers);
        }

        if (nodes.indexOf(node) >= 0 || (node.children.length > 0 && allChildrenAreMembers))
            cladeMembers = cladeMembers.concat(node);

        return cladeMembers;
    }

    return getCladeMembers(this.root, nodes);
};

// Return list of all nodes ancestral to those in the provided node list
Tree.prototype.getAncestralNodes = function (nodes) {

    function getAncestors(node, nodes) {
        var ancestors = [];

        for (var cidx = 0; cidx < node.children.length; cidx++) {
            var child = node.children[cidx];

            ancestors = ancestors.concat(getAncestors(child, nodes));
        }

        if (nodes.indexOf(node) >= 0 || ancestors.length > 0)
            ancestors = ancestors.concat(node);

        return ancestors;
    }

    return getAncestors(this.root, nodes);
};

Tree.prototype.getLineagesThroughTime = function () {
    var nodeList = this.getNodeList().slice(0);

    nodeList.sort(function (nodeA, nodeB) { return nodeA.height - nodeB.height })

    res = { lineages: [], ages: [] };

    var k = 0;
    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];

        k += 1 - node.children.length;

        res.lineages.push(k);
        res.ages.push(node.height);
    }

    return (res);
}

// TreeBuilder constructor

function TreeBuilder(root) {
    Tree.call(this, root);
}

TreeBuilder.prototype = Object.create(Tree.prototype);
TreeBuilder.prototype.constructor = TreeBuilder;

// Exceptions thrown during parsing

function ParseException(message, context) {
    this.message = message;

    if (context !== undefined) {
        this.message += "<br><br>" +
            "Error context:<br> \"... " +
            context.left + "<span class='cursor'>" +
            context.at + "</span>" + context.right + " ... \"";
    }
}

function SkipTreeException(message) {
    this.message = message;
}


// TreeFromNewick constructor

function TreeFromNewick(newick) {

    // Lex
    var tokenList = this.doLex(newick);

    // Parse
    TreeBuilder.call(this, this.doParse(tokenList, newick));

    // Zero root edge length means undefined
    if (this.root.branchLength === 0.0)
        this.root.branchLength = undefined;
}

TreeFromNewick.prototype = Object.create(TreeBuilder.prototype);
TreeFromNewick.prototype.constructor = TreeFromNewick;


// TreeFromNewick properties/methods

TreeFromNewick.prototype.tokens = [
    ["OPENP", /^\(/, false],
    ["CLOSEP", /^\)/, false],
    ["COLON", /^:/, false],
    ["COMMA", /^,/, false],
    ["SEMI", /^;/, false],
    ["OPENA", /^\[&/, false],
    ["CLOSEA", /^\]/, false],
    ["OPENV", /^{/, false],
    ["CLOSEV", /^}/, false],
    ["EQ", /^=/, false],
    ["HASH", /#/, false],
    ["STRING", /^"(?:[^"]|"")+"/, true],
    ["STRING", /^'(?:[^']|'')+'/, true],
    ["STRING", /^[^,():;[\]#]+(?:\([^)]*\))?/, true, 0],
    ["STRING", /^[^,[\]{}=]+/, true, 1]];

// Lexical analysis
TreeFromNewick.prototype.doLex = function (newick) {
    var tokenList = [];
    var idx = 0;

    // Lexer has two modes: 0 (default) and 1 (attribute mode)
    var lexMode = 0;

    while (idx < newick.length) {

        // Skip over whitespace:
        var wsMatch = newick.slice(idx).match(/^\s/);
        if (wsMatch !== null && wsMatch.index === 0) {
            idx += wsMatch[0].length;
            continue;
        }

        var matchFound = false;
        for (var k = 0; k < this.tokens.length; k++) {

            // Skip lexer rules not applying to this mode:
            if (this.tokens[k].length > 3 && this.tokens[k][3] !== lexMode)
                continue;

            var match = newick.slice(idx).match(this.tokens[k][1]);
            if (match !== null && match.index === 0) {

                var value = match[0];

                if (this.tokens[k][2]) {
                    if (this.tokens[k][0] === "STRING") {
                        value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
                        value = value.replace("''", "'").replace('""', '"');
                    }
                }

                tokenList.push([this.tokens[k][0], value, idx]);

                switch (this.tokens[k][0]) {
                    case "OPENA":
                        lexMode = 1;
                        break;
                    case "CLOSEA":
                        lexMode = 0;
                        break;
                    default:
                        break;
                }

                matchFound = true;
                idx += match[0].length;
                break;
            }
        }

        if (!matchFound) {
            throw new ParseException("Error reading character " + newick[idx] + " at position " + idx);
        }

    }

    return tokenList;
};

// Assemble tree from token list
TreeFromNewick.prototype.doParse = function (tokenList, newick) {

    var thisNodeID = 0;

    var idx = 0;
    //var indent = 0;
    return ruleT();


    /*function indentLog(string) {

    // String doesn't have a repeat method.  (Seriously!?)
            var spaces = "";
            for (var i=0; i<indent; i++)
                spaces += " ";

            console.log(spaces + string);
        }*/

    function getContext(flank) {
        var strIdx = tokenList[idx][2];
        var startIdx = strIdx >= flank ? strIdx - flank : 0;
        var stopIdx = newick.length - strIdx >= flank ? strIdx + flank : newick.length;

        return {
            left: newick.slice(startIdx, strIdx),
            at: newick[strIdx],
            right: newick.slice(strIdx + 1, stopIdx)
        };
    }


    function acceptToken(token, mandatory) {
        if (idx < tokenList.length && tokenList[idx][0] === token) {
            idx += 1;
            return true;
        } else {
            if (mandatory)
                if (idx < tokenList.length) {
                    throw new ParseException("Expected token <b>" + token +
                        "</b> but found <b>" + tokenList[idx][0] +
                        "</b> (" +
                        tokenList[idx][1] + ") at string position <b>" +
                        tokenList[idx][2] + "</b>.",
                        getContext(15));
                } else {
                    throw new ParseException("Newick string terminated early. Expected token " + token + ".");
                }
            else
                return false;
        }
    }

    // T -> N;
    function ruleT() {
        var node = ruleN(undefined);

        if (!acceptToken("SEMI", false) && acceptToken("COMMA", false))
            throw new ParseException("Tree/network with multiple roots found.");

        return node;
    }

    // N -> CLHAB
    function ruleN(parent) {
        var node = new Node(thisNodeID++);
        if (parent !== undefined)
            parent.addChild(node);

        ruleC(node);
        ruleL(node);
        ruleH(node);
        ruleA(node);
        ruleB(node);

        return node;
    }

    // C -> (NM)|eps
    function ruleC(node) {
        if (acceptToken("OPENP", false)) {

            //indentLog("(");
            //indent += 1;

            ruleN(node);
            ruleM(node);
            acceptToken("CLOSEP", true);

            //indent -= 1;
            //indentLog(")");
        }
    }

    // M -> ,NM|eps
    function ruleM(node) {
        if (acceptToken("COMMA", false)) {

            //indentLog(",");

            ruleN(node);
            ruleM(node);
        }
    }

    // L -> lab|num
    function ruleL(node) {
        if (acceptToken("STRING", false)) {
            node.label = tokenList[idx - 1][1];

            //indentLog(node.label);
        }
    }

    // H -> #hybridID|eps
    function ruleH(node) {
        if (acceptToken("HASH", false)) {
            acceptToken("STRING", true);
            node.hybridID = tokenList[idx - 1][1];
        }
    }

    // A -> [&DE]|eps
    function ruleA(node) {
        if (acceptToken("OPENA", false)) {
            ruleD(node);
            ruleE(node);
            acceptToken("CLOSEA", true);
        }
    }

    // D -> lab=Q|eps
    function ruleD(node) {
        acceptToken("STRING", true);
        var key = tokenList[idx - 1][1];
        acceptToken("EQ", true);
        var value = ruleQ();

        node.annotation[key] = value;

        //indentLog(key + "=" + value);
    }

    // Q -> num|string|QW|eps
    function ruleQ() {
        if (acceptToken("STRING", false))
            value = tokenList[idx - 1][1];

        else if (acceptToken("OPENV", false)) {
            value = [ruleQ()].concat(ruleW());
            acceptToken("CLOSEV", true);
        } else
            value = null;

        return value;
    }

    // W -> ,QW|eps
    function ruleW() {
        if (acceptToken("COMMA", false)) {
            return [ruleQ()].concat(ruleW());
        }
        else
            return [];
    }

    // E -> ,DE|eps
    function ruleE(node) {
        if (acceptToken("COMMA", false)) {
            ruleD(node);
            ruleE(node);
        }
    }

    // B -> :num R A | eps
    function ruleB(node) {
        if (acceptToken("COLON", false)) {
            acceptToken("STRING", true);

            var length = Number(tokenList[idx - 1][1]);
            if (String(length) !== "NaN")
                node.branchLength = length;
            else
                throw new ParseException("Expected numerical branch length. Found " +
                    tokenList[idx - 1][1] + " instead.");

            //indentLog(":"+tokenList[idx-1][1]);

            ruleR();

            ruleA(node);
        }
    }

    // R -> :num R | eps
    // (This rule strips out additional colon-delimited attributes from
    // phylonet output.)
    function ruleR() {
        if (acceptToken("COLON", false)) {
            acceptToken("STRING", false);

            ruleR();
        }
    }
};


// TreeFromPhyloXML constructor

function TreeFromPhyloXML(phylogenyElement) {

    var thisNodeID = 0;

    function annotateNode(node, prefix, elements) {
        for (var j = 0; j < elements.length; j++) {
            var tname = elements[j].tagName;
            var tval = elements[j].textContent;
            node.annotation[prefix + "_" + tname] = tval;
        }
    }

    function walkDom(parent, cladeElement) {
        var node = new Node(thisNodeID++);
        if (parent !== undefined)
            parent.addChild(node);


        for (var i = 0; i < cladeElement.children.length; i++) {
            var childEl = cladeElement.children[i];
            var tagName = childEl.tagName;

            switch (tagName) {
                case "clade":
                    walkDom(node, childEl);
                    break;

                case "name":
                    node.label = childEl.textContent;
                    break;

                case "taxonomy":
                    annotateNode(node, "taxonomy", childEl.children);
                    break;

                case "sequence":
                    annotateNode(node, "sequence", childEl.children);
                    break;

                case "confidence":
                    node.annotation["confidence_" + childEl.getAttribute("type")] = childEl.textContent;
                    break;

                case "branch_length":
                    node.branchLength = Number(childEl.textContent);
                    break;

                case "property":
                    node.annotation[childEl.getAttribute("ref")] = childEl.textContent;
                    break;

                default:
                    break;
            }
        }

        if (phylogenyElement.hasAttribute("rooted") && phylogenyElement.getAttribute("rooted").toLowerCase() === "false")
            throw new SkipTreeException("Unrooted tree.");

        if (cladeElement.hasAttribute("branch_length"))
            node.branchLength = Number(cladeElement.getAttribute("branch_length"));

        return node;
    }

    for (var i = 0; i < phylogenyElement.children.length; i++) {
        var el = phylogenyElement.children[i];
        if (el.tagName === "clade") {
            TreeBuilder.call(this, walkDom(undefined, el));
            break;
        }
    }

    // Zero root edge length means undefined
    if (this.root.branchLength === 0.0)
        this.root.branchLength = undefined;
}

TreeFromPhyloXML.prototype = Object.create(TreeBuilder.prototype);
TreeFromPhyloXML.prototype.constructor = TreeFromPhyloXML;


// TreeFromNeXML constructor

var neXMLNS = "http://www.nexml.org/2009";

function TreeFromNeXML(treeElement) {

    var thisNodeID = 0;

    var nodeElements = treeElement.getElementsByTagNameNS(neXMLNS, "node");
    var edgeElements = treeElement.getElementsByTagNameNS(neXMLNS, "edge");

    var root;

    var metaElements, metaEl, midx;

    var nodesByID = {};
    for (var nidx = 0; nidx < nodeElements.length; nidx++) {
        var nodeEl = nodeElements[nidx];
        var node = new Node(thisNodeID++);
        node.label = nodeEl.getAttribute("label");
        nodesByID[nodeEl.getAttribute("id")] = node;

        if (nodeEl.getAttribute("root") === "true")
            root = node;

        metaElements = nodeEl.getElementsByTagNameNS(neXMLNS, "meta");
        for (midx = 0; midx < metaElements.length; midx++) {
            metaEl = metaElements[midx];

            if (metaEl.hasAttribute("property") && metaEl.hasAttribute("content"))
                node.annotation[metaEl.getAttribute("property")] = metaEl.getAttribute("content");
        }
    }

    if (root === undefined)
        throw new SkipTreeException("Unrooted tree.");

    for (var eidx = 0; eidx < edgeElements.length; eidx++) {
        var edgeEl = edgeElements[eidx];
        var parent = nodesByID[edgeEl.getAttribute("source")];
        var child = nodesByID[edgeEl.getAttribute("target")];

        parent.addChild(child);
        if (edgeEl.hasAttribute("length"))
            child.branchLength = edgeEl.getAttribute("length");

        metaElements = edgeEl.getElementsByTagNameNS(neXMLNS, "meta");
        for (midx = 0; midx < metaElements.length; midx++) {
            metaEl = metaElements[midx];

            if (metaEl.hasAttribute("property") && metaEl.hasAttribute("content"))
                node.annotation[metaEl.getAttribute("property")] = metaEl.getAttribute("content");
        }
    }

    TreeBuilder.call(this, root);

    var rootEdgeElements = treeElement.getElementsByTagNameNS(neXMLNS, "rootedge");
    if (rootEdgeElements.length > 0)
        this.root.branchLength = rootEdgeElements[0].getAttribute("length") * 1.0;

    return this;
}

TreeFromNeXML.prototype = Object.create(TreeBuilder.prototype);
TreeFromNeXML.prototype.constructor = TreeFromNeXML;


// Interface functions

function getTreesFromNexML(dom) {
    var trees = [];

    var treesBlocks = dom.getElementsByTagNameNS(neXMLNS, "trees");
    if (treesBlocks.length === 0)
        return [];

    var treeElements = treesBlocks[0].getElementsByTagNameNS(neXMLNS, "tree");

    for (var i = 0; i < treeElements.length; i++) {
        try {
            trees.push(new TreeFromNeXML(treeElements[i]));
        } catch (e) {
            if (e instanceof SkipTreeException)
                console.log("Skipping NeXML tree: " + e.message);
            else
                throw e;
        }
    }

    return trees;
}


function getTreesFromPhyloXML(dom) {
    var trees = [];

    var phyloElements = dom.getElementsByTagName("phylogeny");
    for (var i = 0; i < phyloElements.length; i++) {
        try {
            trees.push(new TreeFromPhyloXML(phyloElements[i]));
        } catch (e) {
            if (e instanceof SkipTreeException)
                console.log("Skipping PhyloXML tree: " + e.message);
            else
                throw e;
        }
    }

    return trees;
}

function getTreesFromNewick(string) {
    var trees = [];
    var lines = string.split(/;\s*\n/);

    for (var i = 0; i < lines.length; i++) {
        var thisLine = lines[i].trim();
        if (thisLine.length === 0)
            continue;

        try {
            trees.push(new TreeFromNewick(thisLine));
        } catch (e) {
            if (e instanceof SkipTreeException)
                console.log("Skipping Newick tree: " + e.message);
            else
                throw e;
        }
    }

    return trees;
}

function getTreesFromNexus(string) {
    var trees = [];

    var lines = string.split('\n');

    var inTrees = false;
    var fullLine = "";
    var tmap = {};
    for (var i = 1; i < lines.length; i++) {

        fullLine += lines[i].trim();
        if (fullLine[fullLine.length - 1] !== ";") {
            continue;
        }

        // Remove comments:
        fullLine = fullLine.replace(/\[[^&][^\]]*\]/g, "").trim();

        if (!inTrees) {
            if (fullLine.toLowerCase() === "begin trees;")
                inTrees = true;
            fullLine = "";
            continue;
        }

        if (fullLine.toLowerCase() === "end;")
            break;

        // Parse translate line:
        if (fullLine.toLowerCase().match("^translate")) {
            var tStringArray = fullLine.slice(9, fullLine.length - 1).split(",");
            for (var j = 0; j < tStringArray.length; j++) {
                var tvec = tStringArray[j].trim().split(/\s+/);
                var tkey = tvec[0];
                var tval = tvec.slice(1).join(" ");
                tval = tval.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
                tmap[tkey] = tval;
            }
            fullLine = "";
            continue;
        }

        // Parse tree line:
        var matches = fullLine.toLowerCase().match(/tree (\w|\.)+ *(\[&[^\]]*] *)* *= *(\[&[^\]]*] *)* */);
        if (matches !== null) {
            var eqIdx = matches[0].length;
            trees.push(new TreeFromNewick(fullLine.slice(eqIdx)));
            trees[trees.length - 1].translate(tmap);
        }

        fullLine = "";
    }

    return trees;
}

// Function to read one or more trees from a formatted string.
function getTreesFromString(string) {

    var trees;

    if (string.substring(0, 6).toLowerCase() === "#nexus") {
        console.log("Parsing file as NEXUS.");
        trees = getTreesFromNexus(string);
    } else {
        var parser = new DOMParser();
        var dom = parser.parseFromString(string, "text/xml");

        console.log("Attempting to parse as XML.");

        var parserError = dom.getElementsByTagName("parsererror").length > 0;

        if (!parserError) {
            var docTag = dom.documentElement.tagName;

            switch (docTag) {
                case "phyloxml":
                    console.log("Parsing file as PhyloXML.");
                    trees = getTreesFromPhyloXML(dom);
                    break;

                case "nexml":
                case "nex:nexml":
                    console.log("Parsing file as NeXML.");
                    trees = getTreesFromNexML(dom);
                    break;

                default:
                    throw new ParseException("Unrecognized XML format.");
            }

        } else {
            console.log("Parsing as plain/extended Newick.");
            trees = getTreesFromNewick(string);
        }
    }

    if (trees.length === 0)
        throw new ParseException("No trees found in file");

    return trees;
}

