import _ from 'lodash';

// worker written in vanilla javascript 
export function process(lineData, sourceLine, TargetLines) {

    // we use a numbering system for denoting matches and mismatches
    // 0 refers to places in the line where data is inconsistent or missing
    // 1 refers to places in the line where it matches with the source Line
    // 2 refers to places in the line where it matches with the 2 line but not 1st
    // 3 refers to places where it doesnt match 1 or 2.






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