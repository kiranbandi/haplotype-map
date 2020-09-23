import React, { Component } from 'react';
import ReactSelect from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default class NavigationPanel extends Component {

    onNavOptionChange = (navOption) => {
        this.props.setNavigation({ shift: 0, zoomLevel: 0, 'type': navOption.label });
    }

    onSliderChange = (zoomLevel) => {
        let { navigation = {} } = this.props;
        if (navigation.type !== 'Overview') {
            this.props.setNavigation({ ...navigation, zoomLevel, shift: 0 });
        }
    }

    onMoveClick = (event) => {
        event.preventDefault();
        let { navigation = {} } = this.props;
        if (navigation.type !== 'Overview' && navigation.zoomLevel >= 0) {
            let { shift } = navigation;
            if (event.target.id.indexOf('left') > -1) {
                shift += -1;
            }
            else {
                shift += 1;
            }
            this.props.setNavigation({ ...navigation, shift });
        }
    }

    render() {

        const { genomeMap, navigation } = this.props;

        let navOptions = _.map(genomeMap, (d, key) => {
            return { 'label': key, value: { ...d } }
        }).filter((chromID) => chromID.label.indexOf('Chr') > -1);

        navOptions.push({ 'label': 'Overview', 'value': 'overview' });

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
                        <button onClick={this.onMoveClick} id={'range-move-left'} className='btn btn-primary-outline'>&#8612;</button>
                        <button onClick={this.onMoveClick} id={'range-move-right'} className='btn btn-primary-outline'>&#8614;</button>
                    </div>
                </div>

                <div className='range-slider'>
                    <span>zoom</span>
                    <Slider className='inner-slider'
                        min={1} max={20} step={1}
                        value={navigation.zoomLevel} onChange={this.onSliderChange} />
                </div>
            </div>
        );
    }
}

