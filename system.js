// ============================================
// SYSTEM NOX - SaaS Management Dashboard
// ============================================

// Mock Data (en producción esto vendría de Firebase/API)
let mockData = {
    mrr: 875000, // $875k ARS mensuales
    clients: [
        {
            id: 1,
            name: "La Focacceria de Lola",
            contact: "Juan Pérez",
            plan: "Catálogo Pro",
            status: "active",
            monthlyAmount: 35000,
            nextPayment: new Date(2026, 0, 25),
            whatsapp: "5493442515588",
            domain: "lafocacceriadelola.com.ar"
        },
        {
            id: 2,
            name: "Matilde Joyas",
            contact: "María González",
            plan: "Catálogo Básico",
            status: "active",
            monthlyAmount: 25000,
            nextPayment: new Date(2026, 0, 22),
            whatsapp: "5493442653918",
            domain: "matildejoyas.com.ar"
        },
        {
            id: 3,
            name: "Electro Aguirre",
            contact: "Carlos Aguirre",
            plan: "Catálogo Pro",
            status: "pending",
            monthlyAmount: 35000,
            nextPayment: new Date(2026, 0, 20),
            whatsapp: "5493442123456",
            domain: "electroaguirre.com.ar"
        },
        {
            id: 4,
            name: "Calo Tattoo",
            contact: "Calo",
            plan: "Landing Premium",
            status: "active",
            monthlyAmount: 20000,
            nextPayment: new Date(2026, 0, 28),
            whatsapp: "5493442987654",
            domain: "calotattoo.com.ar"
        }
    ],
    expenses: [
        { concept: "Hosting Vercel Pro", category: "Infraestructura", amount: 20, currency: "USD", frequency: "Mensual" },
        { concept: "Dominios .com.ar (x10)", category: "Dominios", amount: 15000, currency: "ARS", frequency: "Anual" },
        { concept: "Firebase", category: "Infraestructura", amount: 10, currency: "USD", frequency: "Mensual" }
    ]
};

// Tasa de cambio USD a ARS (mock)
const USD_TO_ARS = 1000;

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');
            const sectionId = item.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// ============================================
// DASHBOARD MRR
// ============================================
function initDashboard() {
    updateMRRStats();
    initMRRChart();
    loadUpcomingPayments();
}

function updateMRRStats() {
    const totalMRR = mockData.clients
        .filter(c => c.status === 'active')
        .reduce((sum, c) => sum + c.monthlyAmount, 0);

    const yourShare = totalMRR / 2;
    const partnerShare = totalMRR / 2;
    const activeClients = mockData.clients.filter(c => c.status === 'active').length;

    document.getElementById('mrr-total').textContent = formatCurrency(totalMRR);
    document.getElementById('tu-parte').textContent = formatCurrency(yourShare);
    document.getElementById('parte-socio').textContent = formatCurrency(partnerShare);
    document.getElementById('clientes-activos').textContent = activeClients;
}

function initMRRChart() {
    const ctx = document.getElementById('mrrChart');
    if (!ctx) return;

    // Mock data de últimos 6 meses
    const labels = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'];
    const data = [0, 25000, 60000, 120000, 180000, 240000]; // Crecimiento progresivo

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'MRR (ARS)',
                data: data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0a0a0a',
                    titleColor: '#fff',
                    bodyColor: '#10b981',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#888',
                        callback: function (value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#888'
                    }
                }
            }
        }
    });
}

function loadUpcomingPayments() {
    const paymentsList = document.getElementById('payments-list');
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingPayments = mockData.clients
        .filter(c => c.nextPayment >= today && c.nextPayment <= nextWeek)
        .sort((a, b) => a.nextPayment - b.nextPayment);

    if (upcomingPayments.length === 0) {
        paymentsList.innerHTML = '<p style="color: var(--system-text-muted); text-align: center; padding: 2rem;">No hay cobros próximos en los siguientes 7 días</p>';
        return;
    }

    paymentsList.innerHTML = upcomingPayments.map(client => `
        <div class="payment-item">
            <div class="payment-info">
                <div class="payment-client">${client.name}</div>
                <div class="payment-date">Vence: ${formatDate(client.nextPayment)}</div>
            </div>
            <div class="payment-amount">${formatCurrency(client.monthlyAmount)}</div>
            <div class="payment-actions">
                <button class="btn btn-sm btn-primary" onclick="sendPaymentReminder('${client.whatsapp}', '${client.name}', ${client.monthlyAmount})">
                    <i data-lucide="message-circle"></i>
                    Recordar
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function refreshPayments() {
    loadUpcomingPayments();
    showNotification('Pagos actualizados', 'success');
}

function sendPaymentReminder(whatsapp, clientName, amount) {
    const message = encodeURIComponent(
        `Hola ${clientName}! 👋\n\n` +
        `Te escribimos de NOX para recordarte que hoy vence tu abono mensual de la plataforma.\n\n` +
        `💰 Monto: ${formatCurrency(amount)}\n\n` +
        `Podés realizar el pago por transferencia o Mercado Pago.\n\n` +
        `¡Gracias por confiar en nosotros! 🚀`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
}

// ============================================
// SUBSCRIPTIONS
// ============================================
function initSubscriptions() {
    loadSubscriptionsTable();
    initSubscriptionFilters();
}

function loadSubscriptionsTable() {
    const tbody = document.getElementById('subscriptions-tbody');

    tbody.innerHTML = mockData.clients.map(client => `
        <tr>
            <td>
                <div style="font-weight: 600;">${client.name}</div>
                <div style="color: var(--system-text-muted); font-size: 0.875rem;">${client.contact}</div>
            </td>
            <td>${client.plan}</td>
            <td>
                <span class="status-badge ${client.status}">
                    <i data-lucide="${getStatusIcon(client.status)}"></i>
                    ${getStatusText(client.status)}
                </span>
            </td>
            <td>${formatDate(client.nextPayment)}</td>
            <td style="font-weight: 700;">${formatCurrency(client.monthlyAmount)}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-icon" onclick="editSubscription(${client.id})" title="Editar">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleSubscriptionStatus(${client.id})" title="Suspender/Activar">
                        <i data-lucide="power"></i>
                    </button>
                    <button class="btn-icon" onclick="sendPaymentReminder('${client.whatsapp}', '${client.name}', ${client.monthlyAmount})" title="Enviar recordatorio">
                        <i data-lucide="message-circle"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function initSubscriptionFilters() {
    const searchInput = document.getElementById('search-client');
    const filterStatus = document.getElementById('filter-status');

    searchInput.addEventListener('input', filterSubscriptions);
    filterStatus.addEventListener('change', filterSubscriptions);
}

function filterSubscriptions() {
    const searchTerm = document.getElementById('search-client').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;

    const rows = document.querySelectorAll('#subscriptions-tbody tr');

    rows.forEach(row => {
        const clientName = row.querySelector('td:first-child div').textContent.toLowerCase();
        const status = row.querySelector('.status-badge').classList[1];

        const matchesSearch = clientName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;

        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

function getStatusIcon(status) {
    const icons = {
        active: 'check-circle',
        suspended: 'x-circle',
        pending: 'clock'
    };
    return icons[status] || 'circle';
}

function getStatusText(status) {
    const texts = {
        active: 'Activo',
        suspended: 'Suspendido',
        pending: 'Pago Pendiente'
    };
    return texts[status] || status;
}

function addNewSubscription() {
    // Scroll to onboarding section
    document.querySelector('[data-section="onboarding"]').click();
}

function editSubscription(clientId) {
    const client = mockData.clients.find(c => c.id === clientId);
    if (!client) return;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <form onsubmit="saveSubscription(event, ${clientId})">
            <div class="form-group">
                <label>Estado del Servicio</label>
                <select name="status" required>
                    <option value="active" ${client.status === 'active' ? 'selected' : ''}>Activo</option>
                    <option value="suspended" ${client.status === 'suspended' ? 'selected' : ''}>Suspendido</option>
                    <option value="pending" ${client.status === 'pending' ? 'selected' : ''}>Pago Pendiente</option>
                </select>
            </div>
            <div class="form-group">
                <label>Monto Mensual</label>
                <input type="number" name="amount" value="${client.monthlyAmount}" required>
            </div>
            <div class="form-group">
                <label>Próximo Cobro</label>
                <input type="date" name="nextPayment" value="${client.nextPayment.toISOString().split('T')[0]}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
        </form>
    `;

    document.getElementById('subscription-modal').classList.add('active');
}

function toggleSubscriptionStatus(clientId) {
    const client = mockData.clients.find(c => c.id === clientId);
    if (!client) return;

    client.status = client.status === 'active' ? 'suspended' : 'active';
    loadSubscriptionsTable();
    updateMRRStats();
    showNotification(`Suscripción ${client.status === 'active' ? 'activada' : 'suspendida'}`, 'success');
}

function saveSubscription(event, clientId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const client = mockData.clients.find(c => c.id === clientId);

    if (client) {
        client.status = formData.get('status');
        client.monthlyAmount = parseInt(formData.get('amount'));
        client.nextPayment = new Date(formData.get('nextPayment'));
    }

    closeModal();
    loadSubscriptionsTable();
    updateMRRStats();
    showNotification('Suscripción actualizada', 'success');
}

function closeModal() {
    document.getElementById('subscription-modal').classList.remove('active');
}

// ============================================
// ONBOARDING
// ============================================
function initOnboarding() {
    const form = document.getElementById('new-client-form');
    form.addEventListener('submit', handleNewClient);

    // File upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--system-border)';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--system-border)';
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    const uploadedFilesContainer = document.getElementById('uploaded-files');

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file';
            fileDiv.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-file" onclick="this.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            `;
            uploadedFilesContainer.appendChild(fileDiv);
            lucide.createIcons();
        };
        reader.readAsDataURL(file);
    });
}

function handleNewClient(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const newClient = {
        id: mockData.clients.length + 1,
        name: formData.get('business_name'),
        contact: formData.get('client_name'),
        plan: formData.get('plan'),
        status: 'active',
        monthlyAmount: getPlanAmount(formData.get('plan')),
        nextPayment: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        whatsapp: formData.get('whatsapp'),
        domain: formData.get('domain')
    };

    mockData.clients.push(newClient);

    showNotification('¡Cliente creado exitosamente! 🚀', 'success');
    event.target.reset();
    document.getElementById('uploaded-files').innerHTML = '';

    // Update all sections
    updateMRRStats();
    loadSubscriptionsTable();
    loadUpcomingPayments();
    populateClientSelect();
}

function getPlanAmount(plan) {
    const amounts = {
        'catalogo-basico': 25000,
        'catalogo-pro': 35000,
        'landing-premium': 20000
    };
    return amounts[plan] || 25000;
}

function resetForm() {
    document.getElementById('new-client-form').reset();
    document.getElementById('uploaded-files').innerHTML = '';
}

// ============================================
// PORTAL CLIENTE
// ============================================
function initPortal() {
    populateClientSelect();
    const form = document.getElementById('payment-link-form');
    form.addEventListener('submit', generatePaymentLink);
}

function populateClientSelect() {
    const select = document.getElementById('client-select');
    select.innerHTML = '<option value="">Seleccionar cliente...</option>' +
        mockData.clients.map(client =>
            `<option value="${client.id}">${client.name}</option>`
        ).join('');
}

function generatePaymentLink(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const clientId = formData.get('client');
    const client = mockData.clients.find(c => c.id == clientId);

    if (!client) return;

    // Generate QR (mock - en producción usarías una librería como qrcode.js)
    const qrDisplay = document.getElementById('qr-display');
    const qrCode = document.getElementById('qr-code');

    qrCode.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
            <div style="color: #000; font-weight: 600;">QR de Suscripción</div>
            <div style="color: #666; font-size: 0.875rem; margin-top: 0.5rem;">${client.name}</div>
            <div style="color: #10b981; font-weight: 700; margin-top: 1rem;">${formatCurrency(client.monthlyAmount)}/mes</div>
        </div>
    `;

    qrDisplay.style.display = 'block';
    showNotification('QR generado exitosamente', 'success');
}

function downloadQR() {
    showNotification('Descarga iniciada', 'info');
    // En producción: implementar descarga real del QR
}

function shareWhatsApp() {
    const message = encodeURIComponent(
        '¡Hola! 👋\n\n' +
        'Te compartimos el link para adherir tu tarjeta al débito automático de tu sitio web NOX.\n\n' +
        'Escaneá el QR adjunto para completar la suscripción.\n\n' +
        '¡Gracias por confiar en nosotros! 🚀'
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// ============================================
// GASTOS
// ============================================
function initGastos() {
    updateFinancialSummary();
}

function updateFinancialSummary() {
    const totalIncome = mockData.clients
        .filter(c => c.status === 'active')
        .reduce((sum, c) => sum + c.monthlyAmount, 0);

    // Calcular gastos mensuales (convertir anuales a mensuales)
    const monthlyExpenses = mockData.expenses.reduce((sum, expense) => {
        let amount = expense.amount;
        if (expense.currency === 'USD') {
            amount = amount * USD_TO_ARS;
        }
        if (expense.frequency === 'Anual') {
            amount = amount / 12;
        }
        return sum + amount;
    }, 0);

    const netAmount = totalIncome - monthlyExpenses;
    const yourShare = netAmount / 2;
    const partnerShare = netAmount / 2;

    document.getElementById('summary-income').textContent = formatCurrency(totalIncome);
    document.getElementById('summary-expenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('summary-net').textContent = formatCurrency(netAmount);
    document.getElementById('summary-your-share').textContent = formatCurrency(yourShare);
    document.getElementById('summary-partner-share').textContent = formatCurrency(partnerShare);
}

function addExpense() {
    const tbody = document.getElementById('expenses-tbody');
    const newRow = tbody.insertRow(0);
    newRow.innerHTML = `
        <td><input type="text" placeholder="Concepto" style="width: 100%; background: transparent; border: 1px solid var(--system-border); padding: 0.5rem; border-radius: 6px; color: var(--system-text);"></td>
        <td>
            <select style="background: var(--system-bg); border: 1px solid var(--system-border); padding: 0.5rem; border-radius: 6px; color: var(--system-text);">
                <option>Infraestructura</option>
                <option>Dominios</option>
                <option>Marketing</option>
                <option>Otros</option>
            </select>
        </td>
        <td><input type="text" placeholder="Monto" style="width: 100%; background: transparent; border: 1px solid var(--system-border); padding: 0.5rem; border-radius: 6px; color: var(--system-text);"></td>
        <td>
            <select style="background: var(--system-bg); border: 1px solid var(--system-border); padding: 0.5rem; border-radius: 6px; color: var(--system-text);">
                <option>Mensual</option>
                <option>Anual</option>
            </select>
        </td>
        <td>
            <button class="btn-icon" onclick="saveExpense(this)">
                <i data-lucide="check"></i>
            </button>
            <button class="btn-icon" onclick="this.closest('tr').remove()">
                <i data-lucide="x"></i>
            </button>
        </td>
    `;
    lucide.createIcons();
}

function saveExpense(btn) {
    showNotification('Gasto guardado', 'success');
    updateFinancialSummary();
}

function editExpense(btn) {
    showNotification('Función de edición disponible próximamente', 'info');
}

// ============================================
// UTILITIES
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

function showNotification(message, type = 'info') {
    // Simple notification (en producción usar una librería como toastify)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initSubscriptions();
    initOnboarding();
    initPortal();
    initGastos();
});

// Add animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
