const CONFIG = {
    N8N_CHATBOT_URL: 'https://n8n-n8n.npfusf.easypanel.host/webhook/chatbot-hub',
    N8N_FORMS_URL: 'https://n8n-n8n.1owldl.easypanel.host/webhook/hub-forms',
    rooms: {
        atico: {
            name: 'Ático Naujarás',
            desc: 'Suite de lujo con jacuzzi XXL privado en terraza, cama king size y vistas espectaculares. Ideal para escapadas románticas premium. (Nota: Acceso por ascensor hasta la planta anterior, luego un pequeño tramo de escaleras).',
            availability: 'Disponibilidad alta entre semana',
            bookingUrl: 'https://bookingjlfinal.vercel.app/?room=atico',
            media: 'images/Atico_1.png'
        },
        habitacion: {
            name: 'Habitación Naujarás',
            desc: 'Nuestra opción más equilibrada. Jacuzzi XXL, ambiente relajante y total privacidad. Equipada con ducha de cabina y acabados premium.',
            availability: 'Disponible la mayoría de fechas',
            bookingUrl: 'https://bookingjlfinal.vercel.app/?room=habitacion',
            media: 'images/Habitacion_1.png'
        },
        estudio: {
            name: 'Estudio Naujarás',
            desc: 'Espacio acogedor con jacuzzi XXL integrado, diseño moderno y luz natural. Equipado con ducha de cabina y todas las comodidades para una estancia íntima.',
            availability: 'Suele agotarse los fines de semana',
            bookingUrl: 'https://bookingjlfinal.vercel.app/?room=estudio',
            media: 'images/Estudio_1.png'
        }
    },
    FAQ: [
        { question: '¿Cómo funciona la fianza?', answer: 'Se entrega en efectivo a la llegada y se devuelve a la salida tras revisar la estancia.' },
        { question: '¿Puedo llevar invitados?', answer: 'No, la capacidad máxima es de 2 personas (salvo extras en Ático día).' },
        { question: '¿Hay parquing?', answer: 'No disponemos de parquing privado, hay zona azul y parkings públicos cerca.' },
        { question: '¿Se puede fumar?', answer: 'No, está prohibido fumar en todas las instalaciones (incluida la terraza del Ático).' }
    ]
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

// --- AVAILABILITY (Custom Calendar) ---
const ROOM_SCHEDULES = {
    atico: {
        slots: [
            { name: 'Día', hours: '13:00 – 20:00', icon: '☀️', startH: 13, startM: 0, endH: 20, endM: 0, overnight: false },
            { name: 'Noche', hours: '22:00 – 11:00', icon: '🌙', startH: 22, startM: 0, endH: 11, endM: 0, overnight: true }
        ],
        displaySlots: [
            { name: 'Día', hours: '13:00 – 20:00', icon: '☀️' },
            { name: 'Noche', hours: '22:00 – 11:00', icon: '🌙' },
            { name: 'Día Entero (mañana)', hours: '13:00 – 11:00', icon: '🌅' },
            { name: 'Día Entero (noche)', hours: '22:00 – 20:00', icon: '🌆' }
        ]
    },
    estudio: {
        slots: [
            { name: 'Día', hours: '11:30 – 18:30', icon: '☀️', startH: 11, startM: 30, endH: 18, endM: 30, overnight: false },
            { name: 'Noche', hours: '20:00 – 10:00', icon: '🌙', startH: 20, startM: 0, endH: 10, endM: 0, overnight: true }
        ],
        displaySlots: [
            { name: 'Día', hours: '11:30 – 18:30', icon: '☀️' },
            { name: 'Noche', hours: '20:00 – 10:00', icon: '🌙' },
            { name: 'Día Entero (mañana)', hours: '11:30 – 10:00', icon: '🌅' },
            { name: 'Día Entero (noche)', hours: '20:00 – 18:30', icon: '🌆' }
        ]
    },
    habitacion: {
        slots: [
            { name: 'Día', hours: '13:30 – 19:30', icon: '☀️', startH: 13, startM: 30, endH: 19, endM: 30, overnight: false },
            { name: 'Noche', hours: '21:00 – 12:00', icon: '🌙', startH: 21, startM: 0, endH: 12, endM: 0, overnight: true }
        ],
        displaySlots: [
            { name: 'Día', hours: '13:30 – 19:30', icon: '☀️' },
            { name: 'Noche', hours: '21:00 – 12:00', icon: '🌙' },
            { name: 'Día Entero (mañana)', hours: '13:30 – 12:00', icon: '🌅' },
            { name: 'Día Entero (noche)', hours: '21:00 – 19:30', icon: '🌆' }
        ]
    }
};

let calState = { room: 'atico', year: 2026, month: 2, busy: [] }; // month is 0-indexed

function selectAvailRoom(roomKey, btn) {
    document.querySelectorAll('#avail-room-tabs .room-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateAvailInfo(roomKey);
}

function updateAvailInfo(roomKey) {
    const now = new Date();
    calState.room = roomKey;
    calState.year = now.getFullYear();
    calState.month = now.getMonth();
    calState.busy = [];
    selectedDateStr = null;
    selectedSlotName = null;
    loadAndRenderCalendar();
}

async function loadAndRenderCalendar() {
    const room = CONFIG.rooms[calState.room];
    const schedule = ROOM_SCHEDULES[calState.room];
    const info = document.getElementById('avail-room-info');

    const slotsHtml = schedule.displaySlots.map(slot => `
        <div class="time-slot-card">
            <span class="slot-icon">${slot.icon}</span>
            <div class="slot-info">
                <span class="slot-name">${slot.name}</span>
                <span class="slot-hours">${slot.hours}</span>
            </div>
        </div>
    `).join('');

    info.innerHTML = `
        <div class="room-detail-header">
            <h3>${room.name}</h3>
        </div>
        <div class="time-slots-grid">
            <p class="slots-title">Tramos horarios</p>
            ${slotsHtml}
        </div>
        <div class="custom-cal">
            <div class="cal-nav">
                <button class="cal-nav-btn" onclick="changeCalMonth(-1)">‹</button>
                <span class="cal-month-label" id="cal-month-label"></span>
                <button class="cal-nav-btn" onclick="changeCalMonth(1)">›</button>
            </div>
            <div class="cal-header-row">
                <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
            <div class="cal-grid" id="cal-grid">
                <div class="cal-loading">Cargando disponibilidad...</div>
            </div>
        </div>
        <div class="day-detail-panel" id="day-detail" style="display:none;"></div>
        <div class="avail-status">
            <span class="pulse"></span>
            ${room.availability}
        </div>
    `;
    // We don't overwrite the onclick here anymore, we define a global function
    // document.getElementById('avail-cta').onclick = ... is handled by goToBookingWithRoom()

    // Fetch busy blocks
    await fetchAndRenderMonth();
}

function changeCalMonth(delta) {
    calState.month += delta;
    if (calState.month > 11) { calState.month = 0; calState.year++; }
    if (calState.month < 0) { calState.month = 11; calState.year--; }
    document.getElementById('day-detail').style.display = 'none';
    selectedDateStr = null;
    selectedSlotName = null;
    fetchAndRenderMonth();
}

async function fetchAndRenderMonth() {
    const grid = document.getElementById('cal-grid');
    const label = document.getElementById('cal-month-label');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    label.textContent = monthNames[calState.month] + ' ' + calState.year;
    grid.innerHTML = '<div class="cal-loading">Cargando...</div>';

    const dateFrom = `${calState.year}-${String(calState.month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(calState.year, calState.month + 1, 0).getDate();
    const dateTo = `${calState.year}-${String(calState.month + 1).padStart(2, '0')}-${lastDay}`;

    try {
        const resp = await fetch(`${CONFIG.N8N_CHATBOT_URL.replace('chatbot-hub', 'disponibilidad')}?room=${calState.room}&dateFrom=${dateFrom}&dateTo=${dateTo}`, { signal: AbortSignal.timeout(8000) });
        const data = await resp.json();
        calState.busy = Array.isArray(data) ? (data[0]?.busy || []) : (data.busy || []);
    } catch (e) {
        console.warn('API no disponible, mostrando calendario sin datos de reservas:', e);
        calState.busy = [];
    }

    renderMonthGrid();
}

function renderMonthGrid() {
    const grid = document.getElementById('cal-grid');
    const year = calState.year, month = calState.month;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday=0
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';
    // Empty cells before 1st
    for (let i = 0; i < startOffset; i++) {
        html += '<div class="cal-day empty"></div>';
    }

    for (let d = 1; d <= totalDays; d++) {
        const date = new Date(year, month, d);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        if (isPast && !isToday) {
            html += `<div class="cal-day past"><span>${d}</span></div>`;
            continue;
        }

        const status = getDayStatus(dateStr);
        const statusClass = status === 'free' ? 'free' : status === 'partial' ? 'partial' : 'full';
        html += `<div class="cal-day ${statusClass}${isToday ? ' today' : ''}" onclick="showDaySlots('${dateStr}')">
            <span>${d}</span>
            <div class="status-dot"></div>
        </div>`;
    }

    grid.innerHTML = html;
}

function getDayStatus(dateStr) {
    const slots = ROOM_SCHEDULES[calState.room].slots;
    const diaFree = isSlotFree(dateStr, slots[0]); // Día
    const nocheFree = isSlotFree(dateStr, slots[1]); // Noche

    if (diaFree && nocheFree) return 'free';
    if (!diaFree && !nocheFree) return 'full';
    return 'partial';
}

function isSlotFree(dateStr, slot) {
    const [y, m, d] = dateStr.split('-').map(Number);
    let slotStart, slotEnd;

    if (slot.overnight) {
        slotStart = new Date(y, m - 1, d, slot.startH, slot.startM);
        slotEnd = new Date(y, m - 1, d + 1, slot.endH, slot.endM);
    } else {
        slotStart = new Date(y, m - 1, d, slot.startH, slot.startM);
        slotEnd = new Date(y, m - 1, d, slot.endH, slot.endM);
    }

    for (const b of calState.busy) {
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        // Overlap check: events overlap if one starts before the other ends
        if (bStart < slotEnd && bEnd > slotStart) return false;
    }
    return true;
}

let selectedDateStr = null;
let selectedSlotName = null;

function showDaySlots(dateStr) {
    selectedDateStr = dateStr;
    selectedSlotName = null;
    const panel = document.getElementById('day-detail');
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const slots = ROOM_SCHEDULES[calState.room].slots;
    const diaFree = isSlotFree(dateStr, slots[0]);
    const nocheFree = isSlotFree(dateStr, slots[1]);
    const enteroMananaFree = diaFree && nocheFree;
    // Día entero noche: Noche of this day + Día of next day
    const nextDateStr = formatDate(new Date(y, m - 1, d + 1));
    const nextDiaFree = isSlotFree(nextDateStr, slots[0]);
    const enteroNocheFree = nocheFree && nextDiaFree;

    const allSlots = [
        { ...ROOM_SCHEDULES[calState.room].displaySlots[0], free: diaFree },
        { ...ROOM_SCHEDULES[calState.room].displaySlots[1], free: nocheFree },
        { ...ROOM_SCHEDULES[calState.room].displaySlots[2], free: enteroMananaFree },
        { ...ROOM_SCHEDULES[calState.room].displaySlots[3], free: enteroNocheFree }
    ];

    panel.style.display = 'block';
    panel.innerHTML = `
        <div class="day-detail-header">
            <span>${dayNames[date.getDay()]} ${d} de ${monthNames[m - 1]}</span>
            <button class="day-detail-close" onclick="document.getElementById('day-detail').style.display='none'">✕</button>
        </div>
        ${allSlots.map(s => `
            <div class="slot-row ${s.free ? 'free selectable-slot' : 'reserved'}" ${s.free ? `onclick="selectAvailSlot(this, '${s.name}')"` : ''}>
                <span class="slot-row-icon">${s.icon}</span>
                <div class="slot-row-info">
                    <span class="slot-row-name">${s.name}</span>
                    <span class="slot-row-hours">${s.hours}</span>
                </div>
                <span class="slot-row-status">${s.free ? '✅ LIBRE' : '❌ RESERVADO'}</span>
            </div>
        `).join('')}
        ${allSlots.some(s => s.free) ? '<button id="btn-reserve-slot" class="cta-btn" style="margin-top:12px; opacity:0.5; pointer-events:none;" onclick="proceedToBookingSlot()">Elige un tramo arriba ↑</button>' : '<p class="day-full-msg">Todos los tramos están reservados para este día.</p>'}
    `;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectAvailSlot(el, slotName) {
    document.querySelectorAll('.selectable-slot').forEach(n => n.classList.remove('selected-slot'));
    el.classList.add('selected-slot');
    selectedSlotName = slotName;

    const btn = document.getElementById('btn-reserve-slot');
    if (btn) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.textContent = 'Reservar este tramo →';
    }
}

function proceedToBookingSlot() {
    if (!selectedDateStr || !selectedSlotName) {
        redirectToBooking(calState.room);
        return;
    }
    redirectToBooking(calState.room, selectedDateStr, selectedSlotName);
}

function goToBookingWithRoom() {
    if (selectedDateStr && selectedSlotName) {
        proceedToBookingSlot();
    } else {
        redirectToBooking(calState.room);
    }
}

function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- MEDIA / GALLERY ---
const GALLERY = {
    atico: [
        { type: 'video', id: 'ffRvpZEld3s' },
        { type: 'video', id: 'R6vkIgNFxB4' },
        { type: 'video', id: '_EcLnQmrb4I', isShort: true },
        { type: 'video', id: 'i5I_zigZhbU', isShort: true },
        { type: 'video', id: 'Jm6nOZepbdM', isShort: true },
        { type: 'image', src: 'images/Atico_1.png' },
        { type: 'image', src: 'images/Atico_2.png' },
        { type: 'image', src: 'images/Atico_3.png' }
    ],
    estudio: [
        { type: 'video', id: 'kQMiYxlYnsk' },
        { type: 'video', id: 'B7G_jDGRycc' },
        { type: 'video', id: 'nV1X-XQS3IU', isShort: true },
        { type: 'video', id: 'NzY0BYr-QAU', isShort: true },
        { type: 'image', src: 'images/Estudio_1.png' },
        { type: 'image', src: 'images/Estudio_2.png' },
        { type: 'image', src: 'images/Estudio_3.png' }
    ],
    habitacion: [
        { type: 'video', id: 'R2oYmqhkQMA', isShort: true },
        { type: 'video', id: '1qjbJ0dwAPY', isShort: true },
        { type: 'image', src: 'images/Habitacion_1.png' },
        { type: 'image', src: 'images/Habitacion_2.png' }
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
            const ratio = item.isShort ? '9/16' : '16/9';
            const span = item.isShort ? '' : 'style="grid-column: span 2;"';
            return `
                <div class="gallery-item video-item ${item.isShort ? 'short-video' : 'full-width'}" ${span} style="aspect-ratio: ${ratio};">
                    <iframe src="https://www.youtube.com/embed/${item.id}?rel=0&modestbranding=1" frameborder="0" allowfullscreen style="width:100%; height:100%; border-radius:12px;"></iframe>
                </div>
            `;
        }
        // Fallback for Github Pages root folder uploads
        const fallbackFilename = item.src.split('/').pop();
        return `
            <div class="gallery-item" onclick="openImage(this.querySelector('img').src)">
                <img src="${item.src}" alt="Naujarás Sevilla" loading="lazy" onerror="if(!this.dataset.tried){this.dataset.tried='true'; this.src='${fallbackFilename}';} else {this.src='https://via.placeholder.com/400x300?text=Naujaras';}">
            </div>
        `;
    }).join('');
}

function openImage(src) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('image-modal-img');
    img.src = src;
    modal.classList.add('active');
}

function closeImage() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('active');
}

// --- BOOKING ---
function redirectToBooking(roomKey, date = null, slot = null) {
    const baseUrl = "https://bookingjlfinal.vercel.app/";
    let url = roomKey ? `${baseUrl}?room=${roomKey}` : baseUrl;
    if (date) url += `&date=${date}`;
    if (slot) url += `&slot=${encodeURIComponent(slot)}`;
    window.location.href = url;
}

// --- FORM HANDLING ---
async function handleFormSubmit(event, type) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.type = type; // 'postpone', 'delay', 'help'

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const response = await fetch(CONFIG.N8N_FORMS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('¡Gracias! Tu solicitud ha sido enviada correctamente. Juan se pondrá en contacto contigo pronto.');
            form.reset();
            goBack();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (err) {
        console.error('Error al enviar formulario:', err);
        alert('Lo sentimos, ha ocurrido un error al enviar el formulario. Por favor, inténtalo de nuevo o contacta por email.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// --- NATIVE CHATBOT (n8n) ---
let chatMessages = [];
const sessionId = 'hub_' + Math.random().toString(36).substr(2, 9);

function openChat() {
    document.getElementById('chat-modal').classList.add('active');
    if (chatMessages.length === 0) {
        addMessage('bot', '¡Hola! 🧡 Soy el asistente de Naujarás. ¿En qué puedo ayudarte hoy?');
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

    // Small delay to ensure the user message renders before the typing indicator
    await new Promise(resolve => setTimeout(resolve, 50));

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

let msgCounter = 0;
function addMessage(sender, text, isTyping = false) {
    const container = document.getElementById('chat-messages');
    msgCounter++;
    const id = 'msg_' + msgCounter + '_' + Date.now();
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

// --- DYNAMIC OFFERS FROM N8N ---
const OFFER_WEBHOOK_URL = 'https://n8n-n8n.npfusf.easypanel.host/webhook/check-offer';
let offerImageUrls = [];

async function checkActiveOffer() {
    try {
        const response = await fetch(OFFER_WEBHOOK_URL);
        const data = await response.json();

        // Limpiar el array para asegurar datos nuevos
        offerImageUrls = [];

        // Nuevo formato: { active: true, imageUrls: ["url1", "url2"] }
        if (data && data.active) {
            if (Array.isArray(data.imageUrls)) {
                offerImageUrls = data.imageUrls;
            } else if (data.imageUrl) {
                // Formato antiguo por si no han actualizado en n8n: { active: true, imageUrl: "url" }
                offerImageUrls = [data.imageUrl];
            }
        }

        // Si tenemos al menos una oferta, mostramos el botón brillante en la Home
        if (offerImageUrls.length > 0) {
            const btn = document.getElementById('hub-offer-btn');
            if (btn) {
                btn.classList.add('show-offer');
            }
        }
    } catch (err) {
        console.warn('No se pudo comprobar oferta activa:', err);
    }
}

function openOfferModal() {
    if (offerImageUrls.length === 0) return;

    const modal = document.getElementById('offer-modal');
    const container = document.getElementById('offer-images-container');

    // Forzar contenedor para evitar flechas de scroll horizontales
    container.style.overflowX = 'hidden';
    container.style.boxSizing = 'border-box';

    // Limpiamos imágenes previas que hubiésemos creado antes, conservando solo el botón de cerrar
    Array.from(container.children).forEach(child => {
        if (!child.classList.contains('offer-close')) {
            child.remove();
        }
    });

    // Inyectamos cada imagen en el modal
    offerImageUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Oferta de Última Hora en Naujarás";
        img.className = 'offer-img';
        // Estilos base para que salgan una debajo de otra y ajustadas
        img.style.width = '100%';
        img.style.maxWidth = '100%';
        img.style.display = 'block';
        img.style.borderRadius = '12px';
        img.style.marginBottom = '20px';
        img.style.boxSizing = 'border-box';

        container.appendChild(img);
    });

    modal.classList.add('active');
}

function closeOfferModal() {
    const modal = document.getElementById('offer-modal');
    modal.classList.remove('active');
}

// Run offer check on page load
document.addEventListener('DOMContentLoaded', () => {
    checkActiveOffer();
});
