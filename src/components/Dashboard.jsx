import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData } from '../redux/actions/actions';
import Loader from 'react-loading';
import compareLines from '../utils/compareLines';
import { setSourceLine, setTargetLines } from '../redux/actions/actions';
import HapmapChart from './HapmapChart';
import { FilterPanel } from './';

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            colorMap: []
        }
    }

    triggerCompare = () => {
        const { genome = {}, sourceLine, targetLines } = this.props,
            { germplasmData } = genome,
            selectedLines = [sourceLine, ...targetLines];
        this.setState({ 'buttonLoader': true, colorMap: [] });
        // turn on loader and then trigger data comparision in web worker
        compareLines(germplasmData, selectedLines)
            .then((colorMap) => this.setState({ colorMap, 'buttonLoader': false }))
            .catch(() => {
                alert("Sorry there was an error in comparing the lines");
                this.setState({ 'buttonLoader': true });
            })
    }

    componentDidMount() {
        const { actions } = this.props,
            { setLoaderState, setGenomicData,
                setTargetLines, setSourceLine } = actions;
        const hapmapFilepath = 'data/smaller.txt';
        // Turn on loader
        setLoaderState(true);
        getGenomicsData(hapmapFilepath).then((data) => {

            const germplasmLines = data.germplasmLines;
            // set the genomic data
            setGenomicData(data);
            // make a redux call to set default source and target lines
            setSourceLine(germplasmLines[0]);
            setTargetLines(germplasmLines.slice(1));
            // turn on button loader
            this.setState({ 'buttonLoader': true });
            // turn on loader and then trigger data comparision in web worker
            compareLines(data.germplasmData, germplasmLines)
                .then((colorMap) => this.setState({ colorMap, 'buttonLoader': false }))
                .catch(() => {
                    alert("Sorry there was an error in comparing the lines");
                    this.setState({ 'buttonLoader': true });
                })
        })
            // turn off loader
            .finally(() => { setLoaderState(false) });
    }

    render() {
        const { loaderState, genome = {} } = this.props,
            { genomeMap, germplasmLines } = genome, colorMapList = {},
            { colorMap = [], buttonLoader = false } = this.state;

        _.map(genomeMap, (chr, chrID) => {
            colorMapList[chrID] = _.map(colorMap,
                (cMap) => cMap.lineMap.slice(chr.startIndex, chr.endIndex + 1))
        });

        let width = window.innerWidth * 0.95,
            selectedLines = _.map(colorMap, (d) => d.lineName);

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <FilterPanel
                            germplasmLines={germplasmLines}
                            triggerCompare={this.triggerCompare} />
                        {colorMap.length > 0 ?
                            <div>
                                <HapmapChart
                                    label={'Chrom 1'}
                                    names={selectedLines}
                                    width={width}
                                    colorMap={colorMapList['Chr1']} />
                            </div>
                            : <h2 className='text-danger text-xs-center m-t-lg'>
                                {buttonLoader ? 'Generating Haplotype Map...' : 'No data found'}
                            </h2>}
                    </div>
                    : <Loader className='loading-spinner' type='spin' height='100px' width='100px' color='#d6e5ff' delay={- 1} />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setLoaderState, setGenomicData,
            setSourceLine, setTargetLines
        }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        loaderState: state.oracle.loaderState,
        genome: state.genome,
        sourceLine: state.oracle.sourceLine,
        targetLines: state.oracle.targetLines
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



