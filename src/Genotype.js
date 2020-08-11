export default class Genotype {
  constructor(allele1, allele2, isHomozygous) {
    this.allele1 = allele1;
    this.allele2 = allele2;
    this.isHomozygous = isHomozygous;
  }

  getText() {
    return this.isHomozygous ? this.allele1 : this.getHetText();
  }

  getHetText() {
    return `${this.allele1}/${this.allele2}`;
  }

  // Factory method for creating Genotypes from string input, has a default
  // heterozygous genotype separator of /
  static fromString(genotypeString, hetSeparator = '/') {
    const upperCased = genotypeString.toUpperCase();
    let geno;

    if (upperCased.length === 3 && !upperCased.includes(hetSeparator)) {
      throw Error('Encounctered a string which could not be converted into a Genotype');
    }

    if (upperCased === '-' || upperCased === 'NN' || upperCased === 'N/N' || (!upperCased || upperCased.length === 0)) {
      geno = new Genotype('', '', true);
    } else if (upperCased.length === 1) {
      geno = new Genotype(upperCased, upperCased, true);
    } else if (upperCased.length === 2) {
      geno = new Genotype(upperCased[0], upperCased[1], upperCased[0] === upperCased[1]);
    } else if (upperCased.includes(hetSeparator)) {
      const alleles = upperCased.split(hetSeparator);
      geno = new Genotype(alleles[0], alleles[1], alleles[0] === alleles[1]);
    }

    return geno;
  }
}
