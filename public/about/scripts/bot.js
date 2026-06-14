// =========================
// TechCity Chatbot Script - Full Version (Strict Search)
// =========================

const defaultGreeting = "Hello! I’m TechCity Assistant. How may I assist you today?";
const chatbox = document.getElementById('chatbox');
const chatboxBody = document.getElementById('chatboxBody');
const typingIndicator = document.getElementById('typingIndicator'); 

// DOM Elements
const chatbotButton = document.getElementById('chatbotButton');
const closeChat = document.getElementById('closeChat');
const sendButton = document.getElementById('sendButton');
const userInput = document.getElementById('userInput');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const voiceBtn = document.querySelector('.footer-btn[title="Voice message"]');
const waveform = document.getElementById('waveform');

let lastProducts = []; // last shown products for context
let chatHistory = []; // stores chat messages
let recognition;
let listening = false;
let silenceTimer = null;
const SILENCE_DELAY = 3000;

// =========================
// INITIALIZATION
// =========================
window.addEventListener('DOMContentLoaded', () => {
    chatbox.style.display = 'none';
    if (!localStorage.getItem('cart')) localStorage.setItem('cart', JSON.stringify([]));
});

// =========================
// CREATE MESSAGES
// =========================
function createMessage(text, isBot = false) {
    const msg = document.createElement('div');
    msg.className = isBot ? 'bot-message' : 'user-message';
    msg.textContent = text;
    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;
    if (!isBot) chatHistory.push(text);
}

function createMessageHTML(product) {
    const msg = document.createElement('div');
    msg.className = 'bot-message';
    lastProducts = [product];

    let specsHTML = '';
    if (product.specs && product.specs.length > 0) {
        specsHTML = '<ul>';
        product.specs.forEach(spec => specsHTML += `<li>${spec}</li>`);
        specsHTML += '</ul>';
    }

    let badgeHTML = product.badge ? `<span style="color:red;font-weight:bold">${product.badge}</span><br>` : '';

    msg.innerHTML = `
        <strong>${product.name}</strong> ${badgeHTML}<br>
        Category: ${product.category}<br>
        Price: $${product.price}<br>
        Rating: ${product.rating ? product.rating + ' ⭐' : ''}<br>
        ${specsHTML}
        <img src="${product.image}" style="width:100px;height:auto;margin-top:5px;"><br>
        <button onclick="addToCart('${product.id}')">Add to Cart</button>
    `;

    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;
}

// =========================
// TYPING INDICATOR
// =========================
function showTyping(duration = 500 + Math.random() * 700) {
    typingIndicator.style.display = 'flex';
    setTimeout(() => typingIndicator.style.display = 'none', duration);
}

// =========================
// BOT REPLY
// =========================
function botReply(text, product = null) {
    showTyping();
    setTimeout(() => product ? createMessageHTML(product) : createMessage(text, true), 600);
}

// =========================
// CART FUNCTIONS
// =========================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    botReply(`✅ Great choice! ${product.name} has been added to your cart.`);

    // Suggest related products
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0,2);
    if (related.length) {
        botReply("You might also like:");
        related.forEach(p => botReply(null, p));
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(p => p.id === productId);
    if (index !== -1) {
        const removed = cart.splice(index, 1)[0];
        localStorage.setItem('cart', JSON.stringify(cart));
        return `${removed.name} removed from your cart.`;
    }
    return "Product not found in your cart.";
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    return "Your cart has been cleared.";
}

function showCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const msg = document.createElement('div');
    msg.className = 'bot-message';

    if (!cart.length) msg.textContent = "Your cart is empty.";
    else {
        let html = "<strong>Your Cart:</strong><br>";
        cart.forEach((item,i) => {
            html += `${i+1}. ${item.name} - $${item.price} <button onclick="removeFromCart('${item.id}'); this.parentElement.remove();">Remove</button><br>`;
        });
        msg.innerHTML = html;
    }
    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;
}

function showCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.length) return "Your cart is empty.";
    let summary = "Your cart contains:\n";
    let total = 0;
    cart.forEach((item,i) => {
        summary += `${i+1}. ${item.name} - $${item.price}\n`;
        total += item.price;
    });
    summary += `Total: $${total}`;
    return summary;
}

// =========================
// KEYWORD MAP
// =========================
function getKeywordMap() {
    return [
        // 📍 Location & Contact
        { keywords: ["location", "where are you", "place"], reply: `📍 We are located between 1st and 2nd opposite Finance House,65 Speke Ave, Harare, Zimbabwe` },
        { keywords: ["address"], reply: `📌 Address: 65 Speke Ave, Harare, Zimbabwe` },
        { keywords: ["contact", "phone", "call"], reply: `📞 Call us on +263 771488456` },
        { keywords: ["whatsapp", "chat"], reply: `💬 WhatsApp: https://wa.me/263771234567` },
        { keywords: ["email", "mail"], reply: `📧 Email: info@techcity.com` },

        // ⏰ Business Hours
        { keywords: ["hours", "opening", "closing", "open", "close"], reply: `⏰ Open Mon–Sat, 7:30 AM – 6:00 PM` },

        // 🏢 Company
        { keywords: ["about", "company", "who are you"], reply: "🏢 TechCity sells phones, laptops, gadgets, accessories, and offers tech support." },

        // 💳 Payments (UI ENABLED)
        { keywords: ["payment", "pay", "how to pay", "payment methods"], reply: () => { showPaymentMethods(); return null; } },

        // 🚚 Delivery (UI ENABLED)
        { keywords: ["delivery", "shipping", "deliver"], reply: () => { showDeliveryOptions(); return null; } },
        { keywords: ["same day delivery"], reply: "🚀 Same-day delivery available within Harare." },

        // 🔄 Returns & Warranty
        { keywords: ["return", "refund"], reply: "🔄 Returns accepted within 7 days (conditions apply)." },
        { keywords: ["warranty", "guarantee"], reply: "🛡 All products include a warranty. Period depends on item type." },

        // 🛍 Products & Stock
        { keywords: ["products", "items", "catalog"], reply: () => { showProductCategories(); return null; } },
        { keywords: ["phones", "smartphones"], reply: "📱 We sell Samsung, iPhone, Tecno, Infinix & Redmi." },
        { keywords: ["laptops"], reply: "💻 We stock HP, Dell, Lenovo, ASUS & Apple laptops." },
        { keywords: ["accessories"], reply: "🎧 Chargers, earphones, cases, keyboards, mice & more." },
        { keywords: ["gaming"], reply: "🎮 Gaming laptops, consoles, controllers & accessories available." },
        { keywords: ["available", "in stock"], reply: "📦 Stock changes daily. Please mention the product name." },
        { keywords: ["price", "cost", "how much"], reply: "💲 Prices vary by product. Ask for a specific item." },

        // 🔧 Services
        { keywords: ["repair", "fix"], reply: "🛠 We repair phones and laptops. Visit us for diagnosis." },
        { keywords: ["software", "windows", "installation"], reply: "💿 We install Windows, drivers & software." },

        // 📦 Orders
        { keywords: ["track order", "order status"], reply: "📦 Type: track ORDER_NUMBER" },

        // 🛒 Cart
        { keywords: ["cart", "my cart", "checkout"], reply: showCartSummary },
        { keywords: ["show cart"], reply: showCart },
        { keywords: ["clear cart", "empty cart"], reply: clearCart },

        // 🤖 Help & Agent
        { keywords: ["help", "support"], reply: "🤖 I can help with products, payments, delivery, or orders." },
        { keywords: ["talk to agent", "human", "agent"], reply: "📞 Click **Talk to Agent** below for live support." },

        // 🎉 Promotions
        { keywords: ["sale", "discount", "offer", "promo", "promotion"], reply: "🔥 Current promo: Buy 1 Get 1 Free on accessories!" },

        // 👋 Greetings
        { keywords: ["hello", "hi", "hey", "greetings"], reply: "👋 Hello! I'm TechCity Assistant. How can I help?" },

        // ⏱ Date & Time
        { keywords: ["time", "date"], reply: () => `⏱ ${new Date().toLocaleString()}` },
    ];
}

// =========================
// PRODUCT FUNCTIONS
// =========================

function getProductsByCategory(category) {
    const found = strictProductSearch(category);
    if (found.length) found.forEach(p => displayProduct(p)); // use styled display
    else botReply(`No products found matching "${category}".`);
}

function suggestProducts() {
    const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0,3);
    randomProducts.forEach(p => displayProduct(p)); // use styled display
}

function trackOrder(orderId) {
    const statuses = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return `Order #${orderId} is currently: ${status}.`;
}


// STRICT PRODUCT SEARCH - EXACT MATCH IN NAME OR CATEGORY
// =========================
function strictProductSearch(userText) {
    const keyword = userText.toLowerCase().trim();
    if (!keyword) return [];

    return products.filter(product => {
        // Match only in product name or category
        const nameMatch = product.name.toLowerCase().includes(keyword);
        const categoryMatch = product.category.toLowerCase().includes(keyword);
        return nameMatch || categoryMatch;
    });
}


// =========================
// DISPLAY PRODUCT WITH STYLING
function displayProduct(product) {
    // format specs as styled list with bullet icons
    const specsHtml = product.specs.map(spec => `
        <li style="
            margin-bottom:6px;
            display:flex;
            align-items:center;
            gap:6px;
            font-size:0.85rem;
            color:#555;
        ">
            <span style="
                width:6px;
                height:6px;
                background:#1557b1;
                border-radius:50%;
                display:inline-block;
            "></span>
            ${spec}
        </li>
    `).join('');

    const html = `
        <div style="
            display: flex;
            gap:16px;
            padding:16px;
            background:#f9f9f9;
            border-radius:14px;
            border:1px solid #ddd;
            box-shadow:0 4px 12px rgba(0,0,0,0.05);
            max-width:420px;
            margin:10px 0;
            font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition:all 0.2s ease;
        ">
            <!-- Product Image -->
            <img src="${product.image}" style="
                width:100px;
                height:100px;
                border-radius:12px;
                object-fit:cover;
                flex-shrink:0;
            " />

            <!-- Product Details -->
            <div style="flex:1; display:flex; flex-direction:column;">
                <!-- Product Name -->
                <strong style="
                    font-size:1.1rem;
                    font-weight:700;
                    color:#1557b1;
                    margin-bottom:6px;
                    text-transform:uppercase;
                ">${product.name}</strong>

                <!-- Category and Price -->
                <span style="
                    font-size:0.87rem;
                    color:#777;
                    margin-bottom:6px;
                ">Category: ${product.category}</span>

                <span style="
                    font-size:0.92rem;
                    font-weight:600;
                    color:#28a745;
                    margin-bottom:8px;
                ">Price: $${product.price}</span>

                <!-- Specs List -->
                <ul style="
                    margin:0;
                    padding-left:0;
                    list-style:none;
                    line-height:1.5;
                ">
                    ${specsHtml}
                </ul>
            </div>
        </div>
    `;

    botReply(html); // show the styled product
}

// =========================
// BOT LOGIC
// =========================
function getBotResponse(msg) {
    const text = normalizeText(msg);

    // 0️⃣ Show clickable product categories if user mentions 'product'
    if (text.includes('product')) {
        showProductCategories(); // This is the function that shows the clickable category buttons
        return null; // Already handled
    }

    // 1️⃣ Keyword responses
    for (const entry of getKeywordMap()) {
        if (entry.keywords.some(kw => text.includes(kw))) {
            return typeof entry.reply === 'function' ? entry.reply() : entry.reply;
        }
    }

    // 2️⃣ Commands
    if (text.startsWith('add ')) { 
        addToCart(text.split(' ')[1]); 
        return null; 
    }
    if (text.startsWith('remove ')) return removeFromCart(text.split(' ')[1]);
    if (text.startsWith('track ')) return trackOrder(text.split(' ')[1]);

    // 3️⃣ Context "this" refers to last product
    if (text.includes('this') && /add|buy/.test(text)) {
        if (lastProducts.length) { 
            addToCart(lastProducts[0].id); 
            return null; 
        } else return "Which product are you referring to?";
    }

    // 4️⃣ Show by category (user types "show laptops", "show accessories", etc.)
    if (text.startsWith('show ')) {
        const keyword = text.replace('show ', '').trim();
        const found = strictProductSearch(keyword);
        if (found.length) found.forEach(p => botReply(null, p));
        else botReply(`Sorry, no products found matching "${keyword}".`);
        return null;
    }

    // 5️⃣ Strict product search for general messages
    const foundProducts = strictProductSearch(text);
    if (foundProducts.length) { 
        foundProducts.forEach(p => botReply(null, p)); 
        return null; 
    }

    return "🤔 I didn’t quite understand that. You can ask about products, categories, cart, store info, or orders.";
}

// =========================
// NORMALIZE TEXT
// =========================
function normalizeText(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\b(show|me|please|find|search|for|the|a|an)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// =========================
// SEND GREETING
// =========================
function sendGreeting() {
    if (!chatboxBody.querySelector('.bot-message')) botReply(defaultGreeting);
}

// =========================
// CHAT TOGGLE
// =========================
chatbotButton.addEventListener('click', () => {
    chatbox.style.display = chatbox.style.display === 'flex' ? 'none' : (sendGreeting(), 'flex');
});
closeChat.addEventListener('click', () => chatbox.style.display = 'none');

// =========================
// SEND MESSAGE
// =========================
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });

function sendMessage() {
    const text = userInput.value.trim();
    if(!text) return;
    createMessage(text);
    userInput.value = '';
    const response = getBotResponse(text);
    if(response) botReply(response);
}

// =========================
// DARK MODE TOGGLE
// =========================
toggleDarkMode.addEventListener('click', function() {
    chatbox.classList.toggle('dark-mode');
    this.textContent = chatbox.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// =========================
// VOICE INPUT — AUTO SEND
// =========================
voiceBtn.addEventListener('click', () => { listening ? stopVoice() : startVoice(); });

function startVoice() {
    if(!('webkitSpeechRecognition' in window)) return alert("Voice recognition works best in Chrome.");

    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    listening = true;
    userInput.value = '';
    voiceBtn.textContent = '⏹️';
    voiceBtn.classList.add('recording');
    waveform?.classList.remove('hidden');

    recognition.onresult = (event) => {
        let transcript = '';
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(stopVoice, SILENCE_DELAY);

        for(let i=event.resultIndex;i<event.results.length;i++){
            transcript += event.results[i][0].transcript;
        }
        userInput.value = transcript.trim();
    };
    recognition.onerror = () => stopVoice();
    recognition.start();
}

function stopVoice() {
    if(!listening) return;
    listening = false;
    clearTimeout(silenceTimer);
    recognition.stop();
    voiceBtn.textContent = '🎤';
    voiceBtn.classList.remove('recording');
    waveform?.classList.add('hidden');

    const spokenText = userInput.value.trim();
    if(!spokenText) return;
    createMessage(spokenText);
    const response = getBotResponse(spokenText);
    if(response) botReply(response);
    userInput.value = '';
}

// =========================
// CHATBOT ATTENTION ANIMATION
// =========================
setTimeout(() => chatbotButton.classList.add("attention"), 2000);
chatbotButton.addEventListener("click", () => chatbotButton.classList.remove("attention"));










const toggleBtn = document.querySelector('.toggle-actions');
const footerActions = document.querySelector('.footer-actions');

toggleBtn.addEventListener('click', () => {
    footerActions.classList.toggle('active');
});


//


// ---------------------- CHAT SECTIONS ----------------------
window.addEventListener('DOMContentLoaded', () => {
    const chatboxBody = document.getElementById('chatboxBody');



    // --- Helper to append bot message ---
    function botReply(messageHtml) {
        // Ensure it's a string
        if (typeof messageHtml !== 'string') {
            messageHtml = JSON.stringify(messageHtml);
        }

        const msg = document.createElement('div');
        msg.className = 'bot-message';
        msg.style.padding = '12px 15px';
        msg.innerHTML = messageHtml;
        chatboxBody.appendChild(msg);
        chatboxBody.scrollTop = chatboxBody.scrollHeight;

        saveChat(messageHtml);
    }

    // --- Save chat to localStorage ---
    function saveChat(html) {
        if (typeof html !== 'string') return; // safeguard
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        history.push(html);
        localStorage.setItem('chatHistory', JSON.stringify(history));
    }

    // --- Restore chat from localStorage ---
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatHistory.forEach(h => {
        const div = document.createElement('div');
        div.className = 'bot-message';
        div.style.padding = '12px 15px';
        div.innerHTML = h; // safely restore HTML
        chatboxBody.appendChild(div);
    });

    // --- Agent online check ---
    function isAgentOnline() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // Sunday = 0
        return day !== 0 && hour >= 8 && hour < 18;
    }

    // --- Typing indicator ---
    function showAgentTyping() {
        const typing = document.createElement('div');
        typing.className = 'bot-message';
        typing.id = 'agent-typing';
        typing.innerHTML = `<em>TechCity Agent is typing<span id="dots">.</span></em>`;
        chatboxBody.appendChild(typing);
        chatboxBody.scrollTop = chatboxBody.scrollHeight;

        let dots = 1;
        const interval = setInterval(() => {
            const el = document.getElementById('dots');
            if (!el) return clearInterval(interval);
            dots = dots % 3 + 1;
            el.textContent = '.'.repeat(dots);
        }, 500);

        return () => {
            clearInterval(interval);
            typing.remove();
        };
    }

    // --- Ticket system ---
    function createTicket(message) {
        const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
        tickets.push({ message, time: new Date().toLocaleString(), status: 'open' });
        localStorage.setItem('tickets', JSON.stringify(tickets));
    }
// --- Products (UPDATED UI) ---
function showProductCategories() {
    const categories = [
        { name: 'All Products', category: 'all', icon: '📦' },
        { name: 'Laptops', category: 'laptops', icon: '💻' },
        { name: 'Smartphones', category: 'smartphones', icon: '📱' },
        { name: 'Accessories', category: 'accessories', icon: '🎧' },
        { name: 'Printers', category: 'printers', icon: '🖨️' }
    ];

    const msg = document.createElement('div');
    msg.className = 'bot-message';
    msg.style.padding = '14px 16px';
    msg.innerHTML = `
        <strong style="display:block; margin-bottom:10px;">
            🛍 Browse Categories
        </strong>
        <div class="chat-category-container"></div>
    `;

    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;

    const container = msg.querySelector('.chat-category-container');
    container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    `;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.innerHTML = `
            <span style="font-size:0.95rem">${cat.icon}</span>
            <span>${cat.name}</span>
        `;

        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 8px 0;
            border-radius: 8px;
            border: none;
            background: #007BFF;
            color: #fff;
            font-weight: 500;
            font-size: 0.75rem;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
        `;

        btn.onmouseenter = () => {
            btn.style.background = '#0056b3';
            btn.style.transform = 'translateY(-1px)';
        };

        btn.onmouseleave = () => {
            btn.style.background = '#007BFF';
            btn.style.transform = 'translateY(0)';
        };

        btn.onclick = () => filterProducts(cat.category);

        container.appendChild(btn);
    });
} // ← END of showProductCategories
// --- Payments (Updated Product-style UI) ---
function showPaymentMethods() {
    const payments = [
        { name: 'Cash 💵', method: 'cash' },
        { name: 'EcoCash 📱', method: 'mobilemoney' },
        { name: 'PayPal 🅿️', method: 'paypal' }
    ];

    const msg = document.createElement('div');
    msg.className = 'bot-message';
    msg.style.padding = '14px 16px';
    msg.innerHTML = `
        <strong style="display:block; margin-bottom:10px;">
            💳 Payment Methods
        </strong>
        <div class="chat-payment-container"></div>
    `;
    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;

    const container = msg.querySelector('.chat-payment-container');
    container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    `;

    payments.forEach(pay => {
        const btn = document.createElement('button');
        btn.innerHTML = `<span>${pay.name}</span>`;
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 8px 0;
            border-radius: 8px;
            border: none;
            background: #28a745;
            color: #fff;
            font-weight: 500;
            font-size: 0.75rem;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
        `;
        btn.onmouseenter = () => {
            btn.style.background = '#218838';
            btn.style.transform = 'translateY(-1px)';
        };
        btn.onmouseleave = () => {
            btn.style.background = '#28a745';
            btn.style.transform = 'translateY(0)';
        };
        btn.onclick = () => botReply(`You selected **${pay.name}** as your payment method ✅`);
        container.appendChild(btn);
    });
}

// --- Delivery (Updated Product-style UI) ---
function showDeliveryOptions() {
    const deliveries = [
        { name: 'Standard Delivery', info: '3-5 business days' },
        { name: 'Express Delivery', info: '1-2 business days' },
        { name: 'Pickup', info: 'Collect from store' }
    ];

    const msg = document.createElement('div');
    msg.className = 'bot-message';
    msg.style.padding = '14px 16px';
    msg.innerHTML = `
        <strong style="display:block; margin-bottom:10px;">
            🚚 Delivery Options
        </strong>
        <div class="chat-delivery-container"></div>
    `;
    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;

    const container = msg.querySelector('.chat-delivery-container');
    container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    `;

    deliveries.forEach(del => {
        const btn = document.createElement('button');
        btn.innerHTML = `<span>${del.name}</span>`;
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 8px 0;
            border-radius: 8px;
            border: none;
            background: #fd7e14;
            color: #fff;
            font-weight: 500;
            font-size: 0.75rem;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
        `;
        btn.onmouseenter = () => {
            btn.style.background = '#e06c0a';
            btn.style.transform = 'translateY(-1px)';
        };
        btn.onmouseleave = () => {
            btn.style.background = '#fd7e14';
            btn.style.transform = 'translateY(0)';
        };
        btn.onclick = () => botReply(`You selected **${del.name}** 🚚 (${del.info})`);
        container.appendChild(btn);
    });
}

    // --- Quick replies ---
    const quickReplies = document.querySelectorAll('.quick-reply');
    quickReplies.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent.trim();
            if (text === '🛒 Products') showProductCategories();
            else if (text === '💳 Payments') showPaymentMethods();
            else if (text === '🚚 Delivery') showDeliveryOptions();


else if (text === '📞 Talk to agent') {
    const online = isAgentOnline();
    const message = encodeURIComponent("Hello, I need assistance from TechCity Support.");
    if (!online) createTicket(message);

    const stopTyping = showAgentTyping();
    setTimeout(() => {
        stopTyping();

        const statusColor = online ? '#28a745' : '#dc3545';
        const bgColor = online ? 'linear-gradient(135deg, #e6f4ea, #d1ead7)' : '#fdecea';
        const textColor = online ? '#155724' : '#721c24';

        const html = `
            <div class="agent-card" style="
                display: flex;
                flex-direction: column;
                padding: 16px;
                background: ${bgColor};
                border-radius: 16px;
                border: 1px solid ${statusColor};
                box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                max-width: 420px;
                margin: 10px 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <!-- Avatar + Name -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="scripts/images/im1.jpg" style="
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 3px solid ${statusColor};
                        flex-shrink: 0;
                    " />
                    <span style="
                        font-size: 1rem;
                        font-weight: 600;
                        color: ${textColor};
                    ">TechCity Agent</span>
                </div>

                <!-- Status below both avatar and name -->
                <div style="
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: ${statusColor};
                    margin-top: 6px;
                    margin-left: 68px; /* aligns under avatar + name */
                ">
                    ${online ? '🟢 Online' : '🔴 Offline'}
                </div>

                <!-- Divider -->
                <div style="
                    height: 1px;
                    background: ${statusColor}33;
                    border-radius: 2px;
                    margin: 10px 0;
                "></div>

                <!-- Message -->
                <div style="
                    font-size: 0.85rem;
                    line-height: 1.6;
                    color: ${textColor};
                ">
                    ${
                        online
                        ? `😊 <strong>Hello!</strong> I’m available to assist you now.<br><br>
                           <a href="https://wa.me/263783187312?text=${message}" target="_blank" 
                                style="
                                    color:#1557b1;
                                    text-decoration:none;
                                    font-weight:600;
                                ">
                                👉 Chat on WhatsApp
                           </a>`
                        : `⏰ <strong>Our agents are currently offline.</strong><br>
                           🕒 Mon–Sat, 8am–6pm<br><br>
                           <a href="https://wa.me/263783187312?text=${message}" target="_blank"
                                style="
                                    color:#1557b1;
                                    text-decoration:none;
                                    font-weight:600;
                                ">
                                👉 Leave a WhatsApp message
                           </a>`
                    }
                </div>
            </div>
        `;

        botReply(html);

        // Hover effect
        const card = chatboxBody.lastElementChild;
        if (card) {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px)';
                card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
            });
        }
    }, 1500);
}

 
 else botReply("🤔 Sorry, I don't know what to do with that.");
        });
    });

    // --- AI + Human Hybrid Example ---
    window.botSmartReply = (text) => {
        if (isAgentOnline()) {
            botReply("🧑‍💼 A human agent will reply shortly.");
        } else {
            botReply("🤖 I can help with products, payments, or delivery.");
        }
    };
});

// ====== OPTIONS MENU ======
const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');

// Toggle menu visibility
optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent click from closing menu immediately
    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
});

// Hide menu when clicking outside
document.addEventListener('click', () => {
    optionsMenu.style.display = 'none';
});

// Handle menu option clicks
optionsMenu.addEventListener('click', (e) => {
    const action = e.target.getAttribute('data-action');
    if (action === 'clear-chat') {
        chatboxBody.innerHTML = '';
        localStorage.removeItem('chatHistory');
        botReply("🗑 Chat has been cleared.");
    }
    // Add more actions here if needed
    optionsMenu.style.display = 'none';
});










//ATTACH FILES BUTTON/ICON
const attachBtn = document.querySelector('.footer-btn[title="Attach file"]');
const hiddenFileInput = document.createElement('input');
hiddenFileInput.type = 'file';
hiddenFileInput.multiple = false;
hiddenFileInput.style.display = 'none';
document.body.appendChild(hiddenFileInput);

attachBtn.addEventListener('click', () => hiddenFileInput.click());

hiddenFileInput.addEventListener('change', () => {
    const file = hiddenFileInput.files[0];
    if (!file) return;

    const chatboxBody = document.getElementById('chatboxBody');
    const msg = document.createElement('div');
    msg.className = 'user-message';

    let mediaElement;

    if (file.type.startsWith('image/')) {
        mediaElement = document.createElement('img');
        mediaElement.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
        mediaElement = document.createElement('video');
        mediaElement.src = URL.createObjectURL(file);
        mediaElement.controls = false; // thumbnail only
    } else {
        const docLink = document.createElement('a');
        docLink.href = URL.createObjectURL(file);
        docLink.textContent = `📄 ${file.name}`;
        docLink.target = '_blank';
        docLink.className = 'chat-file-link';
        msg.appendChild(docLink);
        chatboxBody.appendChild(msg);
        chatboxBody.scrollTop = chatboxBody.scrollHeight;
        hiddenFileInput.value = '';
        return;
    }

    mediaElement.className = 'chat-file-preview';
    msg.appendChild(mediaElement);
    chatboxBody.appendChild(msg);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;

    // --- Overlay click to fullscreen ---
    mediaElement.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'media-overlay';
        overlay.innerHTML = `
            ${file.type.startsWith('image/') ? `<img src="${mediaElement.src}" />` : `<video src="${mediaElement.src}" controls autoplay></video>`}
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => overlay.remove());
    });

    hiddenFileInput.value = '';
});





const emojiBtn = document.querySelector('.footer-btn[title="Emoji"]');
const chatInput = document.getElementById('userInput');

// Create emoji container
const emojiContainer = document.createElement('div');
emojiContainer.className = 'emoji-container';
emojiContainer.style.display = 'none';
document.body.appendChild(emojiContainer);

// List of emojis (you can expand this)
const emojis = ['😀','😂','😊','😍','😎','🤔','😢','😡','👍','🙏','🎉','💻','📱','💡'];

emojis.forEach(emoji => {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.className = 'emoji-item';
    span.addEventListener('click', () => {
        chatInput.value += emoji;
        chatInput.focus();
        emojiContainer.style.display = 'none';
    });
    emojiContainer.appendChild(span);
});

// Toggle emoji container on button click
emojiBtn.addEventListener('click', (e) => {
    const rect = emojiBtn.getBoundingClientRect();
    emojiContainer.style.top = rect.top - 200 + 'px'; // above button
    emojiContainer.style.left = rect.left + 'px';
    emojiContainer.style.display = emojiContainer.style.display === 'flex' ? 'none' : 'flex';
});

// Hide when clicking outside
document.addEventListener('click', (e) => {
    if (!emojiContainer.contains(e.target) && e.target !== emojiBtn) {
        emojiContainer.style.display = 'none';
    }
});
