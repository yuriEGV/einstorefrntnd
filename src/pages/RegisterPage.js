import React, { useState } from 'react';
import { apiFetch } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dni: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { name, email, password, dni, phone } = formData;

    if (!name || !email || !password || !dni || !phone) {
      setError('Por favor completa todos los campos de identidad');
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          dni: dni.trim(),
          phone: phone.trim()
        })
      });

      if (setUser && data?.user) setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crea tu cuenta</h1>
            <p className="text-gray-500">Únete a la comunidad de Einstore</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Nombre Completo"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="dni"
                  placeholder="DNI / RUT"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-indigo-50 p-3 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <p>Tus datos están protegidos por encriptación de grado militar para transacciones P2P seguras.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:transform-none"
            >
              <span>{loading ? 'Procesando...' : 'Crear Cuenta'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            {error && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-red-500 font-medium text-sm"
              >
                {error}
              </motion.p>
            )}

            <p className="text-center text-gray-600 text-sm mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 