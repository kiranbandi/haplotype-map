import axios from 'axios';
import GenotypeCanvas from './GenotypeCanvas';
import CanvasController from './CanvasController';
import GenotypeImporter from './GenotypeImporter';
import NucleotideColorScheme from './NucleotideColorScheme';
import DataSet from './DataSet';

export default function GenotypeRenderer() {
    const genotypeRenderer = {};
    // Variables for referring to the genotype canvas
    let genotypeCanvas;
    const boxSize = 1;
    let colorScheme;
    let genomeMap;
    let dataSet;

    function createRendererComponents(domParent, width, height) {
        const canvasHolder = document.getElementById(domParent.slice(1));
        genotypeCanvas = new GenotypeCanvas(width, height, boxSize);
        canvasHolder.append(genotypeCanvas.canvas);
        new CanvasController(genotypeCanvas);
    }

    genotypeRenderer.render = function render(domParent, width, height) {

        createRendererComponents(domParent, width, height);
        axios.get('data.txt').then((response) => {

            let dataLines = response.data.split('\n');
            let germplasmNames = dataLines[0].split('\t').slice(-20);

            var locusList = [];
            let germplasmDataFile = germplasmNames.map((d) => {
                return [d];
            })

            dataLines.slice(1).slice(0, 12500).map((line, index) => {
                let lineContents = line.split('\t');
                locusList.push(lineContents[0]);
                lineContents.slice(-20).map((d) => {
                    if (d[0] == d[1]) {
                        return d[0] == 'N' ? '' : d[0];
                    } else if (d[0] == 'N' || d[1] == 'N') {
                        return '';
                    }
                    return '';
                }).map((allele, innerIndex) => {
                    germplasmDataFile[innerIndex].push(allele);
                })
            });

            let fileContents = '\t' + locusList.join('\t');
            fileContents = fileContents + '\n' + germplasmDataFile.map((d) => d.join('\t')).join('\n');

            const genotypeImporter = new GenotypeImporter();

            genomeMap = genotypeImporter.createFakeMap(fileContents);

            const germplasmData = genotypeImporter.parseFile(fileContents);
            const { stateTable } = genotypeImporter;
            dataSet = new DataSet(genomeMap, germplasmData, stateTable);
            colorScheme = new NucleotideColorScheme(dataSet);

            genotypeCanvas.init(dataSet, colorScheme);
            genotypeCanvas.prerender();

        })

    };

    return genotypeRenderer;
}