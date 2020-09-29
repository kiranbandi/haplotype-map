import React, { Component } from 'react';
import ReactSelect from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default class NavigationPanel extends Component {


    constructor(props) {
        super(props);
        this.state = {
            zoomLevel: 1
        }
    }

    onNavOptionChange = (navOption) => {
        this.props.setNavigation({ shift: 0, zoomLevel: 0, 'type': navOption.label });
    }

    onSliderChange = (zoomLevel) => { this.setState({ zoomLevel }) }

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

        const { genomeMap, startPosition, endPosition } = this.props,
            { zoomLevel } = this.state;

        return (

            <div className='navigation-wrapper'>

                <form className="positonal-form">
                    <input className="form-control genome-postion-entry" type="text" placeholder="Start Position..." />
                    <input className="form-control genome-postion-entry" type="text" placeholder="End Position..." />
                    <button className='btn btn-primary-outline'>GO</button>
                </form>
                <div className='range-wrapper'>
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
                            value={zoomLevel} onChange={this.onSliderChange} />
                    </div>
                </div>
            </div>

        );
    }
}

