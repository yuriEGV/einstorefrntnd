import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';

const StripePaymentForm = ({ clientSecret, orderId, total }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        if (error) {
            setErrorMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent.status === 'succeeded') {
            // Payment successful, order status will be updated via webhook,
            // but we can redirect immediately for better UX
            navigate('/success', { state: { orderId } });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                        },
                        invalid: { color: '#9e2146' },
                    },
                }} />
            </div>
            {errorMessage && <p className="text-sm text-red-600 italic">{errorMessage}</p>}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
                {isProcessing ? 'Processing...' : `Pay Securely`}
            </button>
        </form>
    );
};

export default StripePaymentForm;
