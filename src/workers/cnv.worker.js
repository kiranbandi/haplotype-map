import _ from 'lodash';

// worker written in vanilla javascript 
export function process(cnvData) {

    let fileLines = cnvData.split('\n'),
        processedList = _.filter(_.map(fileLines.slice(1), (d) => d.split('\t')), (l) => l.length > 0);

    // let groupedByLine = 

    // let genomeMap = {};

    // _.map(_.groupBy(genomeStore, (d) => d.chromosomeID), (records, chromID) => {
    //     const referenceMap = _.sortBy(records, (e) => e.index),
    //         start = referenceMap[0].position,
    //         startIndex = referenceMap[0].index,
    //         end = referenceMap[referenceMap.length - 1].position,
    //         endIndex = referenceMap[referenceMap.length - 1].index;
    //     // add only if chromosomeID is valid 
    //     // for now let the test factor be containing "Ch"
    //     if (chromID.length <= 3) {
    //         genomeMap[chromID] = { chromID, referenceMap, start, end, startIndex, endIndex };
    //     }
    // });

    // return { genomeMap, germplasmLines, germplasmData };
};