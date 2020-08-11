export default class NucleotideColorScheme {
    constructor(dataSet) {
        this.dataSet = dataSet;
        this.stateTable = this.dataSet.stateTable;

        this.colors = {
            greenLight: 'rgb(171,255,171)',
            greenDark: 'green',
            redLight: 'rgb(255,171,171)',
            redDark: 'red',
            blueLight: 'rgb(171,171,255)',
            blueDark: 'blue',
            orangeLight: 'rgb(255,228,171)',
            orangeDark: 'orange',
            white: 'rgb(255,255,255)',
            greyLight: 'rgb(210,210,210)',
            greyDark: 'rgb(192,192,192)',
        };

        this.colorMap = new Map();
        this.colorMap.set('A', { light: this.colors.greenLight, dark: this.colors.greenDark });
        this.colorMap.set('C', { light: this.colors.orangeLight, dark: this.colors.orangeDark });
        this.colorMap.set('G', { light: this.colors.redLight, dark: this.colors.redDark });
        this.colorMap.set('T', { light: this.colors.blueLight, dark: this.colors.blueDark });
        this.colorMap.set('', { light: this.colors.white, dark: this.colors.white });
        this.colorMap.set('-', { light: this.colors.greyLight, dark: this.colors.greyDark });
        this.colorMap.set('+', { light: this.colors.greyLight, dark: this.colors.greyDark });
        this.colorStamps = [];
    }

    getState(germplasm, chromosome, marker) {
        const geno = this.dataSet.genotypeFor(germplasm, chromosome, marker);
        return this.colorStamps[geno];
    }

    // Generates a set of homozygous and heterozygous color stamps from the stateTable
    setupColorStamps(size, font, fontSize) {
        console.log('called')
        this.colorStamps = [];
        this.stateTable.forEach((value, genotype) => {
            let stamp;
            stamp = this.drawGradientSquare(size, genotype, font, fontSize);
            this.colorStamps.push(stamp);
        });
    }

    drawGradientSquare(size, genotype, font, fontSize) {
        const color = this.colorMap.get(genotype.allele1);
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = size;
        gradCanvas.height = size;
        const gradientCtx = gradCanvas.getContext('2d');

        const lingrad = gradientCtx.createLinearGradient(0, 0, size, size);
        lingrad.addColorStop(0, color.dark);
        lingrad.addColorStop(1, color.dark);
        gradientCtx.fillStyle = lingrad;
        gradientCtx.fillRect(0, 0, size, size);

        gradientCtx.fillStyle = 'rgb(0,0,0)';
        gradientCtx.font = font;
        if (size >= 10) {
            const textWidth = gradientCtx.measureText(genotype.allele1).width;
            gradientCtx.fillText(genotype.getText(), (size - textWidth) / 2, (size - (fontSize / 2)));
        }
        return gradCanvas;
    }
}