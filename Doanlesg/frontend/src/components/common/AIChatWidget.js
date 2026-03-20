import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './AIChatWidget.css';

// ── Inline markdown renderer (no external deps) ──────────────────────────────
function parseInline(text, keyPrefix) {
    const parts = [];
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
    let lastIndex = 0, match, i = 0;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        if (match[1]) parts.push(<strong key={`${keyPrefix}-b${i++}`}>{match[1]}</strong>);
        else if (match[2]) parts.push(<em key={`${keyPrefix}-i${i++}`}>{match[2]}</em>);
        else if (match[3]) parts.push(
            <a key={`${keyPrefix}-a${i++}`} href={match[4]} target="_blank" rel="noreferrer">{match[3]}</a>
        );
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

function MarkdownBubble({ text }) {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [], listKey = 0;

    const flushList = () => {
        if (!listItems.length) return;
        elements.push(
            <ul key={`ul${listKey++}`} className="ai-md-list">
                {listItems.map((item, i) => (
                    <li key={i}>{parseInline(item, `li${listKey}-${i}`)}</li>
                ))}
            </ul>
        );
        listItems = [];
    };

    lines.forEach((line, idx) => {
        if (/^[-*] /.test(line)) {
            listItems.push(line.slice(2));
        } else {
            flushList();
            if (line.trim() === '') {
                if (elements.length > 0) elements.push(<br key={`br${idx}`} />);
            } else {
                elements.push(
                    <span key={`ln${idx}`} className="ai-md-line">
                        {parseInline(line, `ln${idx}`)}
                    </span>
                );
            }
        }
    });
    flushList();
    return <>{elements}</>;
}
// ─────────────────────────────────────────────────────────────────────────────

const CHAT_API = '/api/chat/consult';
const PRODUCTS_API = '/api/ver0.0.1/product?page=0&size=200&sort=productName';

const STATUS_CYCLE = [
    'Đang tìm kiếm sản phẩm phù hợp...',
    'Đang chuẩn bị tư vấn cho bạn...',
    'Dole Saigon đang xử lý...',
];
const LONG_WAIT_MSG = 'Hệ thống đang bận, vui lòng chờ thêm chút...';
const ERROR_TEXT    = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.';

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
    const [isOpen, setIsOpen]     = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Xin chào! Tôi là trợ lý AI của Dole Saigon. Bạn cần tư vấn sản phẩm gì không?' }
    ]);
    const [input, setInput]           = useState('');
    const [isLoading, setIsLoading]   = useState(false);
    const [statusMsg, setStatusMsg]   = useState(STATUS_CYCLE[0]);
    const [isLongWait, setIsLongWait] = useState(false);
    const [products, setProducts]     = useState([]);

    const messagesEndRef   = useRef(null);
    const cycleIntervalRef = useRef(null);
    const longWaitTimerRef = useRef(null);
    const statusIdxRef     = useRef(0);
    const messageQueueRef  = useRef([]);
    const isLoadingRef     = useRef(false);
    const productsRef      = useRef([]);

    useEffect(() => { productsRef.current = products; }, [products]);

    useEffect(() => {
        fetchAllProducts().then(setProducts);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const startLoadingEffects = () => {
        statusIdxRef.current = 0;
        setStatusMsg(STATUS_CYCLE[0]);
        setIsLongWait(false);

        cycleIntervalRef.current = setInterval(() => {
            statusIdxRef.current = (statusIdxRef.current + 1) % STATUS_CYCLE.length;
            setStatusMsg(STATUS_CYCLE[statusIdxRef.current]);
        }, 1500);

        longWaitTimerRef.current = setTimeout(() => {
            clearInterval(cycleIntervalRef.current);
            setIsLongWait(true);
            setStatusMsg(LONG_WAIT_MSG);
        }, 60000);
    };

    const stopLoadingEffects = () => {
        clearInterval(cycleIntervalRef.current);
        clearTimeout(longWaitTimerRef.current);
        cycleIntervalRef.current = null;
        longWaitTimerRef.current = null;
    };

    // processNext drains the queue after a response lands
    const processNext = useCallback((sendFn) => {
        if (messageQueueRef.current.length > 0) {
            const next = messageQueueRef.current.shift();
            sendFn(next);
        }
    }, []);

    const sendMessage = useCallback(async (textOverride) => {
        const text = (typeof textOverride === 'string' ? textOverride : input).trim();
        if (!text) return;

        // Queue if a request is already in-flight
        if (isLoadingRef.current) {
            messageQueueRef.current.push(text);
            if (typeof textOverride !== 'string') setInput('');
            return;
        }

        isLoadingRef.current = true;
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text }]);
        if (typeof textOverride !== 'string') setInput('');

        startLoadingEffects();

        try {
            const response = await fetch(CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: getSessionId(),
                    session_id:  getSessionId(),
                    message:     text,
                    products:    productsRef.current,
                })
            });

            if (!response.ok) throw new Error('Network error');

            const data    = await response.json();
            const payload = data?.data ?? data;
            const replyText = payload?.reply || 'Xin lỗi, tôi không thể xử lý yêu cầu. Vui lòng thử lại.';
            const recs      = payload?.recommendations ?? [];

            setMessages(prev => [
                ...prev,
                { role: 'assistant', text: replyText, recommendations: recs, fadeIn: true }
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', text: ERROR_TEXT, fadeIn: true }
            ]);
        } finally {
            stopLoadingEffects();
            isLoadingRef.current = false;
            setIsLoading(false);
            processNext(sendMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, processNext]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (location.pathname.startsWith('/admin')) return null;

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
                                <div className={`ai-chat-bubble${msg.fadeIn ? ' ai-fade-in' : ''}`}>
                                    {msg.role === 'assistant'
                                        ? <MarkdownBubble text={msg.text} />
                                        : msg.text}
                                </div>
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
                                <div className="ai-chat-bubble ai-typing-bubble">
                                    <div className="ai-typing-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <div className={`ai-typing-status${isLongWait ? ' ai-typing-status--warn' : ''}`}>
                                        {statusMsg}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-input-area">
                        <input
                            type="text"
                            placeholder={isLoading ? 'Tin nhắn sẽ được gửi sau...' : 'Nhập tin nhắn...'}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button onClick={sendMessage} disabled={!input.trim()}>
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
