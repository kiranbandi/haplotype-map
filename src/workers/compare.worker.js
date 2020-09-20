import _ from 'lodash';

// worker written in vanilla javascript 
export function process(lineData, sourceLine, TargetLines) {

    var colorMap = [];

    return { colorMap };
};


function compareLines(a, b) {
    return _.map(a, (pair, i) => {
        if (pair == 'NN' || b[i] == 'NN' || pair.trim() == '' || b[i].trim() == '') return 2;
        else if (pair == b[i]) return 1;
        else if (pair[0] == b[i][0] || pair[1] == b[i][1]) return 1;
        return 0;
    });
}