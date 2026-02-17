import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, Clock } from 'lucide-react';

const PaymentStatus = () => {
    const location = useLocation();
    const isFailure = location.pathname.includes('failure');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${isFailure ? 'bg-red-100' : 'bg-yellow-100'} mb-6`}>
                    {isFailure ? (
                        <XCircle className="h-10 w-10 text-red-600" />
                    ) : (
                        <Clock className="h-10 w-10 text-yellow-600" />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isFailure ? 'Payment Failed' : 'Payment Pending'}
                </h2>

                <p className="text-gray-600 mb-8">
                    {isFailure
                        ? 'Something went wrong with your transaction. Please try again or use a different payment method.'
                        : 'Your payment is being processed. We will notify you once it is confirmed.'}
                </p>

                <div className="space-y-4">
                    {isFailure && (
                        <Link
                            to="/checkout"
                            className="block w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Try Again
                        </Link>
                    )}

                    <Link
                        to="/"
                        className="block w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
