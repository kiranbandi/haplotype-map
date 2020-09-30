import React, { Component } from 'react';
import Slider from 'rc-slider';
import { scaleLinear, interpolateRound, scaleLog } from 'd3';
import 'rc-slider/assets/index.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRegionWindow } from '../redux/actions/actions';
import { CHART_WIDTH } from '../utils/chartConstants';

class NavigationPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            startInput: this.props.regionStart,
            EndInput: this.props.regionEnd
        }
    }

    onInputChange = (event) => {
        const value = event.target.value;
        if (event.target.id.indexOf('start') > -1) {
            this.setState({ 'startInput': value })
        }
        else {
            this.setState({ 'EndInput': value })
        }
    }

    onNavOptionChange = (navOption) => {
        this.props.setNavigation({ shift: 0, zoomLevel: 0, 'type': navOption.label });
    }


    seekPositions = (event) => {
        event.preventDefault();
    }

    onSliderChange = (zoomLevel) => {

        let { regionStart = 0, regionEnd = 0, setRegionWindow } = this.props;

        let startPosition = this.xScale(regionStart), endPosition = this.xScale(regionEnd);

        if (startPosition == 0 && endPosition == 0) {
            endPosition = 50;
        };

        let midPoint = startPosition + Math.round((endPosition - startPosition) / 2);
        const windowWidth = this.zoomScale.invert(zoomLevel);

        let newStartPosition = midPoint - (windowWidth / 2),
            newEndPosition = midPoint + (windowWidth / 2);

        if (newStartPosition < 0) {
            newEndPosition = newEndPosition - (newStartPosition);
            newStartPosition = 0;
        }

        if (newEndPosition > CHART_WIDTH) {
            newStartPosition = newStartPosition - (newEndPosition - CHART_WIDTH);
            newEndPosition = CHART_WIDTH;
        }

        let newWindow = {
            'start': Math.round(this.xScale.invert(newStartPosition)),
            'end': Math.round(this.xScale.invert(newEndPosition))
        };

        setRegionWindow(newWindow);
    }

    onMoveClick = (event) => {
        event.preventDefault();

        let { regionStart = 0, regionEnd = 0, setRegionWindow } = this.props;
        let startPosition = this.xScale(regionStart), endPosition = this.xScale(regionEnd);

        if (startPosition == 0 && endPosition == 0) {
            endPosition = 50;
        };

        let windowWidth = endPosition - startPosition,
            newStartPosition, newEndPosition;

        // moving left or right we only do it in half steps
        if (event.target.id.indexOf('left') > -1) {
            newStartPosition = startPosition - (windowWidth / 2);
            newStartPosition = newStartPosition < 0 ? 0 : newStartPosition;
            newEndPosition = newStartPosition + windowWidth;
        }
        else {
            newEndPosition = endPosition + (windowWidth / 2);
            newEndPosition = newEndPosition > CHART_WIDTH ? CHART_WIDTH : newEndPosition;
            newStartPosition = newEndPosition - windowWidth;
        }
        let newWindow = {
            'start': Math.round(this.xScale.invert(newStartPosition)),
            'end': Math.round(this.xScale.invert(newEndPosition))
        };
        setRegionWindow(newWindow);
    }

    render() {

        let { genomeMap } = this.props;

        // if both are zero then create a xScale and use a 50px wide window
        let lineDataLength = genomeMap.referenceMap.length;

        this.xScale = scaleLinear()
            .domain([0, lineDataLength - 1])
            .range([0, CHART_WIDTH]);

        let windowWidth = getWindowProps();

        this.zoomScale = scaleLog()
            .domain([10, CHART_WIDTH])
            .range([25, 1])
            .interpolate(interpolateRound)
            .clamp(true);

        let zoomLevel = this.zoomScale(windowWidth);

        let { startInput, endInput } = this.state;


        return (

            <div className='navigation-wrapper'>

                <form className="positonal-form">
                    <input id='region-window-start'
                        value={startInput} onChange={this.onInputChange}
                        className="form-control genome-postion-entry"
                        type="text" placeholder="Start Position..." />
                    <input id='region-window-end'
                        value={endInput} onChange={this.onInputChange}
                        className="form-control genome-postion-entry"
                        type="text" placeholder="End Position..." />
                    <button className='btn btn-primary-outline' onClick={this.seekPositions}>GO</button>
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
                            min={1} max={25} step={1}
                            value={zoomLevel} onChange={this.onSliderChange} />
                    </div>
                </div>
            </div>

        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setRegionWindow: bindActionCreators(setRegionWindow, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(NavigationPanel);


function getWindowProps() {
    let target = document.getElementById('genome-window'),
        windowWidth = 50;
    if (target && target.style.width.indexOf('px')) {
        windowWidth = +target.style.width.slice(0, -2);
    }
    return windowWidth;
}