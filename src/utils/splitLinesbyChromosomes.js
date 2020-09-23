export default function(lines, genomeMap) {
    const lineMap = {};
    // split each line in the lines array based on chromosomes
    _.map(genomeMap, (chr, chrID) => {
        lineMap[chrID] = _.map(lines,
            (cMap) => ({
                'lineData': cMap.lineData.slice(chr.startIndex, chr.endIndex + 1),
                'lineName': cMap.lineName
            }))
    });
    return lineMap;
}