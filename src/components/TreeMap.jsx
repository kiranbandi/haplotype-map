import React, { Component } from 'react';
import '../utils/phylotree';
import d3v3 from '../utils/d3v3';
import { TRACK_HEIGHT } from '../utils/chartConstants';

export default class TreeMap extends Component {

    componentDidMount() {
        this.constructTree(this.props.treeMap, this.props.lineCount);
    }

    constructTree = (newick, count) => {
        var height = (count - 1) * TRACK_HEIGHT, width = 300,
            tree = d3v3.layout.phylotree()
                .svg(d3v3.select('#' + this.props.treeID))
                .options({
                    'left-right-spacing': 'fit-to-size',
                    // fit to given size top-to-bottom
                    'top-bottom-spacing': 'fit-to-size',
                    'show-scale': false,
                    // fit to given size left-to-right
                    'selectable': false,
                    // make nodes and branches not selectable
                    'collapsible': false,
                    // turn off the menu on internal nodes
                    'transitions': false,
                    'align_tips': true
                })
                .size([height, width])
                .node_circle_size(0);
        // complete tree layout
        tree(newick)
            .layout();

    }

    render() {

        const { verticalShift } = this.props;

        return (<div className={'treemap-container visible-lg-inline-block ' + (verticalShift ? ' vertical-shift' : '')}>
            <svg id={this.props.treeID} className="mx-auto text-center phylotree" width={1000} height={1000}>
            </svg>
        </div>);
    }
}
