import React, { Component } from 'react';

export default class GeneTrack extends Component {

    render() {
        const { geneMap, genomeMap, markerCount, chartScale, width } = this.props;

        // transform genomic coordinates to chart scale point
        let genePositions = _.map(geneMap, (d) => {
            return seekGenomeCoords(genomeMap, markerCount, chartScale, d);
        });

        // dx is the width of each gene marker
        // actual track height is 20 but we add a bit of padding of 1px
        let dx = 15, verticalTrackStart = 0, verticalTrackHeight = 20,
            maxPosition = verticalTrackHeight;

        // reposition the genes so they dont overlap by moving them to the next
        // line vertically if things get a bit crowded
        // we start with the start position and if a line is crowded
        // then we push the vPos by the height of the track
        // if the next is not crowded we go back to original start position
        _.reduce(genePositions, (vPos, d, i) => {
            if (i == 0) {
                genePositions[i]['y'] = verticalTrackStart;
                return verticalTrackStart;
            }
            else if ((genePositions[i - 1].x + (dx)) >= genePositions[i].x) {
                let verticalShift = vPos + verticalTrackHeight;
                genePositions[i]['y'] = verticalShift;
                if (verticalShift > maxPosition) { maxPosition = verticalShift }
                return verticalShift;
            }
            else {
                genePositions[i]['y'] = verticalTrackStart;
                return verticalTrackStart;
            }
        }, verticalTrackStart)

        const geneMarkers = _.map(genePositions, (d, i) => {
            let arrowElement;
            let geneInfo = (d.geneID ? 'ID: ' + d.geneID : '') + (d.name ? 'name: ' + d.name : '') + (d.note ? d.note : '');
            if (d.reversed) {
                arrowElement = <path key={'arrow-' + i} className='gene-arrow'
                    d={"M" + (d.x + dx) + "," + (d.y + 5) + " L" + (d.x + dx) +
                        "," + (d.y + 15) + " M" + (d.x + dx) + "," + (d.y + 10) +
                        "L" + (d.x) + "," + (d.y + 10) + " L" + (d.x + 5) + "," +
                        (d.y + 5) + " L" + (d.x) +
                        "," + (d.y + 10) + " L" + (d.x + 5) + "," + (d.y + 15)
                        + " L" + (d.x) + "," + (d.y + 10)} >
                    <title>{geneInfo}</title>
                </path>
            }
            else {
                arrowElement = <path key={'arrow-' + i} className='gene-arrow'
                    d={"M" + d.x + "," + (d.y + 5) + " L" + d.x
                        + "," + (d.y + 15) + " M" + d.x + "," + (d.y + 10) +
                        "L" + (d.x + dx) + "," + (d.y + 10) + " L" + (d.x + dx - 5)
                        + "," + (d.y + 5) + " L" + (d.x + dx) + ","
                        + (d.y + 10) + " L" + (d.x + dx - 5)
                        + "," + (d.y + 15) + " L" + (d.x + dx) + "," + (d.y + 10)} >
                    <title>{geneInfo}</title>
                </path>
            }
            return [arrowElement, <rect key={'gene-rect-' + i} onClick={() => { alert(geneInfo) }} x={d.x} y={d.y} width={dx} height={verticalTrackHeight}><title>{geneInfo}</title></rect>]
        });


        return (<svg className="gene-track" width={width} height={maxPosition}>
            {geneMarkers}
        </svg>);
    }
}


function seekGenomeCoords(genomeMap, markerCount, chartScale, genePoint) {
    let startIndex = 0, endIndex = 0;
    // typecast to numbers
    let genomicStart = +genePoint.start, genomicEnd = +genePoint.end;
    // check only if start and end positions are valid numbers
    // and one of them is non empty
    if (!isNaN(genomicStart) && !isNaN(genomicEnd)) {
        startIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= genomicStart) || 0;
        endIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= genomicEnd) || markerCount;
    }
    // we need a minimum gap for a gene if not we make it atleast a 10 pixels wide
    const minGeneWidth = Math.round(chartScale.invert(10));
    if (endIndex - startIndex < minGeneWidth) {
        endIndex = startIndex + minGeneWidth;
        // if the endIndex is close to the end clamp it
        endIndex = endIndex >= markerCount ? markerCount - 1 : endIndex;
    }
    return { ...genePoint, 'x': Math.round(chartScale(startIndex)), 'dx': Math.round(chartScale(endIndex - startIndex)) };
}