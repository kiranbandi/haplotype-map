import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData } from '../redux/actions/actions';
import Loader from 'react-loading';
import compareLines from '../utils/compareLines';
import HapmapChart from './HapmapChart';
import { FilterPanel, NavigationPanel } from './';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            colorMap: [],
            selectedLines: [],
            navigation: {
                type: 'Overview',
                shift: 0,
                zoomLevel: 0
            }
        }
        this.compareMap = this.compareMap.bind(this);
    }

    setNavigation = (navigation) => { this.setState({ navigation }) }

    triggerCompare = (selectedLines) => {
        const { genome = {} } = this.props, { germplasmData } = genome;
        this.setState({ 'buttonLoader': true, colorMap: [], selectedLines });
        // turn on loader and then trigger data comparision in web worker
        compareLines(germplasmData, selectedLines)
            .then((colorMap) => this.setState({ colorMap, 'buttonLoader': false }))
            .catch(() => {
                alert("Sorry there was an error in comparing the lines");
                this.setState({ 'buttonLoader': true });
            })
    }

    compareMap() {
        const { genome = {} } = this.props, { germplasmLines, germplasmData } = genome;
        this.setState({ 'buttonLoader': true });
        // turn on loader and then trigger data comparision in web worker
        compareLines(germplasmData, germplasmLines)
            .then((colorMap) => this.setState({ colorMap, 'buttonLoader': false }))
            .catch(() => {
                alert("Sorry there was an error in comparing the lines");
                this.setState({ 'buttonLoader': true });
            })
    }

    componentDidMount() {
        const { actions } = this.props, { setLoaderState, setGenomicData } = actions;
        const hapmapFilepath = 'data/smaller.txt';
        // Turn on loader
        setLoaderState(true);
        getGenomicsData(hapmapFilepath).then((data) => {
            // set the genomic data
            setGenomicData(data);
            this.setState({ 'buttonLoader': true });
            // turn on loader and then trigger data comparision in web worker
            compareLines(data.germplasmData, data.germplasmLines)
                .then((colorMap) => this.setState({ 'selectedLines': [...data.germplasmLines], colorMap, 'buttonLoader': false }))
                .catch(() => {
                    alert("Sorry there was an error in comparing the lines");
                    this.setState({ 'buttonLoader': true });
                })
        }).finally(() => {
            // Turn off the loader
            setLoaderState(false);
        });
    }

    render() {
        const { loaderState, genome = {} } = this.props,
            { genomeMap, germplasmLines } = genome, colorMapList = {},
            { colorMap = [], selectedLines = [],
                navigation = { 'type': '' }, buttonLoader = false } = this.state;

        _.map(genomeMap, (chr, chrID) => {
            colorMapList[chrID] = _.map(colorMap, (cMap) => cMap.slice(chr.startIndex, chr.endIndex + 1))
        });

        let width = window.innerWidth * 0.95,
            navColorMap = colorMapList[navigation['type']];

        // if (navigation['type'] != 'Overview') {

        //     let chromCoords = genomeMap[navigation['type']],
        //         start, end;

        //     if (navigation.zoomLevel == 0) {
        //         start = chromCoords.start;
        //         end = chromCoords.end + 1;
        //     }
        //     else {

        //         let totalBPwidth = (chromCoords.end + 1 - chromCoords.start);
        //         let stepSize = (totalBPwidth / (navigation.zoomLevel * 2));
        //         start = totalBPwidth / 2 - stepSize + (navigation.shift * stepSize);
        //         end = totalBPwidth / 2 + stepSize + (navigation.shift * stepSize);

        //         if (start < chromCoords.start) { start = chromCoords.start }
        //         if (end > (chromCoords.end + 1)) { end = chromCoords.end }
        //     }
        //     navColorMap = _.map(navColorMap, (cMap) => cMap.slice(start, end + 1));
        // }

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <FilterPanel
                            germplasmLines={germplasmLines}
                            triggerCompare={this.triggerCompare} />
                        <NavigationPanel
                            navigation={navigation}
                            genomeMap={genomeMap}
                            setNavigation={this.setNavigation} />
                        {colorMap.length > 0 ?
                            <div>
                                {navigation['type'] == 'Overview' ? <div>
                                    <HapmapChart
                                        label={'Genome'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMap} />
                                    <HapmapChart
                                        label={'Chrom 1'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr1']} />
                                    <HapmapChart
                                        label={'Chrom 2'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr2']} />
                                    <HapmapChart
                                        label={'Chrom 3'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr3']} />
                                    <HapmapChart
                                        label={'Chrom 4'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr4']} />
                                    <HapmapChart
                                        label={'Chrom 5'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr5']} />
                                    <HapmapChart
                                        label={'Chrom 6'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr6']} />
                                    <HapmapChart
                                        label={'Chrom 7'}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={colorMapList['Chr7']} />
                                </div> :
                                    <HapmapChart
                                        label={navigation['type']}
                                        names={selectedLines}
                                        width={width}
                                        colorMap={navColorMap} />}
                            </div>
                            : <h2 className='text-danger text-xs-center m-t-lg'>{buttonLoader ? 'Generating Haplotype Map...' : 'No data found'}</h2>}
                    </div>
                    : <Loader className='loading-spinner' type='spin' height='100px' width='100px' color='#d6e5ff' delay={- 1} />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setLoaderState,
            setGenomicData
        }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        loaderState: state.oracle.loaderState,
        genome: state.genome,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



