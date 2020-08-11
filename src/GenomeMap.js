import IntervalTree from 'node-interval-tree';

export default class GenomeMap {
    constructor(chromosomes) {
        this.chromosomes = chromosomes;
        // TODO: initialise this value
        this.intervalTree = this.createIntervalTree();
        this.chromosomeStarts = this.calculateChromosomeStarts();
        this.markerIndices = this.calculateMarkerIndices();
    }

    // Creates an interval tree where the key is the range of the start and end of
    // a chromosome in the total marker data set and the value is that chromosome
    createIntervalTree() {
        const tree = new IntervalTree.default();
        let sum = 0;
        this.chromosomes.forEach((c) => {
            const markerCount = c.markerCount();
            tree.insert(sum, sum + markerCount - 1, c);
            sum += markerCount;
        });

        return tree;
    }

    calculateChromosomeStarts() {
        const starts = new Map();
        let sum = 0;
        this.chromosomes.forEach((c) => {
            starts.set(c, sum);
            sum += c.markerCount();
        });

        return starts;
    }

    calculateMarkerIndices() {
        const indices = [];
        this.chromosomes.forEach((chr) => {
            chr.markers.forEach((m, idx) => {
                indices.push(idx);
            });
        });

        return indices;
    }

    chromosomePositionsFor(dataStart, dataEnd) {
        const foundChromosomes = this.intervalTree.search(dataStart, dataEnd);
        const positions = [];
        foundChromosomes.forEach((chromosome) => {
            const chromStart = this.chromosomeStarts.get(chromosome);
            const firstMarker = Math.max(dataStart - chromStart, 0);
            const lastMarker = Math.min(chromosome.markerCount() - 1, dataEnd - chromStart);
            positions.push({ chromosomeIndex: this.chromosomes.indexOf(chromosome), firstMarker, lastMarker });
        });

        return positions;
    }

    markerAt(dataIndex) {
        const foundChromosomes = this.intervalTree.search(dataIndex, dataIndex);
        const chromosome = foundChromosomes[0];
        const chromStart = this.chromosomeStarts.get(chromosome);
        const markerIndex = Math.max(dataIndex - chromStart, 0);

        return { marker: chromosome.markers[markerIndex], markerIndex };
    }

    markerByName(markerName) {
        let found = -1;
        this.chromosomes.forEach((chromosome, idx) => {
            const markerIndex = chromosome.markers.map(m => m.name).indexOf(markerName);
            if (markerIndex !== -1) {
                found = { chromosome: idx, markerIndex };
            }
        });

        return found;
    }

    markerCount() {
        return this.chromosomes.map(c => c.markerCount()).reduce((a, b) => a + b, 0);
    }
}