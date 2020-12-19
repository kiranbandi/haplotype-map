import _ from 'lodash';
// worker to perform computationally intese process of comparision in a different thread
export function process(lineCollection, targetLines) {
    // we use a numbering system for denoting matches and mismatches
    // 0 refers to places in the line where data is inconsistent or missing
    // 1 refers to places in the line where it matches with the source Line
    // 2 refers to places in the line where it matches with the 2 line but not 1st
    // 3 refers to places where it doesnt match 1 or 2.
    //  and so on... 
    var originalLines = _.map(targetLines, (lineName, targetIndex) => {
        return {
            lineName,
            'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                if (pair == 'NN' || pair.trim() == '') return 0;
                // var iterator = 0;
                // while (iterator < targetIndex) {
                let targetPair = lineCollection[targetLines[0]][pairIndex];
                if (pair == targetPair || pair[0] == targetPair[0] || pair[1] == targetPair[1]) {
                    return 1;
                } else return 2;
                // iterator += 1;
                // }
                // return targetIndex + 1;
            })
        }
    });

    var sortedLines = _.sortBy(originalLines.slice(1), (d) => _.countBy(d.lineData, (e) => e == 2).true);

    return [originalLines[0], ...(_.reverse(sortedLines))];
    // return originalLines;
};