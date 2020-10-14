import { interpolateGreens } from 'd3';

export default function(trackMap, scale, yShift) {
    const trackStart = trackMap[0].start,
        trackEnd = trackMap[trackMap.length - 1].end,
        trackMin = _.minBy(trackMap, (d) => d.value).value,
        trackMax = _.maxBy(trackMap, (d) => d.value).value,
        trackScale = scale.copy().domain([trackStart, trackEnd]),
        colorScale = scale.copy().range([0.4, 1]).domain([trackMin, trackMax]);

    let trackArray = [];

    _.map(trackMap, (t) => {
        trackArray.push({
            'start': trackScale(t.start),
            'end': trackScale(t.end),
            'color': interpolateGreens(colorScale(t.value)),
            'yPosition': yShift,
            'type': 'track'
        });
    });

    // Add a base color to the track
    trackArray.push({
        'start': trackScale(trackStart),
        'end': trackScale(trackEnd),
        'color': interpolateGreens(0.2),
        'yPosition': yShift,
        'type': 'base'
    });

    return trackArray;
}