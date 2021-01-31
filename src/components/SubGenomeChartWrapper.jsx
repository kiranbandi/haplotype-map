import React, { Component } from 'react';
import ChromosomeMap from './ChromosomeMap';
import RegionMap from './RegionMap';
import NavigationPanel from './NavigationPanel';
import { scaleLinear } from 'd3';
import { CHART_WIDTH } from '../utils/chartConstants';

// This is a wrapper component for the three controlled 
// sub components that come into play when a chromosome is selected
// these three sub components are interlinked to each other
// intricately through the start region and end region values of the genome window
// The chromosomeMap and Navigation Panel can update these values
// while the region map consumes it to filter and show a sub genomic region

export default class SubGenomeChartWrapper extends Component {

    render() {

        let { genomeMap, germplasmData, lineMap, referenceType,
            traitMap, traitList, selectedTrait,
            regionStart, regionEnd, cnvMap, colorScheme,
            geneMap, treeMap, trackMap } = this.props;
        // create a list of line names from the lineMap
        const lineNames = _.map(lineMap, (d) => d.lineName),
            lineCount = lineNames.length,
            markerCount = genomeMap.referenceMap.length,
            // create a reusable horizontal scale for markers
            chartScale = scaleLinear()
                .domain([0, markerCount - 1])
                .range([0, CHART_WIDTH]);
        // If the end position has not been set then set it to a window of 50 pixels
        if (regionStart == 0 && regionEnd == 0) {
            regionEnd = Math.round(chartScale.invert(50));
        }
        // Get the real genomic position of the start and end markers
        const genomeStartPosition = genomeMap.referenceMap[regionStart].position,
            genomeEndPosition = genomeMap.referenceMap[regionEnd].position;

        return (
            <div className='subgenome-wrapper'>
                {lineMap.length > 0 &&
                    <div>
                        <ChromosomeMap
                            colorScheme={colorScheme}
                            trait={selectedTrait}
                            traitMap={traitMap}
                            traitList={traitList}
                            referenceType={referenceType}
                            treeMap={treeMap}
                            geneMap={geneMap} cnvMap={cnvMap} trackMap={trackMap}
                            regionStart={regionStart} regionEnd={regionEnd}
                            genomeMap={genomeMap} lineMap={lineMap}
                            lineNames={lineNames} lineCount={lineCount}
                            chartScale={chartScale} markerCount={markerCount} />
                        <NavigationPanel
                            regionStart={regionStart} regionEnd={regionEnd}
                            genomeMap={genomeMap} lineMap={lineMap}
                            lineCount={lineCount} markerCount={markerCount}
                            chartScale={chartScale}
                            genomeStartPosition={genomeStartPosition}
                            genomeEndPosition={genomeEndPosition} />
                        <RegionMap
                            colorScheme={colorScheme}
                            trait={selectedTrait}
                            traitMap={traitMap}
                            traitList={traitList}
                            referenceType={referenceType}
                            geneMap={geneMap} cnvMap={cnvMap}
                            treeMap={treeMap}
                            germplasmData={germplasmData}
                            regionStart={regionStart} regionEnd={regionEnd}
                            genomeMap={genomeMap} lineMap={lineMap}
                            lineNames={lineNames} lineCount={lineCount}
                            chartScale={chartScale} markerCount={markerCount} />
                    </div>}

            </div>
        );
    }
}