import { schemeTableau10, scaleLog } from 'd3';
// Force page reload when window is resized as
// chart widths are dependant on window width
window.onresize = function() { location.reload() }
    // we account a 0.05% for white space around the charts
const OVERALL_WIDTH = window.innerWidth * 0.95,
    // This is the right margin width created so all charts have extra
    // unallocated space for labels
    LABEL_WIDTH = 80,
    CHART_WIDTH = OVERALL_WIDTH - LABEL_WIDTH,
    ZOOM_SCALE = scaleLog()
    .domain([10, CHART_WIDTH])
    .range([30, 1])
    .clamp(true);

module.exports = {
    'MISSING_COLOR': 'white',
    'MATCH_COLOR': schemeTableau10[0],
    'COLOR_LIST': [...schemeTableau10.slice(1), ...schemeTableau10.slice(1), ...schemeTableau10.slice(1), ...schemeTableau10.slice(1), ...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    'TRACK_HEIGHT': 10.5,
    LABEL_WIDTH,
    OVERALL_WIDTH,
    CHART_WIDTH,
    ZOOM_SCALE
};