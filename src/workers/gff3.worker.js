import _ from 'lodash';

// worker written in vanilla javascript 
export function process(gff3Data) {


    let fileLines = gff3Data.split('\n'),
        filteredList = _.filter(_.map(fileLines, (d) => d.split('\t')), (l) => l.length > 2),
        processedList = _.map(filteredList, (d) => {
            const geneInfo = d[8].split(';');
            return {
                'geneID': geneInfo[1] ? geneInfo[1].slice(3) : 'N/A',
                'name': geneInfo[2] ? geneInfo[2].slice(5) : '',
                'note': geneInfo[3] ? geneInfo[3].slice(5) : '',
                'reversed': d[6] == '-' ? true : false,
                'start': d[3],
                'end': d[4],
                'chromosome': d[0]
            }
        });
    // group the data by chromosome IDs for easy access
    return _.groupBy(processedList, (d) => d.chromosome);
};