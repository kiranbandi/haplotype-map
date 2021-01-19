import { color } from 'd3';
import _ from 'lodash';
// worker to perform computationally intese process of comparision in a different thread
export function process(lineCollection, targetLines, colorScheme = 'difference') {

    if (colorScheme == 'difference' && targetLines.length <= 10) {
        // we use a numbering system for denoting matches and mismatches
        // 0 refers to places in the line where data is inconsistent or missing
        // 1 refers to places in the line where it matches with the source Line
        // 2 refers to places in the line where it matches with the 2 line but not 1st
        // 3 refers to places where it doesnt match 1 or 2.
        //  and so on... 
        return _.map(targetLines, (lineName, targetIndex) => {
            return {
                lineName,
                'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                    if (pair == 'NN' || pair.trim() == '') return 0;
                    var iterator = 0;
                    while (iterator < targetIndex) {
                        let targetPair = lineCollection[targetLines[iterator]][pairIndex];
                        if (pair == targetPair || pair[0] == targetPair[0] || pair[1] == targetPair[1]) {
                            return iterator + 1;
                        }
                        iterator += 1;
                    }
                    return targetIndex + 1;
                })
            }
        });
    }
    else if (colorScheme == 'differenceNoPartial' && targetLines.length <= 10) {
        // we use a numbering system for denoting matches and mismatches
        // 0 refers to places in the line where data is inconsistent or missing
        // 1 refers to places in the line where it matches with the source Line
        // 2 refers to places in the line where it matches with the 2 line but not 1st
        // 3 refers to places where it doesnt match 1 or 2.
        //  and so on... 
        return _.map(targetLines, (lineName, targetIndex) => {
            return {
                lineName,
                'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                    if (pair == 'NN' || pair.trim() == '') return 0;
                    var iterator = 0;
                    while (iterator < targetIndex) {
                        let targetPair = lineCollection[targetLines[iterator]][pairIndex];
                        if (pair == targetPair) {
                            return iterator + 1;
                        }
                        iterator += 1;
                    }
                    return targetIndex + 1;
                })
            }
        });
    }
    // For heterozygous pairing color scheme, 
    // missing pairs are white and homo pairs are blue/1
    // and hetero pairs are in red/2
    else if (colorScheme == 'hetero') {
        return _.map(targetLines, (lineName, targetIndex) => {
            return {
                lineName,
                'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                    if (pair == 'NN' || pair.trim() == '') return 0;
                    else if (pair[0] == pair[1]) return 1;
                    else return 3;
                })
            }
        });
    }
    // For nucleotide color scheme, 
    // missing pairs are white and AA are blue/1
    // GG are red/3
    // CC are orange/2
    // TT are li
    // all others are purple 
    else if (colorScheme == 'nucleotide') {
        return _.map(targetLines, (lineName, targetIndex) => {
            return {
                lineName,
                'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                    if (pair == 'NN' || pair.trim() == '') return 0;
                    else if (pair == 'AA') return 1;
                    else if (pair == 'GG') return 2;
                    else if (pair == 'CC') return 5;
                    else if (pair == 'TT') return 6;
                    else return 7;
                })
            }
        });
    }
    // when there are more than ten lines, we switch to a 
    // basic coloring scheme where missing is 0, match is 1 and mismatch with first line is 3 which is color for red
    else if (colorScheme == "differenceNoPartial") {
        return _.map(targetLines, (lineName, targetIndex) => {
            return {
                lineName,
                'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                    if (pair == 'NN' || pair.trim() == '') return 0;
                    let targetPair = lineCollection[targetLines[0]][pairIndex];
                    if (pair == targetPair) return 1;
                    return 3;
                })
            }
        });
    }
    else {
        return _.map(targetLines, (lineName, targetIndex) => {
            return {
                lineName,
                'lineData': _.map(lineCollection[lineName], (pair, pairIndex) => {
                    if (pair == 'NN' || pair.trim() == '') return 0;
                    let targetPair = lineCollection[targetLines[0]][pairIndex];
                    if (pair == targetPair || pair[0] == targetPair[0] || pair[1] == targetPair[1]) {
                        return 1;
                    }
                    return 3;
                })
            }
        });
    }
};