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
    loadAndRenderCalendar();
}

async function loadAndRenderCalendar() {
    const room = CONFIG.ROOMS[calState.room];
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
            <p class="room-desc">${room.desc}</p>
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
    document.getElementById('avail-cta').onclick = () => redirectToBooking(calState.room);

    // Fetch busy blocks
    await fetchAndRenderMonth();
}

function changeCalMonth(delta) {
    calState.month += delta;
    if (calState.month > 11) { calState.month = 0; calState.year++; }
    if (calState.month < 0) { calState.month = 11; calState.year--; }
    document.getElementById('day-detail').style.display = 'none';
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

function showDaySlots(dateStr) {
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
            <div class="slot-row ${s.free ? 'free' : 'reserved'}">
                <span class="slot-row-icon">${s.icon}</span>
                <div class="slot-row-info">
                    <span class="slot-row-name">${s.name}</span>
                    <span class="slot-row-hours">${s.hours}</span>
                </div>
                <span class="slot-row-status">${s.free ? '✅ LIBRE' : '❌ RESERVADO'}</span>
            </div>
        `).join('')}
        ${allSlots.some(s => s.free) ? '<button class="cta-btn" style="margin-top:12px" onclick="redirectToBooking(\'' + calState.room + '\')">Reservar este tramo →</button>' : '<p class="day-full-msg">Todos los tramos están reservados para este día.</p>'}
    `;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
