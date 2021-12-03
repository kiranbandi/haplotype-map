import React, { Component } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRegionWindow } from '../redux/actions/actions';
import { CHART_WIDTH, ZOOM_SCALE } from '../utils/chartConstants';

class NavigationPanel extends Component {

    constructor(props) {
        super(props);
        const { genomeStartPosition, genomeEndPosition } = this.props;
        // start and end input are local copies that
        // are overriden when new props arrive
        this.state = {
            'startInput': genomeStartPosition,
            'endInput': genomeEndPosition,
            genomeStartPosition,
            genomeEndPosition,
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if ((prevState.genomeStartPosition !== nextProps.genomeStartPosition) ||
            (prevState.genomeEndPosition !== nextProps.genomeEndPosition)) {
            return {
                startInput: nextProps.genomeStartPosition,
                endInput: nextProps.genomeEndPosition,
                'genomeStartPosition': nextProps.genomeStartPosition,
                'genomeEndPosition': nextProps.genomeEndPosition
            };
        }
        // // if not no change in state
        return null;
    }


    onInputChange = (event) => {
        const value = event.target.value;
        if (event.target.id.indexOf('start') > -1) { this.setState({ 'startInput': value }) }
        else { this.setState({ 'endInput': value }) }
    }


    seekPositions = (event) => {
        event.preventDefault();
        let { genomeMap, markerCount, chartScale, setRegionWindow } = this.props,
            { startInput, endInput } = this.state;

        let startIndex = 0, endIndex = 0;
        // typecast to numbers
        startInput = +startInput, endInput = +endInput;

        // check only if start and end positions are valid numbers
        // and one of them is non empty
        if (!isNaN(startInput) && !isNaN(endInput) && (startInput != 0 || endInput != 0)) {

            // start is empty so use the end as the anchor
            if (startInput == 0) {
                // find the first number that is close to the input as the list is pre sorted 
                // in increasing order
                endIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= endInput) || markerCount;
                startIndex = endIndex - Math.round(chartScale.invert(50));
                // if the startIndex is close to the starting clamp it
                startIndex = startIndex < 0 ? 0 : startIndex;
            }
            else if (endInput == 0) {
                // find the first number that is close to the input as the list is pre sorted 
                // in increasing order
                startIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= startInput) || 0;
                endIndex = startIndex + Math.round(chartScale.invert(50));
                // if the endIndex is close to the end clamp it
                endIndex = endIndex >= markerCount ? markerCount - 1 : endIndex;
            }
            // final check so start is always less than end
            else if (+startInput < +endInput) {
                startIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= startInput) || 0;
                endIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= endInput) || markerCount;
            }
        }
        
        // after the processing if one of them is nonzero 
        if (startIndex != 0 || endIndex != 0) {
            setRegionWindow({
                'start': startIndex,
                'end': endIndex
            });
        }
    }

    onSliderChange = (zoomLevel) => {

        let { chartScale, regionStart = 0, regionEnd = 0, setRegionWindow } = this.props;

        let markerStartPos = chartScale(regionStart), markerEndPos = chartScale(regionEnd);

        let midPoint = markerStartPos + Math.round((markerEndPos - markerStartPos) / 2);
        const windowWidth = ZOOM_SCALE.invert(zoomLevel);

        let newmarkerStartPos = midPoint - (windowWidth / 2),
            newmarkerEndPos = midPoint + (windowWidth / 2);

        if (newmarkerStartPos < 0) {
            newmarkerEndPos = newmarkerEndPos - (newmarkerStartPos);
            newmarkerStartPos = 0;
        }

        if (newmarkerEndPos > CHART_WIDTH) {
            newmarkerStartPos = newmarkerStartPos - (newmarkerEndPos - CHART_WIDTH);
            newmarkerEndPos = CHART_WIDTH;
        }

        let newWindow = {
            'start': Math.round(chartScale.invert(newmarkerStartPos)),
            'end': Math.round(chartScale.invert(newmarkerEndPos))
        };
        setRegionWindow(newWindow);
    }

    onMoveClick = (event) => {
        event.preventDefault();

        let { regionStart = 0, regionEnd = 0, chartScale, setRegionWindow } = this.props;
        let markerStartPos = chartScale(regionStart), markerEndPos = chartScale(regionEnd);

        let windowWidth = markerEndPos - markerStartPos,
            newmarkerStartPos, newmarkerEndPos;

        // moving left or right we only do it in half steps
        if (event.target.id.indexOf('left') > -1) {
            newmarkerStartPos = markerStartPos - (windowWidth / 2);
            newmarkerStartPos = newmarkerStartPos < 0 ? 0 : newmarkerStartPos;
            newmarkerEndPos = newmarkerStartPos + windowWidth;
        }
        else {
            newmarkerEndPos = markerEndPos + (windowWidth / 2);
            newmarkerEndPos = newmarkerEndPos > CHART_WIDTH ? CHART_WIDTH : newmarkerEndPos;
            newmarkerStartPos = newmarkerEndPos - windowWidth;
        }
        let newWindow = {
            'start': Math.round(chartScale.invert(newmarkerStartPos)),
            'end': Math.round(chartScale.invert(newmarkerEndPos))
        };
        setRegionWindow(newWindow);
    }

    render() {

        let { chartScale, regionStart, regionEnd } = this.props,
            { startInput, endInput } = this.state,
            zoomLevel = ZOOM_SCALE(chartScale(regionEnd) - chartScale(regionStart));

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
                            min={1} max={30} step={1}
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
