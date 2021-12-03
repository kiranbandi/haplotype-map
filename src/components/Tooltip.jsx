import React from 'react';


// 'geneID': gene.geneID,
// 'note': gene.note,
// 'start-stop': gene.start + ' - ' + gene.stop

export default (props) =>
    <div className='graph-tooltip' style={{ 'left': props.x, 'top': props.y }}>
        {props.geneID && <p><b>Gene: </b><span>{props.geneID}</span></p>}
        {props['start-stop'] && <p><b>Position: </b><span>{props['start-stop']}</span></p>}
        {props.note && <p><b>Note: </b><span>{props.note}</span></p>}
    </div>;
