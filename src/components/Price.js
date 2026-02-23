import React, { useState, useEffect } from 'react';
import { convertCurrency, formatCurrencyValue } from '../utils/currencyUtils';

const Price = ({ amount }) => {
    const [displayAmount, setDisplayAmount] = useState(amount);
    const [currency, setCurrency] = useState(localStorage.getItem('einstore_currency') || 'CLP');
    const [loading, setLoading] = useState(false);

    const updatePrice = async (targetCurrency) => {
        if (!amount) return;
        if (targetCurrency === 'CLP') {
            setDisplayAmount(amount);
            setCurrency('CLP');
        } else {
            setLoading(true);
            const converted = await convertCurrency(amount, 'CLP', targetCurrency);
            setDisplayAmount(converted);
            setCurrency(targetCurrency);
            setLoading(false);
        }
    };

    useEffect(() => {
        updatePrice(currency);

        const handleCurrencyChange = (e) => {
            setCurrency(e.detail.currency);
            updatePrice(e.detail.currency);
        };

        window.addEventListener('currencyChanged', handleCurrencyChange);
        return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }, [amount]);

    if (loading) return <span className="animate-pulse opacity-50">...</span>;

    return (
        <span>
            {formatCurrencyValue(displayAmount, currency)}
        </span>
    );
};

export default Price;
