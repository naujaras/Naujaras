const CONFIG = {
    ROOMS: {
        atico: {
            name: "Ático con Piscina",
            desc: "Piscina privada climatizada y Jacuzzi XXL",
            bookingUrl: "https://naujaras-reservas.vercel.app/?room=atico",
            availability: "Suele agotarse con 2 semanas de antelación.",
            calendarId: "91fbc4c4ce05435d7146988aceb737dcd04b6c1c6648de88a8edde5b62407de3@group.calendar.google.com"
        },
        estudio: {
            name: "Estudio Jacuzzi XXL",
            desc: "Espacio amplio con todas las comodidades",
            bookingUrl: "https://naujaras-reservas.vercel.app/?room=estudio",
            availability: "Disponibilidad alta entre semana.",
            calendarId: "d4e9330a3e5bd3016772624c0edf840a8be0a83b6c8cfb567779b5fd036a1715@group.calendar.google.com"
        },
        habitacion: {
            name: "Habitación Jacuzzi XXL",
            desc: "Ambiente íntimo y romántico",
            bookingUrl: "https://naujaras-reservas.vercel.app/?room=habitacion",
            availability: "Ideal para escapadas de última hora.",
            calendarId: "2484f196e7d7bcf5bc15ff2a9ff20b2125a0c7c02bac42fdd3fba82d759f1529@group.calendar.google.com"
        }
    },
    FAQ: [
        { question: "¿Cuál es el horario de entrada?", answer: "Depende del tramo: Día (12:00-19:00), Noche (21:00-10:00). Consulta el 'Día + Noche' para estancias completas." },
        { question: "¿Cómo funciona la fianza?", answer: "Se entrega una fianza en efectivo a la llegada (aprox. 50-100€ según estancia) que se devuelve al salir tras revisar la habitación." },
        { question: "¿Puedo llevar mi propia comida?", answer: "Sí, todas las estancias están equipadas para que puedas traer lo que necesites y disfrutar de una cena privada." },
        { question: "¿Qué incluye el pack romántico?", answer: "Pétalos, velas led, bombones y una botella de cava para hacer tu estancia inolvidable." }
    ],
    N8N_CHATBOT_URL: 'https://n8n-n8n.npfusf.easypanel.host/webhook/chatbot-hub'
};

let currentScreen = 'screen-home';
const history = ['screen-home'];

// --- NAVIGATION ---
function goTo(screenId, params = {}) {
    const current = document.querySelector('.screen.active');
    const next = document.getElementById(screenId);

    if (current) current.classList.remove('active');
    next.classList.add('active');

    currentScreen = screenId;
    history.push(screenId);
    window.scrollTo(0, 0);

    if (screenId === 'screen-info') renderFaqs();
    if (screenId === 'screen-availability') updateAvailInfo('atico');
    if (screenId === 'screen-media') selectMediaRoom('atico', document.querySelector('#media-room-tabs .room-tab'));
}

function goBack() {
    if (history.length > 1) {
        history.pop();
        const prev = history[history.length - 1];
        const current = document.querySelector('.screen.active');
        const next = document.getElementById(prev);

        current.classList.remove('active');
        next.classList.add('active');
        currentScreen = prev;
    }
}

// --- INFO / FAQ ---
function renderFaqs() {
    const grid = document.getElementById('faq-grid');
    grid.innerHTML = CONFIG.FAQ.map(item => `
        <div class="faq-card" onclick="askChatbot('${item.question.replace(/'/g, "\\'")}')"">
            <h4>${item.question}</h4>
            <span class="faq-action">Consultar al asistente →</span>
        </div>
    `).join('');
}

// --- AVAILABILITY ---
function selectAvailRoom(roomKey, btn) {
    document.querySelectorAll('#avail-room-tabs .room-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateAvailInfo(roomKey);
}

function updateAvailInfo(roomKey) {
    const room = CONFIG.ROOMS[roomKey];
    const info = document.getElementById('avail-room-info');

    // Google Calendar Embed URL (público) para visualización inmediata
    const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(room.calendarId)}&ctz=Europe%2FMadrid&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=MONTH&wkst=2`;

    info.innerHTML = `
        <div class="room-detail-header">
            <h3>${room.name}</h3>
            <p class="room-desc">${room.desc}</p>
        </div>
        <div class="visual-calendar-container" style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--border);">
            <iframe src="${calendarUrl}" style="border: 0" width="100%" height="400" frameborder="0" scrolling="no"></iframe>
        </div>
        <div class="avail-status">
            <span class="pulse"></span>
            ${room.availability}
        </div>
    `;
    document.getElementById('avail-cta').onclick = () => redirectToBooking(roomKey);
}

// --- MEDIA / GALLERY ---
const GALLERY = {
    atico: [
        { type: 'video', id: 'mS_6S331MNo' },
        { type: 'image', src: 'images/Atico_1.png' },
        { type: 'image', src: 'images/Atico_2.png' },
        { type: 'image', src: 'images/Atico_3.png' },
        { type: 'image', src: 'images/Atico_4.png' },
        { type: 'image', src: 'images/Atico_5.png' },
        { type: 'image', src: 'images/Atico_6.png' },
        { type: 'image', src: 'images/Atico_7.png' }
    ],
    estudio: [
        { type: 'video', id: 'p7eF5KAnF0k' },
        { type: 'image', src: 'images/Estudio_1.png' },
        { type: 'image', src: 'images/Estudio_2.png' },
        { type: 'image', src: 'images/Estudio_3.png' },
        { type: 'image', src: 'images/Estudio_4.png' },
        { type: 'image', src: 'images/Estudio_5.png' },
        { type: 'image', src: 'images/Estudio_6.png' },
        { type: 'image', src: 'images/Estudio_7.png' },
        { type: 'image', src: 'images/Estudio_8.png' }
    ],
    habitacion: [
        { type: 'image', src: 'images/Habitacion_1.png' },
        { type: 'image', src: 'images/Habitacion_2.png' },
        { type: 'image', src: 'images/Habitacion_3.png' }
    ]
};

function selectMediaRoom(roomKey, btn) {
    document.querySelectorAll('#media-room-tabs .room-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(roomKey);
}

function renderGallery(roomKey) {
    const grid = document.getElementById('gallery-grid');
    const items = GALLERY[roomKey] || [];

    grid.innerHTML = items.map(item => {
        if (item.type === 'video') {
            return `
                <div class="gallery-item video-item full-width" style="grid-column: span 2; aspect-ratio: 16/9;">
                    <iframe src="https://www.youtube.com/embed/${item.id}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>
                </div>
            `;
        }
        return `
            <div class="gallery-item">
                <img src="${item.src}" alt="Naujarás Sevilla" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Naujaras'">
            </div>
        `;
    }).join('');
}

// --- BOOKING ---
function redirectToBooking(roomKey) {
    const baseUrl = "https://naujaras-reservas.vercel.app/";
    const url = roomKey ? `${baseUrl}?room=${roomKey}` : baseUrl;
    window.location.href = url;
}

// --- NATIVE CHATBOT (n8n) ---
let chatMessages = [];
const sessionId = 'hub_' + Math.random().toString(36).substr(2, 9);

function openChat() {
    document.getElementById('chat-modal').classList.add('active');
    if (chatMessages.length === 0) {
        addMessage('bot', '¡Hola! Soy el asistente de Naujarás. ¿En qué puedo ayudarte hoy?');
        chatMessages.push({ sender: 'bot', text: 'init' });
    }
}

function closeChat() {
    document.getElementById('chat-modal').classList.remove('active');
}

function askChatbot(text) {
    openChat();
    sendMessage(text);
}

async function sendMessage(text = null) {
    const input = document.getElementById('chat-input');
    const msg = text || input.value.trim();
    if (!msg) return;

    if (!text) input.value = '';
    addMessage('user', msg);

    // Show animated typing indicator
    const typingId = addMessage('bot', '⏳ Consultando...', true);

    // Animated ellipsis while waiting
    let dots = 0;
    const loadingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        const el = document.getElementById(typingId);
        if (el) el.querySelector('.msg-content').textContent = '⏳ Consultando' + '.'.repeat(dots);
    }, 600);

    // AbortController with 3 minute timeout (AI Agent can take up to 90 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
        const response = await fetch(CONFIG.N8N_CHATBOT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: msg,
                sessionId: sessionId,
                source: 'hub'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        clearInterval(loadingInterval);
        removeMessage(typingId);

        const data = await response.json();

        // Handle n8n response format
        let botText = "Lo siento, he tenido un problema conectando con mi cerebro. ¿Puedes repetir?";
        if (Array.isArray(data)) {
            botText = data[0].output || data[0].content || data[0].text || botText;
        } else {
            botText = data.output || data.content || data.text || botText;
        }

        addMessage('bot', botText);
    } catch (e) {
        clearTimeout(timeoutId);
        clearInterval(loadingInterval);
        removeMessage(typingId);
        if (e.name === 'AbortError') {
            addMessage('bot', 'La respuesta está tardando demasiado. El asistente está muy ocupado ahora mismo. Inténtalo en un momento.');
        } else {
            console.error(e);
            addMessage('bot', 'Vaya, parece que no tengo conexión ahora mismo. Por favor, inténtalo de nuevo en unos segundos.');
        }
    }
}

// --- FORMAT BOT TEXT (Markdown to HTML) ---
function formatBotText(text) {
    // Sanitize: escape HTML entities first
    var safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Convert markdown bold **text** or __text__ to <strong>
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Convert markdown italic *text* or _text_ to <em> (single asterisk)
    safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Handle both literal \n (from JSON string) and real newlines
    safe = safe.replace(/\\n/g, '<br>');
    safe = safe.replace(/\n/g, '<br>');
    return safe;
}

function addMessage(sender, text, isTyping = false) {
    const container = document.getElementById('chat-messages');
    const id = 'msg_' + Date.now();
    const div = document.createElement('div');
    div.className = 'message ' + sender + (isTyping ? ' typing' : '');
    div.id = id;
    // Format bot text (markdown → HTML), sanitize user text
    var formatted;
    if (sender === 'bot') {
        formatted = formatBotText(text);
    } else {
        formatted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    div.innerHTML = '<div class="msg-content">' + formatted + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Handle Enter key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('chat-modal').classList.contains('active')) {
        sendMessage();
    }
});
