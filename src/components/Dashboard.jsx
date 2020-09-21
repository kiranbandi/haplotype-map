import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData } from '../redux/actions/actions';
import Loader from 'react-loading';
import compareLines from '../utils/compareLines';
import HapmapChart from './HapmapChart';
import { FilterPanel } from './';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            colorMap: [],
            selectedLines: []
        }
        this.compareMap = this.compareMap.bind(this);
    }

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
        const hapmapFilepath = 'data/sample-data-new.txt';
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
        let { loaderState, genome = {} } = this.props,
            { genomeMap, germplasmLines } = genome, colorMapList = {},
            { colorMap = [], selectedLines = [], buttonLoader = false } = this.state;

        _.map(genomeMap, (chr, chrID) => {
            colorMapList[chrID] = _.map(colorMap, (cMap) => cMap.slice(chr.start, chr.end + 1))
        });

        const width = window.innerWidth * 0.95;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <FilterPanel
                            triggerCompare={this.triggerCompare}
                            germplasmLines={germplasmLines} />
                        {colorMap.length > 0 ?
                            <div>
                                <HapmapChart
                                    label={'Genome'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMap} />
                                <HapmapChart
                                    label={'Chrom 1'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr1']} />
                                <HapmapChart
                                    label={'Chrom 2'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr2']} />
                                <HapmapChart
                                    label={'Chrom 3'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr3']} />
                                <HapmapChart
                                    label={'Chrom 4'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr4']} />
                                <HapmapChart
                                    label={'Chrom 5'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr5']} />
                                <HapmapChart
                                    label={'Chrom 6'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr6']} />
                                <HapmapChart
                                    label={'Chrom 7'}
                                    names={selectedLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr7']} />
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



