import React, { Component } from 'react';
import ReactSelect from 'react-select';

export default class FilterPanel extends Component {


    constructor(props) {
        super(props);
        this.state = {
            sourceLine: '',
            targetLines: []
        }
    }

    onSourceChange = (sourceLine) => { this.setState({ sourceLine }) }
    onTargetChange = (targetLines) => { this.setState({ targetLines }) }

    onSubmit = () => {
        const { sourceLine = '', targetLines = [] } = this.state;
        if (sourceLine && sourceLine.value.length > 0 && targetLines.length > 0) {
            this.props.triggerCompare([sourceLine, ...targetLines].map((d) => d.value));
        }
    }

    render() {
        const { germplasmLines = [] } = this.props,
            { source, targetLines } = this.state,
            lineOptions = _.map(germplasmLines, (d) => { return { 'label': d, 'value': d } });

        return (
            <div className='filter-panel text-center'>
                <div className="line-select">
                    <span className='inner-span'>Source Germplasm Line</span>
                    <ReactSelect
                        className='select-box'
                        value={_.find(lineOptions, (entry) => entry.value == source)}
                        options={lineOptions}
                        styles={{ option: (styles) => ({ ...styles, color: 'black', textAlign: 'left' }) }}
                        onChange={this.onSourceChange} />
                </div>
                <div className="line-select">
                    <span className='inner-span'>Target Germplasm Lines</span>
                    <ReactSelect
                        isMulti
                        className='select-box'
                        value={targetLines}
                        options={lineOptions}
                        styles={{ option: (styles) => ({ ...styles, color: 'black', textAlign: 'left' }) }}
                        onChange={this.onTargetChange} />
                </div>
                <button className='btn btn-primary-outline compare-button' onClick={this.onSubmit}>SUBMIT</button>
            </div>
        );
    }
}

