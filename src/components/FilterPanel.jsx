import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../utils/phylotree';
import d3v3 from '../utils/d3v3';
import {
    setSourceLine, setTargetLines, setTrait,
    setReferenceTypeChange, setColorScheme, setActiveTraitList
} from '../redux/actions/actions';

const colorSchemes = [{ 'label': 'Difference from source line', 'value': 'difference' },
{ 'label': 'Difference from source line(ignore partial matches)', 'value': 'differenceNoPartial' },
{ 'label': 'Nucleotides', 'value': 'nucleotide' },
{ 'label': 'Highlight heterozygous pairs', 'value': 'hetero' }];

const orderingSchemes = [
    { 'label': 'Dendogram Clustering', 'value': 'tree' },
    { 'label': 'Trait features', 'value': 'trait' },
    { 'label': 'Manual Selection', 'value': 'none' }];

class FilterPanel extends Component {

    onSourceChange = (sourceLine) => { this.props.actions.setSourceLine(sourceLine.value) }
    onTargetChange = (targetLines) => { this.props.actions.setTargetLines(_.map(targetLines, (d) => d.value)) }
    onColorSchemeChange = (colorScheme) => { this.props.actions.setColorScheme(colorScheme.value) }
    onReferenceTypeChange = (referenceType) => {

        const { genome, selectedTrait } = this.props;

        // set the reference type onto redux but also set the target line list
        this.props.actions.setReferenceTypeChange(referenceType.value)
        if (referenceType.value == 'tree') {
            var newickNodes = d3v3.layout.phylotree()(this.props.genome['treeMap']).get_nodes();
            var nameList = _.filter(newickNodes, (d) => d.name && d.name !== 'root').map((d) => d.name);
            this.props.actions.setTargetLines([...nameList]);
        }
        else if (referenceType.value == 'trait') {
            const referenceTrait = selectedTrait ? selectedTrait : genome.traitList[0];
            this.props.actions.setTargetLines(_.sortBy(genome.traitMap, (d) => d[referenceTrait]).map((d) => d.name));
        }
    };

    onTraitChange = (trait) => {
        const { genome } = this.props;
        this.props.actions.setTrait(trait.value);
        this.props.actions.setTargetLines(_.sortBy(genome.traitMap, (d) => d[trait.value]).map((d) => d.name));
    };

    onActiveTraitChange = (selectedTraitList) => {
        this.props.actions.setActiveTraitList(_.map(selectedTraitList, (d) => d.value));
    };

    render() {
        const { germplasmLines = [], genome = {},
            sourceLine = '', targetLines = [], selectedTrait,
            colorScheme, referenceType, activeTraitList = [] } = this.props,
            { traitList } = genome,
            lineOptions = _.map(germplasmLines, (d) => { return { 'label': d, 'value': d } }),
            traitOptions = _.map(traitList, (d) => ({ 'label': d, 'value': d })),
            modifiedSourceLine = { 'label': sourceLine, 'value': sourceLine },
            modifiedTargetLines = _.map(targetLines, (d) => { return { 'label': d, 'value': d } }),
            selectedColorScheme = _.find(colorSchemes, (d) => d.value == colorScheme),
            selectedReferenceType = _.find(orderingSchemes, (d) => d.value == referenceType),
            selectedTraitIndex = _.findIndex(traitOptions, (d) => d.value == selectedTrait);

        const activeTraits = _.map(activeTraitList, (d) => ({ 'label': d, 'value': d }));

        return (
            <div className='filter-panel m-t text-center'>
                <div className="compare-select">
                    <span className='inner-span'>Line Ordering</span>
                    <ReactSelect
                        className='select-box color-scheme'
                        value={selectedReferenceType}
                        options={orderingSchemes}
                        styles={selectStyle}
                        onChange={this.onReferenceTypeChange} />
                </div>
                <div className="compare-select">
                    <span className='inner-span'>Colour Scheme</span>
                    <ReactSelect
                        className='select-box color-scheme'
                        value={selectedColorScheme}
                        options={colorSchemes}
                        styles={selectStyle}
                        onChange={this.onColorSchemeChange} />
                </div>
                <div className="compare-select">
                    <span className='inner-span'>Reference Line</span>
                    <ReactSelect
                        className='select-box source'
                        value={modifiedSourceLine}
                        options={lineOptions}
                        styles={selectStyle}
                        onChange={this.onSourceChange} />
                </div>
                {referenceType == 'none' && <div className="compare-select">
                    <span className='inner-span'>Target Lines</span>
                    <ReactSelect
                        isMulti
                        className='select-box'
                        value={modifiedTargetLines}
                        options={lineOptions}
                        styles={selectStyle}
                        onChange={this.onTargetChange} />
                </div>}
                {referenceType == 'trait' && <div className="compare-select">
                    <span className='inner-span'>Active Traits</span>
                    <ReactSelect
                        key='trait-enabler'
                        isMulti
                        className='select-box source'
                        value={activeTraits}
                        options={traitOptions}
                        styles={selectStyle}
                        onChange={this.onActiveTraitChange} />
                </div>}
                {referenceType == 'trait' && <div className="compare-select">
                    <span className='inner-span'>Order by Trait</span>
                    <ReactSelect
                        key='trait-order-selector'
                        className='select-box source'
                        // if index not found default to first trait
                        value={traitOptions[selectedTraitIndex == -1 ? 0 : selectedTraitIndex]}
                        options={traitOptions}
                        styles={selectStyle}
                        onChange={this.onTraitChange} />
                </div>}
                <button className='btn btn-primary-outline compare-button'
                    onClick={this.props.triggerCompare}> REDRAW
                    </button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        sourceLine: state.oracle.sourceLine,
        targetLines: state.oracle.targetLines,
        colorScheme: state.oracle.colorScheme,
        referenceType: state.oracle.referenceType,
        selectedTrait: state.oracle.trait,
        activeTraitList: state.oracle.activeTraitList,
        genome: state.genome
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setSourceLine, setTargetLines, setTrait,
            setColorScheme, setReferenceTypeChange, setActiveTraitList
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterPanel);

const selectStyle = {
    option: (styles) => ({
        ...styles,
        color: 'black', textAlign: 'left'
    })
};