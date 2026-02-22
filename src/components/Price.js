import React from 'react';

const Price = ({ amount }) => {
    return (
        <span>
            {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount || 0)}
        </span>
    );
};

export default Price;
