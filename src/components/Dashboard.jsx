import React, { Component } from 'react';
import { getFile, getAndProcessFile } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData, setDashboardDefaults } from '../redux/actions/actions';
import Loader from 'react-loading';
import colorLines from '../utils/colorLines';
import splitLinesbyChromosomes from '../utils/splitLinesbyChromosomes';
import GenomeMap from './GenomeMap';
import SubGenomeChartWrapper from './SubGenomeChartWrapper';
import FilterPanel from './FilterPanel';
import '../utils/phylotree';
import d3v3 from '../utils/d3v3';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            lineMap: {},
            darkTheme: true
        }
    }

    toggleTheme = () => { this.setState({ 'darkTheme': !this.state.darkTheme }) }

    triggerCompare = () => {
        const { genome = {}, sourceLine, referenceType,
            targetLines, colorScheme } = this.props,
            { germplasmData, genomeMap } = genome,
            selectedLines = [sourceLine, ...targetLines];

        this.setState({ 'buttonLoader': true, lineMap: [] });
        // turn on loader and then trigger data comparision in web worker
        colorLines(germplasmData, selectedLines, colorScheme)
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
        const { actions, source = 'BN_lines' } = this.props,
            { setLoaderState, setGenomicData, setDashboardDefaults } = actions,
            fullpath = window.location.protocol + '//' + window.location.host + '/' + process.env.DATADIR_PATH,
            hapmapFilepath = fullpath + 'data/' + source + '.txt',
            gff3Path = fullpath + 'data/BN_gene.gff3',
            treeFilepath = fullpath + 'data/bn.newick',
            traitPath = fullpath + 'data/BN_traits.txt';

        let genomicData = {};
        // Turn on loader
        setLoaderState(true);
        // Start fetching all required files
        getAndProcessFile(hapmapFilepath, 'hapmap')
            .then((hapmapData) => {
                const { germplasmLines, genomeMap, germplasmData } = hapmapData;
                genomicData = { germplasmLines, genomeMap, germplasmData };
                return getAndProcessFile(gff3Path, 'gff3');
            })
            .then((geneMap) => {
                genomicData['geneMap'] = geneMap;
                return getFile(traitPath);
            })
            .then((response) => {
                var traitText = response.split('\n'),
                    traitList = traitText[0].split('\t').slice(1),
                    traitMap = traitText.slice(1).map((d) => {
                        var trait = {};
                        _.map(d.split('\t'), (e, i) => {
                            if (i == 0) trait['name'] = isNaN(+e) ? e : +e;
                            else trait[traitList[i - 1]] = isNaN(+e) ? e : +e;
                        });
                        return trait;
                    });
                genomicData['traitMap'] = traitMap;
                genomicData['traitList'] = traitList;
                return getFile(treeFilepath);
            })
            .then((treeMap) => {
                genomicData['treeMap'] = treeMap;
                const { germplasmLines, genomeMap, germplasmData } = genomicData;
                // set the genomic data
                setGenomicData(genomicData);
                // make a redux call to set default source and target lines 
                // then set the default selected chromosome as the first one
                var newickNodes = d3v3.layout.phylotree()(genomicData['treeMap']).get_nodes();
                var nameList = _.filter(newickNodes, (d) => d.name && d.name !== 'root').map((d) => d.name);

                setDashboardDefaults(germplasmLines[0], nameList, _.keys(genomeMap)[0]);
                // turn on button loader
                this.setState({ 'buttonLoader': true });
                // turn on loader and then trigger data comparision in web worker
                colorLines(germplasmData, [germplasmLines[0], ...nameList])
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
            selectedChromosome = '', referenceType, selectedTrait,
            regionEnd = '', regionStart = '', colorScheme } = this.props,
            { genomeMap, treeMap, germplasmData,
                germplasmLines, cnvMap = {}, geneMap = {}, traitList = [], traitMap = [],
                trackMap = { 'chromosomeMap': {} } } = genome,
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
                            <div className='text-center'>
                                <GenomeMap
                                    colorScheme={colorScheme}
                                    referenceType={referenceType}
                                    treeMap={treeMap}
                                    genomeMap={genomeMap}
                                    lineMap={lineMap}
                                    cnvMap={cnvMap}
                                    traitMap={traitMap}
                                    traitList={traitList}
                                    trackMap={trackMap}
                                    geneMap={geneMap} />
                                {selectedChromosome.length > 0 &&
                                    <SubGenomeChartWrapper
                                        colorScheme={colorScheme}
                                        selectedTrait={selectedTrait}
                                        traitMap={traitMap}
                                        traitList={traitList}
                                        referenceType={referenceType}
                                        regionStart={regionStart}
                                        regionEnd={regionEnd}
                                        germplasmData={germplasmData}
                                        genomeMap={genomeMap[selectedChromosome]}
                                        treeMap={treeMap}
                                        lineMap={lineMap[selectedChromosome]}
                                        trackMap={trackMap.chromosomeMap[selectedChromosome] || []}
                                        cnvMap={cnvMap[selectedChromosome] || {}}
                                        geneMap={geneMap[selectedChromosome] || []} />}
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
        colorScheme: state.oracle.colorScheme,
        referenceType: state.oracle.referenceType,
        selectedChromosome: state.oracle.selectedChromosome,
        regionStart: state.oracle.regionStart,
        regionEnd: state.oracle.regionEnd,
        selectedTrait: state.oracle.trait
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



