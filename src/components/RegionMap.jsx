import React, { Component } from 'react';
import { scaleLinear, format } from 'd3';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import generateNucleotidePositions from '../utils/generateNucleotidePositions';
import { showTooltip, setSelectedLine, setSelectedSNP } from '../redux/actions/actions';
import { LABEL_WIDTH, CHART_WIDTH, TRACK_HEIGHT } from '../utils/chartConstants';
import {
    drawLinesByColor, drawNucleotides,
    clearAndGetContext, drawLabels, drawSNPNames
} from '../utils/canvasUtilities';
import TreeMap from './TreeMap';
import TraitMap from './TraitMap';
import GeneTrack from './GeneTrack';


class RegionMap extends Component {

    componentDidMount() { this.drawChart() }
    componentDidUpdate() { this.drawChart() }

    onMouseMove = (event) => {

        let { regionStart, regionEnd, lineNames } = this.props;

        if ((regionEnd - regionStart) < 90) {

            const referenceMap = window.referenceMap,
                referenceScale = window.referenceScale;

            var pageWidth = document.body.getBoundingClientRect().width,
                canvasRect = event.currentTarget.getBoundingClientRect();

            const xPosition = event.pageX - canvasRect.left,
                yPosition = event.pageY - window.pageYOffset - canvasRect.top;

            const lineName = lineNames[Math.round((yPosition - 12) / TRACK_HEIGHT)],
                referenceIndex = Math.floor(referenceScale.invert(xPosition)),
                dataPoint = referenceMap[referenceIndex];

            this.props.actions.showTooltip(true, {
                'x': event.pageX + 200 > pageWidth ? event.pageX - 200 : event.pageX + 25,
                'y': event.pageY - 50,
                lineName,
                'SNP': dataPoint.locusName,
                'allele': dataPoint.allele
            });
        }
    }

    onMouseLeave = (event) => { this.props.actions.showTooltip(false) }

    canvasLabelClick = (event) => {
        const { lineNames } = this.props;
        let bounds = this['canvas-label'].getBoundingClientRect();
        let y = event.clientY - bounds.top;
        let yStep = (bounds.bottom - bounds.top) / lineNames.length;
        let activeYIndex = Math.floor(y / yStep);
        this.props.actions.setSelectedLine(lineNames[activeYIndex]);
    }

    SNPLabelClick = (event) => {

        let { regionStart, regionEnd } = this.props;

        if ((regionEnd - regionStart) < 90) {

            const referenceMap = window.referenceMap,
                referenceScale = window.referenceScale,
                canvasRect = event.currentTarget.getBoundingClientRect(),
                xPosition = event.pageX - canvasRect.left,
                referenceIndex = Math.floor(referenceScale.invert(xPosition)),
                dataPoint = referenceMap[referenceIndex];

            this.props.actions.setSelectedSNP(dataPoint.locusName);
        }
    }


    drawChart = () => {
        let { lineMap = [], lineNames, genomeMap, chartScale, selectedLine, selectedSNP,
            regionStart, regionEnd, germplasmData, colorScheme } = this.props;

        //   to get the nucleotide data, move the start index by the start of the chromosome
        // so we are in the right position 
        let modifiedLineMap = _.map(lineMap, (l) => ({
            'lineName': l.lineName,
            'lineData': l.lineData.slice(regionStart, regionEnd),
            'lineNucleotideData': germplasmData[l.lineName].slice((regionStart + genomeMap.startIndex), (regionEnd + genomeMap.startIndex))
        })),
            modifiedGenomeMap = {
                'chromID': genomeMap.chromID,
                'startIndex': regionStart,
                'endIndex': regionEnd,
                'start': genomeMap.referenceMap[regionStart].position,
                'end': genomeMap.referenceMap[regionEnd - 1].position,
                'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd)
            },

            modifiedChartScale = chartScale.copy().domain([0, (regionEnd - regionStart) - 1]);

        // TODO quick hack, dump to window so that tooltip can do a quick read 
        window.referenceScale = modifiedChartScale;
        window.referenceMap = modifiedGenomeMap.referenceMap;


        let context = clearAndGetContext(this.canvas);

        let selectedLineIndex = _.findIndex(lineNames, d => d == selectedLine);

        const isColorActiveInLabels = colorScheme.indexOf('difference') > -1 && lineNames.length <= 10;

        drawLinesByColor(this.canvas, generateLinesFromMap(modifiedLineMap, modifiedChartScale, selectedLineIndex));


        // If the user is zoomed in far enough show the actual nucleotides 
        // and the SNP labels 
        if ((regionEnd - regionStart) < 90) {
            const SNPLocusNames = _.map(modifiedGenomeMap.referenceMap, (d) => d.locusName.toLocaleUpperCase());
            let selectedSNPIndex = _.findIndex(SNPLocusNames, d => d == selectedSNP.toLocaleUpperCase());
            drawNucleotides(this.canvas, generateNucleotidePositions(modifiedLineMap, modifiedChartScale, selectedSNPIndex));
            drawSNPNames(this.SNPnamesCanvas, SNPLocusNames, modifiedChartScale, selectedSNPIndex);

            if (selectedSNPIndex != -1) {
                //   to get the nucleotide data, move the start index by the start of the chromosome
                // so we are in the right position 
                let modifiedLineMapSNP = _.map(lineMap, (l) => ({
                    'lineName': l.lineName,
                    'lineData': l.lineData.slice(selectedSNPIndex, selectedSNPIndex + 1),
                    'lineNucleotideData': germplasmData[l.lineName].slice((selectedSNPIndex + genomeMap.startIndex), (selectedSNPIndex + 1 + genomeMap.startIndex))
                })),
                    modifiedChartScaleSNP = chartScale.copy().domain([0, 1]);
                
                drawLinesByColor(this['subchart-canvas-snp'], generateLinesFromMap(modifiedLineMapSNP, modifiedChartScaleSNP, selectedLineIndex));
                drawNucleotides(this['subchart-canvas-snp'], generateNucleotidePositions(modifiedLineMapSNP, modifiedChartScaleSNP, -1));
            }


        }

        drawXAxisPoisitonalMarkers(modifiedGenomeMap, lineNames, context, modifiedChartScale);
        drawLabels(this['canvas-label'], lineNames, isColorActiveInLabels, selectedLineIndex);
    }

    render() {

        let { lineCount, chartScale, treeMap,
            genomeMap, referenceType,
            regionStart, regionEnd, geneMap,
            traitMap, traitList, trait, selectedSNP } = this.props;

        const markerCount = (regionEnd - regionStart) - 1;

        let modifiedGenomeMap = {
            'chromID': genomeMap.chromID,
            'startIndex': regionStart,
            'endIndex': regionEnd,
            'start': genomeMap.referenceMap[regionStart].position,
            'end': genomeMap.referenceMap[regionEnd - 1].position,
            'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd)
        },
            modifiedChartScale = chartScale.copy().domain([0, (regionEnd - regionStart) - 1]),
            modifiedGeneMap = _.filter(geneMap, (d) => ((+d.start > +modifiedGenomeMap.start) && (+d.end < +modifiedGenomeMap.end)));

        const showSNPNames = (regionEnd - regionStart) < 90;
        const isSelectedSNPActive = showSNPNames && (selectedSNP.length > 0);

        return (<div className='subchart-container'>
            <h4 className='text-primary chart-title'>Sub Region</h4>
            {referenceType == 'tree' && <TreeMap lineCount={lineCount} verticalShift={showSNPNames} treeMap={treeMap} treeID='regionTree' />}
            {referenceType == 'trait' && <TraitMap lineCount={lineCount} verticalShift={showSNPNames} trait={trait} traitList={traitList} traitMap={traitMap} treeID='regionTraitMap' />}
            <div className={'subchart-outer-wrapper ' + (isSelectedSNPActive ? 'push-right' : '')}>
                <canvas className={'subchart-canvas-snp ' + (isSelectedSNPActive ? 'show' : 'hide')}
                    width={20}
                    height={(lineCount * TRACK_HEIGHT)}
                    ref={(el) => { this['subchart-canvas-snp'] = el }} />
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    {showSNPNames &&
                        <canvas
                            className='subchart-canvas-snpnames'
                            width={CHART_WIDTH}
                            height={75}
                            onClick={this.SNPLabelClick}
                            ref={(el) => { this.SNPnamesCanvas = el }}
                        />}
                    <canvas
                        onMouseOver={this.onMouseMove}
                        onMouseMove={this.onMouseMove}
                        onMouseLeave={this.onMouseLeave}
                        className='subchart-canvas'
                        width={CHART_WIDTH}
                        height={(lineCount * TRACK_HEIGHT) + 65}
                        ref={(el) => { this.canvas = el }} />
                    <GeneTrack
                        geneMap={modifiedGeneMap}
                        genomeMap={modifiedGenomeMap}
                        markerCount={markerCount}
                        chartScale={modifiedChartScale}
                        width={CHART_WIDTH} />
                </div>
                <canvas className={'subchart-canvas-label ' + (showSNPNames ? ' vertical-shift' : '')}
                    width={LABEL_WIDTH}
                    height={(lineCount * TRACK_HEIGHT)}
                    onClick={this.canvasLabelClick}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}

function drawXAxisPoisitonalMarkers(genomeMap, lineNames, context, xScale) {

    const { start, end, referenceMap } = genomeMap;

    const chromosomeScale = scaleLinear()
        .domain([start, end])
        .range([0, CHART_WIDTH]);

    const verticalHeight = (lineNames.length * TRACK_HEIGHT) + 2;

    // for every marker get the corresponding point on the chromosome scale
    // and draw a line between them
    const chromosomePointerLines = _.map(referenceMap, (d, dIndex) => {
        return {
            'x1': chromosomeScale(d.position), 'x2': xScale(dIndex),
        }
    });

    // first draw a thick line indicating the chromosome
    context.strokeStyle = "grey";
    context.fillStyle = "white";

    // draw a rectangle for the chromosome container
    context.beginPath();
    context.lineWidth = 2;
    context.rect(xScale.range()[0], verticalHeight + 25,
        xScale.range()[1] - xScale.range()[0], TRACK_HEIGHT);
    context.stroke();

    // for each marker draw 3 lines 
    //  the first line is inside the chromosome rect
    //  the second line is a straight line on the linemap
    //  the third line connects these two
    context.beginPath();
    context.lineWidth = 0.5;

    _.map(chromosomePointerLines, (cp) => {
        // first line inside chromosome container
        context.moveTo(cp.x1, verticalHeight + 25);
        context.lineTo(cp.x1, verticalHeight + 25 + TRACK_HEIGHT);
        // second line is right under the linemap
        context.moveTo(cp.x2, verticalHeight + 2);
        context.lineTo(cp.x2, verticalHeight + 10);
        // 3rd line connects these two
        context.moveTo(cp.x2, verticalHeight + 10);
        context.lineTo(cp.x1, verticalHeight + 25);
    })
    context.stroke();

    var tickCount = 15,
        tickSize = 5,
        ticks = chromosomeScale.ticks(tickCount),
        tickFormat = format('~s');

    context.lineWidth = 0.5;
    // draw lines for each tick
    context.beginPath();
    context.lineWidth = 2;
    ticks.forEach(function (d) {
        context.moveTo(chromosomeScale(d), 20 + TRACK_HEIGHT + verticalHeight + tickSize);
        context.lineTo(chromosomeScale(d), 25 + TRACK_HEIGHT + verticalHeight + tickSize);
    });
    context.stroke();
    context.fillStyle = "grey";
    context.textAlign = "center";
    context.textBaseline = "top";
    ticks.forEach(function (d) {
        context.fillText(tickFormat(d), chromosomeScale(d), 27 + TRACK_HEIGHT + verticalHeight + tickSize);
    });

}


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showTooltip, setSelectedLine, setSelectedSNP
        }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        selectedLine: state.oracle.selectedLine,
        selectedSNP: state.oracle.selectedSNP
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(RegionMap);