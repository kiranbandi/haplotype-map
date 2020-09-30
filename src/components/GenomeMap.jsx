import React, { Component } from 'react';
import { scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSelectedChromosome } from '../redux/actions/actions';
import {
    MISSING_COLOR, MATCH_COLOR, LABEL_WIDTH, CHART_WIDTH,
    COLOR_LIST, TRACK_HEIGHT
} from '../utils/chartConstants';
import { drawLines, clearAndGetContext, drawLabels } from '../utils/canvasUtilities';
// Have a list of colors to sample from 
let // A global scale that gets updated each time the chart is drawn again
    chromosomeScale;

class GenomeMap extends Component {

    chromosomeClick = (event) => {
        const chromosomeID = event.currentTarget.id.split('-')[1];
        this.props.setSelectedChromosome(chromosomeID);
    }

    componentDidMount() {
        const { lineMap = {}, genomeMap = {} } = this.props,
            { validChromosomeList, chromosomeScale } = getChromosomeVectors(genomeMap);

        // create a list of line names from the lineMap of the first valid chromosome
        const lineNames = _.map(lineMap[validChromosomeList[0]], (d) => d.lineName);

        _.map(validChromosomeList, (chrom, chromIndex) => {
            const subLineMap = lineMap[chrom] || [],
                subGenomeMap = genomeMap[chrom],
                subWidth = chromosomeScale(subGenomeMap.referenceMap.length);
            if (subLineMap.length > 0) {
                drawChart(this['canvas-' + chrom], subWidth, subLineMap, subGenomeMap);
            }
        });
        // Also draw labels for each line 
        drawLabels(this['canvas-label'], lineNames);
    }

    componentDidUpdate() {
        const { lineMap = {}, genomeMap = {} } = this.props,
            { validChromosomeList, chromosomeScale } = getChromosomeVectors(genomeMap);

        // create a list of line names from the lineMap of the first valid chromosome
        const lineNames = _.map(lineMap[validChromosomeList[0]], (d) => d.lineName);

        _.map(validChromosomeList, (chrom) => {
            const subLineMap = lineMap[chrom] || [],
                subGenomeMap = genomeMap[chrom],
                subWidth = chromosomeScale(subGenomeMap.referenceMap.length);
            if (subLineMap.length > 0) {
                drawChart(this['canvas-' + chrom], subWidth, subLineMap, subGenomeMap);
            }
        });
        // Also draw labels for each line 
        drawLabels(this['canvas-label'], lineNames);
    }

    render() {
        const { genomeMap = {}, lineMap = {}, selectedChromosome = '' } = this.props,
            { validChromosomeList, chromosomeScale } = getChromosomeVectors(genomeMap);

        const canvasList = _.map(validChromosomeList, (chrom, chromIndex) => {
            const subWidth = chromosomeScale(genomeMap[chrom].referenceMap.length);
            return <div
                key={"canvas-" + chromIndex}
                id={'chromID-' + chrom}
                className={'genomemap-canvas-wrapper ' + (selectedChromosome == chrom ? 'selected' : '')}
                onClick={this.chromosomeClick}>
                <canvas className='genomemap-canvas'
                    width={subWidth}
                    height={(_.keys(lineMap[chrom]).length * TRACK_HEIGHT)}
                    ref={(el) => { this['canvas-' + chrom] = el }} />
                <h3>{chrom}</h3>
            </div>
        });

        // Add in the a separate canvas just for label names
        canvasList.push(<canvas key="canvas-label" className='genomemap-canvas-label'
            width={LABEL_WIDTH}
            height={(_.keys(lineMap[validChromosomeList[0]]).length * TRACK_HEIGHT)}
            ref={(el) => { this['canvas-label'] = el }} />);

        return (<div className='genomemap-container'>{canvasList}</div>);
    }
}

function drawChart(canvas, subWidth, lineMap, genomeMap) {

    let context = clearAndGetContext(canvas);
    // set line width 
    context.lineWidth = 15;

    const lineDataLength = genomeMap.referenceMap.length,
        xScale = scaleLinear()
            .domain([0, lineDataLength - 1])
            .range([0, subWidth]),
        lineCollection = generateLinesFromMap(lineMap, xScale, TRACK_HEIGHT);

    // remove white and base color from the group and draw them first
    drawLines(canvas, lineCollection[1], MATCH_COLOR);
    drawLines(canvas, lineCollection[0], MISSING_COLOR);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => drawLines(canvas, lineCollection[d], COLOR_LIST[d - 2]));

}

function getChromosomeVectors(genomeMap) {
    // make sure list only has chromosomes and not unmapped IDs
    const validChromosomeList = _.keys(genomeMap),
        // 5 pixel gap between chromosomes
        availableWidth = CHART_WIDTH - ((validChromosomeList.length - 1) * 5),
        totalMarkerCount = _.reduce(validChromosomeList,
            ((acc, chr) => acc + genomeMap[chr].referenceMap.length), 0);
    // create a scale for the entire chromosome 
    chromosomeScale = scaleLinear().domain([0, totalMarkerCount]).range([0, availableWidth]);
    return { validChromosomeList, chromosomeScale };
}

function mapDispatchToProps(dispatch) {
    return {
        setSelectedChromosome: bindActionCreators(setSelectedChromosome, dispatch)
    };
}

function mapStateToProps(state) {
    return { selectedChromosome: state.oracle.selectedChromosome };
}

export default connect(mapStateToProps, mapDispatchToProps)(GenomeMap);



