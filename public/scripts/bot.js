// ============================================================
//  TechCity Premium Chatbot — Professional Edition
//  Version 3.0 | © 2025 TechCity
// ============================================================

// ── Store Config ─────────────────────────────────────────────
const STORE = {
    name:     'TechCity',
    phone:    '+263 771 488 456',
    whatsapp: 'https://wa.me/263771488456',
    email:    'info@techcity.com',
    address:  '65 Speke Ave, Harare — opposite Finance House',
    hours:    'Mon – Sat  |  7:30 AM – 6:00 PM',
    closed:   'We are closed on Sundays.',
};

// ── Session state ─────────────────────────────────────────────
const SESSION = {
    step:           null,   // current guided flow step
    pendingCategory:null,
    pendingBudget:  null,
    pendingUseCase: null,
    lastProducts:   [],
    chatHistory:    [],
    products:       [], // local cache for all products
};

// ── Product Data Fetcher (Global Access) ───────────────────────
async function ensureProductsLoaded() {
    if (window.products && window.products.length > 0) {
        SESSION.products = window.products;
        return window.products;
    }
    if (SESSION.products.length > 0) return SESSION.products;

    try {
        const response = await fetch((window.TECHCITY_API_BASE || '') + '/api/products');
        const data = await response.json();
        SESSION.products = data;
        if (typeof window !== 'undefined') window.products = data;
        return data;
    } catch (e) {
        console.error('Bot failed to fetch products:', e);
        return [];
    }
}

// ── User Data Helper ──────────────────────────────────────────

// ── User Data Helper ──────────────────────────────────────────
function getUserName() {
    try {
        const userData = JSON.parse(localStorage.getItem('techcity_user'));
        return userData && userData.username ? userData.username : null;
    } catch (e) { return null; }
}

// ── Inject Styles (ELITE FROSTED THEME) ──────────────────────────────
(function() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --chat-primary: #2563eb;
            --chat-primary-dark: #1e40af;
            --chat-accent: #3b82f6;
            --chat-bg: rgba(255, 255, 255, 0.72);
            --chat-glass: blur(35px);
            --chat-border: rgba(255, 255, 255, 0.4);
            --chat-shadow: 
                0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04),
                inset 0 0 20px rgba(255, 255, 255, 0.1);
            --chat-radius: 24px;
            --chat-font: 'Outfit', 'Inter', -apple-system, sans-serif;
        }

        .chatbot-button {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--chat-primary), var(--chat-primary-dark));
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4);
            cursor: pointer;
            z-index: 10000;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .chatbot-button:hover { 
            transform: scale(1.1) rotate(12deg);
            box-shadow: 0 12px 32px rgba(37, 99, 235, 0.6);
        }
        .chatbot-button i { animation: botBreath 3s infinite ease-in-out; }
        @keyframes botBreath { 
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.9; }
        }
        
        .chatbot-button.attention { animation: chatPulse 2s infinite; }
        @keyframes chatPulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }

        .chatbox {
            position: fixed;
            bottom: 175px;
            right: 20px;
            width: 330px;
            height: 500px;
            background: var(--chat-bg);
            backdrop-filter: var(--chat-glass);
            -webkit-backdrop-filter: var(--chat-glass);
            border: 1px solid var(--chat-border);
            border-radius: var(--chat-radius);
            box-shadow: var(--chat-shadow);
            display: flex;
            flex-direction: column;
            z-index: 10000;
            overflow: hidden;
            font-family: var(--chat-font);
            transform: translateY(30px) scale(0.92);
            opacity: 0;
            pointer-events: none;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chatbox.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        .chatbox-header {
            padding: 16px 20px;
            background: linear-gradient(135deg, var(--chat-primary), var(--chat-primary-dark));
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .chatbox-header-main { display: flex; align-items: center; gap: 12px; }
        .chatbox-header-main img { 
            width: 40px; height: 40px; border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid #fff;
        }
        
        .header-btn {
            background: rgba(255, 255, 255, 0.15); 
            border: 1px solid rgba(255, 255, 255, 0.2); 
            padding: 8px; cursor: pointer;
            font-size: 16px; border-radius: 12px; transition: all .2s;
            display: flex; align-items: center; justify-content: center;
            color: #fff;
        }
        .header-btn:hover { 
            background: rgba(255, 255, 255, 0.3); 
            transform: translateY(-1px); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }

        .chatbox-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
        }

        .chatbox-body {
            flex: 1; padding: 16px; overflow-y: auto; scroll-behavior: smooth;
            display: flex; flex-direction: column; gap: 12px;
            background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.03), transparent);
        }
        .chat-date { text-align: center; color: #94a3b8; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        .bot-message, .user-message {
            max-width: 90%; padding: 10px 16px; border-radius: 18px;
            font-size: 0.9rem; line-height: 1.45; position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            animation: messagePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes messagePop {
            from { opacity: 0; transform: translateY(10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bot-message { 
            align-self: flex-start; background: #fff; color: #1e293b;
            border-bottom-left-radius: 4px;
        }
        .user-message { 
            align-self: flex-end; 
            background: linear-gradient(135deg, var(--chat-primary), var(--chat-primary-dark));
            color: #fff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
        }

        .message-time { display: block; font-size: 0.65rem; margin-top: 6px; opacity: 0.5; }
        .user-message .message-time { text-align: right; color: rgba(255,255,255,0.8); }

        .quick-replies {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 12px 16px;
            border-top: 1px solid rgba(0,0,0,0.02);
        }
        .quick-reply {
            padding: 10px 12px; border-radius: 12px;
            background: #fff; border: 1px solid rgba(37, 99, 235, 0.15);
            color: var(--chat-primary); font-size: 0.85rem; font-weight: 600;
            cursor: pointer; transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .quick-reply:hover { 
            background: var(--chat-primary); color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(37, 99, 235, 0.2);
        }

        .chatbox-footer {
            padding: 14px 20px; border-top: 1px solid rgba(0,0,0,0.04);
            display: flex; align-items: center; gap: 10px;
            background: #fff;
        }
        .footer-actions { display: flex; align-items: center; gap: 12px; }
        .action-group { display: flex; gap: 8px; max-width: 0; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; }
        .footer-actions.active .action-group { max-width: 180px; opacity: 1; }
        
        #userInput {
            flex: 1; padding: 12px 20px; border-radius: 30px; border: 2px solid #f1f5f9;
            background: #f8fafc; font-size: 0.95rem; outline: none; transition: all .3s;
        }
        #userInput:focus { border-color: var(--chat-primary); background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

        #sendButton {
            width: 44px; height: 44px; border-radius: 50%; border: none;
            background: linear-gradient(135deg, var(--chat-primary), var(--chat-primary-dark));
            color: #fff; font-size: 18px;
            cursor: pointer; transition: all .3s;
            display: flex; align-items: center; justify-content: center;
        }
        #sendButton:hover { transform: scale(1.1) rotate(-10deg); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }

        /* Carousel Enhancements */
        .product-carousel {
            display: flex; gap: 16px; overflow-x: auto; padding: 12px 0;
            scroll-snap-type: x mandatory; scrollbar-width: none;
        }
        .product-carousel-item {
            flex: 0 0 270px; scroll-snap-align: center;
            background: #fff; border-radius: 20px; overflow: hidden;
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
            transition: transform .3s;
        }
        .product-carousel-item:hover { transform: translateY(-5px); }

        /* Dark Mode Elite */
        .chatbox.dark-mode {
            --chat-bg: rgba(15, 23, 42, 0.85);
            --chat-border: rgba(255, 255, 255, 0.1);
            color: #f1f5f9;
        }
        .chatbox.dark-mode .bot-message { background: #1e293b; color: #f1f5f9; }
        .chatbox.dark-mode #userInput { background: #0f172a; border-color: #334155; color: #fff; }
        .chatbox.dark-mode .chatbox-footer { background: #1e293b; }

        .waveform.hidden { display: none; }
        .recording { animation: pulseRed 1s infinite; color: #ef4444 !important; }
        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

        .typing-indicator {
            display: none;
            align-items: center;
            gap: 4px;
            padding: 12px 16px;
            background: #fff;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            width: fit-content;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            margin-bottom: 12px;
        }
        .typing-indicator span {
            width: 6px;
            height: 6px;
            background: #94a3b8;
            border-radius: 50%;
            animation: typingBlink 1.4s infinite both;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBlink {
            0% { opacity: 0.2; transform: scale(0.8); }
            20% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0.2; transform: scale(0.8); }
        }
        .chatbox.dark-mode .typing-indicator { background: #1e293b; }
    `;
    document.head.appendChild(style);
})();

// ── Inject Chatbot HTML ─────────────────────────────────────────────
(function() {
    if (document.getElementById('chatbox')) return;
    if (!document.body) return;
    const html = `
<a href="javascript:void(0);" class="chatbot-button" id="chatbotButton" aria-label="Chat with Tech City Assistant">
    <i class="fas fa-robot"></i>
</a>
<div class="chatbox" id="chatbox">
    <div class="chatbox-header">
        <div class="chatbox-header-main">
            <img src="/images/techcity.jpg" alt="Logo" />
            <div>
                <div style="font-weight:700;font-size:0.95rem;color:#ffffff;">Tech City Assistant</div>
                <div style="font-size:0.75rem;color:#4ade80;font-weight:600;display:flex;align-items:center;gap:4px;">
                    <span style="font-size:10px;">●</span> Online
                </div>
            </div>
        </div>
        <div class="chatbox-header-actions" style="position: relative;">
            <button id="optionsBtn" class="header-btn" title="Options">⋮</button>
            <div id="optionsMenu" style="display: none; position: absolute; top: 42px; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); min-width: 180px; z-index: 1000; overflow:hidden;">
                <div class="option-item" data-action="clear-chat" style="padding:14px 18px; cursor:pointer; border-bottom:1px solid #f1f5f9;font-size:0.85rem;color:#475569;">🧹 Clear Conversation</div>
                <div class="option-item" data-action="toggle-sound" style="padding:14px 18px; cursor:pointer; border-bottom:1px solid #f1f5f9;font-size:0.85rem;color:#475569;" id="soundOptionBtn">🔊 Sound: ON</div>
                <div class="option-item" data-action="toggle-wakeword" style="padding:14px 18px; cursor:pointer;font-size:0.85rem;color:#475569;" id="wakeWordOptionBtn">🎙️ Wake Word: OFF</div>
            </div>
            <button id="toggleDarkMode" class="header-btn" title="Appearance">☀️</button>
            <button id="closeChat" class="header-btn" title="Close">✕</button>
        </div>
    </div>
    <div class="chatbox-body" id="chatboxBody">
        <div class="chat-date">Today</div>
        <div class="bot-message">
            <p>Hi ${getUserName() || 'there'}! 👋 I'm your <strong>Tech City Assistant</strong>. How can I help you elevate your tech experience today?</p>
            <span class="message-time">Just now</span>
        </div>
        <div class="typing-indicator" id="typingIndicator">
            <span></span><span></span><span></span>
        </div>
    </div>
    <div class="quick-replies">
        <button class="quick-reply">🛒 Browse Products</button>
        <button class="quick-reply">💻 Laptop Guide</button>
        <button class="quick-reply">🚚 Delivery Info</button>
        <button class="quick-reply">💬 Speak to Agent</button>
    </div>
    <div class="chatbox-footer">
        <div class="footer-actions" id="footerActions">
            <button class="header-btn toggle-actions" id="toggleActions">+</button>
            <div class="action-group">
                <button class="header-btn" title="Emoji" id="emojiBtn">😊</button>
                <button class="header-btn" title="Attach file" id="attachBtn">📎</button>
                <button class="header-btn" title="Voice" id="voiceBtn">🎤</button>
            </div>
        </div>
        <input type="text" id="userInput" placeholder="Message assistant..." autocomplete="off" />
        <button id="sendButton">➤</button>
    </div>
    <div id="waveform" class="waveform hidden" style="position:absolute;bottom:85px;left:24px;z-index:99;background:linear-gradient(135deg, #ef4444, #dc2626);padding:10px 20px;border-radius:30px;color:#fff;font-size:0.8rem;font-weight:600;box-shadow:0 8px 20px rgba(239,68,68,0.3);">
        Listening...
    </div>
</div>`;
    const container = document.createElement('div');
    container.innerHTML = html;
    while (container.firstChild) document.body.appendChild(container.firstChild);
})();

// ── DOM refs (updated) ────────────────────────────────────────
const $ = id => document.getElementById(id);
const chatbox        = $('chatbox');
const chatboxBody    = $('chatboxBody');
const typingEl       = $('typingIndicator');
const chatbotButton  = $('chatbotButton');
const closeChatBtn   = $('closeChat');
const sendBtn        = $('sendButton');
const userInputEl    = $('userInput');
const darkModeBtn    = $('toggleDarkMode');
const voiceBtn       = $('voiceBtn');
const waveform       = $('waveform');
const optionsBtn     = $('optionsBtn');
const optionsMenu    = $('optionsMenu');
const toggleActions  = $('toggleActions');
const footerActionsWrapper = $('footerActions');
const emojiBtn       = $('emojiBtn');
const attachBtn      = $('attachBtn');

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('cart')) localStorage.setItem('cart', JSON.stringify([]));
    restoreChatHistory();
});

// ═══════════════════════════════════════════════════════════════
//  SOUND SYNTHESIS (PREMIUM FEATURE)
// ═══════════════════════════════════════════════════════════════

function playSound(type) {
    if (SESSION.soundEnabled === false) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!window.chatAudioCtx) window.chatAudioCtx = new AudioCtx();
        if (window.chatAudioCtx.state === 'suspended') window.chatAudioCtx.resume();
        const t = window.chatAudioCtx.currentTime;
        const osc = window.chatAudioCtx.createOscillator();
        const gain = window.chatAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(window.chatAudioCtx.destination);
        if (type === 'send') {
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else {
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.start(t);
            osc.stop(t + 0.15);
        }
    } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════
//  DISPLAY HELPERS
// ═══════════════════════════════════════════════════════════════

function showTyping(textLengthOrDelay) {
    let ms = typeof textLengthOrDelay === 'number' ? textLengthOrDelay : 
             (textLengthOrDelay ? Math.min(1500, 300 + textLengthOrDelay.length * 15) : 800);
    if (typingEl) typingEl.style.display = 'flex';
    scroll();
    return new Promise(r => setTimeout(() => {
        if (typingEl) typingEl.style.display = 'none';
        r();
    }, ms));
}

function scroll() {
    if (chatboxBody) chatboxBody.scrollTop = chatboxBody.scrollHeight;
}

/** Append a message bubble with premium animations */
function appendMsg(html, cls = 'bot-message') {
    const div = document.createElement('div');
    div.className = cls;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
        <div class="message-content">${html}</div>
        <span class="message-time">${time}</span>
    `;
    
    chatboxBody.appendChild(div);
    scroll();
    return div;
}

/** Show a user bubble immediately */
function showUserMsg(text) {
    playSound('send');
    appendMsg(escHtml(text), 'user-message');
    SESSION.chatHistory.push({ role: 'user', text });
    saveHistory();
}

/** Queue a bot reply with smart typing delay */
function botReply(html, delayMs = 0) {
    // Strip HTML tags to estimate proper reading/typing time
    let rawText = String(html).replace(/<[^>]*>?/gm, '');
    return new Promise(resolve => {
        setTimeout(async () => {
            const typingTime = Math.min(1800, 400 + rawText.length * 12);
            await showTyping(typingTime);
            playSound('receive');
            const div = appendMsg(html, 'bot-message');
            SESSION.chatHistory.push({ role: 'bot', html });
            saveHistory();
            resolve(div);
        }, delayMs);
    });
}

/** Chain multiple bot replies (staggered) */
async function botReplies(...msgs) {
    for (let i = 0; i < msgs.length; i++) {
        await botReply(msgs[i], i === 0 ? 0 : 200);
    }
}

/** Render a set of quick‑reply chips below the last message */
function showChips(labels, onClickFn) {
    const wrap = document.createElement('div');
    wrap.className = 'chip-row';
    wrap.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 12px 0 4px;
    `;
    labels.forEach(label => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
            padding: 8px 10px; border-radius: 12px; border: 1px solid rgba(37, 99, 235, 0.15);
            background: #fff; color: var(--chat-primary); font-size: 0.8rem; cursor: pointer;
            transition: all .2s ease; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        `;
        btn.onmouseenter = () => { btn.style.background = 'var(--chat-primary)'; btn.style.color = '#fff'; };
        btn.onmouseleave = () => { btn.style.background = '#fff'; btn.style.color = 'var(--chat-primary)'; };
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            wrap.remove();
            const cleanLabel = label.replace(/[^\x00-\x7F]/g, "").trim(); // strip emojis for intent matching
            showUserMsg(label);
            onClickFn(label);
        };
        wrap.appendChild(btn);
    });
    chatboxBody.appendChild(wrap);
    scroll();
}

/** Escape HTML to avoid XSS in user text */
function escHtml(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ═══════════════════════════════════════════════════════════════
//  PRODUCT CARD RENDERER
// ═══════════════════════════════════════════════════════════════

function getImg(p) {
    if (p.images && p.images.length) return p.images[0];
    if (p.image) return p.image;
    return '';
}

function starRating(r = 0) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += `<span style="color:${i<=r?'#f5a623':'#ccc'}">★</span>`;
    }
    return s;
}

function productCard(p) {
    const img = getImg(p);
    const specsHtml = (p.specs || []).slice(0,4).map(s =>
        `<li style="font-size:.8rem;color:#555;padding:2px 0;border-bottom:1px solid #f0f0f0;">
            <span style="color:#1557b1">›</span> ${escHtml(s)}
         </li>`
    ).join('');
    const badge = p.badge
        ? `<span style="position:absolute;top:10px;left:10px;background:#e63946;color:#fff;
               font-size:.7rem;font-weight:700;padding:3px 8px;border-radius:12px;
               text-transform:uppercase;letter-spacing:.5px;">${escHtml(p.badge)}</span>`
        : '';

    return `
    <div style="
        border-radius:16px; border:1px solid #e8eaf0; background:#fff;
        box-shadow:0 4px 20px rgba(0,0,0,.07); overflow:hidden;
        max-width:280px; margin:8px 0; position:relative;
        font-family:'Segoe UI',sans-serif; transition:transform .2s;
    " onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='translateY(0)'">
        ${badge}
        ${img ? `<div style="background:#f5f7ff;text-align:center;padding:12px;">
            <img src="${img}" alt="${escHtml(p.name)}"
                 style="width:120px;height:100px;object-fit:contain;" />
        </div>` : ''}
        <div style="padding:14px;">
            <div style="font-size:1rem;font-weight:700;color:#1a1a2e;margin-bottom:2px;">${escHtml(p.name)}</div>
            <div style="font-size:.75rem;color:#888;text-transform:capitalize;margin-bottom:6px;">${escHtml(p.category)}</div>
            <div style="margin-bottom:6px;">${starRating(p.rating)}</div>
            <div style="font-size:1.15rem;font-weight:700;color:#1557b1;margin-bottom:10px;">
                $${Number(p.price).toFixed(2)}
            </div>
            ${specsHtml ? `<ul style="margin:0 0 12px;padding:0;list-style:none;">${specsHtml}</ul>` : ''}
            <div style="display:flex;gap:8px;">
                <button onclick="tcBotAddToCart('${p.id}')"
                    style="flex:1;padding:8px;border:none;border-radius:8px;
                           background:linear-gradient(135deg,#1557b1,#0d3f7a);
                           color:#fff;font-weight:600;font-size:.8rem;cursor:pointer;
                           transition:opacity .2s;"
                    onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">
                    🛒 Add to Cart
                </button>
            </div>
        </div>
    </div>`;
}

/** Display one or more product cards (Carousel Mode) */
async function showProducts(list, intro = null) {
    SESSION.lastProducts = list;
    if (intro) await botReply(intro);
    
    if (list.length === 0) return;

    if (list.length === 1) {
        await botReply(productCard(list[0]), 150);
    } else {
        // Multi-product carousel
        const carouselWrap = document.createElement('div');
        carouselWrap.className = 'product-carousel';
        
        // Custom message div for carousel (no <p> wrapper to allow full width)
        const msgDiv = document.createElement('div');
        msgDiv.className = 'bot-message';
        msgDiv.style.maxWidth = '100%';
        msgDiv.style.background = 'transparent';
        msgDiv.style.border = 'none';
        msgDiv.style.boxShadow = 'none';
        
        msgDiv.appendChild(carouselWrap);
        chatboxBody.appendChild(msgDiv);

        // Show up to 5 items initially
        const limit = 5;
        list.slice(0, limit).forEach(p => {
            const item = document.createElement('div');
            item.className = 'product-carousel-item';
            item.innerHTML = productCard(p);
            carouselWrap.appendChild(item);
        });

        if (list.length > limit) {
            const more = document.createElement('div');
            more.className = 'product-carousel-item';
            more.innerHTML = `<div style="padding:60px 20px; text-align:center; color:#1557b1; font-size:0.9rem; background:#f0f4ff; border-radius:16px; border:1px dashed #1557b1; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <strong>+${list.length - limit} More</strong><br>
                <a href="/shop/index.html" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1557b1;color:#fff;border-radius:25px;text-decoration:none;font-weight:600;font-size:0.8rem;">View All →</a>
            </div>`;
            carouselWrap.appendChild(more);
        }
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = 'Just now';
        msgDiv.appendChild(time);
        
        playSound('receive');
        scroll();
    }
}

// ═══════════════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════════════

window.tcBotAddToCart = function(id) {
    const list = (SESSION.products && SESSION.products.length) ? SESSION.products : (window.products || []);
    if (!list.length) {
        botReply('⚠️ Still loading product data. Please try again in a moment.');
        ensureProductsLoaded();
        return;
    }
    const p = list.find(x => x.id == id); // use == for flexible ID comparison
    if (!p) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(x => x.id === id);
    if (existing) existing.quantity = (existing.quantity || 1) + 1;
    else cart.push({ ...p, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));

    botReply(`✅ <strong>${escHtml(p.name)}</strong> has been added to your cart!`).then(() => {
        const related = products.filter(x => x.category === p.category && x.id !== id).slice(0,2);
        if (related.length) {
            setTimeout(() => {
                botReply('You might also like these:');
                related.forEach(r => botReply(productCard(r), 150));
            }, 600);
        }
    });
};

function cartSummaryText() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.length) return "Your cart is currently empty.";
    let total = 0;
    let lines = cart.map((item, i) => {
        const sub = (item.price || 0) * (item.quantity || 1);
        total += sub;
        return `${i+1}. <strong>${escHtml(item.name)}</strong> × ${item.quantity || 1} — <strong>$${sub.toFixed(2)}</strong>`;
    }).join('<br>');
    return `🛒 <strong>Your Cart:</strong><br>${lines}<br><hr style="border:none;border-top:1px solid #eee;margin:8px 0">
            <strong>Total: $${total.toFixed(2)}</strong>`;
}

// ═══════════════════════════════════════════════════════════════
//  PRODUCT SEARCH
// ═══════════════════════════════════════════════════════════════

// ── Category aliases — maps common user terms to DB category names ──
const CATEGORY_ALIASES = {
    // Laptops
    'laptop': 'laptops', 'laptops': 'laptops', 'notebook': 'laptops', 'notebooks': 'laptops',
    'macbook': 'laptops', 'chromebook': 'laptops', 'ultrabook': 'laptops',
    'thinkpad': 'laptops', 'ideapad': 'laptops',
    // Smartphones
    'phone': 'smartphones', 'phones': 'smartphones', 'smartphone': 'smartphones',
    'smartphones': 'smartphones', 'mobile': 'smartphones', 'mobiles': 'smartphones',
    'iphone': 'smartphones', 'samsung': 'smartphones', 'tecno': 'smartphones',
    'infinix': 'smartphones', 'redmi': 'smartphones', 'xiaomi': 'smartphones',
    'huawei': 'smartphones', 'oppo': 'smartphones', 'vivo': 'smartphones',
    'realme': 'smartphones', 'itel': 'smartphones', 'nokia': 'smartphones',
    'google pixel': 'smartphones', 'pixel': 'smartphones',
    // Accessories
    'accessory': 'accessories', 'accessories': 'accessories',
    'charger': 'accessories', 'chargers': 'accessories',
    'earphone': 'accessories', 'earphones': 'accessories',
    'earbuds': 'accessories', 'earbud': 'accessories',
    'headphone': 'accessories', 'headphones': 'accessories',
    'headset': 'accessories', 'headsets': 'accessories',
    'keyboard': 'accessories', 'keyboards': 'accessories',
    'mouse': 'accessories', 'mice': 'accessories',
    'power bank': 'accessories', 'powerbank': 'accessories',
    'cable': 'accessories', 'cables': 'accessories',
    'case': 'accessories', 'cover': 'accessories', 'covers': 'accessories',
    'adapter': 'accessories', 'adapters': 'accessories',
    'speaker': 'accessories', 'speakers': 'accessories',
    'usb': 'accessories', 'flash drive': 'accessories',
    'memory card': 'accessories', 'sd card': 'accessories',
    'screen protector': 'accessories', 'tempered glass': 'accessories',
    'airpods': 'accessories', 'airpod': 'accessories',
    'watch': 'accessories', 'smartwatch': 'accessories',
    // Printers
    'printer': 'printers', 'printers': 'printers',
    'printing': 'printers', 'scanner': 'printers', 'scanners': 'printers',
    'ink': 'printers', 'toner': 'printers', 'cartridge': 'printers',
    // Bags
    'bag': 'bags', 'bags': 'bags', 'backpack': 'bags', 'backpacks': 'bags',
    'satchel': 'bags', 'laptop bag': 'bags',
    // Tablets
    'tablet': 'tablets', 'tablets': 'tablets', 'ipad': 'tablets',
};

function resolveCategory(term) {
    if (!term) return null;
    const lower = term.toLowerCase().trim();
    // Try exact match first
    if (CATEGORY_ALIASES[lower]) return CATEGORY_ALIASES[lower];
    
    // Split lower into words
    const words = lower.split(/\s+/);
    
    // Check if any word exactly matches an alias
    for (const word of words) {
        if (CATEGORY_ALIASES[word]) return CATEGORY_ALIASES[word];
    }
    
    // Check if the full term contains any multi-word alias as a word group
    for (const [alias, cat] of Object.entries(CATEGORY_ALIASES)) {
        // Only match if the alias exists as a distinct word/phrase in the lower query
        const escapedAlias = alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedAlias}\\b`, 'i');
        if (regex.test(lower)) {
            return cat;
        }
    }
    return null;
}

/** Detect if a term is a brand name (should match product names, not categories) */
const BRAND_NAMES = [
    'hp', 'dell', 'lenovo', 'asus', 'acer', 'apple', 'msi', 'toshiba', 'microsoft',
    'samsung', 'tecno', 'infinix', 'redmi', 'xiaomi', 'huawei', 'oppo', 'vivo',
    'realme', 'itel', 'nokia', 'google', 'motorola', 'sony', 'lg', 'oneplus',
    'jbl', 'anker', 'logitech', 'razer', 'corsair', 'hyperx', 'steelseries',
    'epson', 'canon', 'brother', 'ricoh',
    'oraimo', 'baseus', 'ugreen', 'hoco',
];

function isBrand(term) {
    return BRAND_NAMES.includes(term.toLowerCase().trim());
}

/**
 * Smart product search with weighted scoring.
 * Returns products sorted by relevance.
 */
function searchProducts(query, categoryFilter = null) {
    const list = (SESSION.products && SESSION.products.length) ? SESSION.products : (window.products || []);
    console.log(`Bot: searching among ${list.length} products for query "${query}"${categoryFilter ? ` in category "${categoryFilter}"` : ''}`);
    if (!list.length) return [];

    const rawQuery = query.toLowerCase().trim();
    // Strip common filler words for better matching
    const fillerWords = ['show', 'me', 'find', 'search', 'for', 'get', 'any', 'some', 'the', 'a', 'an', 'i', 'want', 'need', 'looking', 'do', 'you', 'have', 'sell', 'got', 'give'];
    const queryWords = rawQuery.split(/\s+/).filter(w => !fillerWords.includes(w) && w.length > 1);
    const cleanQuery = queryWords.join(' ');
    const querySingular = cleanQuery.replace(/s$/, '');

    // Identify if the query contains a category reference
    const detectedCategory = categoryFilter || resolveCategory(cleanQuery);

    // Identify brand words in query
    const brandWords = queryWords.filter(w => isBrand(w));
    // Non-category, non-brand search terms (model numbers, specific product names)
    const searchTerms = queryWords.filter(w => {
        if (isBrand(w)) return false;
        if (CATEGORY_ALIASES[w]) return false;
        return true;
    });

    const scored = list.map(p => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase().trim();
        const desc = (p.description || '').toLowerCase();
        const specsArr = Array.isArray(p.specs) ? p.specs : (typeof p.specs === 'string' ? [p.specs] : []);
        const specsText = specsArr.join(' ').toLowerCase();

        let score = 0;

        // ── Category filtering (if a category was detected) ──
        if (detectedCategory) {
            const normalizedCat = resolveCategory(cat);
            if (normalizedCat === detectedCategory || cat === detectedCategory || 
                cat === detectedCategory.replace(/s$/, '') || detectedCategory === cat + 's') {
                score += 20; // Category match bonus
            } else {
                return { product: p, score: 0 }; // Wrong category, exclude
            }
        }

        // ── Exact full query match in name ──
        if (name === cleanQuery || name === querySingular) {
            score += 100;
        }
        // ── Name contains full query ──
        else if (name.includes(cleanQuery) || name.includes(querySingular)) {
            score += 60;
        }

        // ── Brand matching ──
        for (const brand of brandWords) {
            if (name.includes(brand)) score += 30;
            else if (specsText.includes(brand)) score += 10;
        }

        // ── Individual search term matching (model numbers, etc.) ──
        for (const term of searchTerms) {
            if (name.includes(term)) score += 25;
            else if (desc.includes(term)) score += 8;
            else if (specsText.includes(term)) score += 5;
        }

        // ── All query words present in name (high relevance) ──
        if (queryWords.length > 1 && queryWords.every(w => name.includes(w))) {
            score += 40;
        }

        return { product: p, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.product);
}

function filterByBudget(list, max) {
    return list.filter(p => p.price <= max);
}

/**
 * Extract a structured product query from natural language.
 * Returns { searchTerms, category, minPrice, maxPrice } or null.
 */
function extractProductQuery(text) {
    const lower = text.toLowerCase().trim();
    let category = null;
    let minPrice = 0;
    let maxPrice = Infinity;
    let hasProductIntent = false;

    // Detect category from the text
    const words = lower.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
        // Try two-word combos first
        if (i < words.length - 1) {
            const twoWord = words[i] + ' ' + words[i+1];
            const cat = resolveCategory(twoWord);
            if (cat) { category = cat; hasProductIntent = true; break; }
        }
        const cat = resolveCategory(words[i]);
        if (cat) { category = cat; hasProductIntent = true; break; }
        if (isBrand(words[i])) { hasProductIntent = true; }
    }

    // Detect price range
    const rangeMatch = lower.match(/(\d+)\s*[-–]\s*(\d+)/) || lower.match(/between\s*(\d+)\s*and\s*(\d+)/i);
    if (rangeMatch) {
        minPrice = parseInt(rangeMatch[1]);
        maxPrice = parseInt(rangeMatch[2]);
        hasProductIntent = true;
    } else {
        const underMatch = lower.match(/(?:under|below|less than|up to|max|at most)\s*\$?\s*(\d+)/i);
        if (underMatch) { maxPrice = parseInt(underMatch[1]); hasProductIntent = true; }
        const overMatch = lower.match(/(?:over|above|more than|at least|from|starting)\s*\$?\s*(\d+)/i);
        if (overMatch) { minPrice = parseInt(overMatch[1]); hasProductIntent = true; }
        const aroundMatch = lower.match(/(?:around|about|roughly|approximately)\s*\$?\s*(\d+)/i);
        if (aroundMatch) {
            const val = parseInt(aroundMatch[1]);
            minPrice = Math.floor(val * 0.8);
            maxPrice = Math.ceil(val * 1.2);
            hasProductIntent = true;
        }
    }

    // Remove filler/intent words to get the actual search terms
    const fillerWords = ['show', 'me', 'find', 'search', 'for', 'get', 'any', 'some',
        'the', 'a', 'an', 'i', 'want', 'need', 'looking', 'do', 'you', 'have', 'sell',
        'got', 'give', 'what', 'which', 'best', 'good', 'cheap', 'cheapest',
        'under', 'below', 'above', 'over', 'between', 'and', 'around', 'about',
        'less', 'more', 'than', 'from', 'to', 'up', 'at', 'most', 'least',
        'starting', 'roughly', 'approximately', 'products', 'product', 'items', 'item'];
    const searchTerms = words.filter(w => {
        if (fillerWords.includes(w)) return false;
        if (/^\$?\d+$/.test(w)) return false; // pure numbers (prices)
        return true;
    }).join(' ');

    if (!hasProductIntent && !searchTerms) return null;

    return { searchTerms, category, minPrice, maxPrice, hasProductIntent };
}

// ═══════════════════════════════════════════════════════════════
//  AGENT STATUS
// ═══════════════════════════════════════════════════════════════

function isAgentOnline() {
    const now = new Date();
    return now.getDay() !== 0 && now.getHours() >= 8 && now.getHours() < 18;
}

async function showAgentCard() {
    const online = isAgentOnline();
    const statusColor = online ? '#28a745' : '#dc3545';
    const bg = online ? '#edfdf3' : '#fff0f0';
    const html = `
    <div style="padding:16px;background:${bg};border-radius:14px;border:1.5px solid ${statusColor};max-width:280px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <img src="/scripts/images/im1.jpg" alt="Agent"
                 style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2.5px solid ${statusColor};">
            <div>
                <div style="font-weight:700;font-size:.95rem;">TechCity Support</div>
                <div style="font-size:.78rem;color:${statusColor};font-weight:600;">
                    ${online ? '🟢 Online — Ready to help' : '🔴 Offline'}
                </div>
            </div>
        </div>
        <div style="font-size:.83rem;color:#444;line-height:1.6;">
            ${online
                ? `I'm available right now! Click below to start a live chat.`
                : `Our agents are offline. Business hours:<br><strong>${STORE.hours}</strong><br>Leave a WhatsApp message and we'll reply first thing.`
            }
        </div>
        <a href="${STORE.whatsapp}" target="_blank"
           style="display:block;margin-top:12px;padding:9px;background:#25D366;
                  color:#fff;font-weight:700;text-align:center;border-radius:8px;
                  text-decoration:none;font-size:.85rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            ${online ? 'Chat with an Agent' : 'Leave a Message'}
        </a>
    </div>`;
    await botReply(html);
}

// ═══════════════════════════════════════════════════════════════
//  GUIDED FLOWS
// ═══════════════════════════════════════════════════════════════

async function startPurchaseAdvisor(category) {
    SESSION.pendingCategory = category;
    SESSION.step = 'use_case';
    const label = category === 'laptops' ? 'laptop' : category === 'smartphones' ? 'phone' : category;
    await botReply(`Great! I'll help you find the perfect <strong>${label}</strong>. 💡<br>
        <em>What will you primarily use it for?</em>`);
    showChips(
        category === 'laptops'
            ? ['🎓 School / Studies', '💼 Business / Work', '🎮 Gaming', '🎨 Creative Work', '🌐 General Use']
            : ['📸 Camera Quality', '🔋 Battery Life', '📱 Social Media', '💰 Best Value', '🚀 Performance'],
        txt => handleUseCase(txt)
    );
}

async function handleUseCase(txt) {
    SESSION.pendingUseCase = txt;
    SESSION.step = 'budget';
    await botReply(`Got it — <strong>${txt}</strong>. 🎯<br>
        What is your <strong>budget range</strong>?`);
    showChips(
        ['Under $300', '$300 – $500', '$500 – $800', '$800 – $1200', 'No limit'],
        txt => handleBudget(txt)
    );
}

async function handleBudget(budgetTxt, min = 0, max = Infinity) {
    SESSION.step = null;
    let minBudget = min;
    let maxBudget = max;

    // If budgetTxt is one of the chips, handle it specifically
    if (max === Infinity && min === 0) {
        if (budgetTxt.includes('300') && budgetTxt.includes('Under')) maxBudget = 300;
        else if (budgetTxt.includes('300')) { minBudget = 300; maxBudget = 500; }
        else if (budgetTxt.includes('500')) { minBudget = 500; maxBudget = 800; }
        else if (budgetTxt.includes('800')) { minBudget = 800; maxBudget = 1200; }
    }

    SESSION.pendingBudget = maxBudget;

    const allProds = await ensureProductsLoaded();
    if (!allProds || !allProds.length) {
        await botReply(`I found great options in that range! 🛍️<br>
            Visit our <a href="/shop/index.html" style="color:#1557b1;font-weight:600;">Shop</a> or
            <a href="/${SESSION.pendingCategory}/index.html" style="color:#1557b1;font-weight:600;">
            ${SESSION.pendingCategory} page</a> to browse and filter.`);
        return;
    }

    // Use category-aware search
    const resolvedCat = resolveCategory(SESSION.pendingCategory) || SESSION.pendingCategory;
    let results = searchProducts(SESSION.pendingCategory || 'products', resolvedCat);
    
    results = results.filter(p => {
        const priceStr = String(p.price).replace(/[^0-9.]/g, '');
        const price = parseFloat(priceStr);
        if (isNaN(price)) return false;
        return price >= minBudget && price <= maxBudget;
    });

    console.log(`Bot: final filtered results count: ${results.length}`);

    if (!results.length) {
        await botReply(`Hmm, I couldn't find any **${SESSION.pendingCategory}** in the **$${minBudget}-$${maxBudget}** range right now.<br>
            I can show you all our <a href="/shop/index.html" style="color:#1557b1;font-weight:600;">available products</a> or you can try a different range.`);
    } else {
        await showProducts(results,
            `✨ I found **${results.length}** ${SESSION.pendingCategory} for you in the **$${minBudget}-$${maxBudget}** range:`);
        showChips(['🛒 View Cart', '🔍 Search Again', '🤝 Talk to Agent'], handleChip);
    }
}

// ═══════════════════════════════════════════════════════════════
//  KEYWORD / INTENT ENGINE
// ═══════════════════════════════════════════════════════════════

const INTENTS = [
    // Greetings & Casual Start
    { match: /\b(hello|hi+|hey|howdy|greetings|good (morning|afternoon|evening)|anyone there|start)\b/i,
      reply: async () => {
          const hour = new Date().getHours();
          const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
          const userName = getUserName();
          const namePart = userName ? `, <strong>${userName}</strong>` : '';
          await botReplies(
              `${greet}${namePart}! 👋 Welcome to <strong>TechCity</strong>. How can I help you today?`,
              `I'm here to chat about anything tech — from picking the right laptop to checking your order status.`
          );
      }},

    // Small Talk: How are you?
    { match: /\b(how are you|how (i)?s it going|how (r|are) (u|you)|u (ok|good))\b/i,
      reply: async () => {
          await botReply("I'm doing great, thank you for asking! 😊 Just here and ready to help you find some awesome tech. How are you doing today?");
      }},

    // Small Talk: What's your name? / Who are you?
    { match: /\b(what is your name|who are you|your name|what (do i|should i) call you)\b/i,
      reply: async () => {
          await botReply("I'm the **TechCity Assistant**! 🤖 You can think of me as your personal tech guide here at the store.");
      }},

    // Small Talk: Who created you?
    { match: /\b(who (made|created|built) you|your creator|who is your boss)\b/i,
      reply: async () => {
          await botReply("I was built by the talented team at **TechCity** to make your shopping experience as smooth as possible! 🚀");
      }},

    // Small Talk: Compliments
    { match: /\b(you are (cool|smart|great|awesome|good|helpful)|nice bot|good job|well done)\b/i,
      reply: async () => {
          await botReply("That's so kind of you! I'm blushing (if a robot could blush)! 😊 I'm just happy to be of service.");
      }},

    // Small Talk: Jokes
    { match: /\b(tell me a joke|joke|laugh)\b/i,
      reply: async () => {
          const jokes = [
              "Why did the computer show up late to work? It had a hard drive! 🚗",
              "Why was the cell phone wearing glasses? Because it lost its contacts! 👓",
              "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
              "What do you call a computer that sings? A Dell! 🎤"
          ];
          await botReply(jokes[Math.floor(Math.random() * jokes.length)]);
      }},

    // General Help / What can you do?
    { match: /\b(what can you do|help|commands|features|how (do i )?use this)\b/i,
      reply: async () => {
          await botReply(`I can help you with a lot of things! 🛠️<br><br>
              • **Find Products**: Ask for "laptops between 200-500"<br>
              • **Guides**: Type "laptop guide" or "phone guide"<br>
              • **Orders**: Ask "where is my order"<br>
              • **Info**: Ask about our "location", "hours", or "payment methods"<br>
              • **Casual**: We can just chat about tech or I can tell you a joke!`);
      }},

    // Laptop Specific Guide
    { match: /\b(laptop guide|recommend a laptop|which laptop (should|do)|buying (a )?laptop|suggest a laptop)\b/i,
      reply: () => startPurchaseAdvisor('laptops') },

    // Phone Specific Guide
    { match: /\b(phone guide|recommend a phone|which phone (should|do)|buying (a )?phone|suggest a phone)\b/i,
      reply: () => startPurchaseAdvisor('smartphones') },

    // Products / Browse
    { match: /\b(products?|catalog|browse|what do you (sell|have)|items?|show me everything|store)\b/i,
      reply: async () => {
          await botReply(`Here's what we carry at <strong>TechCity</strong>:`);
          await botReply(categoriesCard());
      }},

    // Laptops — show actual products from DB
    { match: /\b(laptop|laptops|notebook|macbook|chromebook)\b/i,
      reply: async () => {
          await ensureProductsLoaded();
          const results = searchProducts('laptops', 'laptops');
          if (results.length > 0) {
              await showProducts(results, `💻 Here are our <strong>laptops</strong>:`);
              showChips(['🛒 My Cart', '💻 Laptop Guide', '🤝 Talk to Agent'], handleChip);
          } else {
              await botReply(`💻 We have great laptops! <a href="/Laptops/index.html" style="color:#1557b1;font-weight:600;">Browse Laptops →</a>`);
          }
      }},

    // Smartphones — show actual products from DB
    { match: /\b(phone|smartphone|mobile|iphone)\b/i,
      reply: async () => {
          await ensureProductsLoaded();
          const results = searchProducts('smartphones', 'smartphones');
          if (results.length > 0) {
              await showProducts(results, `📱 Here are our <strong>smartphones</strong>:`);
              showChips(['🛒 My Cart', '📱 Phone Guide', '🤝 Talk to Agent'], handleChip);
          } else {
              await botReply(`📱 We have great smartphones! <a href="/smartphones/index.html" style="color:#1557b1;font-weight:600;">Browse Smartphones →</a>`);
          }
      }},

    // Accessories — show actual products from DB
    { match: /\b(accessor(y|ies)|charger|earphone|headphone|keyboard|mouse|power ?bank|cable)\b/i,
      reply: async () => {
          await ensureProductsLoaded();
          const results = searchProducts('accessories', 'accessories');
          if (results.length > 0) {
              await showProducts(results, `🎧 Here are our <strong>accessories</strong>:`);
              showChips(['🛒 My Cart', '🔍 Search Again', '🤝 Talk to Agent'], handleChip);
          } else {
              await botReply(`🎧 We have great accessories! <a href="/accessories/index.html" style="color:#1557b1;font-weight:600;">Browse Accessories →</a>`);
          }
      }},

    // Printers — show actual products from DB
    { match: /\b(printer|printing|scanner|ink)\b/i,
      reply: async () => {
          await ensureProductsLoaded();
          const results = searchProducts('printers', 'printers');
          if (results.length > 0) {
              await showProducts(results, `🖨️ Here are our <strong>printers</strong>:`);
              showChips(['🛒 My Cart', '🔍 Search Again', '🤝 Talk to Agent'], handleChip);
          } else {
              await botReply(`🖨️ We have great printers! <a href="/printers/index.html" style="color:#1557b1;font-weight:600;">Browse Printers →</a>`);
          }
      }},

    // Bags
    { match: /\b(bag|satchel|backpack|laptop bag)\b/i,
      reply: async () => {
          await ensureProductsLoaded();
          const results = searchProducts('bags', 'bags');
          if (results.length > 0) {
              await showProducts(results, `🎒 Here are our <strong>bags</strong>:`);
              showChips(['🛒 My Cart', '🔍 Search Again', '🤝 Talk to Agent'], handleChip);
          } else {
              await botReply(`🎒 We carry quality laptop bags and satchels.<br>
                  <a href="/bags/bags.html" style="color:#1557b1;font-weight:600;">Browse Bags →</a>`);
          }
      }},

    // Price / Budget
    { match: /\b(price|cost|how much|budget|afford|cheap|expensive)\b/i,
      reply: async () => {
          await botReply(`💲 Prices vary by product. Here's a rough guide:<br>
              <ul style="margin:8px 0 0;padding-left:16px;font-size:.88rem;">
                  <li>💻 Laptops — from <strong>$250</strong></li>
                  <li>📱 Smartphones — from <strong>$100</strong></li>
                  <li>🎧 Accessories — from <strong>$5</strong></li>
                  <li>🖨️ Printers — from <strong>$80</strong></li>
              </ul><br>
              Which category would you like to explore?`);
          showChips(['💻 Laptops', '📱 Smartphones', '🎧 Accessories', '🖨️ Printers'], handleChip);
      }},

    // Cart
    { match: /\b(my cart|cart|checkout|basket|order summary)\b/i,
      reply: async () => {
          await botReply(cartSummaryText());
          showChips(['🗑 Clear Cart', '🛍 Keep Shopping', '✅ Checkout'], handleChip);
      }},

    // Delivery
    { match: /\b(deliver(y|ed)?|shipping|ship|dispatch|send)\b/i,
      reply: async () => {
          await botReply(deliveryCard());
      }},

    // Payment
    { match: /\b(pay(ment)?|how (can i )?pay|accept|cash|ecocash|bank)\b/i,
      reply: async () => {
          await botReply(paymentCard());
      }},

    // Warranty / Returns
    { match: /\b(warrant(y|ies?)|guarant(ee|y)|return|refund|exchange|swap)\b/i,
      reply: async () => {
          await botReply(`🛡️ <strong>Warranty & Returns</strong><br>
              <ul style="margin:8px 0;padding-left:18px;font-size:.88rem;line-height:1.8;">
                  <li>All products include a <strong>manufacturer warranty</strong></li>
                  <li>Returns accepted within <strong>7 days</strong> (unused, original packaging)</li>
                  <li>Exchanges available based on product condition</li>
                  <li>Bring your <strong>receipt</strong> for all claims</li>
              </ul>`);
      }},

    // Repair / Service
    { match: /\b(repair|fix|broken|screen|battery|virus|slow|hang|lag|format|install|window)\b/i,
      reply: async () => {
          await botReply(`🛠️ <strong>TechCity Repair Services</strong><br>
              <ul style="margin:8px 0;padding-left:18px;font-size:.88rem;line-height:1.8;">
                  <li>📱 Phone & Laptop <strong>Screen Replacement</strong></li>
                  <li>🔋 <strong>Battery Replacement</strong></li>
                  <li>🦠 <strong>Virus Removal</strong> & System Cleanup</li>
                  <li>💿 <strong>Windows Installation</strong> & Driver Updates</li>
                  <li>💾 <strong>Data Recovery</strong> (conditions apply)</li>
              </ul>
              Bring it in or <a href="${STORE.whatsapp}" target="_blank" style="color:#1557b1;font-weight:600;">
              WhatsApp us</a> to book.`);
      }},

    // Location
    { match: /\b(location|where (are you|r u)|address|find you|direc)\b/i,
      reply: async () => {
          await botReply(`📍 <strong>Find Us</strong><br>
              <span style="font-size:.9rem;">${STORE.address}</span><br><br>
              🕐 <strong>Hours:</strong> ${STORE.hours}<br>
              ❌ <strong>Sunday:</strong> Closed`);
      }},

    // Contact
    { match: /\b(contact|call|phone number|\+263|whatsapp|email|reach)\b/i,
      reply: async () => {
          await botReply(contactCard());
      }},

    // Hours
    { match: /\b(hours?|open|close|when|what time|working hours?)\b/i,
      reply: async () => {
          await botReply(`⏰ <strong>Business Hours</strong><br>
              ${STORE.hours}<br>
              ❌ Closed on Sundays.`);
      }},

    // About
    { match: /\b(about|company|who are you|what is techcity)\b/i,
      reply: async () => {
          await botReply(`🏢 <strong>About TechCity</strong><br>
              TechCity is Harare's leading technology store, offering premium laptops, smartphones, accessories, printers,
              and professional tech support services. We've been trusted by thousands of customers across Zimbabwe.`);
          showChips(['🛍 Browse Products', '📞 Contact Us', '📍 Our Location'], handleChip);
      }},

    // Promotions
    { match: /\b(promo|sale|discount|deal|offer|special)\b/i,
      reply: async () => {
          await botReply(`🔥 <strong>Current Promotions</strong><br>
              <ul style="margin:8px 0;padding-left:18px;font-size:.88rem;line-height:1.8;">
                  <li>🎧 <strong>Buy 1 Get 1 Free</strong> on selected accessories</li>
                  <li>💻 Up to <strong>15% off</strong> refurbished laptops</li>
                  <li>🚀 <strong>Free same-day delivery</strong> on orders over $50 in Harare</li>
              </ul>
              <a href="${STORE.whatsapp}" target="_blank" style="color:#1557b1;font-weight:600;">
              WhatsApp us for exclusive deals →</a>`);
      }},

    // Agent / Human
    { match: /\b(agent|human|person|staff|support|help me|assist)\b/i,
      reply: showAgentCard },

    // Thank you
    { match: /\b(thank(s| you)|thx|ty|appreciate)\b/i,
      reply: async () => {
          await botReply(`You're very welcome! 😊 Is there anything else I can help you with?`);
          showChips(['🛍 Browse Products', '📞 Contact Us', '🛒 My Cart'], handleChip);
      }},

    // Bye
    { match: /\b(bye|goodbye|see you|later|cya)\b/i,
      reply: async () => {
          await botReply(`👋 Thank you for visiting <strong>TechCity</strong>! Have a great day. Come back anytime! 😊`);
      }},

    // Track order
    { match: /\b(track|order status|where is my order)\b/i,
      reply: async () => {
          await botReply(`📦 To track your order, please <a href="${STORE.whatsapp}" target="_blank"
              style="color:#1557b1;font-weight:600;">WhatsApp us</a> with your <strong>order number</strong>
              and we'll give you a real-time update.`);
      }},

    // Time / Date
    { match: /\b(time|date|today|day)\b/i,
      reply: async () => {
          await botReply(`🗓️ ${new Date().toLocaleString('en-GB', {
              weekday:'long', year:'numeric', month:'long', day:'numeric',
              hour:'2-digit', minute:'2-digit'
          })}`);
      }},

    // Search Again
    { match: /\b(search again|another search)\b/i,
      reply: async () => {
          await botReply("What would you like to search for? 🔍");
          showChips(['💻 Laptops', '📱 Smartphones', '🎧 Accessories', '🖨️ Printers'], handleChip);
      }},

    // View Cart
    { match: /\b(view cart|my cart|show cart)\b/i,
      reply: async () => {
          await botReply(cartSummaryText());
          showChips(['🗑 Clear Cart', '🛍 Keep Shopping', '✅ Checkout'], handleChip);
      }},
];

// ── Rich card builders ────────────────────────────────────────

function categoriesCard() {
    const cats = [
        { icon:'💻', label:'Laptops', href:'/Laptops/index.html' },
        { icon:'📱', label:'Smartphones', href:'/smartphones/index.html' },
        { icon:'🎧', label:'Accessories', href:'/accessories/index.html' },
        { icon:'🖨️', label:'Printers', href:'/printers/index.html' },
        { icon:'🎒', label:'Bags', href:'/bags/bags.html' },
        { icon:'🛍️', label:'All Products', href:'/shop/index.html' },
    ];
    const btns = cats.map(c => `
        <a href="${c.href}" style="
            display:flex;align-items:center;gap:6px;padding:9px 12px;
            background:#f0f4ff;border-radius:10px;text-decoration:none;
            color:#1557b1;font-size:.82rem;font-weight:600;
            border:1px solid #d0dcf5;transition:background .2s;"
           onmouseenter="this.style.background='#d0dcf5'"
           onmouseleave="this.style.background='#f0f4ff'">
            ${c.icon} ${c.label}
        </a>`).join('');
    return `<strong>🛍 Our Categories</strong>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">${btns}</div>`;
}

function paymentCard() {
    return `💳 <strong>Accepted Payment Methods</strong><br>
        <div style="margin:10px 0;display:flex;flex-direction:column;gap:8px;font-size:.88rem;">
            <div style="display:flex;align-items:center;gap:8px;padding:8px;background:#f5fff8;border-radius:8px;">💵 <strong>Cash</strong> — at the store</div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px;background:#f5fff8;border-radius:8px;">📱 <strong>EcoCash</strong> — mobile money</div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px;background:#f5fff8;border-radius:8px;">🏦 <strong>Bank Transfer</strong> — wire / RTGS</div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px;background:#f5fff8;border-radius:8px;">🅿️ <strong>PayPal</strong> — for international orders</div>
        </div>
        <em style="font-size:.8rem;color:#888">💬 Contact us for payment arrangements.</em>`;
}

function deliveryCard() {
    return `🚚 <strong>Delivery Options</strong><br>
        <div style="margin:10px 0;display:flex;flex-direction:column;gap:8px;font-size:.88rem;">
            <div style="padding:10px;background:#fff8f0;border-radius:8px;border-left:3px solid #fd7e14;">
                <strong>⚡ Same-Day Delivery</strong><br>
                <span style="color:#555">Within Harare. Order before 1 PM.</span>
            </div>
            <div style="padding:10px;background:#fff8f0;border-radius:8px;border-left:3px solid #fd7e14;">
                <strong>🚚 Countrywide Courier</strong><br>
                <span style="color:#555">2–4 business days. Courier cost applies.</span>
            </div>
            <div style="padding:10px;background:#fff8f0;border-radius:8px;border-left:3px solid #fd7e14;">
                <strong>🏪 In-Store Pickup</strong><br>
                <span style="color:#555">Free! Collect at 65 Speke Ave, Harare.</span>
            </div>
        </div>
        <a href="${STORE.whatsapp}" target="_blank" style="color:#1557b1;font-weight:600;font-size:.85rem;">
        📲 WhatsApp to confirm your delivery →</a>`;
}

function contactCard() {
    return `📞 <strong>Contact TechCity</strong><br>
        <div style="margin:10px 0;font-size:.88rem;display:flex;flex-direction:column;gap:8px;">
            <div>📞 <a href="tel:${STORE.phone}" style="color:#1557b1;font-weight:600;">${STORE.phone}</a></div>
            <div>💬 <a href="${STORE.whatsapp}" target="_blank" style="color:#25D366;font-weight:600;">WhatsApp Us</a></div>
            <div>📧 <a href="mailto:${STORE.email}" style="color:#1557b1;font-weight:600;">${STORE.email}</a></div>
            <div>📍 ${STORE.address}</div>
            <div>⏰ ${STORE.hours}</div>
        </div>`;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN RESPONSE HANDLER
// ═══════════════════════════════════════════════════════════════

async function getBotResponse(raw) {
    const text = raw.trim();
    const cleanText = text.replace(/[^\x00-\x7F]/g, "").trim();

    // High-priority intents that must bypass guided flows (e.g. Talk to Agent, Checkout, Cart)
    const isGlobalIntent = /^(agent|human|person|staff|support|help me|assist|checkout|clear cart|my cart|cart)$/i.test(cleanText)
        || /\b(agent|support|human|staff|whatsapp|phone|checkout|chat with agent|talk to agent|speak to agent)\b/i.test(cleanText);

    if (!isGlobalIntent) {
        // Guided flow continuation
        if (SESSION.step === 'use_case') { await handleUseCase(text); return; }
        if (SESSION.step === 'budget')   { await handleBudget(text); return; }
    }

    // Cart commands (exact)
    if (/^clear cart$/i.test(text)) {
        localStorage.setItem('cart', JSON.stringify([]));
        await botReply('🗑️ Your cart has been cleared.');
        return;
    }
    if (/^checkout$/i.test(text)) {
        await botReply("✅ Proceeding to checkout! If you're ready, <a href='/shop/index.html' style='color:#1557b1;font-weight:600;'>click here</a> or <a href='" + STORE.whatsapp + "' target='_blank' style='color:#1557b1;font-weight:600;'>WhatsApp us</a> to confirm your order.");
        return;
    }

    // ── 1. Try to extract a structured product query ──
    const pq = extractProductQuery(text);

    // ── 2. Handle explicit price range + optional category ──
    if (pq && (pq.minPrice > 0 || pq.maxPrice < Infinity)) {
        if (pq.category) {
            SESSION.pendingCategory = pq.category;
            await handleBudget(`${pq.minPrice}-${pq.maxPrice}`, pq.minPrice, pq.maxPrice);
            return;
        } else if (SESSION.pendingCategory) {
            await handleBudget(`${pq.minPrice}-${pq.maxPrice}`, pq.minPrice, pq.maxPrice);
            return;
        } else {
            // Have a price range but no category — ask
            SESSION.pendingMin = pq.minPrice;
            SESSION.pendingMax = pq.maxPrice;
            await botReply(`I can help you find something in the **$${pq.minPrice}${pq.maxPrice < Infinity ? '–$' + pq.maxPrice : '+'}** range. 🛍️<br>What type of product are you looking for?`);
            showChips(['💻 Laptops', '📱 Smartphones', '🖨️ Printers', '🎧 Accessories'], (choice) => {
                const cat = choice.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
                SESSION.pendingCategory = resolveCategory(cat) || cat;
                handleBudget(`${SESSION.pendingMin}-${SESSION.pendingMax}`, SESSION.pendingMin, SESSION.pendingMax);
            });
            return;
        }
    }

    // ── 3. Direct product search — check if the query matches actual products ──
    // Only skip for pure greeting/smalltalk/meta intents
    const isSmallTalk = /^(hi+|hey|hello|howdy|greetings|good\s+(morning|afternoon|evening)|bye|goodbye|see you|later|thank(s| you)|thx|ty|how are you|what can you do|help|who are you|your name|tell me a joke|joke)$/i.test(cleanText)
        || /\b(guide|recommend|suggest|which .+ should|buying a)\b/i.test(cleanText);

    if (!isSmallTalk && pq && pq.hasProductIntent) {
        await ensureProductsLoaded();
        const results = searchProducts(pq.searchTerms || text, pq.category);

        if (results.length > 0) {
            // Apply price filter if present
            let filtered = results;
            if (pq.minPrice > 0 || pq.maxPrice < Infinity) {
                filtered = results.filter(p => {
                    const price = parseFloat(String(p.price).replace(/[^0-9.]/g, ''));
                    return !isNaN(price) && price >= pq.minPrice && price <= pq.maxPrice;
                });
            }

            if (filtered.length > 0) {
                const catLabel = pq.category ? ` ${pq.category}` : '';
                await showProducts(filtered, `🔍 I found <strong>${filtered.length}</strong>${catLabel} matching "<strong>${escHtml(text)}</strong>":`);
                showChips(['🛒 My Cart', '🔍 Search Again', '🤝 Talk to Agent'], handleChip);
                return;
            }
        }

        // Product intent detected but no results — tell them specifically
        if (pq.category || pq.searchTerms) {
            const catLabel = pq.category || 'products';
            await botReply(`😕 I couldn't find any <strong>${catLabel}</strong> matching "<strong>${escHtml(pq.searchTerms || text)}</strong>" right now.<br>
                You can <a href="/shop/index.html" style="color:#1557b1;font-weight:600;">browse all products</a> or try a different search term.`);
            showChips(['🛍 Browse Products', '💻 Laptop Guide', '📱 Phone Guide', '🤝 Talk to Agent'], handleChip);
            return;
        }
    }

    // ── 4. Intent matching for non-product queries (greetings, info, etc.) ──
    for (const intent of INTENTS) {
        if (intent.match.test(text) || intent.match.test(cleanText)) {
            await intent.reply();
            return;
        }
    }

    // ── 5. Fallback: broad product search (no structured query detected) ──
    await ensureProductsLoaded();
    const fallbackResults = searchProducts(text);
    if (fallbackResults.length) {
        await showProducts(fallbackResults, `🔍 Here's what I found for "<strong>${escHtml(text)}</strong>":`);
        showChips(['🛒 My Cart', '💼 Get a Recommendation', '🤝 Talk to Agent'], handleChip);
        return;
    }

    // ── 6. Smart fallback ──
    await botReply(`🤔 I'm not sure I understood that. Here's how I can help:`);
    showChips(['🛍 Browse Products', '💰 Check Prices', '📞 Contact Us', '🛒 My Cart', '🤝 Talk to Agent'], handleChip);
}

// ── Chip handler ──────────────────────────────────────────────
function handleChip(label) {
    getBotResponse(label);
}

// ═══════════════════════════════════════════════════════════════
//  SEND + INPUT
// ═══════════════════════════════════════════════════════════════

async function sendMessage() {
    if (!userInputEl) return;
    const text = userInputEl.value.trim();
    if (!text) return;
    userInputEl.value = '';
    showUserMsg(text);
    
    // Ensure products are ready for search
    await ensureProductsLoaded();
    
    await getBotResponse(text);
}

if (sendBtn)      sendBtn.addEventListener('click', sendMessage);
if (userInputEl)  userInputEl.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

// ── Quick reply buttons (static HTML in chatbox) ──────────────
document.addEventListener('click', e => {
    // Quick replies
    if (e.target.classList.contains('quick-reply')) {
        const text = e.target.textContent.trim();
        showUserMsg(text);
        getBotResponse(text);
        return;
    }

    // Auto-hide chatbox when clicking outside
    if (chatbox && chatbox.classList.contains('active')) {
        // If the click is outside the chatbox and outside the chatbot toggle button
        if (!chatbox.contains(e.target) && (!chatbotButton || !chatbotButton.contains(e.target))) {
            // DETACHED ELEMENT FIX: If the element is no longer in the document, 
            // it likely was a chip that got removed on click. Don't close.
            if (!document.body.contains(e.target)) return;

            // Also ignore clicks on the file input, emoji picker, or other overlays
            const isOverlay = e.target.closest('.media-overlay') || 
                              e.target.closest('div[style*="z-index:9999"]'); // simple check for emoji picker
            if (!isOverlay) {
                chatbox.classList.remove('active');
            }
        }
    }
});

// ═══════════════════════════════════════════════════════════════
//  CHAT TOGGLE
// ═══════════════════════════════════════════════════════════════

const GREETING_KEY = 'tc_greeted';

if (chatbotButton) {
    chatbotButton.addEventListener('click', async () => {
        if (!chatbox) return;
        const isOpen = chatbox.classList.contains('active');
        
        // Elite Toggle Logic
        if (isOpen) {
            chatbox.classList.remove('active');
        } else {
            chatbox.classList.add('active');
            chatbotButton.classList.remove('attention');
        }

        if (!isOpen && !sessionStorage.getItem(GREETING_KEY)) {
            sessionStorage.setItem(GREETING_KEY, '1');
            const path = window.location.pathname.toLowerCase();
            let greeting = `I'm your <strong>Tech City Assistant</strong>. How can I help you elevate your tech experience? 🚀`;
            
            if (path.includes('laptops')) {
                greeting = `Looking for a high-performance <strong>laptop</strong> for work or play? I can help you find the best specs! 💻`;
            } else if (path.includes('smartphones')) {
                greeting = `Need a <strong>smartphone</strong> with a pro-grade camera or all-day battery? Let's find your match. 📱`;
            } else if (path.includes('printers')) {
                greeting = `Ready to upgrade your <strong>printing setup</strong>? I've got the best deals on office-grade gear. 🖨️`;
            } else if (path.includes('cart') || path.includes('checkout')) {
                greeting = `Almost ready to finish your order? I can assist with delivery info or payment questions. 🛒`;
            }

            // Auto-greet with elite timing
            await botReplies(
                `👋 Hello! Experience the best of tech at <strong>Tech City</strong>.`,
                greeting
            );
            showChips(['🛍 Browse Products', '💻 Laptop Guide', '📱 Phone Guide', '🤝 Speak to Agent'], handleChip);
        }
    });

    // Elite Proactive Nudge
    const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    if (isHome) {
        setTimeout(() => {
            if (!chatbox.classList.contains('active')) {
                chatbotButton.classList.add('attention');
            }
        }, 20000); // 20s delay for non-intrusive nudge
    } else {
        setTimeout(() => chatbotButton.classList.add('attention'), 3000);
    }
}

if (closeChatBtn) closeChatBtn.addEventListener('click', () => { if (chatbox) chatbox.classList.remove('active'); });

// ═══════════════════════════════════════════════════════════════
//  DARK MODE
// ═══════════════════════════════════════════════════════════════

if (darkModeBtn) {
    darkModeBtn.addEventListener('click', function () {
        chatbox.classList.toggle('dark-mode');
        this.textContent = chatbox.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
}

// ═══════════════════════════════════════════════════════════════
//  VOICE INPUT
// ═══════════════════════════════════════════════════════════════

let recognition, listening = false, silenceTimer;
const SILENCE_MS = 2500;

function startVoice() {
    if (!('webkitSpeechRecognition' in window)) { alert('Voice recognition is only supported in Chrome.'); return; }
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US'; recognition.continuous = true; recognition.interimResults = true;
    listening = true;
    if (userInputEl) userInputEl.value = '';
    if (voiceBtn) { voiceBtn.textContent = '⏹️'; voiceBtn.classList.add('recording'); }
    if (waveform) waveform.classList.remove('hidden');

    recognition.onresult = e => {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(stopVoice, SILENCE_MS);
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
        if (userInputEl) userInputEl.value = t.trim();
    };
    recognition.onerror = stopVoice;
    recognition.start();
}

function stopVoice() {
    if (!listening) return;
    listening = false;
    clearTimeout(silenceTimer);
    recognition.stop();
    if (voiceBtn) { voiceBtn.textContent = '🎤'; voiceBtn.classList.remove('recording'); }
    if (waveform) waveform.classList.add('hidden');
    const spoken = userInputEl ? userInputEl.value.trim() : '';
    if (spoken) { showUserMsg(spoken); if (userInputEl) userInputEl.value = ''; getBotResponse(spoken); }
}

if (voiceBtn) voiceBtn.addEventListener('click', () => listening ? stopVoice() : startVoice());

// ═══════════════════════════════════════════════════════════════
 //  WAKE WORD DETECTION (HEY TECH CITY)
 // ═══════════════════════════════════════════════════════════════
 
 let wakeRecognition, wakeListening = false;
 
 function initWakeWordDetection() {
     if (!('webkitSpeechRecognition' in window)) return;
     if (wakeListening) return;
 
     wakeRecognition = new webkitSpeechRecognition();
     wakeRecognition.lang = 'en-US';
     wakeRecognition.continuous = true;
     wakeRecognition.interimResults = false;
 
     wakeRecognition.onresult = e => {
         for (let i = e.resultIndex; i < e.results.length; i++) {
             const result = e.results[i][0].transcript.toLowerCase().trim();
             console.log('Wake word check:', result);
             if (result.includes('hey tech city') || result.includes('tech city')) {
                 triggerWakeWord();
             }
         }
     };
 
     wakeRecognition.onend = () => {
         if (SESSION.wakeWordEnabled) wakeRecognition.start();
     };
 
     wakeRecognition.onerror = e => {
         console.warn('Wake recognition error:', e.error);
         if (e.error === 'not-allowed') {
             SESSION.wakeWordEnabled = false;
             updateWakeWordUI();
         }
     };
 
     try {
         wakeRecognition.start();
         wakeListening = true;
         console.log('Wake word detection started.');
     } catch(e) {
         console.error('Failed to start wake word detection:', e);
     }
 }
 
 function triggerWakeWord() {
     if (!chatbox.classList.contains('active')) {
         chatbotButton.click();
         botReply("Yes? I'm listening! How can I help you today? 😊");
         playSound('receive');
     }
 }
 
 function updateWakeWordUI() {
     const btn = $('wakeWordOptionBtn');
     if (btn) btn.innerHTML = SESSION.wakeWordEnabled ? '🎙️ Wake Word: ON' : '🎙️ Wake Word: OFF';
 }
 
 // Start on user interaction if enabled
 document.addEventListener('click', () => {
     if (SESSION.wakeWordEnabled && !wakeListening) {
         initWakeWordDetection();
     }
 }, { once: true });

// ═══════════════════════════════════════════════════════════════
//  OPTIONS MENU
// ═══════════════════════════════════════════════════════════════

if (optionsBtn && optionsMenu) {
    optionsBtn.addEventListener('click', e => {
        e.stopPropagation();
        optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { optionsMenu.style.display = 'none'; });
    optionsMenu.addEventListener('click', e => {
        const action = e.target.getAttribute('data-action');
        if (action === 'clear-chat') {
            chatboxBody.innerHTML = '';
            localStorage.removeItem('tc_chatHistory');
            sessionStorage.removeItem(GREETING_KEY);
            botReply('🗑️ Chat cleared. How can I help you?');
        } else if (action === 'toggle-sound') {
            SESSION.soundEnabled = SESSION.soundEnabled === false ? true : false;
            e.target.innerHTML = SESSION.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
            if (SESSION.soundEnabled) playSound('receive');
            return; // don't close menu immediately
        } else if (action === 'toggle-wakeword') {
            SESSION.wakeWordEnabled = !SESSION.wakeWordEnabled;
            updateWakeWordUI();
            if (SESSION.wakeWordEnabled) {
                initWakeWordDetection();
                botReply("🎙️ Wake word detection enabled. Try saying 'Hey Tech City'!");
            } else {
                if (wakeRecognition) wakeRecognition.stop();
                wakeListening = false;
                botReply("🎙️ Wake word detection disabled.");
            }
            return;
        }
        optionsMenu.style.display = 'none';
    });
}

// ── Toggle Footer Actions ─────────────────────────────────────
if (toggleActions && footerActionsWrapper) {
    toggleActions.addEventListener('click', () => footerActionsWrapper.classList.toggle('active'));
}

// ═══════════════════════════════════════════════════════════════
//  FILE ATTACHMENT
// ═══════════════════════════════════════════════════════════════

if (attachBtn) {
    const fileInput = Object.assign(document.createElement('input'), { type:'file', style:'display:none' });
    document.body.appendChild(fileInput);
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'user-message';
        if (file.type.startsWith('image/')) {
            const img = Object.assign(document.createElement('img'), {
                src: URL.createObjectURL(file),
                className: 'chat-file-preview',
            });
            img.style.cssText = 'max-width:150px;border-radius:8px;cursor:pointer;';
            img.onclick = () => {
                const ov = Object.assign(document.createElement('div'), {
                    className: 'media-overlay',
                    innerHTML: `<img src="${img.src}" style="max-width:90%;max-height:90%;border-radius:12px;">`
                });
                ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;';
                ov.onclick = () => ov.remove();
                document.body.appendChild(ov);
            };
            msgDiv.appendChild(img);
        } else {
            msgDiv.innerHTML = `📄 <a href="${URL.createObjectURL(file)}" target="_blank"
                style="color:#1557b1;">${escHtml(file.name)}</a>`;
        }
        chatboxBody.appendChild(msgDiv);
        scroll();
        fileInput.value = '';
        setTimeout(() => botReply('📎 Got it! If you need help with this file, just ask.'), 400);
    });
}

// ═══════════════════════════════════════════════════════════════
//  EMOJI PICKER
// ═══════════════════════════════════════════════════════════════

if (emojiBtn && userInputEl) {
    const EMOJIS = ['😀','😂','😊','😍','😎','🤔','👍','🙏','🎉','💻','📱','💡','🔥','✅','❓','🛒'];
    const picker = document.createElement('div');
    picker.style.cssText = `position:fixed;background:#fff;border:1px solid #ddd;border-radius:12px;
        padding:10px;display:none;flex-wrap:wrap;gap:8px;width:220px;
        box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;`;
    EMOJIS.forEach(em => {
        const sp = Object.assign(document.createElement('span'), { textContent: em });
        sp.style.cssText = 'font-size:1.3rem;cursor:pointer;transition:transform .1s;';
        sp.onmouseenter = () => sp.style.transform = 'scale(1.3)';
        sp.onmouseleave = () => sp.style.transform = 'scale(1)';
        sp.onclick = () => { userInputEl.value += em; userInputEl.focus(); picker.style.display = 'none'; };
        picker.appendChild(sp);
    });
    document.body.appendChild(picker);

    emojiBtn.addEventListener('click', e => {
        const rect = emojiBtn.getBoundingClientRect();
        picker.style.top  = (rect.top - 170) + 'px';
        picker.style.left = rect.left + 'px';
        picker.style.display = picker.style.display === 'flex' ? 'none' : 'flex';
    });
    document.addEventListener('click', e => {
        if (!picker.contains(e.target) && e.target !== emojiBtn) picker.style.display = 'none';
    });
}

// ═══════════════════════════════════════════════════════════════
//  CHAT HISTORY (localStorage)
// ═══════════════════════════════════════════════════════════════

function saveHistory() {
    try {
        // Keep last 30 messages to avoid bloat
        const slice = SESSION.chatHistory.slice(-30);
        localStorage.setItem('tc_chatHistory', JSON.stringify(slice));
    } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════
//  PROACTIVE ENGAGEMENT
// ═══════════════════════════════════════════════════════════════

(function() {
    // If user is idle on index.html for 20s, offer help
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        setTimeout(async () => {
            if (!sessionStorage.getItem('tc_nudged') && !chatbox.classList.contains('active')) {
                sessionStorage.setItem('tc_nudged', '1');
                if (chatbotButton) chatbotButton.classList.add('attention');
                
                // Show a small preview bubble or just wait for them to click
                console.log('Bot: Proactive nudge ready.');
            }
        }, 20000);
    }
})();

function restoreChatHistory() {
    if (!chatboxBody) return;
    try {
        const hist = JSON.parse(localStorage.getItem('tc_chatHistory') || '[]');
        if (!hist.length) return;
        hist.forEach(m => {
            const div = document.createElement('div');
            div.className = m.role === 'user' ? 'user-message' : 'bot-message';
            div.innerHTML = m.role === 'user' ? escHtml(m.text || '') : (m.html || '');
            chatboxBody.appendChild(div);
        });
        SESSION.chatHistory = hist;
        scroll();
    } catch(e) {}
}
