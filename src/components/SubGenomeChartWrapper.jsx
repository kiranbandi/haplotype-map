import React, { Component } from 'react';
import ChromosomeMap from './ChromosomeMap';
import RegionMap from './RegionMap';
import NavigationPanel from './NavigationPanel';

// This is a wrapper component for the three controlled 
// sub components that come into play when a chromosome is selected
// these three sub components are interlinked to each other
// intricately through the start region and end region values of the genome window
// The chromosomeMap and Navigation Panel can update these values
// while the region map consumes it to filter and show a sub genomic region

export default class SubGenomeChartWrapper extends Component {

    render() {

        let { genomeMap, lineMap, regionStart, regionEnd } = this.props;
        // create a list of line names from the lineMap
        const lineNames = _.map(lineMap, (d) => d.lineName);

        return (
            <div className='subgenome-wrapper'>
                <ChromosomeMap
                    regionStart={regionStart} regionEnd={regionEnd}
                    genomeMap={genomeMap} lineMap={lineMap}
                    lineNames={lineNames} />
                <NavigationPanel
                    regionStart={regionStart} regionEnd={regionEnd}
                    genomeMap={genomeMap} lineMap={lineMap} />
                <RegionMap
                    regionStart={regionStart} regionEnd={regionEnd}
                    genomeMap={genomeMap} lineMap={lineMap}
                    lineNames={lineNames} />
            </div>
        );
    }
}