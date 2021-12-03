import React, { Component } from 'react';
import { getFile } from '../utils/fetchData';
import processFile from '../utils/processFile';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData, setDashboardDefaults } from '../redux/actions/actions';
import Loader from 'react-loading';
import GeneExpressionMap from './GeneExpressionMap';
import _ from 'lodash';
import { scaleLinear, scaleLog } from 'd3';
import ChartLegend from './ChartLegend';
import GeneList from './GeneList';
import InnerGeneList from './InnerGeneList';
import { CHART_WIDTH } from '../utils/chartConstants';
import FilterPanel from './FilterPanel';
import Tooltip from './Tooltip';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            lineMap: {},
            dataMap: [],
            geneList: [],
            geneReferenceMap: {},
            activeChromosomeID: 0,
            darkTheme: true,
            activeColorScale: 'red'
        }
    }


    setActiveChromosomeID = (ac) => {

        const { geneReferenceMap, DAParray, expressionList, maxGE } = this.state;

        // Group the data by tissue type first
        let { seed_coat, embryo } = _.groupBy(expressionList, e => e.tissueType);

        let GEScale = scaleLog()
            .domain([1, maxGE])
            .range([0, 1]);

        let chromosomeKeys = _.keys(geneReferenceMap),
            activeChromosome = chromosomeKeys[ac.value],
            geneMapList = geneReferenceMap[activeChromosome],
            geneList = _.map(geneMapList, d => d.geneID);

        let seed_coat_map = getLineMAP(seed_coat, DAParray, geneList, GEScale),
            embryo_map = getLineMAP(embryo, DAParray, geneList, GEScale);
        let dataMap = [seed_coat_map, embryo_map];

        this.setState({ dataMap, geneList, 'activeChromosomeID': ac.value });
    }

    setActiveColorScale = (colorScale) => { this.setState({ 'activeColorScale': colorScale.value }) }

    componentDidMount() {
        const { actions, source = 'BL' } = this.props,
            { setLoaderState } = actions, { activeChromosomeID = 0 } = this.state;
        var geneReferenceMap = {};

        getFile('data/LC_genes2.gff3')
            .then((content) => processFile(content, 'gff3'))
            .then((gList) => {
                geneReferenceMap = _.clone(gList);
                return getFile('data/gene_expression.csv');
            })
            .then((data) => {
                // split by line, remove empty lines, seperate by comma
                let rows = data.split('\n').filter(f => f.trim().length > 0).map((d) => d.split(','));
                // process column headers first, remove first gene_id entry
                let columnHeaders = _.map(rows[0].slice(1), (d, entryIndex) => {

                    const infoSplit = d.split('_'),
                        replicate = +infoSplit[1],
                        DAPIndex = d.indexOf('DAP'),
                        genotype = d.slice(0, DAPIndex),
                        tissueType = d.indexOf('C_') > -1 ? 'seed_coat' : 'embryo';
                    let DAP = -1;
                    if (tissueType == 'seed_coat') {
                        DAP = +d.slice(DAPIndex + 3, d.indexOf('C_'));
                    }
                    else {
                        DAP = +d.slice(DAPIndex + 3, d.indexOf('E_'));
                    }
                    return { DAP, replicate, genotype, tissueType, entryIndex };
                });
                let DAParray = _.uniqBy(columnHeaders, d => d.DAP).map((d) => d.DAP).sort();

                // create a map fetchable by entryIndex
                let columnHeaderMap = _.groupBy(columnHeaders, (d) => d.entryIndex), expressionList = [];

                _.map(rows.slice(1), (row) => {
                    let geneID = row[0];
                    let oneGeneIDEntries = _.map(row.slice(1), (value, entryIndex) => {
                        let correspondingEntry = columnHeaderMap[entryIndex][0];
                        return { ...correspondingEntry, geneID, 'expression': +value };
                    });
                    // group by DAP,tissueType and genotype
                    let groupedValues = _.groupBy(oneGeneIDEntries, (d) => d.DAP + '_' + d.genotype + '_' + d.tissueType);

                    _.map(groupedValues, (groupArray) => {
                        let expression = _.meanBy(groupArray, (d) => d.expression);
                        expressionList.push({
                            'DAP': groupArray[0]['DAP'],
                            // log scale push 0 to 1 since log zero is undefined
                            'expression': expression == 0 ? 1 : expression,
                            'tissueType': groupArray[0]['tissueType'],
                            geneID,
                            'genotype': groupArray[0]['genotype']
                        });
                    });
                });

                // Group the data by tissue type first
                let { seed_coat, embryo } = _.groupBy(expressionList, e => e.tissueType);
                // Then find the min and max expression values
                let maxGE = _.maxBy(expressionList, e => e.expression).expression,
                    minGE = _.minBy(expressionList, e => e.expression).expression,
                    GEScale = scaleLog()
                        .domain([1, maxGE])
                        .range([0, 1]);

                let chromosomeKeys = _.keys(geneReferenceMap),
                    activeChromosome = chromosomeKeys[activeChromosomeID],
                    geneMapList = geneReferenceMap[activeChromosome],
                    geneList = _.map(geneMapList, d => d.geneID);


                let seed_coat_map = getLineMAP(seed_coat, DAParray, geneList, GEScale),
                    embryo_map = getLineMAP(embryo, DAParray, geneList, GEScale);
                let dataMap = [seed_coat_map, embryo_map];
                this.setState({ dataMap, geneList, geneReferenceMap, expressionList, minGE, maxGE, DAParray });
            })
            // turn off loader
            .finally(() => { setLoaderState(false) });

    }

    render() {
        const { loaderState, regionStart, regionEnd, isTooltipVisible, tooltipData } = this.props,
            { dataMap = [], geneList = [], geneReferenceMap = {}, minGE, activeChromosomeID, maxGE, activeColorScale, darkTheme = false } = this.state;

        let chromosomeKeys = _.keys(geneReferenceMap),
            activeChromosome = chromosomeKeys[activeChromosomeID];

        // create a reusable horizontal scale for markers
        let chartScale = scaleLinear()
            .domain([0, geneList.length - 1])
            .range([0, CHART_WIDTH]);

        let remappedRegionEnd = regionEnd;
        // If the end position has not been set then set it to a window of 50 pixels
        if (regionStart == 0 && regionEnd == 0) {
            remappedRegionEnd = Math.round(chartScale.invert(50));
        }

        return (
            <div className={'dashboard-root ' + (darkTheme ? 'batman' : '')}>
                {!loaderState ?
                    <div className='dashboard-container m-t'>
                        {_.keys(dataMap).length > 0 ?
                            <div className='text-center'>
                                {isTooltipVisible && <Tooltip {...tooltipData} />}
                                <FilterPanel
                                    chromosomeKeys={chromosomeKeys}
                                    activeChromosomeID={activeChromosomeID}
                                    activeColorScale={activeColorScale}
                                    setActiveChromosomeID={this.setActiveChromosomeID}
                                    setActiveColorScale={this.setActiveColorScale} />
                                <GeneList activeChromosomeID={activeChromosomeID} regionStart={regionStart} regionEnd={remappedRegionEnd} chartScale={chartScale} geneList={geneList} />
                                <GeneExpressionMap geneReferenceMap={geneReferenceMap[activeChromosome]} activeColorScale={activeColorScale}
                                    title={'Tissue Type: Seed Coat'}
                                    regionStart={regionStart} regionEnd={remappedRegionEnd} data={dataMap[0]} geneList={geneList} />
                                <GeneExpressionMap geneReferenceMap={geneReferenceMap[activeChromosome]} activeColorScale={activeColorScale}
                                    title={'Tissue Type: Embryo'}
                                    regionStart={regionStart} regionEnd={remappedRegionEnd} data={dataMap[1]} geneList={geneList} />
                                {/* <InnerGeneList regionStart={regionStart} regionEnd={remappedRegionEnd} chartScale={chartScale} geneList={geneList} /> */}
                                <ChartLegend activeColorScale={activeColorScale} min={minGE} max={maxGE} title={'Gene Expression Level'} />
                            </div>
                            : <h2 className='text-primary text-xs-center m-t-lg'>Processing Data... </h2>}
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
        regionStart: state.oracle.regionStart,
        regionEnd: state.oracle.regionEnd,
        isTooltipVisible: state.oracle.isTooltipVisible,
        tooltipData: state.oracle.tooltipData
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


function getLineMAP(data, DAParray, geneList, GEScale) {
    let lineMap = {};
    let oneDataGroupedByGenotype = _.groupBy(data, (d) => d.genotype);
    _.map(oneDataGroupedByGenotype, (genotypeData, genotype) => {
        let groupedByGeneID = _.groupBy(genotypeData, d => d.geneID);
        let localStore = {};
        _.map(DAParray, DAP => { localStore[DAP] = []; });
        _.map(geneList, (geneID) => {
            let geneIDentries = groupedByGeneID[geneID],
                groupedByDAP = _.groupBy(geneIDentries, d => d.DAP);
            _.map(groupedByDAP, (values, DAP) => {
                let value = GEScale(values[0].expression);
                localStore[DAP].push(value);
            });
        });
        lineMap[genotype] = localStore;
    });
    return lineMap;
}