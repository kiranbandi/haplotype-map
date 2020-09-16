import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLoaderState, setGenomicData } from '../redux/actions/actions';
import Loader from 'react-loading';
import HapmapChart from './HapmapChart';

class Dashboard extends Component {

    componentDidMount() {
        const { actions } = this.props, { setLoaderState, setGenomicData } = actions;
        const hapmapFilepath = '/data/sample-data.txt';
        // Turn on loader
        setLoaderState(true);
        getGenomicsData(hapmapFilepath).then((data) => {
            // set the genomic data
            setGenomicData(data);
        }).finally(() => {
            // Turn off the loader
            setLoaderState(false);
        });
    }

    render() {
        let { loaderState, genome = {} } = this.props,
            { germplasmLines = [], colorMap = [] } = genome;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {colorMap.length > 0 ?
                            <div>
                                <HapmapChart
                                    width={window.innerWidth*0.95}
                                    height={1000}
                                    germplasmLines={germplasmLines}
                                    colorMap={colorMap} />
                            </div>
                            : <h2 className='text-danger text-xs-center m-t-lg'>No data found</h2>}
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



