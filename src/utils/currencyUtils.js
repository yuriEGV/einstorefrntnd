const API_KEY = 'cbd090558110b1069f2e3be7'; // ExchangeRate-API free key
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

/**
 * Converts an amount from one currency to another using real-time rates.
 * Includes a 2% safety margin for exchange rate fluctuations.
 */
export const convertCurrency = async (amount, from, to) => {
    if (from === to) return amount;

    try {
        const response = await fetch(`${BASE_URL}/${from}/${to}`);
        const data = await response.json();

        if (data.result === "success") {
            const rate = data.conversion_rate;
            // Add 2% safety margin as requested
            const finalRate = rate * 1.02;
            return (amount * finalRate).toFixed(2);
        }
        throw new Error("Exchange rate fetch failed");
    } catch (error) {
        console.error("Currency Conversion Error:", error);
        // Fallback rates if API fails
        const fallbackRates = {
            'CLP_CAD': 0.0014,
            'CAD_CLP': 714.0
        };
        const pair = `${from}_${to}`;
        const rate = fallbackRates[pair] || 1;
        return (amount * rate).toFixed(2);
    }
};

/**
 * Groups currency formatting logic
 */
export const formatCurrencyValue = (amount, currency) => {
    return new Intl.NumberFormat(currency === 'CLP' ? 'es-CL' : 'en-CA', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
