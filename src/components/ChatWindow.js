import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../api';
import { Send, Image as ImageIcon, ShieldAlert, Lock, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatWindow = ({ order, currentUser, isBlocked, disputeStatus }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const orderId = order?._id;
    const isSeller = currentUser.userId === order?.seller?._id;
    const otherParticipant = isSeller ? order?.user : order?.seller;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = useCallback(async () => {
        if (!orderId) return;
        try {
            const data = await apiFetch(`/messages/${orderId}`);
            setMessages(data.messages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [orderId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isBlocked) return;

        setSending(true);
        try {
            await apiFetch('/messages', {
                method: 'POST',
                body: JSON.stringify({ orderId, content: newMessage }),
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            alert(error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header / Profile Info */}
            <div className="bg-indigo-600 p-4 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-full relative">
                            <User className="w-5 h-5 text-white" />
                            {otherParticipant?.isIdentityVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full border-2 border-indigo-600 p-0.5">
                                    <ShieldCheck className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold">{otherParticipant?.name || 'Cargando...'}</h3>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    {isSeller ? 'Comprador' : 'Vendedor'}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-100 italic">
                                {otherParticipant?.isIdentityVerified ? '✓ Identidad Verificada' : '• Identidad Pendiente'}
                            </p>
                        </div>
                    </div>
                    {disputeStatus === 'open' && (
                        <div className="flex items-center bg-amber-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            <ShieldAlert className="w-4 h-4 mr-1" />
                            BAJO RECLAMO
                        </div>
                    )}
                </div>

                {/* Secondary Info Bar (Confidence) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Lock className="w-3 h-3 mr-1 opacity-70" />
                            Pago en Custodia
                        </div>
                        {otherParticipant?.phone && (
                            <div className="flex items-center">
                                <span className="mr-1 opacity-70">Tel:</span>
                                {otherParticipant.phone}
                            </div>
                        )}
                    </div>
                    <div className="text-indigo-200">
                        Orden #{orderId?.slice(-6).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-30" />
                        <p className="text-gray-400 text-sm">¡Comienza la conversación!</p>
                        <p className="text-xs text-gray-400 mt-1">Coordina la entrega con {otherParticipant?.name}.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender === currentUser.userId;
                        return (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            {isBlocked ? (
                <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center space-x-2 text-amber-800 text-sm font-medium">
                    <Lock className="w-4 h-4" />
                    <span>El chat está bloqueado temporalmente por una disputa activa. El administrador está revisando el caso.</span>
                </div>
            ) : (
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <ImageIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 transition-all shadow-md active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            )}
        </div>
    );
};

export default ChatWindow;
