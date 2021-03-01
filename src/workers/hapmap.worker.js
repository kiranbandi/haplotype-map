import _ from 'lodash';

// worker written in vanilla javascript 
export function process(hapmapData) {

    var FileLines = hapmapData.split('\n'),
        germplasmLines = FileLines[0].split('\t').map((d) => d.trim()).slice(11),
        germplasmData = {},
        genomeStore = [];

    // create placeholder for each germplasm line
    _.map(germplasmLines, (d) => germplasmData[d] = []);

    // remove the first line and then process the file line by line
    FileLines.slice(1).forEach(function (line, index) {
        if (line.trim().length > 0) {
            let lineData = line.split('\t').map((d) => d.trim()),
                genomeEntry = {
                    index,
                    'locusName': lineData[0].trim(),
                    'allele': lineData[1],
                    'chromosomeID': lineData[2],
                    'position': lineData[3]
                };

            genomeStore.push(genomeEntry);
            _.map(germplasmLines, (d, i) => germplasmData[d].push(lineData[4 + i]));
        }
    });

    let genomeMap = {};

    _.map(_.groupBy(genomeStore, (d) => d.chromosomeID), (records, chromID) => {
        const referenceMap = _.sortBy(records, (e) => e.index),
            start = referenceMap[0].position,
            startIndex = referenceMap[0].index,
            end = referenceMap[referenceMap.length - 1].position,
            endIndex = referenceMap[referenceMap.length - 1].index;
        // add only if chromosomeID is valid 
        // for now let the test factor be containing "Ch"
        if (chromID.length <= 3) {
            genomeMap[chromID] = { chromID, referenceMap, start, end, startIndex, endIndex };
        }
    });

    return { genomeMap, germplasmLines, germplasmData };
};