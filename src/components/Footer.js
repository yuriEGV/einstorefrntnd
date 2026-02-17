import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Einstore
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Elevating your shopping experience with premium products and exceptional service.
                        </p>
                        <div className="flex space-x-4">
                            <button className="text-gray-400 hover:text-indigo-400 transition-colors"><Facebook className="w-5 h-5" /></button>
                            <button className="text-gray-400 hover:text-indigo-400 transition-colors"><Twitter className="w-5 h-5" /></button>
                            <button className="text-gray-400 hover:text-indigo-400 transition-colors"><Instagram className="w-5 h-5" /></button>
                            <button className="text-gray-400 hover:text-indigo-400 transition-colors"><Linkedin className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button className="hover:text-indigo-400 transition-colors">New Arrivals</button></li>
                            <li><button className="hover:text-indigo-400 transition-colors">Best Sellers</button></li>
                            <li><button className="hover:text-indigo-400 transition-colors">Electronics</button></li>
                            <li><button className="hover:text-indigo-400 transition-colors">Accessories</button></li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button className="hover:text-indigo-400 transition-colors">Contact Us</button></li>
                            <li><button className="hover:text-indigo-400 transition-colors">FAQ</button></li>
                            <li><button className="hover:text-indigo-400 transition-colors">Shipping & Returns</button></li>
                            <li><button className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-indigo-400" /> 123 Commerce St, Tech City</li>
                            <li className="flex items-center"><Phone className="w-4 h-4 mr-2 text-indigo-400" /> +1 (555) 123-4567</li>
                            <li className="flex items-center"><Mail className="w-4 h-4 mr-2 text-indigo-400" /> support@einstore.com</li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Einstore. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
