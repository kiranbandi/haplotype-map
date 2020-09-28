import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData } from '../redux/actions/actions';
import Loader from 'react-loading';
import compareLines from '../utils/compareLines';
import splitLinesbyChromosomes from '../utils/splitLinesbyChromosomes';
import { setSourceLine, setTargetLines } from '../redux/actions/actions';
import HapmapChart from './RegionMap';
import GenomeMap from './GenomeMap';
import { FilterPanel } from './';

const chartWidth = window.innerWidth * 0.95;

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonLoader: false,
            lineMap: {}
        }
    }

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
        const { actions } = this.props,
            { setLoaderState, setGenomicData,
                setTargetLines, setSourceLine } = actions;
        const hapmapFilepath = 'data/smaller.txt';
        // Turn on loader
        setLoaderState(true);
        getGenomicsData(hapmapFilepath).then((data) => {
            const { germplasmLines, genomeMap, germplasmData } = data;
            // set the genomic data
            setGenomicData(data);
            // make a redux call to set default source and target lines
            setSourceLine(germplasmLines[0]);
            setTargetLines(germplasmLines.slice(1));
            // turn on button loader
            this.setState({ 'buttonLoader': true });
            // turn on loader and then trigger data comparision in web worker
            compareLines(germplasmData, germplasmLines)
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
        const { loaderState, genome = {} } = this.props,
            { genomeMap, germplasmLines } = genome,
            { lineMap = {}, buttonLoader = false } = this.state;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <FilterPanel
                            germplasmLines={germplasmLines}
                            triggerCompare={this.triggerCompare} />
                        {_.keys(lineMap).length > 0 ?
                            <div>
                                <GenomeMap
                                    width={chartWidth}
                                    genomeMap={genomeMap}
                                    lineMap={lineMap}
                                />
                                <HapmapChart
                                    label={'Chrom 1'}
                                    width={chartWidth}
                                    genomeMap={genomeMap['Chr1']}
                                    lineMap={lineMap['Chr1']} />
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



