import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AIChatWidget.css';

const CHAT_API = '/api/chat/consult';
const PRODUCTS_API = '/api/ver0.0.1/product?page=0&size=200&sort=productName';

// Generate or reuse a session ID per browser tab
function getSessionId() {
    let sid = sessionStorage.getItem('ai_chat_session');
    if (!sid) {
        sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem('ai_chat_session', sid);
    }
    return sid;
}

async function fetchAllProducts() {
    try {
        const res = await fetch(PRODUCTS_API);
        if (!res.ok) return [];
        const data = await res.json();
        const items = data?.content ?? (Array.isArray(data) ? data : []);
        // Map fields to what the n8n workflow expects
        return items.map(p => ({
            sku:         String(p.id),
            name:        p.productName,
            price:       Number(p.price) || 0,
            stock:       p.stockQuantity ?? 0,
            category:    p.category?.categoryName ?? '',
            description: p.shortDescription ?? '',
        }));
    } catch {
        return [];
    }
}

export default function AIChatWidget() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Xin chào! Tôi là trợ lý AI của Dole Saigon. Bạn cần tư vấn sản phẩm gì không?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const messagesEndRef = useRef(null);

    // Hide on admin pages
    if (location.pathname.startsWith('/admin')) return null;

    useEffect(() => {
        fetchAllProducts().then(setProducts);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: getSessionId(),
                    session_id:  getSessionId(),
                    message:     text,
                    products:    products,
                })
            });

            if (!response.ok) throw new Error('Network error');

            const data = await response.json();

            // Workflow returns { success: true, data: { reply, recommendations, intent } }
            const payload = data?.data ?? data;
            const replyText = payload?.reply || 'Xin lỗi, tôi không thể xử lý yêu cầu. Vui lòng thử lại.';
            const recs = payload?.recommendations ?? [];

            setMessages(prev => [
                ...prev,
                { role: 'assistant', text: replyText, recommendations: recs }
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', text: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="ai-chat-widget">
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-header-info">
                            <div className="ai-chat-avatar">AI</div>
                            <div>
                                <div className="ai-chat-title">Tư vấn sản phẩm</div>
                                <div className="ai-chat-subtitle">Dole Saigon Assistant</div>
                            </div>
                        </div>
                        <button className="ai-chat-close" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-chat-message ${msg.role}`}>
                                <div className="ai-chat-bubble">{msg.text}</div>
                                {msg.recommendations?.length > 0 && (
                                    <div className="ai-chat-recommendations">
                                        <div className="ai-rec-label">Gợi ý sản phẩm:</div>
                                        {msg.recommendations.map((rec, ri) => (
                                            <a
                                                key={ri}
                                                href={`/product/${rec.sku}`}
                                                className="ai-rec-card"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <div className="ai-rec-name">{rec.name}</div>
                                                <div className="ai-rec-meta">
                                                    <span className="ai-rec-price">
                                                        {Number(rec.price).toLocaleString('vi-VN')}đ
                                                    </span>
                                                    <span className="ai-rec-category">{rec.category}</span>
                                                </div>
                                                {rec.reason && (
                                                    <div className="ai-rec-reason">{rec.reason}</div>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ai-chat-message assistant">
                                <div className="ai-chat-bubble ai-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-input-area">
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                            Gửi
                        </button>
                    </div>
                </div>
            )}

            <button className="ai-chat-fab" onClick={() => setIsOpen(prev => !prev)} aria-label="Chat với AI">
                {isOpen ? (
                    <span className="ai-chat-fab-icon">✕</span>
                ) : (
                    <span className="ai-chat-fab-icon">💬</span>
                )}
            </button>
        </div>
    );
}
