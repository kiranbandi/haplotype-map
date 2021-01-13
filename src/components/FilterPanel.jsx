import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSourceLine, setTargetLines } from '../redux/actions/actions';

class FilterPanel extends Component {

    onSourceChange = (sourceLine) => { this.props.actions.setSourceLine(sourceLine.value) }
    onTargetChange = (targetLines) => { this.props.actions.setTargetLines(_.map(targetLines, (d) => d.value)) }

    render() {
        const { germplasmLines = [],
            sourceLine = '', targetLines = [] } = this.props,
            lineOptions = _.map(germplasmLines,
                (d) => { return { 'label': d, 'value': d } }),
            modifiedSourceLine = { 'label': sourceLine, 'value': sourceLine },
            modifiedTargetLines = _.map(targetLines,
                (d) => { return { 'label': d, 'value': d } })


        return (
            <div className='filter-panel text-center'>
                <div className="line-select">
                    <span className='inner-span'>Source Germplasm Line</span>
                    <ReactSelect
                        className='select-box source'
                        value={modifiedSourceLine}
                        options={lineOptions}
                        styles={{
                            option: (styles) => ({
                                ...styles,
                                color: 'black', textAlign: 'left'
                            })
                        }}
                        onChange={this.onSourceChange} />
                </div>
                {/* <div className="line-select">
                    <span className='inner-span'>Target Germplasm Lines</span>
                    <ReactSelect
                        isMulti
                        className='select-box'
                        value={modifiedTargetLines}
                        options={lineOptions}
                        styles={{
                            option: (styles) => ({
                                ...styles,
                                color: 'black', textAlign: 'left'
                            })
                        }}
                        onChange={this.onTargetChange} />
                </div> */}
                <button className='btn btn-primary-outline compare-button'
                    onClick={this.props.triggerCompare}> COMPARE
                    </button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        sourceLine: state.oracle.sourceLine,
        targetLines: state.oracle.targetLines
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ setSourceLine, setTargetLines }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterPanel);