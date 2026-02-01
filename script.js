const STORAGE_KEY = 'cef_v20';
const THEME_KEY = 'cef_theme';

const DEFAULT_HOLIDAYS = {
    '2026-01-01': 'Confraternização Universal',
    '2026-02-17': 'Carnaval',
    '2026-04-03': 'Paixão de Cristo',
    '2026-04-21': 'Tiradentes',
    '2026-05-01': 'Dia do Trabalhador',
    '2026-06-04': 'Corpus Christi',
    '2026-09-07': 'Independência',
    '2026-10-12': 'Nossa Senhora Aparecida',
    '2026-11-02': 'Finados',
    '2026-11-15': 'Proclamação da República',
    '2026-11-20': 'Consciência Negra',
    '2026-12-25': 'Natal'
};

const CATEGORY_ICONS = {
    moradia: '🏠',
    alimentacao: '🍽️',
    transporte: '🚗',
    saude: '🏥',
    lazer: '🎮',
    educacao: '📚',
    outros: '📦'
};

const CATEGORY_NAMES = {
    moradia: 'Moradia',
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    saude: 'Saúde',
    lazer: 'Lazer',
    educacao: 'Educação',
    outros: 'Outros'
};

let appData = {
    startDate: getCurrentMonth(),
    people: {
        person1: { name: '', salary: 0, allowance: 0 },
        person2: { name: '', salary: 0, allowance: 0 }
    },
    expenses: [],
    transactions: [],
    cefBalance: 0,
    holidays: {...DEFAULT_HOLIDAYS}
};

let currentEditingExpenseId = null;
let currentEditingTransactionId = null;

// ============================================
// TEMA (MODO ESCURO)
// ============================================

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
    showSuccess(newTheme === 'dark' ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado');
}

function updateThemeIcon(theme) {
    document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(monthStr, count) {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + count);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function formatPercent(value) {
    return (value * 100).toFixed(2) + '%';
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function isHoliday(dateStr) {
    return appData.holidays.hasOwnProperty(dateStr);
}

function calculateWorkDaysInMonth(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    let workDays = 0;
    let currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (!isWeekend(currentDate) && !isHoliday(dateStr)) {
            workDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workDays;
}

function calculateWorkDays() {
    const workDays = calculateWorkDaysInMonth(appData.startDate);
    document.getElementById('workDays').value = workDays;
    updateVariableAllowanceDisplay();
    showSuccess(`✅ ${workDays} dias úteis calculados`);
}

function updateVariableAllowanceDisplay() {
    const vaFixed = parseFloat(document.getElementById('vaFixed').value) || 0;
    const vrDaily = parseFloat(document.getElementById('vrDaily').value) || 0;
    const workDays = parseInt(document.getElementById('workDays').value) || 0;
    
    const vaTotal = vaFixed + (workDays * vrDaily * 0.5);
    
    document.getElementById('calculatedWorkDays').textContent = workDays;
    document.getElementById('calculatedVA').textContent = formatCurrency(vaTotal);
}

function getMonthsDiff(start, end) {
    const [y1, m1] = start.split('-').map(Number);
    const [y2, m2] = end.split('-').map(Number);
    return (y2 - y1) * 12 + (m2 - m1);
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function showSuccess(msg) {
    const alert = document.getElementById('successAlert');
    alert.textContent = msg;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 3000);
}

// ============================================
// CARREGAMENTO E NAVEGAÇÃO
// ============================================

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        appData = JSON.parse(saved);
        if (!appData.holidays) appData.holidays = {...DEFAULT_HOLIDAYS};
    }
    
    document.getElementById('startDateInput').value = appData.startDate;
    document.getElementById('person1Name').value = appData.people.person1.name || '';
    document.getElementById('person2Name').value = appData.people.person2.name || '';
    document.getElementById('person1Salary').value = appData.people.person1.salary || 0;
    document.getElementById('person2Salary').value = appData.people.person2.salary || 0;
    document.getElementById('person1Allowance').value = appData.people.person1.allowance || 0;
    document.getElementById('person2Allowance').value = appData.people.person2.allowance || 0;
    document.getElementById('balanceInput').value = appData.cefBalance || 0;
    
    const month = appData.startDate;
    document.getElementById('expenseMonth').value = month;
    document.getElementById('transactionMonth').value = month;
    document.getElementById('liquidationMonth').value = month;
    document.getElementById('extrato1Month').value = month;
    document.getElementById('extrato2Month').value = month;
    document.getElementById('categoryMonth').value = month;
    
    const workDays = calculateWorkDaysInMonth(month);
    document.getElementById('workDays').value = workDays;
    
    updateVariableAllowanceDisplay();
    updateTotalIncome();
    updatePieChart();
    updatePersonSelectors();
    updatePersonTabNames();
    loadExpensesView();
    loadTransactionsView();
    calculateLiquidation();
    loadHistory();
    loadHolidaysList();
    loadCategoryAnalysis();
}

function switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    event.target.classList.add('active');
    
    if (name === 'despesas') loadExpensesView();
    if (name === 'descontos') loadTransactionsView();
    if (name === 'liquidacao') calculateLiquidation();
    if (name === 'extrato1') loadExtrato('person1');
    if (name === 'extrato2') loadExtrato('person2');
    if (name === 'categorias') loadCategoryAnalysis();
    if (name === 'historico') loadHistory();
    if (name === 'feriados') loadHolidaysList();
}

function updateStartDate() {
    appData.startDate = document.getElementById('startDateInput').value;
    const workDays = calculateWorkDaysInMonth(appData.startDate);
    document.getElementById('workDays').value = workDays;
    updateVariableAllowanceDisplay();
    
    // Atualizar todos os campos de mês
    document.getElementById('expenseMonth').value = appData.startDate;
    document.getElementById('transactionMonth').value = appData.startDate;
    document.getElementById('liquidationMonth').value = appData.startDate;
    document.getElementById('extrato1Month').value = appData.startDate;
    document.getElementById('extrato2Month').value = appData.startDate;
    document.getElementById('categoryMonth').value = appData.startDate;
    
    saveData();
    
    // CORREÇÃO: Recarregar todas as visualizações
    loadExpensesView();
    loadTransactionsView();
    calculateLiquidation();
    loadExtrato('person1');
    loadExtrato('person2');
    loadCategoryAnalysis();
    loadHistory();
    
    showSuccess('✅ Data inicial atualizada! Todas as abas foram atualizadas.');
}


function updateBalance() {
    appData.cefBalance = parseFloat(document.getElementById('balanceInput').value) || 0;
    saveData();
    updateTotalIncome();
    calculateLiquidation();
    showSuccess('✅ Saldo CEF atualizado!');
}

function updateTotalIncome() {
    const p1 = (appData.people.person1.salary || 0) + (appData.people.person1.allowance || 0);
    const p2 = (appData.people.person2.salary || 0) + (appData.people.person2.allowance || 0);
    document.getElementById('totalIncomeDisplay').textContent = formatCurrency(p1 + p2 + appData.cefBalance);
}

function updatePersonTabNames() {
    document.getElementById('person1TabName').textContent = appData.people.person1.name || 'Pessoa 1';
    document.getElementById('person2TabName').textContent = appData.people.person2.name || 'Pessoa 2';
    document.getElementById('extrato1PersonName').textContent = appData.people.person1.name || 'Pessoa 1';
    document.getElementById('extrato2PersonName').textContent = appData.people.person2.name || 'Pessoa 2';
}

// ============================================
// RENDA
// ============================================

function saveIncome() {
    appData.people.person1.name = document.getElementById('person1Name').value;
    appData.people.person2.name = document.getElementById('person2Name').value;
    appData.people.person1.salary = parseFloat(document.getElementById('person1Salary').value) || 0;
    appData.people.person2.salary = parseFloat(document.getElementById('person2Salary').value) || 0;
    appData.people.person1.allowance = parseFloat(document.getElementById('person1Allowance').value) || 0;
    appData.people.person2.allowance = parseFloat(document.getElementById('person2Allowance').value) || 0;
    
    saveData();
    updateTotalIncome();
    updatePieChart();
    updatePersonSelectors();
    updatePersonTabNames();
    calculateLiquidation();
    showSuccess('✅ Renda salva!');
}

function updatePieChart() {
    const p1 = (appData.people.person1.salary || 0) + (appData.people.person1.allowance || 0);
    const p2 = (appData.people.person2.salary || 0) + (appData.people.person2.allowance || 0);
    const total = p1 + p2;
    
    if (total === 0) {
        document.getElementById('pieChartContainer').style.display = 'none';
        return;
    }
    
    document.getElementById('pieChartContainer').style.display = 'flex';
    const percent = (p1 / total) * 100;
    document.getElementById('pieChart').style.background = `conic-gradient(#208090 0% ${percent}%, #2ba8a8 ${percent}% 100%)`;
    
    document.getElementById('pieLegend').innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background:#208090;"></div>
            <div>
                <div class="legend-text">${appData.people.person1.name || 'Pessoa 1'}</div>
                <div class="legend-value">${formatCurrency(p1)} (${percent.toFixed(1)}%)</div>
            </div>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background:#2ba8a8;"></div>
            <div>
                <div class="legend-text">${appData.people.person2.name || 'Pessoa 2'}</div>
                <div class="legend-value">${formatCurrency(p2)} (${(100-percent).toFixed(1)}%)</div>
            </div>
        </div>
    `;
}

function updatePersonSelectors() {
    document.getElementById('transactionPerson').innerHTML = `
        <option value="">Selecione...</option>
        <option value="person1">${appData.people.person1.name || 'Pessoa 1'}</option>
        <option value="person2">${appData.people.person2.name || 'Pessoa 2'}</option>
    `;
}

function toggleExpenseOptions() {
    const rec = document.getElementById('expenseRecurring').checked;
    const inst = document.getElementById('expenseInstallment').checked;
    
    if (rec) {
        document.getElementById('expenseInstallment').checked = false;
        document.getElementById('expenseInstallmentOptions').classList.remove('show');
        document.getElementById('expenseRecurringOptions').classList.add('show');
    } else {
        document.getElementById('expenseRecurringOptions').classList.remove('show');
    }
    
    if (inst) {
        document.getElementById('expenseRecurring').checked = false;
        document.getElementById('expenseRecurringOptions').classList.remove('show');
        document.getElementById('expenseInstallmentOptions').classList.add('show');
    } else {
        document.getElementById('expenseInstallmentOptions').classList.remove('show');
    }
}

function toggleTransactionOptions() {
    const rec = document.getElementById('transactionRecurring').checked;
    const inst = document.getElementById('transactionInstallment').checked;
    
    if (rec) {
        document.getElementById('transactionInstallment').checked = false;
        document.getElementById('transactionInstallmentOptions').classList.remove('show');
        document.getElementById('transactionRecurringOptions').classList.add('show');
    } else {
        document.getElementById('transactionRecurringOptions').classList.remove('show');
    }
    
    if (inst) {
        document.getElementById('transactionRecurring').checked = false;
        document.getElementById('transactionRecurringOptions').classList.remove('show');
        document.getElementById('transactionInstallmentOptions').classList.add('show');
    } else {
        document.getElementById('transactionInstallmentOptions').classList.remove('show');
    }
}

// ============================================
// BACKUP
// ============================================

function exportData() {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cef_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    showSuccess('✅ Dados exportados!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            appData = JSON.parse(e.target.result);
            if (!appData.holidays) appData.holidays = {...DEFAULT_HOLIDAYS};
            saveData();
            loadData();
            showSuccess('✅ Dados importados com sucesso!');
        } catch (error) {
            alert('Erro ao importar. Verifique o arquivo.');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (!confirm('⚠️ APAGAR TUDO?')) return;
    if (!confirm('Última confirmação!')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadData();
});

document.getElementById('vaFixed').addEventListener('input', updateVariableAllowanceDisplay);
document.getElementById('vrDaily').addEventListener('input', updateVariableAllowanceDisplay);
document.getElementById('workDays').addEventListener('input', updateVariableAllowanceDisplay);

// ============================================
// DESPESAS (com status pago/pendente)
// ============================================

function addExpense() {
    const month = document.getElementById('expenseMonth').value;
    const name = document.getElementById('expenseName').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const isRecurring = document.getElementById('expenseRecurring').checked;
    const isInstallment = document.getElementById('expenseInstallment').checked;
    
    if (!month || !name || !amount || amount <= 0) {
        alert('Preencha todos os campos!');
        return;
    }
    
    if (isRecurring) {
        const endMonth = document.getElementById('expenseEndMonth').value;
        const months = endMonth ? getMonthsDiff(month, endMonth) + 1 : 12;
        
        for (let i = 0; i < months; i++) {
            appData.expenses.push({
                id: Date.now() + i,
                name: name + ' 🔄',
                amount,
                month: addMonths(month, i),
                category,
                isRecurring: true,
                isPaid: false
            });
        }
        showSuccess(`✅ ${months} despesas recorrentes criadas!`);
    } else if (isInstallment) {
        const installments = parseInt(document.getElementById('expenseInstallments').value);
        if (!installments || installments < 2) {
            alert('Informe o número de parcelas (mín. 2)');
            return;
        }
        
        const type = document.querySelector('input[name="expenseType"]:checked').value;
        const installmentAmount = type === 'total' ? amount / installments : amount;
        const totalAmount = type === 'total' ? amount : amount * installments;
        const group = Date.now();
        
        for (let i = 0; i < installments; i++) {
            appData.expenses.push({
                id: Date.now() + i,
                name: `${name} (${i + 1}/${installments})`,
                amount: installmentAmount,
                month: addMonths(month, i),
                category,
                isInstallment: true,
                installmentNumber: i + 1,
                totalInstallments: installments,
                installmentGroup: group,
                isPaid: false
            });
        }
        
        showSuccess(`✅ ${installments} parcelas de ${formatCurrency(installmentAmount)}! Total: ${formatCurrency(totalAmount)}`);
    } else {
        appData.expenses.push({
            id: Date.now(),
            name,
            amount,
            month,
            category,
            isPaid: false
        });
        showSuccess('✅ Despesa adicionada!');
    }
    
    saveData();
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseRecurring').checked = false;
    document.getElementById('expenseInstallment').checked = false;
    document.getElementById('expenseEndMonth').value = '';
    document.getElementById('expenseInstallments').value = '';
    toggleExpenseOptions();
    loadExpensesView();
    loadHistory();
}

function loadExpensesView() {
    const container = document.getElementById('expensesView');
    const filter = document.getElementById('expenseFilter').value;
    
    let expenses = appData.expenses;
    if (filter === 'paid') expenses = expenses.filter(e => e.isPaid);
    if (filter === 'pending') expenses = expenses.filter(e => !e.isPaid);
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Nenhuma despesa</div></div>';
        return;
    }
    
    const byMonth = {};
    expenses.forEach(e => {
        if (!byMonth[e.month]) byMonth[e.month] = [];
        byMonth[e.month].push(e);
    });
    
    let html = '';
    Object.keys(byMonth).sort().forEach(month => {
        const list = byMonth[month];
        const total = list.reduce((s, e) => s + e.amount, 0);
        const paidCount = list.filter(e => e.isPaid).length;
        
        html += `
            <div style="margin-bottom: 30px; padding: 20px; background: var(--card-bg); border-radius: 10px; border: 2px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: var(--primary-color); margin: 0;">${formatMonth(month)}</h3>
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">${paidCount}/${list.length} pagos</span>
                </div>
                ${list.map(e => {
                    const categoryIcon = CATEGORY_ICONS[e.category] || '📦';
                    const statusClass = e.isPaid ? 'paid' : 'pending';
                    
                    return `
                    <div class="list-item ${e.isInstallment ? 'installment' : ''} ${statusClass}">
                        <div class="list-item-content">
                            <div class="list-item-title">
                                ${categoryIcon} ${e.name}
                                <span class="status-badge status-${e.isPaid ? 'paid' : 'pending'}">
                                    ${e.isPaid ? '✅ Pago' : '⏳ Pendente'}
                                </span>
                            </div>
                            ${e.isInstallment ? `<div class="list-item-meta">💳 ${e.installmentNumber}/${e.totalInstallments} • ${CATEGORY_NAMES[e.category]}</div>` : `<div class="list-item-meta">${CATEGORY_NAMES[e.category]}</div>`}
                        </div>
                        <div class="list-item-amount">${formatCurrency(e.amount)}</div>
                        <div class="list-item-actions">
                            ${e.isPaid ? 
                                `<button class="btn-unpay" onclick="toggleExpenseStatus(${e.id})" title="Marcar como pendente">↩️</button>` :
                                `<button class="btn-pay" onclick="toggleExpenseStatus(${e.id})" title="Marcar como pago">✓</button>`
                            }
                            <button class="btn-edit" onclick="openEditExpenseModal(${e.id})">✏️</button>
                            <button class="btn-delete" onclick="deleteExpense(${e.id}, ${e.installmentGroup || 'null'}, ${e.isInstallment || false})">🗑️</button>
                        </div>
                    </div>
                `}).join('')}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--primary-color); font-size: 1.2rem; font-weight: 700; color: var(--primary-color);">
                    Total: ${formatCurrency(total)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function toggleExpenseStatus(id) {
    const expense = appData.expenses.find(e => e.id === id);
    if (!expense) return;
    
    expense.isPaid = !expense.isPaid;
    saveData();
    loadExpensesView();
    showSuccess(expense.isPaid ? '✅ Marcado como pago!' : '⏳ Marcado como pendente!');
}

function deleteExpense(id, group, isInstallment) {
    if (isInstallment && group) {
        const all = appData.expenses.filter(e => e.installmentGroup === group);
        if (all.length > 1) {
            const choice = confirm(`Excluir TODAS as ${all.length} parcelas?\n\nOK = Todas | Cancelar = Só esta`);
            if (choice) {
                appData.expenses = appData.expenses.filter(e => e.installmentGroup !== group);
                showSuccess(`✅ ${all.length} parcelas excluídas!`);
            } else {
                appData.expenses = appData.expenses.filter(e => e.id !== id);
                showSuccess('✅ Parcela excluída!');
            }
        } else {
            appData.expenses = appData.expenses.filter(e => e.id !== id);
            showSuccess('✅ Despesa excluída!');
        }
    } else {
        if (!confirm('Excluir esta despesa?')) return;
        appData.expenses = appData.expenses.filter(e => e.id !== id);
        showSuccess('✅ Despesa excluída!');
    }
    
    saveData();
    loadExpensesView();
    loadHistory();
}

function openEditExpenseModal(id) {
    const expense = appData.expenses.find(e => e.id === id);
    if (!expense) return;
    
    currentEditingExpenseId = id;
    let cleanName = expense.name.replace(' 🔄', '').replace(/\s*\(\d+\/\d+\)/, '');
    
    document.getElementById('editExpenseName').value = cleanName;
    document.getElementById('editExpenseAmount').value = expense.amount;
    document.getElementById('editExpenseMonth').value = expense.month;
    document.getElementById('editExpenseCategory').value = expense.category || 'outros';
    document.getElementById('editExpenseModal').classList.add('show');
}

function closeEditExpenseModal() {
    document.getElementById('editExpenseModal').classList.remove('show');
    currentEditingExpenseId = null;
}

function saveExpenseEdit() {
    if (!currentEditingExpenseId) return;
    
    const expense = appData.expenses.find(e => e.id === currentEditingExpenseId);
    if (!expense) return;
    
    const newName = document.getElementById('editExpenseName').value;
    let finalName = newName;
    if (expense.isRecurring) finalName += ' 🔄';
    if (expense.isInstallment) finalName += ` (${expense.installmentNumber}/${expense.totalInstallments})`;
    
    expense.name = finalName;
    expense.amount = parseFloat(document.getElementById('editExpenseAmount').value);
    expense.month = document.getElementById('editExpenseMonth').value;
    expense.category = document.getElementById('editExpenseCategory').value;
    
    saveData();
    closeEditExpenseModal();
    loadExpensesView();
    loadHistory();
    loadCategoryAnalysis();
    showSuccess('✅ Despesa atualizada!');
}

// ============================================
// DESCONTOS (com status pago/pendente)
// ============================================

function addTransaction() {
    const month = document.getElementById('transactionMonth').value;
    const person = document.getElementById('transactionPerson').value;
    const description = document.getElementById('transactionDescription').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const category = document.getElementById('transactionCategory').value;
    const isRecurring = document.getElementById('transactionRecurring').checked;
    const isInstallment = document.getElementById('transactionInstallment').checked;
    
    if (!month || !person || !description || !amount || amount <= 0) {
        alert('Preencha todos os campos!');
        return;
    }
    
    if (isRecurring) {
        const endMonth = document.getElementById('transactionEndMonth').value;
        const months = endMonth ? getMonthsDiff(month, endMonth) + 1 : 12;
        
        for (let i = 0; i < months; i++) {
            appData.transactions.push({
                id: Date.now() + i,
                person,
                description: description + ' 🔄',
                amount,
                month: addMonths(month, i),
                category,
                isRecurring: true,
                isPaid: false
            });
        }
        showSuccess(`✅ ${months} descontos recorrentes criados!`);
    } else if (isInstallment) {
        const installments = parseInt(document.getElementById('transactionInstallments').value);
        if (!installments || installments < 2) {
            alert('Informe o número de parcelas (mín. 2)');
            return;
        }
        
        const type = document.querySelector('input[name="transactionType"]:checked').value;
        const installmentAmount = type === 'total' ? amount / installments : amount;
        const totalAmount = type === 'total' ? amount : amount * installments;
        const group = Date.now();
        
        for (let i = 0; i < installments; i++) {
            appData.transactions.push({
                id: Date.now() + i,
                person,
                description: `${description} (${i + 1}/${installments})`,
                amount: installmentAmount,
                month: addMonths(month, i),
                category,
                isInstallment: true,
                installmentNumber: i + 1,
                totalInstallments: installments,
                installmentGroup: group,
                isPaid: false
            });
        }
        
        showSuccess(`✅ ${installments} parcelas de ${formatCurrency(installmentAmount)}! Total: ${formatCurrency(totalAmount)}`);
    } else {
        appData.transactions.push({
            id: Date.now(),
            person,
            description,
            amount,
            month,
            category,
            isPaid: false
        });
        showSuccess('✅ Desconto adicionado!');
    }
    
    saveData();
    document.getElementById('transactionPerson').value = '';
    document.getElementById('transactionDescription').value = '';
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionRecurring').checked = false;
    document.getElementById('transactionInstallment').checked = false;
    document.getElementById('transactionEndMonth').value = '';
    document.getElementById('transactionInstallments').value = '';
    toggleTransactionOptions();
    loadTransactionsView();
    loadHistory();
}

function loadTransactionsView() {
    const container = document.getElementById('transactionsView');
    const filter = document.getElementById('transactionFilter').value;
    
    let transactions = appData.transactions;
    if (filter === 'paid') transactions = transactions.filter(t => t.isPaid);
    if (filter === 'pending') transactions = transactions.filter(t => !t.isPaid);
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💳</div><div class="empty-state-text">Nenhum desconto</div></div>';
        return;
    }
    
    const byMonth = {};
    transactions.forEach(t => {
        if (!byMonth[t.month]) byMonth[t.month] = { person1: [], person2: [] };
        byMonth[t.month][t.person].push(t);
    });
    
    let html = '';
    Object.keys(byMonth).sort().forEach(month => {
        const p1 = byMonth[month].person1;
        const p2 = byMonth[month].person2;
        const t1 = p1.reduce((s, t) => s + t.amount, 0);
        const t2 = p2.reduce((s, t) => s + t.amount, 0);
        const p1PaidCount = p1.filter(t => t.isPaid).length;
        const p2PaidCount = p2.filter(t => t.isPaid).length;
        
        html += `
            <div style="margin-bottom: 30px; padding: 20px; background: var(--card-bg); border-radius: 10px; border: 2px solid var(--border-color);">
                <h3 style="color: var(--primary-color); margin-bottom: 15px;">${formatMonth(month)}</h3>
                
                ${p1.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="color: var(--primary-color); margin: 0;">${appData.people.person1.name || 'Pessoa 1'}</h4>
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">${p1PaidCount}/${p1.length} pagos</span>
                        </div>
                        ${p1.map(t => {
                            const categoryIcon = CATEGORY_ICONS[t.category] || '📦';
                            const statusClass = t.isPaid ? 'paid' : 'pending';
                            
                            return `
                            <div class="list-item ${t.isInstallment ? 'installment' : ''} ${statusClass}">
                                <div class="list-item-content">
                                    <div class="list-item-title">
                                        ${categoryIcon} ${t.description}
                                        <span class="status-badge status-${t.isPaid ? 'paid' : 'pending'}">
                                            ${t.isPaid ? '✅ Pago' : '⏳ Pendente'}
                                        </span>
                                    </div>
                                    ${t.isInstallment ? `<div class="list-item-meta">💳 ${t.installmentNumber}/${t.totalInstallments} • ${CATEGORY_NAMES[t.category]}</div>` : `<div class="list-item-meta">${CATEGORY_NAMES[t.category]}</div>`}
                                </div>
                                <div class="list-item-amount">${formatCurrency(t.amount)}</div>
                                <div class="list-item-actions">
                                    ${t.isPaid ? 
                                        `<button class="btn-unpay" onclick="toggleTransactionStatus(${t.id})" title="Marcar como pendente">↩️</button>` :
                                        `<button class="btn-pay" onclick="toggleTransactionStatus(${t.id})" title="Marcar como pago">✓</button>`
                                    }
                                    <button class="btn-edit" onclick="openEditTransactionModal(${t.id})">✏️</button>
                                    <button class="btn-delete" onclick="deleteTransaction(${t.id}, ${t.installmentGroup || 'null'}, ${t.isInstallment || false})">🗑️</button>
                                </div>
                            </div>
                        `}).join('')}
                        <div style="margin-top: 10px; font-weight: 700; color: var(--primary-color);">Subtotal: ${formatCurrency(t1)}</div>
                    </div>
                ` : ''}
                
                ${p2.length > 0 ? `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="color: var(--secondary-color); margin: 0;">${appData.people.person2.name || 'Pessoa 2'}</h4>
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">${p2PaidCount}/${p2.length} pagos</span>
                        </div>
                        ${p2.map(t => {
                            const categoryIcon = CATEGORY_ICONS[t.category] || '📦';
                            const statusClass = t.isPaid ? 'paid' : 'pending';
                            
                            return `
                            <div class="list-item ${t.isInstallment ? 'installment' : ''} ${statusClass}">
                                <div class="list-item-content">
                                    <div class="list-item-title">
                                        ${categoryIcon} ${t.description}
                                        <span class="status-badge status-${t.isPaid ? 'paid' : 'pending'}">
                                            ${t.isPaid ? '✅ Pago' : '⏳ Pendente'}
                                        </span>
                                    </div>
                                    ${t.isInstallment ? `<div class="list-item-meta">💳 ${t.installmentNumber}/${t.totalInstallments} • ${CATEGORY_NAMES[t.category]}</div>` : `<div class="list-item-meta">${CATEGORY_NAMES[t.category]}</div>`}
                                </div>
                                <div class="list-item-amount">${formatCurrency(t.amount)}</div>
                                <div class="list-item-actions">
                                    ${t.isPaid ? 
                                        `<button class="btn-unpay" onclick="toggleTransactionStatus(${t.id})" title="Marcar como pendente">↩️</button>` :
                                        `<button class="btn-pay" onclick="toggleTransactionStatus(${t.id})" title="Marcar como pago">✓</button>`
                                    }
                                    <button class="btn-edit" onclick="openEditTransactionModal(${t.id})">✏️</button>
                                    <button class="btn-delete" onclick="deleteTransaction(${t.id}, ${t.installmentGroup || 'null'}, ${t.isInstallment || false})">🗑️</button>
                                </div>
                            </div>
                        `}).join('')}
                        <div style="margin-top: 10px; font-weight: 700; color: var(--secondary-color);">Subtotal: ${formatCurrency(t2)}</div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--primary-color); font-size: 1.2rem; font-weight: 700; color: var(--primary-color);">
                    Total: ${formatCurrency(t1 + t2)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function toggleTransactionStatus(id) {
    const transaction = appData.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    transaction.isPaid = !transaction.isPaid;
    saveData();
    loadTransactionsView();
    showSuccess(transaction.isPaid ? '✅ Marcado como pago!' : '⏳ Marcado como pendente!');
}

function deleteTransaction(id, group, isInstallment) {
    if (isInstallment && group) {
        const all = appData.transactions.filter(t => t.installmentGroup === group);
        if (all.length > 1) {
            const choice = confirm(`Excluir TODAS as ${all.length} parcelas?\n\nOK = Todas | Cancelar = Só esta`);
            if (choice) {
                appData.transactions = appData.transactions.filter(t => t.installmentGroup !== group);
                showSuccess(`✅ ${all.length} parcelas excluídas!`);
            } else {
                appData.transactions = appData.transactions.filter(t => t.id !== id);
                showSuccess('✅ Parcela excluída!');
            }
        } else {
            appData.transactions = appData.transactions.filter(t => t.id !== id);
            showSuccess('✅ Desconto excluído!');
        }
    } else {
        if (!confirm('Excluir este desconto?')) return;
        appData.transactions = appData.transactions.filter(t => t.id !== id);
        showSuccess('✅ Desconto excluído!');
    }
    
    saveData();
    loadTransactionsView();
    loadHistory();
}

function openEditTransactionModal(id) {
    const t = appData.transactions.find(x => x.id === id);
    if (!t) return;
    
    currentEditingTransactionId = id;
    
    document.getElementById('editTransactionPerson').innerHTML = `
        <option value="">Selecione...</option>
        <option value="person1" ${t.person === 'person1' ? 'selected' : ''}>${appData.people.person1.name || 'Pessoa 1'}</option>
        <option value="person2" ${t.person === 'person2' ? 'selected' : ''}>${appData.people.person2.name || 'Pessoa 2'}</option>
    `;
    
    let cleanDesc = t.description.replace(' 🔄', '').replace(/\s*\(\d+\/\d+\)/, '');
    document.getElementById('editTransactionDescription').value = cleanDesc;
    document.getElementById('editTransactionAmount').value = t.amount;
    document.getElementById('editTransactionMonth').value = t.month;
    document.getElementById('editTransactionCategory').value = t.category || 'outros';
    document.getElementById('editTransactionModal').classList.add('show');
}

function closeEditTransactionModal() {
    document.getElementById('editTransactionModal').classList.remove('show');
    currentEditingTransactionId = null;
}

function saveTransactionEdit() {
    if (!currentEditingTransactionId) return;
    
    const t = appData.transactions.find(x => x.id === currentEditingTransactionId);
    if (!t) return;
    
    const newDesc = document.getElementById('editTransactionDescription').value;
    let finalDesc = newDesc;
    if (t.isRecurring) finalDesc += ' 🔄';
    if (t.isInstallment) finalDesc += ` (${t.installmentNumber}/${t.totalInstallments})`;
    
    t.person = document.getElementById('editTransactionPerson').value;
    t.description = finalDesc;
    t.amount = parseFloat(document.getElementById('editTransactionAmount').value);
    t.month = document.getElementById('editTransactionMonth').value;
    t.category = document.getElementById('editTransactionCategory').value;
    
    saveData();
    closeEditTransactionModal();
    loadTransactionsView();
    loadHistory();
    loadCategoryAnalysis();
    showSuccess('✅ Desconto atualizado!');
}


// ============================================
// LIQUIDAÇÃO
// ============================================

function calculateLiquidation() {
    const month = document.getElementById('liquidationMonth').value;
    const container = document.getElementById('liquidationDetails');
    
    if (!month) return;
    
    const expenses = appData.expenses.filter(e => e.month === month);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    
    const p1Trans = appData.transactions.filter(t => t.month === month && t.person === 'person1');
    const p2Trans = appData.transactions.filter(t => t.month === month && t.person === 'person2');
    const p1Disc = p1Trans.reduce((s, t) => s + t.amount, 0);
    const p2Disc = p2Trans.reduce((s, t) => s + t.amount, 0);
    const totalDisc = p1Disc + p2Disc;
    
    const cef = appData.cefBalance || 0;
    const obligations = totalExp + totalDisc - cef;
    
    const p1Inc = (appData.people.person1.salary || 0) + (appData.people.person1.allowance || 0);
    const p2Inc = (appData.people.person2.salary || 0) + (appData.people.person2.allowance || 0);
    const totalInc = p1Inc + p2Inc;
    
    if (totalInc === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Configure a renda primeiro</div></div>';
        return;
    }
    
    const p1Ratio = p1Inc / totalInc;
    const p2Ratio = p2Inc / totalInc;
    const p1Obl = obligations * p1Ratio;
    const p2Obl = obligations * p2Ratio;
    const p1Transfer = p1Obl - p1Disc;
    const p2Transfer = p2Obl - p2Disc;
    
    const p1Dir = p1Transfer >= 0 ? 'Para CEF' : 'Da CEF';
    const p2Dir = p2Transfer >= 0 ? 'Para CEF' : 'Da CEF';
    const p1Color = p1Transfer >= 0 ? '#ea580c' : '#16a34a';
    const p2Color = p2Transfer >= 0 ? '#ea580c' : '#16a34a';
    
    // Contar pagos/pendentes
    const expensesPaid = expenses.filter(e => e.isPaid).length;
    const p1TransPaid = p1Trans.filter(t => t.isPaid).length;
    const p2TransPaid = p2Trans.filter(t => t.isPaid).length;
    
    container.innerHTML = `
        <div style="background: var(--bg-color); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">📊 Resumo Geral</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="stat-card"><div class="stat-label">Despesas CEF</div><div class="stat-value">${formatCurrency(totalExp)}</div><div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">${expensesPaid}/${expenses.length} pagas</div></div>
                <div class="stat-card"><div class="stat-label">Descontos Total</div><div class="stat-value">${formatCurrency(totalDisc)}</div></div>
                <div class="stat-card"><div class="stat-label">Saldo CEF</div><div class="stat-value">${formatCurrency(cef)}</div></div>
                <div class="stat-card"><div class="stat-label">Obrigações</div><div class="stat-value">${formatCurrency(obligations)}</div></div>
                <div class="stat-card"><div class="stat-label">Renda Total</div><div class="stat-value">${formatCurrency(totalInc)}</div></div>
            </div>
        </div>
        
        <div style="background: var(--card-bg); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid var(--primary-color);">
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">💰 ${appData.people.person1.name || 'Pessoa 1'}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                <div><strong>Renda:</strong> ${formatCurrency(p1Inc)}</div>
                <div><strong>Proporção:</strong> ${formatPercent(p1Ratio)}</div>
                <div><strong>Descontos:</strong> ${formatCurrency(p1Disc)}</div>
                <div><strong>Obrigação:</strong> ${formatCurrency(p1Obl)}</div>
            </div>
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                Status: ${p1TransPaid}/${p1Trans.length} descontos pagos
            </div>
            <div style="margin-top: 20px; padding: 15px; background: ${p1Color}22; border-left: 4px solid ${p1Color}; border-radius: 8px;">
                <div style="font-size: 1.2rem; font-weight: 700; color: ${p1Color};">
                    ${p1Dir}: ${formatCurrency(Math.abs(p1Transfer))}
                </div>
            </div>
        </div>
        
        <div style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 2px solid var(--secondary-color);">
            <h3 style="color: var(--secondary-color); margin-bottom: 15px;">💰 ${appData.people.person2.name || 'Pessoa 2'}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                <div><strong>Renda:</strong> ${formatCurrency(p2Inc)}</div>
                <div><strong>Proporção:</strong> ${formatPercent(p2Ratio)}</div>
                <div><strong>Descontos:</strong> ${formatCurrency(p2Disc)}</div>
                <div><strong>Obrigação:</strong> ${formatCurrency(p2Obl)}</div>
            </div>
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                Status: ${p2TransPaid}/${p2Trans.length} descontos pagos
            </div>
            <div style="margin-top: 20px; padding: 15px; background: ${p2Color}22; border-left: 4px solid ${p2Color}; border-radius: 8px;">
                <div style="font-size: 1.2rem; font-weight: 700; color: ${p2Color};">
                    ${p2Dir}: ${formatCurrency(Math.abs(p2Transfer))}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// EXTRATOS
// ============================================

function loadExtrato(person) {
    const monthField = person === 'person1' ? 'extrato1Month' : 'extrato2Month';
    const contentField = person === 'person1' ? 'extrato1Content' : 'extrato2Content';
    
    const month = document.getElementById(monthField).value;
    const container = document.getElementById(contentField);
    
    if (!month) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Selecione um mês</p>';
        return;
    }
    
    const personData = appData.people[person];
    const personName = personData.name || (person === 'person1' ? 'Pessoa 1' : 'Pessoa 2');
    const personIncome = (personData.salary || 0) + (personData.allowance || 0);
    
    const p1Inc = (appData.people.person1.salary || 0) + (appData.people.person1.allowance || 0);
    const p2Inc = (appData.people.person2.salary || 0) + (appData.people.person2.allowance || 0);
    const totalInc = p1Inc + p2Inc;
    const ratio = totalInc > 0 ? personIncome / totalInc : 0;
    
    const expenses = appData.expenses.filter(e => e.month === month);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    
    const transactions = appData.transactions.filter(t => t.month === month && t.person === person);
    const totalDisc = transactions.reduce((s, t) => s + t.amount, 0);
    
    const p1Trans = appData.transactions.filter(t => t.month === month && t.person === 'person1');
    const p2Trans = appData.transactions.filter(t => t.month === month && t.person === 'person2');
    const allDisc = p1Trans.reduce((s, t) => s + t.amount, 0) + p2Trans.reduce((s, t) => s + t.amount, 0);
    
    const cef = appData.cefBalance || 0;
    const obligations = totalExp + allDisc - cef;
    const personObl = obligations * ratio;
    const personExpenseShare = totalExp * ratio;
    const transfer = personObl - totalDisc;
    
    const transferDir = transfer >= 0 ? 'Para CEF' : 'Da CEF';
    const transferColor = transfer >= 0 ? '#ea580c' : '#16a34a';
    
    const expensesPaid = expenses.filter(e => e.isPaid).length;
    const transPaid = transactions.filter(t => t.isPaid).length;
    
    let html = `
        <div class="extrato-header-main">
            <h2 style="margin: 0; font-size: 1.8rem;">📄 ${formatMonth(month)}</h2>
            <p style="margin-top: 10px; font-size: 1.2rem;">${personName}</p>
        </div>
        
        <div class="extrato-box">
            <div class="extrato-line"><span>💰 Renda Mensal</span><span style="font-weight: 700;">${formatCurrency(personIncome)}</span></div>
            <div class="extrato-line"><span>📊 Proporção da Renda</span><span style="font-weight: 700;">${formatPercent(ratio)}</span></div>
        </div>
        
        <div class="extrato-box">
            <h4 style="color: var(--primary-color); margin-bottom: 10px;">🏠 Despesas CEF (Compartilhadas)</h4>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 10px;">Status: ${expensesPaid}/${expenses.length} pagas</div>
            ${expenses.length > 0 ? expenses.map(e => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--border-color);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        ${CATEGORY_ICONS[e.category] || '📦'} ${e.name}
                        <span class="status-badge status-${e.isPaid ? 'paid' : 'pending'}" style="font-size: 0.7rem;">
                            ${e.isPaid ? '✅' : '⏳'}
                        </span>
                    </span>
                    <span style="font-weight: 600;">${formatCurrency(e.amount)}</span>
                </div>
            `).join('') : '<p style="color: var(--text-secondary); font-style: italic;">Nenhuma despesa CEF neste mês</p>'}
            ${expenses.length > 0 ? `
                <div class="extrato-line total">
                    <span>Total Despesas CEF</span>
                    <span>${formatCurrency(totalExp)}</span>
                </div>
                <div class="extrato-line">
                    <span>Sua parte proporcional (${formatPercent(ratio)})</span>
                    <span>${formatCurrency(personExpenseShare)}</span>
                </div>
            ` : ''}
        </div>
        
        <div class="extrato-box">
            <h4 style="color: var(--primary-color); margin-bottom: 10px;">💳 Seus Descontos (Pagamentos Próprios)</h4>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 10px;">Status: ${transPaid}/${transactions.length} pagos</div>
            ${transactions.length > 0 ? transactions.map(t => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--border-color);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        ${CATEGORY_ICONS[t.category] || '📦'} ${t.description}
                        <span class="status-badge status-${t.isPaid ? 'paid' : 'pending'}" style="font-size: 0.7rem;">
                            ${t.isPaid ? '✅' : '⏳'}
                        </span>
                    </span>
                    <span style="font-weight: 600;">${formatCurrency(t.amount)}</span>
                </div>
            `).join('') : '<p style="color: var(--text-secondary); font-style: italic;">Nenhum desconto neste mês</p>'}
            ${transactions.length > 0 ? `
                <div class="extrato-line total">
                    <span>Total Seus Descontos</span>
                    <span>${formatCurrency(totalDisc)}</span>
                </div>
            ` : ''}
        </div>
        
        <div class="extrato-box" style="border: 3px solid var(--primary-color);">
            <h4 style="color: var(--primary-color); margin-bottom: 15px;">🧮 Cálculo Final</h4>
            <div class="extrato-line">
                <span>💰 Total Despesas CEF</span>
                <span>${formatCurrency(totalExp)}</span>
            </div>
            <div class="extrato-line">
                <span>💳 Total Descontos (Pessoa 1 + Pessoa 2)</span>
                <span>${formatCurrency(allDisc)}</span>
            </div>
            <div class="extrato-line">
                <span>🏦 Saldo CEF Disponível</span>
                <span style="color: var(--success-color);">${formatCurrency(cef)}</span>
            </div>
            <div class="extrato-line" style="background: var(--bg-color); font-weight: 600;">
                <span>📊 Obrigações Totais (Desp + Desc - Saldo)</span>
                <span>${formatCurrency(obligations)}</span>
            </div>
            <div class="extrato-line" style="background: var(--bg-color); font-weight: 600;">
                <span>💼 Sua Obrigação (${formatPercent(ratio)} das obrigações)</span>
                <span style="color: var(--danger-color);">${formatCurrency(personObl)}</span>
            </div>
            <div class="extrato-line" style="background: var(--bg-color); font-weight: 600;">
                <span>✅ Você Já Pagou (seus descontos)</span>
                <span style="color: var(--info-color);">${formatCurrency(totalDisc)}</span>
            </div>
        </div>
        
        <div class="extrato-box" style="border: 4px solid ${transferColor}; background: ${transferColor}11;">
            <div class="extrato-line total" style="border: none; background: transparent;">
                <span style="font-size: 1.3rem;">🔄 Você deve ${transferDir}</span>
                <span style="color: ${transferColor}; font-size: 1.5rem;">${formatCurrency(Math.abs(transfer))}</span>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 20px; background: var(--bg-color); border-radius: 10px; border-left: 4px solid var(--info-color);">
            <p style="margin: 0; color: var(--text-primary); line-height: 1.8; font-size: 0.95rem;">
                <strong>💡 Como foi calculado:</strong><br><br>
                
                <strong>1.</strong> Obrigações Totais = Despesas CEF (${formatCurrency(totalExp)}) + Todos Descontos (${formatCurrency(allDisc)}) - Saldo CEF (${formatCurrency(cef)}) = <strong>${formatCurrency(obligations)}</strong><br><br>
                
                <strong>2.</strong> Sua Obrigação = Obrigações Totais × Sua Proporção de Renda (${formatPercent(ratio)}) = <strong>${formatCurrency(personObl)}</strong><br><br>
                
                <strong>3.</strong> Você já pagou = Seus Descontos = <strong>${formatCurrency(totalDisc)}</strong><br><br>
                
                <strong>4.</strong> ${transfer >= 0 ? 
                    `Você precisa transferir <strong>${formatCurrency(Math.abs(transfer))}</strong> para a CEF` : 
                    `A CEF deve devolver <strong>${formatCurrency(Math.abs(transfer))}</strong> para você`
                }
            </p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// ANÁLISE POR CATEGORIAS
// ============================================

function loadCategoryAnalysis() {
    const month = document.getElementById('categoryMonth').value;
    const container = document.getElementById('categoryContent');
    
    if (!month) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Selecione um mês</p>';
        return;
    }
    
    const expenses = appData.expenses.filter(e => e.month === month);
    const transactions = appData.transactions.filter(t => t.month === month);
    const allItems = [...expenses, ...transactions];
    
    if (allItems.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏷️</div><div class="empty-state-text">Nenhum dado neste mês</div></div>';
        return;
    }
    
    // Agrupar por categoria
    const categoryTotals = {};
    allItems.forEach(item => {
        const cat = item.category || 'outros';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += item.amount;
    });
    
    const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    
    let html = `
        <div style="background: var(--bg-color); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">📊 Resumo do Mês</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="stat-card">
                    <div class="stat-label">Total Gasto</div>
                    <div class="stat-value">${formatCurrency(total)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Despesas CEF</div>
                    <div class="stat-value">${formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Descontos</div>
                    <div class="stat-value">${formatCurrency(transactions.reduce((s, t) => s + t.amount, 0))}</div>
                </div>
            </div>
        </div>
    `;
    
    sortedCategories.forEach(([category, amount]) => {
        const percentage = (amount / total) * 100;
        const categoryItems = allItems.filter(i => (i.category || 'outros') === category);
        const icon = CATEGORY_ICONS[category];
        const name = CATEGORY_NAMES[category];
        
        html += `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-name">${icon} ${name}</div>
                    <div class="category-total">${formatCurrency(amount)}</div>
                </div>
                <div class="category-bar" data-percentage="${percentage.toFixed(1)}%" style="width: ${percentage}%; min-width: 80px;"></div>
                <div style="margin-top: 15px;">
                    <strong style="color: var(--text-secondary); font-size: 0.9rem;">${categoryItems.length} item(ns):</strong>
                    <div style="margin-top: 10px;">
                        ${categoryItems.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-color); color: var(--text-primary);">
                                <span style="font-size: 0.9rem;">
                                    ${item.name || item.description}
                                    ${item.isPaid !== undefined ? 
                                        `<span class="status-badge status-${item.isPaid ? 'paid' : 'pending'}" style="font-size: 0.7rem; margin-left: 5px;">${item.isPaid ? '✅' : '⏳'}</span>` 
                                        : ''
                                    }
                                </span>
                                <span style="font-weight: 600; font-size: 0.9rem;">${formatCurrency(item.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// HISTÓRICO
// ============================================

function loadHistory() {
    const container = document.getElementById('historyTable');
    
    const allMonths = new Set();
    appData.expenses.forEach(e => allMonths.add(e.month));
    appData.transactions.forEach(t => allMonths.add(t.month));
    
    if (allMonths.size === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Nenhum histórico</div></div>';
        return;
    }
    
    const sorted = Array.from(allMonths).sort();
    const p1Inc = (appData.people.person1.salary || 0) + (appData.people.person1.allowance || 0);
    const p2Inc = (appData.people.person2.salary || 0) + (appData.people.person2.allowance || 0);
    const totalInc = p1Inc + p2Inc;
    const cef = appData.cefBalance || 0;
    
    const rows = sorted.map(month => {
        const exp = appData.expenses.filter(e => e.month === month).reduce((s, e) => s + e.amount, 0);
        const disc = appData.transactions.filter(t => t.month === month).reduce((s, t) => s + t.amount, 0);
        const total = exp + disc;
        const obl = exp + disc - cef;
        const balance = totalInc - obl;
        const balClass = balance >= 0 ? 'positive' : 'negative';
        
        return `
            <tr>
                <td><strong>${formatMonth(month)}</strong></td>
                <td>${formatCurrency(exp)}</td>
                <td>${formatCurrency(disc)}</td>
                <td><strong>${formatCurrency(total)}</strong></td>
                <td><strong>${formatCurrency(obl)}</strong></td>
                <td class="${balClass}"><strong>${formatCurrency(balance)}</strong></td>
            </tr>
        `;
    }).join('');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Despesas CEF</th>
                    <th>Descontos</th>
                    <th>Total</th>
                    <th>Obrigações</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

// ============================================
// FERIADOS
// ============================================

function addHoliday() {
    const date = document.getElementById('holidayDate').value;
    const name = document.getElementById('holidayName').value;
    
    if (!date || !name) {
        alert('Preencha data e nome!');
        return;
    }
    
    appData.holidays[date] = name;
    saveData();
    loadHolidaysList();
    document.getElementById('holidayDate').value = '';
    document.getElementById('holidayName').value = '';
    showSuccess('✅ Feriado adicionado!');
}

function deleteHoliday(date) {
    if (!confirm(`Excluir "${appData.holidays[date]}"?`)) return;
    delete appData.holidays[date];
    saveData();
    loadHolidaysList();
    showSuccess('✅ Feriado excluído!');
}

function loadHolidaysList() {
    const container = document.getElementById('holidaysList');
    const holidays = Object.entries(appData.holidays).sort((a, b) => a[0].localeCompare(b[0]));
    
    if (holidays.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">Nenhum feriado</div></div>';
        return;
    }
    
    container.innerHTML = holidays.map(([date, name]) => {
        const formatted = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
        return `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--bg-color); border-radius: 6px; margin-bottom: 8px; border-left: 3px solid var(--info-color);">
                <span style="font-weight: 600; color: var(--primary-color); min-width: 100px;">${formatted}</span>
                <span style="flex: 1; color: var(--text-primary);">${name}</span>
                <button class="btn-delete" onclick="deleteHoliday('${date}')">🗑️</button>
            </div>
        `;
    }).join('');
}
