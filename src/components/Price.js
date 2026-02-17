import React from 'react';
import { useTranslation } from 'react-i18next';

const Price = ({ amount }) => {
    const { i18n } = useTranslation();

    // Exchange rate: 1 USD = 950 CLP (Example)
    const EXCHANGE_RATE = 950;

    if (i18n.language === 'es') {
        const clpAmount = amount * EXCHANGE_RATE;
        return (
            <span>
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(clpAmount)}
            </span>
        );
    }

    // Default to USD
    return (
        <span>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
        </span>
    );
};

export default Price;
