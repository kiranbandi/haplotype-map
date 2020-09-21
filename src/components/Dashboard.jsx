import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData } from '../redux/actions/actions';
import Loader from 'react-loading';
import compareLines from '../utils/compareLines';
import HapmapChart from './HapmapChart';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            colorMap: []
        }
        this.compareMap = this.compareMap.bind(this);
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
                .then((colorMap) => this.setState({ colorMap, 'buttonLoader': false }))
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
            { colorMap = [], buttonLoader = false } = this.state;

        _.map(genomeMap, (chr, chrID) => {
            colorMapList[chrID] = _.map(colorMap, (cMap) => cMap.slice(chr.start, chr.end + 1))
        });

        const width = window.innerWidth * 0.95;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {colorMap.length > 0 ?
                            <div>
                                <HapmapChart
                                    label={'ALL'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMap} />
                                <HapmapChart
                                    label={'Chr1'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr1']} />
                                <HapmapChart
                                    label={'Chr2'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr2']} />
                                <HapmapChart
                                    label={'Chr3'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr3']} />
                                <HapmapChart
                                    label={'Chr4'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr4']} />
                                <HapmapChart
                                    label={'Chr5'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr5']} />
                                <HapmapChart
                                    label={'Chr6'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr6']} />
                                <HapmapChart
                                    label={'Chr7'}
                                    names={germplasmLines}
                                    width={width} height={215}
                                    colorMap={colorMapList['Chr7']} />
                            </div>
                            : <h2 className='text-danger text-xs-center m-t-lg'>{buttonLoader ? 'Data fetch complete.Generating Haplotype Map...' : 'No data found'}</h2>}
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



