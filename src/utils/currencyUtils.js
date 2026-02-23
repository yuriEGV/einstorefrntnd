// Currency utility — uses static fallback rates to avoid broken free API keys
// To use a real-time API, replace EXCHANGE_RATE_API_KEY in your .env file.

const EXCHANGE_RATE_API_KEY = process.env.REACT_APP_EXCHANGE_RATE_API_KEY;

// Reliable fallback rates (updated periodically)
const FALLBACK_RATES = {
    CLP_CAD: 0.00145,
    CAD_CLP: 689.0,
    CLP_USD: 0.00107,
    USD_CLP: 935.0,
    CLP_EUR: 0.00099,
    EUR_CLP: 1010.0,
};

/**
 * Converts an amount from one currency to another.
 * Tries live API first; falls back to static rates.
 * Includes a 2% safety margin.
 */
export const convertCurrency = async (amount, from, to) => {
    if (from === to) return amount;

    // Try live API only if a key is configured
    if (EXCHANGE_RATE_API_KEY) {
        try {
            const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/${from}/${to}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.result === 'success') {
                const finalRate = data.conversion_rate * 1.02;
                return (amount * finalRate).toFixed(2);
            }
        } catch (_) {
            // Fall through to static rates
        }
    }

    // Use static fallback rates (always available, no API needed)
    const pair = `${from}_${to}`;
    const rate = FALLBACK_RATES[pair];
    if (rate) {
        return (amount * rate * 1.02).toFixed(2);
    }

    // If no rate found, return as-is
    return amount.toFixed(2);
};

/**
 * Format a number as a currency string.
 */
export const formatCurrencyValue = (amount, currency) => {
    const locales = {
        CLP: 'es-CL',
        CAD: 'en-CA',
        USD: 'en-US',
        EUR: 'fr-FR',
    };
    return new Intl.NumberFormat(locales[currency] || 'en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
