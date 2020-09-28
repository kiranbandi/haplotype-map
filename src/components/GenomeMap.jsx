import React, { Component } from 'react';
import { schemeTableau10, scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSelectedChromosome } from '../redux/actions/actions';
// Have a list of colors to sample from 
let missingColor = 'white',
    matchColor = schemeTableau10[0],
    colorList = [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    trackLineHeight = 17.5,
    // This is added to the last chromosome block and labels are shown in it
    labelWidth = 75;

class GenomeMap extends Component {

    chromosomeClick = (event) => {
        const chromosomeID = event.currentTarget.id.split('-')[1];
        this.props.setSelectedChromosome(chromosomeID);
    }

    componentDidMount() {
        const { lineMap = {}, genomeMap = {}, width } = this.props;

        // make sure list only has chromosomes and not unmapped IDs
        const validChromosomeList = _.keys(genomeMap),
            // 5 pixel gap between chromosomes
            availableWidth = width - ((validChromosomeList.length - 1) * 7.5) - labelWidth;

        const totalMarkerCount = _.reduce(validChromosomeList,
            ((acc, chr) => acc + genomeMap[chr].referenceMap.length), 0);

        const chromosomeScale = scaleLinear()
            .domain([0, totalMarkerCount])
            .range([0, availableWidth]);

        _.map(validChromosomeList, (chrom, chromIndex) => {
            const subLineMap = lineMap[chrom] || [],
                subGenomeMap = genomeMap[chrom],
                subWidth = chromosomeScale(subGenomeMap.referenceMap.length);
            if (subLineMap.length > 0) {
                drawChart(this['canvas-' + chrom], subWidth, subLineMap, subGenomeMap);
            }
        });
        // Also draw labels for each line 
        drawLabels(this['canvas-label'], lineMap[validChromosomeList[0]], labelWidth);
    }

    componentDidUpdate() {
        const { lineMap = {}, genomeMap = {}, width } = this.props;
        // make sure list only has chromosomes and not unmapped IDs
        const validChromosomeList = _.keys(genomeMap),
            // 5 pixel gap between chromosomes
            availableWidth = width - ((validChromosomeList.length - 1) * 7.5) - labelWidth;

        const totalMarkerCount = _.reduce(validChromosomeList,
            ((acc, chr) => acc + genomeMap[chr].referenceMap.length), 0);

        const chromosomeScale = scaleLinear()
            .domain([0, totalMarkerCount])
            .range([0, availableWidth]);

        _.map(validChromosomeList, (chrom, chromIndex) => {
            const subLineMap = lineMap[chrom] || [],
                subGenomeMap = genomeMap[chrom],
                subWidth = chromosomeScale(subGenomeMap.referenceMap.length);
            if (subLineMap.length > 0) {
                drawChart(this['canvas-' + chrom], subWidth, subLineMap, subGenomeMap);
            }
        });
        // Also draw labels for each line 
        drawLabels(this['canvas-label'], lineMap[validChromosomeList[0]], labelWidth);
    }

    render() {
        const { width, genomeMap = {}, lineMap = {}, selectedChromosome = '' } = this.props,
            // make sure list only has chromosomes and not unmapped IDs
            validChromosomeList = _.keys(genomeMap),
            // 5 pixel gap between chromosomes and 100 pixels for the label width at the end
            availableWidth = width - ((validChromosomeList.length - 1) * 7.5) - labelWidth;

        const totalMarkerCount = _.reduce(validChromosomeList,
            ((acc, chr) => acc + genomeMap[chr].referenceMap.length), 0);

        const chromosomeScale = scaleLinear()
            .domain([0, totalMarkerCount])
            .range([0, availableWidth]);

        const canvasList = _.map(validChromosomeList, (chrom, chromIndex) => {

            const subWidth = chromosomeScale(genomeMap[chrom].referenceMap.length);
            return <div
                key={"canvas-" + chromIndex}
                id={'chromID-' + chrom}
                className={'genomemap-canvas-wrapper ' + (selectedChromosome == chrom ? 'selected' : '')}
                onClick={this.chromosomeClick}>
                <canvas className='genomemap-canvas'
                    width={subWidth}
                    height={(_.keys(lineMap[chrom]).length * trackLineHeight)}
                    ref={(el) => { this['canvas-' + chrom] = el }} />
                <h3>{chrom}</h3>
            </div>
        });

        // Add in the a separate canvas just for label names
        canvasList.push(<div key="canvas-label" className='genomemap-label-wrapper'>
            <canvas className='genomemap-canvas'
                width={labelWidth}
                height={(_.keys(lineMap[validChromosomeList[0]]).length * trackLineHeight)}
                ref={(el) => { this['canvas-label'] = el }} />
        </div>);

        return (<div className='genomemap-container'>{canvasList}</div>);
    }
}


function drawLineGroup(context, lineGroup, color) {
    context.beginPath();
    context.strokeStyle = color;
    _.map(lineGroup, (line) => {
        context.moveTo(Math.round(line.start), line.yPosition);
        context.lineTo(Math.round(line.end), line.yPosition);
    });
    context.stroke();
}


function drawChart(canvas, width, lineMap, genomeMap, isLast = false) {

    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();
    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    context.restore();

    // set line width 
    context.lineWidth = 15;


    const lineNames = _.map(lineMap, (d) => d.lineName);
    let lineDataLength = genomeMap.referenceMap.length;

    let xScale = scaleLinear()
        .domain([0, lineDataLength])
        .range([0, width]);

    const lineCollection = generateLinesFromMap(lineMap, xScale, trackLineHeight);

    // remove white and base color from the group and draw them first
    drawLineGroup(context, lineCollection[1], matchColor);
    drawLineGroup(context, lineCollection[0], missingColor);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLineGroup(context, lineCollection[d], colorList[d - 2])
        });

}

function drawLabels(canvas, lineMap, width) {
    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();
    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    context.restore();
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    const lineNames = _.map(lineMap, (d) => d.lineName);
    // Add label for each line
    _.map(lineNames, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
        context.fillText(name, 0, 15 + (yIndex * trackLineHeight));
    });
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



