import React, { Component } from 'react';
import { getAndProcessFile } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData, setDashboardDefaults } from '../redux/actions/actions';
import Loader from 'react-loading';
import compareLines from '../utils/compareLines';
import splitLinesbyChromosomes from '../utils/splitLinesbyChromosomes';
import GenomeMap from './GenomeMap';
import TreeMap from './TreeMap';
import SubGenomeChartWrapper from './SubGenomeChartWrapper';
import FilterPanel from './FilterPanel';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            lineMap: {},
            darkTheme: false
        }
    }

    toggleTheme = () => { this.setState({ 'darkTheme': !this.state.darkTheme }) }

    triggerCompare = () => {
        const { genome = {}, sourceLine, targetLines } = this.props,
            { germplasmData, genomeMap } = genome,
            selectedLines = [sourceLine, ...targetLines];

        this.setState({ 'buttonLoader': true, lineMap: [] });
        // turn on loader and then trigger data comparision in web worker
        compareLines(germplasmData, selectedLines)
            .then((result) => {
                let lineMap = splitLinesbyChromosomes(result, genomeMap);
                this.setState({ lineMap, 'buttonLoader': false });
            })
            .catch(() => {
                alert("Sorry there was an error in comparing the lines");
                this.setState({ 'buttonLoader': true });
            })
    }

    componentDidMount() {
        const { actions, source = 'CDC_lines' } = this.props,
            { setLoaderState, setGenomicData, setDashboardDefaults } = actions,
            fullpath = window.location.protocol + '//' + window.location.host + '/' + process.env.DATADIR_PATH,
            hapmapFilepath = fullpath + 'data/' + source + '.txt',
            cnvFilepath = fullpath + 'data/cnvList.txt',
            gff3Path = fullpath + 'data/filteredGenes.gff3',
            geneDensityPath = fullpath + 'data/resistantGeneDensity.txt',
            treeFilepath = fullpath + 'data/bn.newick';

        let genomicData = {};
        // Turn on loader
        setLoaderState(true);
        // Start fetching all required files
        getAndProcessFile(hapmapFilepath, 'hapmap')
            .then((hapmapData) => {
                const { germplasmLines, genomeMap, germplasmData } = hapmapData;
                genomicData = { germplasmLines, genomeMap, germplasmData };
                return getAndProcessFile(treeFilepath, 'newick');
                //     return getAndProcessFile(cnvFilepath, 'cnv');
            })
            .then((treeMap) => {
                genomicData['treeMap'] = treeMap;
                return getAndProcessFile(gff3Path, 'gff3');
            })
            // .then((cnvMap) => {
            //     genomicData['cnvMap'] = cnvMap;
            //     return getAndProcessFile(geneDensityPath, 'track');
            // })
            // .then((trackMap) => {
            //     genomicData['trackMap'] = trackMap;
            //     return getAndProcessFile(gff3Path, 'gff3');
            // })
            .then((geneMap) => {
                genomicData['geneMap'] = geneMap;
                const { germplasmLines, genomeMap, germplasmData } = genomicData;
                // set the genomic data
                setGenomicData(genomicData);
                // make a redux call to set default source and target lines 
                // then set the default selected chromosome as the first one
                setDashboardDefaults(germplasmLines[0], germplasmLines.slice(1, 51), _.keys(genomeMap)[0]);
                // turn on button loader
                this.setState({ 'buttonLoader': true });
                // turn on loader and then trigger data comparision in web worker
                compareLines(germplasmData, germplasmLines.slice(0, 10))
                    .then((result) => {
                        let lineMap = splitLinesbyChromosomes(result, genomeMap);
                        this.setState({ lineMap, 'buttonLoader': false });
                    })
                    .catch(() => {
                        alert("Sorry there was an error in comparing the lines");
                        this.setState({ 'buttonLoader': true });
                    })
            })
            // turn off loader
            .finally(() => { setLoaderState(false) });
    }

    render() {
        const { loaderState, genome = {},
            selectedChromosome = '', regionEnd = '', regionStart = '' } = this.props,
            { genomeMap, treeMap, germplasmLines, cnvMap, geneMap, trackMap = { 'chromosomeMap': {} } } = genome,
            { lineMap = {}, buttonLoader = false, darkTheme = false } = this.state;

        return (
            <div className={'dashboard-root ' + (darkTheme ? 'batman' : '')}>
                <button onClick={this.toggleTheme} className='theme-button'>&#9680;</button>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <FilterPanel
                            germplasmLines={germplasmLines}
                            triggerCompare={this.triggerCompare} />
                        {/* // Show the basic genome map once lineMap data is available */}
                        {_.keys(lineMap).length > 0 ?
                            <div>
                                <TreeMap
                                    treeMap={treeMap} />
                                <GenomeMap
                                    genomeMap={genomeMap}
                                    lineMap={lineMap}
                                    cnvMap={cnvMap}
                                    trackMap={trackMap}
                                    geneMap={geneMap} />
                                {/* {selectedChromosome.length > 0 &&
                                    <SubGenomeChartWrapper
                                        regionStart={regionStart}
                                        regionEnd={regionEnd}
                                        genomeMap={genomeMap[selectedChromosome]}
                                        lineMap={lineMap[selectedChromosome]}
                                        trackMap={trackMap.chromosomeMap[selectedChromosome]}
                                        cnvMap={cnvMap[selectedChromosome] || {}}
                                        geneMap={geneMap[selectedChromosome] || []} />} */}
                            </div>
                            : <h2 className='text-danger text-xs-center m-t-lg'>
                                {buttonLoader ? <Loader className='loading-spinner' type='spin' height='100px' width='100px' color='#d6e5ff' delay={- 1} /> : 'No data found'}
                            </h2>}
                    </div>
                    : <Loader className='loading-spinner' type='spin' height='100px' width='100px' color='#d6e5ff' delay={- 1} />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ setLoaderState, setGenomicData, setDashboardDefaults }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        loaderState: state.oracle.loaderState,
        genome: state.genome,
        sourceLine: state.oracle.sourceLine,
        targetLines: state.oracle.targetLines,
        selectedChromosome: state.oracle.selectedChromosome,
        regionStart: state.oracle.regionStart,
        regionEnd: state.oracle.regionEnd
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



