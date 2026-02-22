import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, DollarSign, Activity, X, Plus, Trash2, Edit, Shield, Package, Lock, Menu, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ChatWindow from '../components/ChatWindow';
import { MessageSquare } from 'lucide-react';

const Dashboard = ({ user }) => {
  const { t } = useTranslation();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    profit: 0,
    sellerEarnings: 0
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'my-products', 'security'

  // Overview State
  const [recentOrders, setRecentOrders] = useState([]);

  // My Products State
  const [myProducts, setMyProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Replaces showProductModal
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // Kept for product editing logic
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'electronics', company: 'otros', description: '', inventory: 10, image: null });
  const [mediaFile, setMediaFile] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  // Security State
  const [securityForm, setSecurityForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

  // Users Management State
  const [allUsers, setAllUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);



  const [allGlobalProducts, setAllGlobalProducts] = useState([]);
  const fetchAllProducts = useCallback(() => {
    apiFetch('/products')
      .then(data => setAllGlobalProducts(data.products || []))
      .catch(err => console.error(err));
  }, []);

  const fetchAllUsers = useCallback(() => {
    apiFetch('/users')
      .then(data => setAllUsers(data.users || []))
      .catch(err => console.error(err));
  }, []);

  const fetchAdminStats = useCallback(() => {
    apiFetch('/orders/stats/dashboard')
      .then(data => {
        setStats({
          users: data.users || 0,
          products: data.products || 0,
          orders: data.orders || 0,
          revenue: data.revenue || 0,
          profit: data.profit || 0,
          sellerEarnings: data.sellerEarnings || 0
        });
      })
      .catch(err => console.error("Failed to fetch admin stats", err));
  }, []);

  const clearNotifications = () => {
    apiFetch('/orders/mark-as-notified', { method: 'PATCH' })
      .then(() => {
        fetchAdminStats();
        fetchMyOrders();
      })
      .catch(err => console.error("Failed to clear notifications", err));
  };

  const fetchMyOrders = useCallback(() => {
    const endpoint = user.role === 'admin' || user.role === 'user' ? '/orders/showAllMyOrders' : '/orders/showMySales';
    apiFetch(endpoint).then(data => {
      if (data.orders) setRecentOrders(data.orders.slice(0, 5));
    }).catch(err => console.log(err));
  }, [user.role]);

  const fetchMyProducts = useCallback(() => {
    // Requires backend to support filtering by user or a dedicated endpoint
    // We added ?user=ID support in getAllProducts
    const userId = user._id || user.userId;
    apiFetch(`/products?user=${userId}`)
      .then(data => setMyProducts(data.products || []))
      .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAdminStats();
      fetchMyOrders();
      if (activeTab === 'my-products') {
        fetchMyProducts();
      }
      if (activeTab === 'users' && user.role === 'admin') {
        fetchAllUsers();
      }
      if (activeTab === 'all-products' && user.role === 'admin') {
        fetchAllProducts();
      }
    }
  }, [user, activeTab, fetchAdminStats, fetchMyOrders, fetchMyProducts, fetchAllUsers, fetchAllProducts]);

  // --- Product Handlers ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    try {
      let imagePath = editingProduct ? editingProduct.image : '/api/v1/products/image/example.jpeg';

      // 1. Upload media if exists
      if (mediaFile) {
        const formData = new FormData();
        formData.append('image', mediaFile);

        const uploadData = await apiFetch('/products/upload', {
          method: 'POST',
          body: formData,
        });
        imagePath = uploadData.image;
      }

      const url = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const body = { ...productForm, image: imagePath };

      await apiFetch(url, { method, body: JSON.stringify(body) });

      setIsModalOpen(false); // Changed from setShowProductModal
      setEditingProduct(null);
      setMediaFile(null);
      fetchMyProducts(); // Refresh list
      if (user.role === 'admin') fetchAdminStats(); // Refresh stats if admin
    } catch (error) {
      alert(error.message);
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      fetchMyProducts();
      if (user.role === 'admin') fetchAdminStats();
    } catch (error) {
      alert(error.message);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      company: product.company,
      description: product.description,
      inventory: product.inventory,
      image: product.image
    });
    setIsModalOpen(true); // Changed from setShowProductModal
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: 'electronics', company: 'otros', description: '', inventory: 10, image: null });
    setIsModalOpen(true); // Changed from setShowProductModal
  }

  // --- Security Handlers ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    try {
      await apiFetch('/users/updateUserPassword', {
        method: 'PATCH',
        body: JSON.stringify({ oldPassword: securityForm.oldPassword, newPassword: securityForm.newPassword })
      });
      setSecurityMsg({ type: 'success', text: t('success.password_updated') });
      setSecurityForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setSecurityMsg({ type: 'error', text: error.message });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiFetch(`/users/updateRole/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      fetchAllUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleVerify = async (userId) => {
    try {
      await apiFetch(`/users/toggle-verify/${userId}`, { method: 'PATCH' });
      fetchAllUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      fetchAllUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchMyOrders();
      fetchAdminStats();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOpenDispute = async (orderId) => {
    if (!window.confirm('¿Estás seguro de abrir una disputa? El chat se bloqueará para revisión del administrador.')) return;
    try {
      await apiFetch(`/orders/${orderId}/dispute`, { method: 'POST' });
      alert('Disputa abierta. El administrador revisará el caso.');
      fetchMyOrders(); // Refresh orders to show updated dispute status
    } catch (error) {
      alert(error.message);
    }
  };

  const handleResolveDispute = async (orderId, resolution) => {
    try {
      await apiFetch(`/orders/${orderId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ resolution }),
      });
      alert(`Disputa resuelta: ${resolution}`);
      fetchMyOrders(); // Refresh orders to show updated dispute status
    } catch (error) {
      alert(error.message);
    }
  };

  const openChat = (order) => {
    setSelectedOrderForChat(order);
    setIsChatOpen(true);
  };


  if (!user) return <div className="min-h-screen flex justify-center items-center text-red-500 font-bold">{t('common.please_login')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar / Tabs */}
      <motion.div
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="bg-white shadow-lg hidden md:flex flex-col overflow-hidden"
      >
        <div className="p-6 flex justify-between items-center whitespace-nowrap overflow-hidden">
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-indigo-600">{t('nav.dashboard')}</h2>
              <p className="text-sm text-gray-500">{t('common.welcome')}, {user.name}</p>
            </motion.div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-6 flex-1 px-4">
          <SidebarItem icon={<Activity />} label={t('common.overview')} active={activeTab === 'overview'} isOpen={isSidebarOpen} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<Package />} label={t('common.my_products')} active={activeTab === 'my-products'} isOpen={isSidebarOpen} onClick={() => setActiveTab('my-products')} />
          <SidebarItem icon={<Shield />} label={t('common.security')} active={activeTab === 'security'} isOpen={isSidebarOpen} onClick={() => setActiveTab('security')} />
          {user.role === 'admin' && (
            <SidebarItem icon={<Users />} label={t('common.users')} active={activeTab === 'users'} isOpen={isSidebarOpen} onClick={() => setActiveTab('users')} />
          )}
          {user.role === 'admin' && (
            <SidebarItem icon={<ShoppingBag />} label={t('common.all_products')} active={activeTab === 'all-products'} isOpen={isSidebarOpen} onClick={() => setActiveTab('all-products')} />
          )}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Mobile Tab Nav */}
        <div className="md:hidden flex space-x-4 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{t('common.overview')}</button>
          <button onClick={() => setActiveTab('my-products')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'my-products' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{t('common.my_products')}</button>
          <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{t('common.security')}</button>
          {user.role === 'admin' && (
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{t('common.users')}</button>
          )}
          {user.role === 'admin' && (
            <button onClick={() => setActiveTab('all-products')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'all-products' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{t('common.all_products')}</button>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('common.dashboard_overview')}</h1>

            {/* Incomplete Profile Alert */}
            {(!user.dni || !user.phone) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-amber-600 mr-3" />
                  <div>
                    <p className="text-amber-800 font-bold">Verificación de Identidad Incompleta</p>
                    <p className="text-amber-700 text-sm">Captura tu DNI y Teléfono en tu perfil para aumentar la confianza y seguridad de tus transacciones.</p>
                  </div>
                </div>
                <Link to="/profile" className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">
                  Completar Perfil
                </Link>
              </motion.div>
            )}

            {/* Administrative Alerts for Commission */}
            {user.role === 'admin' && recentOrders.some(o => o.status === 'paid' && !o.isAdminNotified) && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mb-6 flex justify-between items-center animate-bounce">
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-emerald-800 font-semibold">¡Nuevas comisiones recibidas! La plataforma ha generado ingresos.</span>
                </div>
                <button className="text-xs text-emerald-600 underline font-bold" onClick={clearNotifications}>Marcar como leído</button>
              </div>
            )}

            {/* Seller Alerts */}
            {recentOrders.some(o => o.status === 'paid' && !o.isSellerNotified) && (
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-6 flex justify-between items-center animate-pulse">
                <div className="flex items-center">
                  <Activity className="w-6 h-6 text-indigo-600 mr-3" />
                  <span className="text-indigo-800 font-semibold">¡Tienes nuevas ventas pagadas! Revisa tus pedidos recientes.</span>
                </div>
                <button className="text-xs text-indigo-600 underline font-bold" onClick={clearNotifications}>Marcar como leído</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.role === 'admin' && <StatCard icon={<Users className="w-8 h-8 text-blue-600" />} title={t('common.total_users')} value={stats.users} color="bg-blue-100" />}
              <StatCard icon={<ShoppingBag className="w-8 h-8 text-purple-600" />} title={user.role === 'admin' ? t('common.total_products') : 'Mis Productos'} value={stats.products} color="bg-purple-100" />
              <StatCard icon={<Activity className="w-8 h-8 text-green-600" />} title={user.role === 'admin' ? t('common.total_orders') : 'Mis Ventas'} value={stats.orders} color="bg-green-100" />
              {user.role === 'admin' && <StatCard icon={<DollarSign className="w-8 h-8 text-yellow-600" />} title={t('common.revenue')} value={formatPrice(stats.revenue)} color="bg-yellow-100" />}
              {user.role === 'admin' && <StatCard icon={<DollarSign className="w-8 h-8 text-emerald-600" />} title="Plataforma Profit" value={formatPrice(stats.profit)} color="bg-emerald-100" />}
              <StatCard icon={<DollarSign className="w-8 h-8 text-indigo-600" />} title="Mis Ganancias (Net)" value={formatPrice(stats.sellerEarnings)} color="bg-indigo-100" />
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('common.recent_orders')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Shipping Info</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {order.user?.name || 'Guest'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {order.status === 'paid' ? (
                            <div className="text-indigo-600 font-medium italic">
                              {order.shippingAddress || 'No address provided'}
                            </div>
                          ) : (
                            <span className="text-gray-400">Hidden until paid</span>
                          )}
                        </td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span></td>
                        <td className="px-6 py-4 font-bold">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {order.status === 'paid' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition"
                                title="Marcar como enviado"
                              >
                                Marcar Enviado
                              </button>
                            )}
                            {order.status === 'shipped' && order.user?._id === (user._id || user.userId) && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
                                title="Confirmar recepción"
                              >
                                Confirmar Recibo
                              </button>
                            )}
                            {(order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') && (
                              <button
                                onClick={() => openChat(order)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition flex items-center"
                                title="Abrir Chat"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Chat
                              </button>
                            )}
                            {order.status === 'paid' && order.user?._id === (user._id || user.userId) && order.disputeStatus === 'none' && (
                              <button
                                onClick={() => handleOpenDispute(order._id)}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition flex items-center"
                                title="Reportar Problema"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Reclamo
                              </button>
                            )}
                            {user.role === 'admin' && order.disputeStatus === 'open' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleResolveDispute(order._id, 'release_funds')}
                                  className="text-[10px] bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                                >
                                  Liberar $
                                </button>
                                <button
                                  onClick={() => handleResolveDispute(order._id, 'refund')}
                                  className="text-[10px] bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition"
                                >
                                  Reembolsar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No orders found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MY PRODUCTS TAB */}
        {activeTab === 'my-products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
              <button onClick={openNewModal} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                  <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{product.company}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-indigo-600">{formatPrice(product.price)}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Stock: {product.inventory}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t border-gray-100">
                    <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {myProducts.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>You haven't listed any products yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="max-w-2xl bg-white rounded-xl shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-indigo-600" />
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" required value={securityForm.oldPassword} onChange={e => setSecurityForm({ ...securityForm, oldPassword: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" required value={securityForm.newPassword} onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" required value={securityForm.confirmPassword} onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
              </div>

              {securityMsg.text && (
                <div className={`p-3 rounded ${securityMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {securityMsg.text}
                </div>
              )}

              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* USER MANAGEMENT TAB (Admin Only) */}
        {(activeTab === 'users' && user.role === 'admin') && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Verified Supplier</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.map(u => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleVerify(u._id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${u.isVerifiedSeller ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.isVerifiedSeller ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' && (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="text-sm border-gray-300 rounded p-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' && u._id !== (user._id || user.userId) && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALL PRODUCTS MANAGEMENT (Admin Only) */}
        {(activeTab === 'all-products' && user.role === 'admin') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Manage All Products</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allGlobalProducts.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                  <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">{product.company} / {product.category}</p>
                    <p className="text-xs text-indigo-600 mb-2">Seller ID: {product.user}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-indigo-600">{formatPrice(product.price)}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Stock: {product.inventory}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t border-gray-100">
                    <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
              </div>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input type="number" required value={productForm.inventory} onChange={e => setProductForm({ ...productForm, inventory: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <select value={productForm.company} onChange={e => setProductForm({ ...productForm, company: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="otros">Otros</option>
                    <option value="techcorp">TechCorp</option>
                    <option value="soundwave">SoundWave</option>
                    <option value="vision">Vision</option>
                    <option value="fashionhub">FashionHub</option>
                    <option value="jeansco">JeansCo</option>
                    <option value="fitlife">FitLife</option>
                    <option value="runfast">RunFast</option>
                    <option value="deco">Deco</option>
                    <option value="greenthumb">GreenThumb</option>
                    <option value="ikea">Ikea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image / Video</label>
                  <input type="file" accept="image/*,video/*" onChange={e => setMediaFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="3"></textarea>
                </div>
                <button type="submit" disabled={productLoading} className="w-full bg-indigo-600 text-white py-2 rounded-md font-bold hover:bg-indigo-700 transition">
                  {productLoading ? (editingProduct ? 'Updating...' : 'Uploading & Saving...') : (editingProduct ? 'Update Product' : 'Save Product')}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* NEW: Chat Modal */}
      <AnimatePresence>
        {isChatOpen && selectedOrderForChat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl relative"
            >
              <button
                onClick={() => setIsChatOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white bg-white/10 rounded-full hover:bg-white/20 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <ChatWindow
                orderId={selectedOrderForChat._id}
                currentUser={user}
                isBlocked={selectedOrderForChat.isChatBlocked}
                disputeStatus={selectedOrderForChat.disputeStatus}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};

const SidebarItem = ({ icon, label, active, isOpen, onClick }) => (
  <button
    onClick={onClick}
    title={!isOpen ? label : ''}
    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all mb-1 ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'} ${!isOpen ? 'justify-center' : 'space-x-3'}`}
  >
    {React.cloneElement(icon, { size: 20 })}
    {isOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-medium whitespace-nowrap"
      >
        {label}
      </motion.span>
    )}
  </button>
);

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
