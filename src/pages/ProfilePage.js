import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';
import { User, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const ProfilePage = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mpAccount, setMpAccount] = useState(user?.mercadoPagoAccount || '');
    const [wallet, setWallet] = useState(user?.cryptoWallet || '');
    const { t } = useTranslation();

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/users/updateUser', {
                method: 'PATCH',
                body: JSON.stringify({ mercadoPagoAccount: mpAccount, cryptoWallet: wallet })
            });
            alert('Configuración guardada correctamente.');
        } catch (error) {
            alert('Error al guardar configuración.');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await apiFetch('/orders/showAllMyOrders');
                setOrders(data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">{t('profile.please_login') || "Please login to view profile."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Profile Header */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                    <div className="bg-indigo-600 h-32"></div>
                    <div className="px-4 py-5 sm:px-6 relative">
                        <div className="-mt-16 mb-4">
                            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white ring-4 ring-white shadow-lg">
                                <span className="text-4xl text-indigo-600 font-bold uppercase">{user.name.charAt(0)}</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold leading-6 text-gray-900">{user.name}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{user.email}</p>
                        <div className="mt-4 flex space-x-3">
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Configuración de Pagos
                    </h2>
                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cuenta MercadoPago (Email)</label>
                            <input
                                type="email"
                                value={mpAccount}
                                onChange={(e) => setMpAccount(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Billetera Crypto (Wallet Address)</label>
                            <input
                                type="text"
                                value={wallet}
                                onChange={(e) => setWallet(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0x..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition"
                        >
                            Guardar Configuración
                        </button>
                    </form>
                </div>

                {/* Order History */}
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order History
                </h2>

                {loading ? (
                    <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div></div>
                ) : orders.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                        You have no orders yet.
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <li key={order._id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                Order #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'paid' || order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Package className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {order.orderItems.length} items
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p className="font-bold text-gray-900 mr-4">${order.total}</p>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            // Store order in session or just navigate to checkout with a way to recover?
                                                            // Actually, best is to recreate the preference or just go to a dedicated pay page
                                                            // For now, let's just hint they can go to checkout if they have items, 
                                                            // or we can implement a quick "Re-pay" that triggers the MP modal.
                                                            alert('Redirigiendo a pago...');
                                                            apiFetch('/payments/mercadopago/create-preference', {
                                                                method: 'POST',
                                                                body: JSON.stringify({ orderId: order._id })
                                                            }).then(data => {
                                                                window.location.assign(`https://www.mercadopago.cl/checkout/v1/redirect?pref_id=${data.id}`);
                                                            }).catch(err => alert(err.message));
                                                        }}
                                                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition"
                                                    >
                                                        Pagar ahora
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProfilePage;
