import _ from 'lodash';

// worker written in vanilla javascript 
export function process(gff3Data) {
    let fileLines = gff3Data.split('\n'),
        filteredList = _.filter(_.map(fileLines, (d) => d.split(' ')), (l) => l.length > 2),
        processedList = _.map(filteredList, (d) => {
            const geneInfo = d.slice(8).join(' ').split(';');
            return {
                'geneID': geneInfo[0] ? geneInfo[0].slice(3) : 'N/A',
                'name': geneInfo[1] ? geneInfo[1].slice(5) : '',
                'note': geneInfo[2] ? geneInfo[2].slice(12) : '',
                'reversed': d[6] == '-' ? true : false,
                'start': d[3],
                'end': d[4],
                'chromosome': d[0]
            }
        });
    // group the data by chromosome IDs for easy access
    return _.groupBy(processedList, (d) => d.chromosome);
};