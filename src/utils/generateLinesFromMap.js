import { TRACK_HEIGHT } from './chartConstants';

export default function (lineMap, scale, selectedLineIndex) {
    // for every track in the lineMap generate an array of lines based on the lineType
    let lineList = _.reduce(lineMap, (acc, track, trackIndex) => {
        return acc.concat(convertTrackToLines(scale, track.lineData, (trackIndex * TRACK_HEIGHT) + 10))
    }, []);
    // return a collection of lines by lineType
    let groupedLineList = _.groupBy(lineList, (d) => d.lineType);

    if (selectedLineIndex != -1) {
        groupedLineList['-1'] = [{
            lineType: -1,
            'start': scale.range()[0],
            'end': scale.range()[1],
            'yPosition': (selectedLineIndex * TRACK_HEIGHT) + 7.5
        }]
    }
    return groupedLineList;
}

let convertTrackToLines = (xScale, lineData, yPosition) => _.map(lineData, (d, pointIndex) => ({
    'lineType': d,
    'start': xScale(pointIndex),
    'end': xScale(pointIndex + 1),
    yPosition
}));
