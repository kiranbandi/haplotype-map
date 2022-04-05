import React, { Component } from 'react';
import { getFile, getAndProcessFile } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData, setDashboardDefaults } from '../redux/actions/actions';
import Loader from 'react-loading';
import colorLines from '../utils/colorLines';
import splitLinesbyChromosomes from '../utils/splitLinesbyChromosomes';
import GenomeMap from './GenomeMap';
import Tooltip from './Tooltip';
import SubGenomeChartWrapper from './SubGenomeChartWrapper';
import FilterPanel from './FilterPanel';
import '../utils/phylotree';
import d3v3 from '../utils/d3v3';
import _ from 'lodash';


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
        const { genome = {}, sourceLine,
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
        const { actions, source = 'topas' } = this.props,
            { setLoaderState, setGenomicData, setDashboardDefaults } = actions,
            fullpath = './',
            hapmapFilepath = fullpath + 'data/' + source + '_lines.txt',
            gff3Path = fullpath + 'data/' + source + '_genes.gff3',
            treeFilepath = fullpath + 'data/' + source + '_tree.txt',
            traitPath = fullpath + 'data/' + source + '_traits.txt';

        let genomicData = {};
        // Turn on loader
        setLoaderState(true);
        // Start fetching all required files
        getAndProcessFile(gff3Path, 'gff3')
            .then((geneMap) => {
                genomicData['geneMap'] = geneMap;
                return getAndProcessFile(hapmapFilepath, 'hapmap')
            })
            .then((hapmapData) => {
                const { germplasmLines, genomeMap, germplasmData } = hapmapData;

                genomicData = { ...genomicData, germplasmLines, genomeMap, germplasmData };
                // set the genomic data
                setGenomicData({ germplasmLines, genomeMap, germplasmData, ...genomicData });
                // make a redux call to set default source and target lines 
                // then set the default selected chromosome as the first one

                setDashboardDefaults(germplasmLines[0],
                    germplasmLines.slice(1, 8),
                    _.keys(genomeMap)[0]);
                // turn on button loader
                this.setState({ 'buttonLoader': true });
                // turn on loader and then trigger data comparision in web worker
                colorLines(germplasmData, [germplasmLines[0], ...germplasmLines.slice(1, 8)])
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
            selectedChromosome = '', referenceType,
            selectedTrait, activeTraitList,
            regionEnd = '', regionStart = '', colorScheme,
            isTooltipVisible, tooltipData } = this.props,
            { genomeMap, treeMap, germplasmData,
                germplasmLines, cnvMap = {},
                geneMap = {}, traitList = [], traitMap = [],
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
                                {/* code chunk to show tooltip*/}
                                {isTooltipVisible && <Tooltip {...tooltipData} />}
                                <GenomeMap
                                    colorScheme={colorScheme}
                                    referenceType={referenceType}
                                    treeMap={treeMap}
                                    genomeMap={genomeMap}
                                    lineMap={lineMap}
                                    cnvMap={cnvMap}
                                    traitMap={traitMap}
                                    traitList={activeTraitList}
                                    trackMap={trackMap}
                                    geneMap={geneMap} />
                                {selectedChromosome.length > 0 &&
                                    <SubGenomeChartWrapper
                                        colorScheme={colorScheme}
                                        selectedTrait={selectedTrait}
                                        traitMap={traitMap}
                                        traitList={activeTraitList}
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
        selectedTrait: state.oracle.trait,
        activeTraitList: state.oracle.activeTraitList,
        isTooltipVisible: state.oracle.isTooltipVisible,
        tooltipData: state.oracle.tooltipData
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);




