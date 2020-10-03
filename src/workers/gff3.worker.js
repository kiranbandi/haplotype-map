import _ from 'lodash';

// worker written in vanilla javascript 
export function process(cnvData) {

    let fileLines = cnvData.split('\n'),
        processedList = _.filter(_.map(fileLines.slice(1), (d) => d.split('\t')), (l) => l.length > 0);

    return '';
};