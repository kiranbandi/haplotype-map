import React, { Component } from 'react';
import { phylotree } from 'phylotree';

console.log(phylotree);


export default class TreeMap extends Component {

    constructTree = (treeMap) => {

        let totalBranchLength = treeMap.root.height;

        let labelWidth = 100;
        let availableWidth = 1000 - labelWidth;
        let availableHeight = 1000;

        let xMargin = { left: 20, right: 10 },
            yMargin = { top: 10, bottom: 10 };

        let xScale = scaleLinear()
            .domain([0, totalBranchLength])
            .range([xMargin.left, availableWidth - xMargin.right]);

        var yScale = scaleLinear()
            .domain([0, 100])
            .range([yMargin.top, availableHeight - yMargin.bottom]);

        // one root element
        var rootElement = <line x1={xMargin.left - 10} x2={10} y1={yScale(50)} y2={yScale(50)} />

        var branchList = [], leafList = [], isTimeTree = false,
            treeDepth = maxDepth(treeMap.root),
            subBranchLength = totalBranchLength / treeDepth;

        // trigger of tree parsing with the two children of the root node
        addBranch(treeMap.root.children[0], 0, 50, 1, false);
        addBranch(treeMap.root.children[1], 0, 50, 1, true);

        function addBranch(treeNode, xPosition, yPosition, rootDistance, down = true) {

            const branchLength = treeNode.children.length == 0 ? totalBranchLength - xPosition : subBranchLength;

            let branchEnd = {
                'x': xPosition + (isTimeTree ? Number(treeNode.branchLength) : branchLength),
                'y': yPosition + ((down ? -1 : 1) * (100 / Math.pow(2, (rootDistance + 1))))
            };

            // add the coords for the branch
            branchList.push({
                'id': treeNode.id,
                'start': {
                    'x': xScale(xPosition),
                    'y': yScale(yPosition)
                },
                'bend': {
                    'x': xScale(xPosition),
                    'y': yScale(branchEnd.y)
                },
                'end': {
                    'x': xScale(branchEnd.x),
                    'y': yScale(branchEnd.y)
                }
            });


            // if the node has children add nodes on them
            if (treeNode.children.length > 0) {
                addBranch(treeNode.children[0], branchEnd.x, branchEnd.y, rootDistance + 1, false);
                addBranch(treeNode.children[1], branchEnd.x, branchEnd.y, rootDistance + 1, true);
            }
            // if there are no children its a leaf node so add labels
            else {
                leafList.push({
                    'x': xScale(branchEnd.x),
                    'y': yScale(branchEnd.y),
                    'label': treeNode.label,
                    'id': treeNode.id
                })
            }
        }
        return { branchList, rootElement, leafList };
    }

    render() {

        const { branchList, rootElement, leafList } = this.constructTree(this.props.treeMap);

        return (<div className='treemap-container'>
            <svg className="mx-auto text-center" width={1000} height={1000}>
                {_.map(branchList, (d) => {
                    return <path id={'branch-' + d.id}
                        strokeWidth={'3'}
                        stroke={'red'}
                        fill={'none'}
                        d={branchPathCreator(d)}>
                        <title>{d.id}</title>
                    </path>
                })}
            </svg>
        </div>);
    }
}

function branchPathCreator(branch, straight = true) {
    return straight ? `M ${branch.start.x} ${branch.start.y} L ${branch.bend.x} ${branch.bend.y} L ${branch.end.x} ${branch.end.y}` :
        `M ${branch.start.x} ${branch.start.y} C ${branch.bend.x} ${branch.bend.y}, ${branch.bend.x} ${branch.bend.y}, ${branch.end.x} ${branch.end.y}`;
}




function maxDepth(node) {
    if (node.children.length == 0) return 1;
    return Math.max(maxDepth(node.children[0]), maxDepth(node.children[1])) + 1;
}

function minDepth(node) {
    if (node.children.length == 0) return 1;
    return Math.min(minDepth(node.children[0]), minDepth(node.children[1])) + 1;
}

// <path id="lineAB" d="M 50 50 L 50 100 L 150 100" stroke="red" stroke-width="3" fill="none" />
// <path d="M 50 50 C 50 100, 50 100, 150 100" stroke="blue" stroke-width="5" fill="none" />