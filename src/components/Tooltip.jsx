import React from 'react';

export default (props) =>
    <div className='graph-tooltip' style={{ 'left': props.x, 'top': props.y }}>
        {props.lineName && <p><b>Line Name: </b><span>{props.lineName}</span></p>}
        {props.SNP && <p><b>SNP ID: </b><span>{props.SNP}</span></p>}
        {props.allele && <p><b>Allele: </b><span>{props.allele}</span></p>}
    </div>;
