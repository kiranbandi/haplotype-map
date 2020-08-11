import Genotype from './Genotype';
import GenomeMap from './GenomeMap';
import Chromosome from './Chromosome';

export default class GenotypeImporter {
    constructor(genomeMap) {
        this.rawToGenoMap = new Map();
        this.rawToGenoMap.set('', Genotype.fromString(''));
        this.stateTable = new Map();
        this.stateTable.set(this.rawToGenoMap.get(''), 0);

        this.genomeMap = genomeMap;
        this.markerIndices = new Map();
        this.germplasmList = [];
    }

    getState(genoString) {
        let index = 0;
        try {
            let genotype = this.rawToGenoMap.get(genoString);
            if (genotype === undefined) {
                genotype = Genotype.fromString(genoString);
                this.rawToGenoMap.set(genoString, genotype);
            }

            index = this.stateTable.get(genotype);

            // If the genotype is not found in the map, we have a new genotype, so set
            // its index in the map to the size of the map
            if (index === undefined) {
                index = this.stateTable.size;
                this.stateTable.set(genotype, index);
            }
        } catch (error) {
            console.log(error);
        }
        return index;
    }

    initGenotypeData() {
        const data = [];
        this.genomeMap.chromosomes.forEach((chromosome) => {
            data.push(Array(chromosome.markerCount()).fill(0));
        });

        return data;
    }

    processFileLine(line) {
        if (line.startsWith('#') || (!line || line.length === 0)) {
            return;
        }
        if (line.startsWith('Accession') || line.startsWith('\t')) {
            const markerNames = line.split('\t');
            markerNames.slice(1).forEach((name, idx) => {
                const indices = this.genomeMap.markerByName(name);
                if (indices !== -1) {
                    this.markerIndices.set(idx, indices);
                }
            });
            return;
        }
        const tokens = line.split('\t');
        const name = tokens[0];
        const genotypeData = this.initGenotypeData();
        tokens.slice(1).forEach((state, idx) => {
            const indices = this.markerIndices.get(idx);
            if (indices !== undefined && indices !== -1) {
                genotypeData[indices.chromosome][indices.markerIndex] = this.getState(state);
            }
        });
        const germplasm = { name, genotypeData };
        this.germplasmList.push(germplasm);
    }

    parseFile(fileContents) {
        const lines = fileContents.split(/\r?\n/);
        for (let line = 0; line < lines.length; line += 1) {
            this.processFileLine(lines[line]);
        }
        return this.germplasmList;
    }

    // In situations where a map hasn't been provided, we want to create a fake or
    // dummy map one chromosome and evenly spaced markers
    createFakeMap(fileContents) {
        const lines = fileContents.split(/\r?\n/);
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
            const line = lines[lineIndex];
            if (!line.startsWith('#')) {
                if (line.startsWith('Accession') || line.startsWith('\t')) {
                    const markers = [];
                    const markerNames = line.split('\t');
                    // Use the genotype data format's header line to map marker names to
                    // a 0 to length range of indices which double up as marker positions
                    // for mapless loading
                    markerNames.slice(1).forEach((name, idx) => {
                        const marker = { name, 'chromosome': 'unmapped', 'position': idx };
                        markers.push(marker);
                    });
                    const chromosomes = [];
                    chromosomes.push(new Chromosome('unmapped', markers.length, markers));
                    this.genomeMap = new GenomeMap(chromosomes);
                    return this.genomeMap;
                }
            }
        }
        return this.genomeMap;
    }
}