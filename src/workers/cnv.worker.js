import _ from 'lodash';

// worker written in vanilla javascript 
export function process(cnvData) {

    let fileLines = cnvData.split('\n'),
        filteredList = _.filter(_.map(fileLines.slice(1), (d) => d.split('\t')), (l) => l.length > 1),
        processedList = _.map(filteredList, (d) => {
            const position = d[2].split(':')[1].split('-');
            return {
                'lineName': d[0],
                'type': d[1],
                'start': position[0],
                'end': position[1],
                'mid': d[5],
                'chromosome': d[4]
            }
        }),
        // group the data by chromosome IDs for easy access
        groupedByChromosome = _.groupBy(processedList, (d) => d.chromosome),
        cnvMap = {};
    //    group the data further by line
    _.map(groupedByChromosome, (data, chrName) => {
        cnvMap[chrName] = _.groupBy(data, (d) => d.lineName);
    });
    return cnvMap;
};