import React, { Component } from 'react';
import { clearAndGetContext, drawRotatedText } from '../utils/canvasUtilities';
import { TRACK_HEIGHT, CHART_WIDTH, LABEL_WIDTH } from '../utils/chartConstants';
import { schemeTableau10, scaleLinear } from 'd3';

const REF_COLOR = schemeTableau10[1];

export default class GeneList extends Component {

    componentDidMount() { this.drawChart() }

    componentDidUpdate(previousProps) { this.drawChart() }


    drawChart = () => {

        const { regionStart, regionEnd, geneList, chartScale } = this.props,
            InnerGeneList = geneList.slice(regionStart, regionEnd),
            geneCount = InnerGeneList.length;

        let updatedChartScale = scaleLinear().domain([0, geneCount]).range([0, CHART_WIDTH]);
        let chartCanvas = clearAndGetContext(this.canvas),
            chartLabelCanvas = clearAndGetContext(this['canvas-label']),
            geneLabelCanvas = clearAndGetContext(this['canvas-genelabel']);

        // Draw Chart Labels
        chartLabelCanvas.textAlign = "left";
        chartLabelCanvas.textBaseline = "alphabetic";
        chartLabelCanvas.font = "bolder 14px Arial";
        chartLabelCanvas.fillStyle = "white";
        chartLabelCanvas.beginPath();
        chartLabelCanvas.fillText('Genes', 10, TRACK_HEIGHT * (1.5));

        // Draw Gene Labels 
        geneLabelCanvas.textAlign = "left";
        geneLabelCanvas.textBaseline = "middle";
        geneLabelCanvas.beginPath();
        geneLabelCanvas.font = "bold 10px Arial";
        geneLabelCanvas.fillStyle = '#1ca8dd';

        const numberOfGenes = 100,
            nthIndex = Math.max(1, Math.round(InnerGeneList.length / numberOfGenes)),
            mappedGeneNames = InnerGeneList.map((e, i) => ({ 'name': e.toLocaleUpperCase(), 'index': i })),
            // Add original index to the gene entry for chart scale to use for its true position
            everyNthGene = _.filter(mappedGeneNames, (d, i) => i % (nthIndex) == 0);
        console.log(nthIndex);
        _.map(everyNthGene, (d, xIndex) => {
            drawRotatedText(updatedChartScale(d.index) + (updatedChartScale(1) / 2), 57, -Math.PI / 4, d.name, geneLabelCanvas);
        });

        // Draw a single block line to show gene background
        chartCanvas.beginPath();
        chartCanvas.lineWidth = TRACK_HEIGHT - 2.5;
        chartCanvas.strokeStyle = REF_COLOR;
        chartCanvas.moveTo(Math.round(updatedChartScale.range()[0]), TRACK_HEIGHT / 2);
        chartCanvas.lineTo(Math.round(updatedChartScale.range()[1]), TRACK_HEIGHT / 2);
        chartCanvas.stroke();
    }


    render() {

        const { lineCount = 1 } = this.props;

        return (<div className='subchart-container m-b' >
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <canvas
                        className='canvas-genelabel'
                        width={CHART_WIDTH}
                        height={80}
                        ref={(el) => { this['canvas-genelabel'] = el }} />
                    <canvas
                        style={{ 'background': 'white' }}
                        className='subchart-canvas m-b'
                        width={CHART_WIDTH}
                        height={(lineCount * TRACK_HEIGHT)}
                        ref={(el) => { this.canvas = el }} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={((lineCount + 1) * TRACK_HEIGHT)}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}
