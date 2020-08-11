export default class NucleotideColorScheme {
    constructor(dataSet) {
        this.dataSet = dataSet;
        this.stateTable = this.dataSet.stateTable;

        this.colors = {
            greenDark: 'green',
            redDark: 'red',
            blueDark: 'blue',
            orangeDark: 'orange',
            white: 'rgb(255,255,255)',
            greyDark: 'rgb(192,192,192)',
        };

        this.colorMap = new Map();
        this.colorMap.set('A', this.colors.greenDark);
        this.colorMap.set('C', this.colors.orangeDark);
        this.colorMap.set('G', this.colors.redDark);
        this.colorMap.set('T', this.colors.blueDark);
        this.colorMap.set('', this.colors.white);
        this.colorMap.set('-', this.colors.greyDark);
        this.colorMap.set('+', this.colors.greyDark);
        this.colorStamps = [];
    }

    getState(germplasm, chromosome, marker) {
        const geno = this.dataSet.genotypeFor(germplasm, chromosome, marker);
        return this.colorStamps[geno];
    }

    // Generates a set of homozygous and heterozygous color stamps from the stateTable
    setupColorStamps(size, font, fontSize) {
        this.colorStamps = [];
        this.stateTable.forEach((value, genotype) => {
            this.colorStamps.push(this.drawSquare(size, genotype, font, fontSize));
        });
    }

    drawSquare(size, genotype, font, fontSize) {
        const squareCanvas = document.createElement('canvas');
        squareCanvas.width = size;
        squareCanvas.height = size * 30;
        const squareCtx = squareCanvas.getContext('2d');
        squareCtx.fillStyle = this.colorMap.get(genotype.allele);
        squareCtx.fillRect(0, 0, size, size * 30 - 2);
        squareCtx.fillStyle = 'rgb(0,0,0)';
        squareCtx.font = font;
        if (size >= 10) {
            const textWidth = squareCtx.measureText(genotype.allele).width;
            squareCtx.fillText(genotype.getText(), (size - textWidth) / 2, (size - (fontSize / 2)));
        }
        return squareCanvas;
    }
}