import React, { Component } from 'react';
import ReactSelect from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default class NavigationPanel extends Component {


    constructor(props) {
        super(props);
        this.state = {
            sliderValue: 0
        }
    }

    onNavOptionChange = (navOption) => {
        let { navigation = {} } = this.props;
        this.props.setNavigation({ ...navigation, 'type': navOption.label });
    }

    onSliderChange = (sliderValue) => { this.setState({ sliderValue }) }

    render() {

        const { genomeMap, navigation } = this.props,
            { sliderValue } = this.state;

        let navOptions = _.map(genomeMap, (d, key) => {
            return { 'label': key, value: { ...d } }
        }).filter((chromID) => chromID.label.indexOf('Chr') > -1);

        navOptions.push({ 'label': 'Overview Map', 'value': 'overview' });

        return (
            <div className='range-wrapper'>

                <div className='range-select'>
                    <ReactSelect
                        placeholder='Select Chromosome...'
                        className='select-box'
                        value={_.find(navOptions, (entry) => entry.label == navigation.type)}
                        options={navOptions}
                        styles={{ option: (styles) => ({ ...styles, color: 'black', textAlign: 'left' }) }}
                        onChange={this.onNavOptionChange} />
                </div>
                <div className='range-buttonbox'>
                    <span>move</span>
                    <div>
                        <button className='btn btn-primary-outline'>&#8612;</button>
                        <button className='btn btn-primary-outline'>&#8614;</button>
                    </div>

                </div>

                <div className='range-slider'>
                    <span>zoom</span>
                    <Slider className='inner-slider' min={0} max={20} step={1} value={sliderValue} onChange={this.onSliderChange} />
                </div>
            </div>
        );
    }
}

