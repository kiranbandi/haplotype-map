import { TRACK_HEIGHT } from './chartConstants';

function getPositions(d, xIndex, chartScale, yIndex) {
    return {
        'text': d,
        'y': (yIndex * TRACK_HEIGHT) + 10,
        'x': chartScale(xIndex) + (chartScale(1) / 2),
    };
}

export default (lineMap, chartScale) => _.reduce(lineMap, (acc, line, lineIndex) => {
    return acc.concat(_.map(line.lineNucleotideData,
        (d, xIndex) => getPositions(d, xIndex, chartScale, lineIndex)))
}, []);
