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
    FileLines.slice(1).forEach(function(line, index) {
        if (line.trim().length > 0) {
            var lineData = line.split('\t').map((d) => d.trim());
            genomeStore.push({
                index,
                'allele': lineData[1],
                'chromosomeID': lineData[2],
                'position': lineData[3]
            })
            _.map(germplasmLines, (d, i) => germplasmData[d].push(lineData[4 + i]));
        }
    });
    // The first line is the same color for everything 
    let colorMap = [];

    // compare every line with the first line
    _.map(germplasmLines, (gp, gpIndex) => {
        colorMap.push(compareLines(germplasmData[germplasmLines[0]], germplasmData[germplasmLines[gpIndex]]));
    });

    // group the map by chromosome ID 
    let genomeMap = {};

    _.map(_.groupBy(genomeStore, (d) => d.chromosomeID), (records, chromosomeIdentifier) => {
        const data = _.sortBy(records, (e) => e.index);
        genomeMap[chromosomeIdentifier] = { data, 'start': data[0].index, 'end': data[data.length - 1].index };
    })

    return { genomeMap, germplasmLines, germplasmData, colorMap };
};


function compareLines(a, b) {



    return _.map(a, (pair, i) => {

        if (pair == undefined || b[i] == undefined) {
            debugger;
        }

        if (pair == 'NN' || b[i] == 'NN' || pair.trim() == '' || b[i].trim() == '') return 2;
        else if (pair == b[i]) return 1;
        else if (pair[0] == b[i][0] || pair[1] == b[i][1]) return 1;
        return 0;
    });
}