import _ from 'lodash';

// worker written in vanilla javascript 
export function process(cnvData) {

    let fileLines = cnvData.split('\n'),
        filteredList = _.filter(_.map(fileLines.slice(1), (d) => d.split('\t')), (l) => l.length > 1),
        processedList = _.map(filteredList, (d) => {
            const position = d[2].split(':')[1].split('-');
            return {
                'lineName': d[0].toLowerCase(),
                'type': d[1],
                'start': position[0],
                'end': position[1],
                'chromosome': position[4]
            }
        }),
        groupedByLine = _.groupBy(processedList, (d) => d.lineName),
        cnvMap = {};
    // group the data by chromosome IDs for easy access
    _.map(groupedByLine, (lineData, lineName) => {
        cnvMap[lineName] = _.groupBy(lineData, (d) => d.chromosome);
    });
    return cnvMap;
};