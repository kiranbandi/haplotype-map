import { schemeTableau10 } from 'd3';

module.exports = {
    'missingColor': 'white',
    'matchColor': schemeTableau10[0],
    'colorList': [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    'trackLineHeight': 17.5,
    'labelWidth': 75
};