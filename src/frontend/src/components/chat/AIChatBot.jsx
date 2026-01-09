import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import chatService from '../../services/chat.service';
import { usePremium } from '../../context/PremiumContext';

const AIChatBot = () => {
    const { isPro, openPremiumModal } = usePremium();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check access on mount
    useEffect(() => {
        if (isPro) {
            setHasAccess(true);
            loadHistory();
        }
    }, [isPro]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && hasAccess && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen, hasAccess]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const data = await chatService.getHistory();
            if (data.messages && data.messages.length > 0) {
                const formattedMessages = [];
                data.messages.forEach(msg => {
                    formattedMessages.push({ role: 'user', content: msg.userMessage });
                    formattedMessages.push({ role: 'assistant', content: msg.aiResponse });
                });
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        
        // Add user message to UI immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
        } catch (error) {
            console.error('Send message error:', error);
            const errorMsg = error.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.';
            toast.error(errorMsg);
            // Remove the user message if failed
            setMessages(prev => prev.slice(0, -1));
            setInputMessage(userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (action, label) => {
        const data = prompt(`Nhập nội dung cho "${label}":`);
        if (!data) return;

        setMessages(prev => [...prev, { role: 'user', content: `[${label}] ${data}` }]);
        setIsLoading(true);

        try {
            const response = await chatService.quickAction(action, data);
            setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
        } catch (error) {
            console.error('Quick action error:', error);
            toast.error('Không thể thực hiện. Vui lòng thử lại.');
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Bạn có chắc muốn xóa lịch sử hội thoại?')) return;
        
        try {
            await chatService.clearHistory();
            setMessages([]);
            toast.success('Đã xóa lịch sử hội thoại');
        } catch (error) {
            toast.error('Không thể xóa lịch sử');
        }
    };

    const quickActions = [
        { action: 'vocabulary', label: '📚 Từ vựng', icon: '📚' },
        { action: 'explain_grammar', label: '📝 Ngữ pháp', icon: '📝' },
        { action: 'translate', label: '🌐 Dịch', icon: '🌐' },
        { action: 'correct_writing', label: '✏️ Sửa văn', icon: '✏️' },
    ];

    // Floating button
    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {/* Pro badge */}
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    PRO
                </span>
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.8 }}
                className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-100">EduBot - Gia sư AI</h3>
                                <p className="text-xs text-purple-200">Powered by LLaMA 3.3 70B</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasAccess && messages.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    title="Xóa lịch sử"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {!hasAccess ? (
                    // No access - show upgrade prompt
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-4xl mb-4">
                            🔒
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                            Tính năng dành cho Pro
                        </h4>
                        <p className="text-gray-600 text-sm mb-6">
                            Nâng cấp lên gói Pro để sử dụng gia sư AI cá nhân, trò chuyện không giới hạn và nhiều tính năng khác!
                        </p>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                openPremiumModal();
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Nâng cấp Pro ngay
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">👋</div>
                                    <h4 className="font-semibold text-gray-700 mb-2">
                                        Chào mừng đến với EduBot!
                                    </h4>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Tôi là gia sư AI của bạn. Hãy hỏi tôi bất cứ điều gì về tiếng Anh!
                                    </p>
                                    
                                    {/* Quick actions */}
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        {quickActions.map((qa) => (
                                            <button
                                                key={qa.action}
                                                onClick={() => handleQuickAction(qa.action, qa.label)}
                                                className="p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm text-gray-700"
                                            >
                                                <span className="text-lg mr-1">{qa.icon}</span>
                                                {qa.label.replace(qa.icon + ' ', '')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl ${
                                                msg.role === 'user'
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                                            }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                                            strong: ({ children }) => <strong className="font-semibold text-purple-700">{children}</strong>,
                                                            code: ({ children }) => <code className="bg-purple-100 px-1 py-0.5 rounded text-purple-800">{children}</code>,
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm">{msg.content}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            
                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 disabled:bg-gray-100 text-gray-800 placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default AIChatBot;
