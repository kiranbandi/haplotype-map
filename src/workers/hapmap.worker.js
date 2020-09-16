import _ from 'lodash';

// worker written in vanilla javascript 
export function process(hapmapData) {

    var FileLines = hapmapData.split('\n'),
        germplasmLines = FileLines[0].split('\t').map((d) => d.trim()).slice(1),
        germplasmData = {},
        genomeMap = {},
        mapCount = 0,
        germplasmCount = germplasmLines.length;

    // create placeholder for each germplasm line
    _.map(germplasmLines, (d) => germplasmData[d] = []);

    // remove the first line and then process the file line by line
    FileLines.slice(1).forEach(function(line, index) {
        if (line.trim().length > 0) {
            var lineData = line.split('\t').map((d) => d.trim());
            genomeMap[lineData[0]] = {
                index,
                'allele': lineData[1],
                'chromosomeID': lineData[2],
                'position': lineData[3]
            }
            _.map(germplasmLines, (d, i) => germplasmData[d].push(lineData[4 + i]));
            mapCount += 1;
        }
    });
    // The first line is the same color for everything 
    var colorMap = [];

    // compare every line with the first line
    _.map(germplasmLines, (gp, gpIndex) => {
        colorMap.push(compareLines(germplasmData[germplasmLines[0]], germplasmData[germplasmLines[gpIndex]]));
    });

    return { genomeMap, germplasmLines, germplasmData, colorMap };
};


function compareLines(a, b) {
    return _.map(a, (pair, i) => {
        if (pair == 'NN' || b[i] == 'NN' || pair.trim() == '' || b[i].trim() == '') return 2;
        else if (pair == b[i]) return 1;
        else if (pair[0] == b[i][0] || pair[1] == b[i][1]) return 1;
        return 0;
    });
}