const STORAGE_KEY = 'dividecerto_easy_v1';
const OLD_STORAGE_KEY = 'dividecerto_v20';
const THEME_KEY = 'dividecerto_theme';

const CATEGORY_NAMES = {
  moradia: 'Moradia', alimentacao: 'Alimentação', transporte: 'Transporte',
  saude: 'Saúde', educacao: 'Educação', lazer: 'Lazer', outros: 'Outros'
};
const CATEGORY_ICONS = {
  moradia: '🏠', alimentacao: '🍽️', transporte: '🚗', saude: '🏥',
  educacao: '📚', lazer: '🎮', outros: '📦'
};
const TYPE_NAMES = {
  single: 'Único', planned: 'Período', installment: 'Parcelado', continuous: 'Contínuo', annual: 'Anual'
};

const defaultData = () => ({
  version: 9,
  month: currentMonth(),
  people: {
    person1: { name: '', income: 0 },
    person2: { name: '', income: 0 }
  },
  incomeChanges: { person1: [], person2: [] },
  incomeOverrides: {},
  jointBalances: {},
  expenses: []
});

let data = defaultData();
let editingId = null;
let editingOriginal = null;
let editingOccurrenceMonth = null;
let toastTimer = null;
let resizeTimer = null;
let filters = { payer: 'all', category: 'all', text: '' };
let dashboardFilters = { from: '', to: '', payer: 'all', category: 'all', type: 'all' };

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(month, offset) {
  const [year, mon] = String(month).split('-').map(Number);
  const d = new Date(year, (mon || 1) - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function planningHorizonEnd() {
  const d = new Date();
  return `${d.getFullYear() + 1}-12`;
}

function monthDistanceInclusive(from, to) {
  if (!/^\d{4}-\d{2}$/.test(String(from)) || !/^\d{4}-\d{2}$/.test(String(to)) || to < from) return 0;
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}

function formatMonth(month, short = false) {
  if (!/^\d{4}-\d{2}$/.test(String(month))) return month || '';
  const [year, mon] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', short ? { month: 'short', year: '2-digit' } : { month: 'long', year: 'numeric' })
    .format(new Date(year, mon - 1, 1)).replace('.', '');
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

function compactMoney(value) {
  const n = safeNumber(value);
  if (Math.abs(n) >= 1000000) return `R$ ${(n / 1000000).toFixed(1).replace('.', ',')} mi`;
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(1).replace('.', ',')} mil`;
  return money(n);
}

function pct(value) {
  return `${(value * 100).toFixed(1).replace('.', ',')}%`;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Aceita valores no formato brasileiro (1.747,20 / 1747,20) e também 1747.20.
function parseMoneyInput(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  let raw = String(value ?? '').trim();
  if (!raw) return 0;
  raw = raw.replace(/R\$/gi, '').replace(/\s/g, '').replace(/[^0-9,.-]/g, '');
  const negative = raw.startsWith('-');
  raw = raw.replace(/-/g, '');
  const comma = raw.lastIndexOf(',');
  const dot = raw.lastIndexOf('.');

  if (comma >= 0 && dot >= 0) {
    if (comma > dot) raw = raw.replace(/\./g, '').replace(',', '.');
    else raw = raw.replace(/,/g, '');
  } else if (comma >= 0) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else if (dot >= 0) {
    const parts = raw.split('.');
    // Um ponto seguido de 3 dígitos é tratado como separador de milhar: 1.747 -> 1747.
    // Nos demais casos, um único ponto pode ser decimal: 1747.20 -> 1747,20.
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) raw = parts.join('');
  }

  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return negative ? -n : n;
}

function moneyInputText(value) {
  const n = typeof value === 'string' ? parseMoneyInput(value) : safeNumber(value);
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatMoneyField(input) {
  if (!input || !String(input.value).trim()) return;
  input.value = moneyInputText(input.value);
}

function bindMoneyInputs() {
  ['expenseAmount', 'person1Income', 'person2Income', 'jointBalance'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => formatMoneyField(input));
    input.addEventListener('focus', () => input.select());
  });
}

function normalizeIncomeChanges(value) {
  const entries = Array.isArray(value) ? value : [];
  const byMonth = new Map();
  entries.forEach(entry => {
    const startMonth = entry?.startMonth;
    if (!/^\d{4}-\d{2}$/.test(String(startMonth))) return;
    byMonth.set(startMonth, { startMonth, amount: Math.max(0, safeNumber(entry.amount)) });
  });
  return [...byMonth.values()].sort((a, b) => a.startMonth.localeCompare(b.startMonth));
}

function normalizeIncomeOverrides(value) {
  const result = {};
  if (!value || typeof value !== 'object') return result;
  Object.entries(value).forEach(([month, row]) => {
    if (!/^\d{4}-\d{2}$/.test(month) || !row || typeof row !== 'object') return;
    const normalized = {};
    if (row.person1 !== undefined && row.person1 !== null) normalized.person1 = Math.max(0, safeNumber(row.person1));
    if (row.person2 !== undefined && row.person2 !== null) normalized.person2 = Math.max(0, safeNumber(row.person2));
    if (Object.keys(normalized).length) result[month] = normalized;
  });
  return result;
}

function incomeBaseForMonth(person, month = data.month) {
  const fallback = Math.max(0, safeNumber(data.people?.[person]?.income));
  const changes = Array.isArray(data.incomeChanges?.[person]) ? data.incomeChanges[person] : [];
  let value = fallback;
  for (const change of changes) {
    if (change.startMonth > month) break;
    value = Math.max(0, safeNumber(change.amount));
  }
  return value;
}

function incomeForMonth(person, month = data.month) {
  const override = data.incomeOverrides?.[month]?.[person];
  return override === undefined || override === null ? incomeBaseForMonth(person, month) : Math.max(0, safeNumber(override));
}

function incomeStateForMonth(person, month = data.month) {
  const override = data.incomeOverrides?.[month]?.[person];
  if (override !== undefined && override !== null) return { kind: 'override', amount: Math.max(0, safeNumber(override)) };
  const changes = Array.isArray(data.incomeChanges?.[person]) ? data.incomeChanges[person] : [];
  const active = [...changes].reverse().find(change => change.startMonth <= month);
  if (active) return { kind: active.startMonth === month ? 'new-rule' : 'rule', amount: Math.max(0, safeNumber(active.amount)), startMonth: active.startMonth };
  return { kind: 'base', amount: Math.max(0, safeNumber(data.people?.[person]?.income)) };
}

function personName(key) {
  return data.people[key]?.name?.trim() || (key === 'person1' ? 'Pessoa 1' : 'Pessoa 2');
}

function payerName(payer) {
  if (payer === 'joint') return 'Conta conjunta';
  return personName(payer);
}

function expenseType(expense) {
  if (expense?.recurrenceType && TYPE_NAMES[expense.recurrenceType]) return expense.recurrenceType;
  if (expense?.continuous) return 'continuous';
  if (safeNumber(expense?.installmentTotal) > 1) return 'installment';
  if (expense?.seriesId) return 'planned';
  return 'single';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeExpense(expense) {
  const e = { ...(expense || {}) };
  e.id = e.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  e.month = /^\d{4}-\d{2}$/.test(String(e.month)) ? e.month : currentMonth();
  e.description = String(e.description || 'Despesa');
  e.amount = Math.max(0, safeNumber(e.amount));
  e.payer = ['person1', 'person2', 'joint'].includes(e.payer) ? e.payer : 'person1';
  e.category = CATEGORY_NAMES[e.category] ? e.category : 'outros';
  e.recurrenceType = expenseType(e);
  if (e.recurrenceType === 'continuous' || e.recurrenceType === 'annual') {
    delete e.continuous;
    e.recurrenceGroupId = String(e.recurrenceGroupId || e.id);
    if (e.endMonth && !/^\d{4}-\d{2}$/.test(String(e.endMonth))) delete e.endMonth;
    const rawOverrides = e.overrides && typeof e.overrides === 'object' ? e.overrides : {};
    const normalizedOverrides = {};
    Object.entries(rawOverrides).forEach(([month, override]) => {
      if (!/^\d{4}-\d{2}$/.test(month) || !override || typeof override !== 'object') return;
      normalizedOverrides[month] = {
        description: String(override.description ?? e.description),
        amount: Math.max(0, safeNumber(override.amount ?? e.amount)),
        payer: ['person1', 'person2', 'joint'].includes(override.payer) ? override.payer : e.payer,
        category: CATEGORY_NAMES[override.category] ? override.category : e.category
      };
    });
    if (Object.keys(normalizedOverrides).length) e.overrides = normalizedOverrides; else delete e.overrides;
  }
  if (e.recurrenceType === 'installment') {
    e.installmentTotal = Math.max(2, Math.round(safeNumber(e.installmentTotal) || 2));
    e.installmentCurrent = Math.min(e.installmentTotal, Math.max(1, Math.round(safeNumber(e.installmentCurrent) || 1)));
  }
  return e;
}

function normalizeLoadedData(rawData) {
  const base = defaultData();
  const loaded = { ...base, ...(rawData || {}) };
  loaded.version = 9;
  loaded.people = { ...base.people, ...(loaded.people || {}) };
  loaded.people.person1 = { ...base.people.person1, ...(loaded.people.person1 || {}) };
  loaded.people.person2 = { ...base.people.person2, ...(loaded.people.person2 || {}) };
  loaded.incomeChanges = {
    person1: normalizeIncomeChanges(loaded.incomeChanges?.person1),
    person2: normalizeIncomeChanges(loaded.incomeChanges?.person2)
  };
  loaded.incomeOverrides = normalizeIncomeOverrides(loaded.incomeOverrides);
  loaded.expenses = Array.isArray(loaded.expenses) ? loaded.expenses.map(normalizeExpense).filter(e => e.amount > 0) : [];
  loaded.jointBalances = loaded.jointBalances && typeof loaded.jointBalances === 'object' ? loaded.jointBalances : {};

  if (safeNumber(rawData?.jointBalance) !== 0 && loaded.jointBalances[loaded.month] === undefined) {
    loaded.jointBalances[loaded.month] = safeNumber(rawData.jointBalance);
  }

  delete loaded.method;
  delete loaded.customP1;
  delete loaded.jointBalance;
  return loaded;
}

function migrateOldData() {
  const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
  if (!oldRaw) return false;
  try {
    const old = JSON.parse(oldRaw);
    const migrated = defaultData();
    migrated.month = old.startDate || currentMonth();
    migrated.people.person1.name = old.people?.person1?.name || '';
    migrated.people.person2.name = old.people?.person2?.name || '';
    migrated.people.person1.income = safeNumber(old.people?.person1?.salary) + safeNumber(old.people?.person1?.allowance);
    migrated.people.person2.income = safeNumber(old.people?.person2?.salary) + safeNumber(old.people?.person2?.allowance);
    if (safeNumber(old.cefBalance) !== 0) migrated.jointBalances[migrated.month] = safeNumber(old.cefBalance);

    const cc = Array.isArray(old.expenses) ? old.expenses.map((e, index) => normalizeExpense({
      id: `old-e-${e.id ?? index}`,
      month: e.month || migrated.month,
      description: e.name || e.description || 'Despesa',
      amount: safeNumber(e.amount), payer: 'joint', category: e.category, imported: true,
      recurrenceType: 'single'
    })) : [];

    const personal = Array.isArray(old.transactions) ? old.transactions.map((t, index) => normalizeExpense({
      id: `old-t-${t.id ?? index}`,
      month: t.month || migrated.month,
      description: t.description || 'Pagamento individual',
      amount: safeNumber(t.amount), payer: t.person === 'person2' ? 'person2' : 'person1',
      category: t.category, imported: true, recurrenceType: 'single'
    })) : [];

    migrated.expenses = [...cc, ...personal].filter(e => e.amount > 0);
    data = migrated;
    save();
    return true;
  } catch (err) {
    console.warn('Não foi possível migrar a V20:', err);
    return false;
  }
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let migrated = false;
  if (raw) {
    try { data = normalizeLoadedData(JSON.parse(raw)); }
    catch { data = defaultData(); }
  } else {
    migrated = migrateOldData();
  }
  initDashboardRange();
  syncFormFromData();
  render();
  if (migrated) showToast('Dados da V20 importados sem apagar o original.');
}

function initDashboardRange() {
  const year = String(currentMonth()).slice(0, 4);
  if (!dashboardFilters.from) dashboardFilters.from = `${year}-01`;
  if (!dashboardFilters.to) dashboardFilters.to = planningHorizonEnd();
}

function syncFormFromData() {
  document.getElementById('monthInput').value = data.month;
  document.getElementById('expenseMonth').value = data.month;
  document.getElementById('expenseMonth').disabled = false;
  document.getElementById('person1Name').value = data.people.person1.name || '';
  document.getElementById('person2Name').value = data.people.person2.name || '';
  document.getElementById('person1Income').value = incomeForMonth('person1', data.month) ? moneyInputText(incomeForMonth('person1', data.month)) : '';
  document.getElementById('person2Income').value = incomeForMonth('person2', data.month) ? moneyInputText(incomeForMonth('person2', data.month)) : '';
  document.getElementById('incomeScope').value = 'future';
  syncIncomeEditorContext();
  document.getElementById('dashboardFrom').value = dashboardFilters.from;
  document.getElementById('dashboardTo').value = dashboardFilters.to;
  syncJointBalanceInput();
}

function ratios(month = data.month) {
  const i1 = incomeForMonth('person1', month);
  const i2 = incomeForMonth('person2', month);
  const total = i1 + i2;
  if (!total) return { p1: 0, p2: 0, valid: false, i1, i2 };
  return { p1: i1 / total, p2: i2 / total, valid: true, i1, i2 };
}

function jointBalanceForMonth(month = data.month) {
  return safeNumber(data.jointBalances?.[month]);
}

function occursInMonth(expense, month) {
  const type = expenseType(expense);
  if (type === 'continuous') return month >= expense.month && (!expense.endMonth || month <= expense.endMonth);
  if (type === 'annual') {
    return month >= expense.month
      && month.slice(5, 7) === expense.month.slice(5, 7)
      && (!expense.endMonth || month <= expense.endMonth);
  }
  return expense.month === month;
}

function materializeExpense(expense, month) {
  if (!occursInMonth(expense, month)) return null;
  const type = expenseType(expense);
  if (type !== 'continuous' && type !== 'annual') return { ...expense, occurrenceMonth: month, sourceId: expense.id };

  const override = expense.overrides?.[month];
  return {
    ...expense,
    ...(override || {}),
    id: expense.id,
    sourceId: expense.id,
    sourceMonth: expense.month,
    occurrenceMonth: month,
    recurrenceType: type,
    adjustedThisMonth: Boolean(override),
    baseAmount: safeNumber(expense.amount),
    projected: type === 'annual' && month > currentMonth() && !override
  };
}

function expensesForMonth(month = data.month) {
  return data.expenses.map(e => materializeExpense(e, month)).filter(Boolean);
}

function calculation(month = data.month) {
  const r = ratios(month);
  const expenses = expensesForMonth(month);
  const total = expenses.reduce((sum, e) => sum + safeNumber(e.amount), 0);
  const paid1 = expenses.filter(e => e.payer === 'person1').reduce((s, e) => s + safeNumber(e.amount), 0);
  const paid2 = expenses.filter(e => e.payer === 'person2').reduce((s, e) => s + safeNumber(e.amount), 0);
  const paidJoint = expenses.filter(e => e.payer === 'joint').reduce((s, e) => s + safeNumber(e.amount), 0);
  const jointBalance = jointBalanceForMonth(month);
  // Saldo positivo funciona como crédito e reduz o que o casal precisa aportar.
  // Saldo negativo representa um déficit da conta conjunta e aumenta o valor a dividir.
  const balanceUsed = jointBalance >= 0 ? Math.min(jointBalance, total) : jointBalance;
  const netObligation = Math.max(0, total - balanceUsed);
  const fair1 = r.valid ? netObligation * r.p1 : 0;
  const fair2 = r.valid ? netObligation * r.p2 : 0;
  const need1 = fair1 - paid1;
  const need2 = fair2 - paid2;
  return { r, expenses, total, paid1, paid2, paidJoint, balanceUsed, netObligation, fair1, fair2, need1, need2 };
}

function settlementFlows(c) {
  const eps = 0.005;
  const flows = { p1Out: 0, p1In: 0, p2Out: 0, p2In: 0 };
  if (!c?.r?.valid) return flows;

  // Quando não há uso líquido da conta conjunta como intermediária, o acerto pode ser direto.
  if (Math.abs(c.paidJoint - c.balanceUsed) < eps && c.need1 * c.need2 < 0) {
    const value = Math.min(Math.abs(c.need1), Math.abs(c.need2));
    if (c.need1 > 0) { flows.p1Out = value; flows.p2In = value; }
    else { flows.p2Out = value; flows.p1In = value; }
    return flows;
  }

  if (c.need1 > eps) flows.p1Out = c.need1;
  else if (c.need1 < -eps) flows.p1In = Math.abs(c.need1);
  if (c.need2 > eps) flows.p2Out = c.need2;
  else if (c.need2 < -eps) flows.p2In = Math.abs(c.need2);
  return flows;
}

function effectiveOutlays(c) {
  const flows = settlementFlows(c);
  return {
    person1: Math.max(0, c.paid1 + flows.p1Out - flows.p1In),
    person2: Math.max(0, c.paid2 + flows.p2Out - flows.p2In),
    flows
  };
}

function filteredExpenses() {
  const text = filters.text.trim().toLocaleLowerCase('pt-BR');
  return expensesForMonth()
    .filter(e => filters.payer === 'all' || e.payer === filters.payer)
    .filter(e => filters.category === 'all' || e.category === filters.category)
    .filter(e => !text || String(e.description).toLocaleLowerCase('pt-BR').includes(text))
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

function monthsInRange(from, to) {
  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) return [];
  let start = from <= to ? from : to;
  const end = from <= to ? to : from;
  const months = [];
  for (let guard = 0; guard < 240 && start <= end; guard++) {
    months.push(start);
    start = addMonths(start, 1);
  }
  return months;
}

function dashboardOccurrences() {
  const months = monthsInRange(dashboardFilters.from, dashboardFilters.to);
  const rows = [];
  for (const month of months) {
    for (const expense of expensesForMonth(month)) {
      const type = expenseType(expense);
      if (dashboardFilters.payer !== 'all' && expense.payer !== dashboardFilters.payer) continue;
      if (dashboardFilters.category !== 'all' && expense.category !== dashboardFilters.category) continue;
      if (dashboardFilters.type !== 'all' && type !== dashboardFilters.type) continue;
      rows.push({ ...expense, occurrenceMonth: month, recurrenceType: type });
    }
  }
  return { months, rows };
}

function render() {
  renderPeopleLabels();
  renderIncomeSummary();
  renderFilters();
  renderExpenses();
  renderResult();
  renderDashboard();
  syncJointBalanceInput();
  save();
}

function renderPeopleLabels() {
  const p1 = personName('person1');
  const p2 = personName('person2');

  const payer = document.getElementById('expensePayer');
  const current = payer.value;
  payer.innerHTML = `<option value="person1">${escapeHtml(p1)}</option><option value="person2">${escapeHtml(p2)}</option><option value="joint">Conta conjunta</option>`;
  if ([...payer.options].some(o => o.value === current)) payer.value = current;

  const dashPayer = document.getElementById('dashboardPayer');
  const dashCurrent = dashboardFilters.payer;
  dashPayer.innerHTML = `<option value="all">Todos</option><option value="person1">${escapeHtml(p1)}</option><option value="person2">${escapeHtml(p2)}</option><option value="joint">Conta conjunta</option>`;
  dashPayer.value = [...dashPayer.options].some(o => o.value === dashCurrent) ? dashCurrent : 'all';
  document.getElementById('dashboardP1Header').textContent = `${p1} · gastos`;
  document.getElementById('dashboardP2Header').textContent = `${p2} · gastos`;
  document.getElementById('dashboardP1OutlayHeader').textContent = `${p1} · desembolso`;
  document.getElementById('dashboardP2OutlayHeader').textContent = `${p2} · desembolso`;
}

function renderIncomeSummary() {
  const r = ratios(data.month);
  const p1 = personName('person1');
  const p2 = personName('person2');
  const s1 = incomeStateForMonth('person1', data.month);
  const s2 = incomeStateForMonth('person2', data.month);
  document.getElementById('incomeMonthLabel').textContent = `Renda do casal · ${formatMonth(data.month)}`;
  document.getElementById('incomeStats').innerHTML = `
    <div class="income-stat"><span>${escapeHtml(p1)} · renda</span><strong>${money(r.i1)}</strong><small>${escapeHtml(incomeStateLabel(s1))}</small></div>
    <div class="income-stat accent"><span>Participação de ${escapeHtml(p1)}</span><strong>${r.valid ? pct(r.p1) : '—'}</strong></div>
    <div class="income-stat"><span>${escapeHtml(p2)} · renda</span><strong>${money(r.i2)}</strong><small>${escapeHtml(incomeStateLabel(s2))}</small></div>
    <div class="income-stat accent"><span>Participação de ${escapeHtml(p2)}</span><strong>${r.valid ? pct(r.p2) : '—'}</strong></div>`;
}

function incomeStateLabel(state) {
  if (!state) return '';
  if (state.kind === 'override') return 'ajustada só neste mês';
  if (state.kind === 'new-rule') return 'novo valor a partir deste mês';
  if (state.kind === 'rule' && state.startMonth) return `vigente desde ${formatMonth(state.startMonth, true)}`;
  return 'valor-base';
}

function renderFilters() {
  const tabs = document.getElementById('payerTabs');
  const items = [['all', 'Todos'], ['person1', personName('person1')], ['person2', personName('person2')], ['joint', 'Conta conjunta']];
  tabs.innerHTML = items.map(([value, label]) => `<button type="button" class="payer-tab ${filters.payer === value ? 'active' : ''}" data-payer="${value}">${escapeHtml(label)}</button>`).join('');
  tabs.querySelectorAll('[data-payer]').forEach(button => button.addEventListener('click', () => {
    filters.payer = button.dataset.payer;
    renderFilters();
    renderExpenses();
  }));
}

function expenseMeta(expense) {
  const parts = [`Pago por ${payerName(expense.payer)}`, CATEGORY_NAMES[expense.category] || 'Outros'];
  const type = expenseType(expense);
  if (type === 'installment') parts.push(`parcela ${expense.installmentCurrent}/${expense.installmentTotal}`);
  if (type === 'continuous') {
    parts.push(`contínuo desde ${formatMonth(expense.sourceMonth || expense.month, true)}`);
    if (expense.endMonth) parts.push(`até ${formatMonth(expense.endMonth, true)}`);
    if (expense.adjustedThisMonth) parts.push(`ajustado neste mês · padrão ${money(expense.baseAmount)}`);
  }
  if (type === 'annual') {
    parts.push(`anual desde ${formatMonth(expense.sourceMonth || expense.month, true)}`);
    if (expense.endMonth) parts.push(`até ${formatMonth(expense.endMonth, true)}`);
    if (expense.adjustedThisMonth) parts.push(`ajustado nesta ocorrência · padrão ${money(expense.baseAmount)}`);
    else if (expense.projected) parts.push('valor previsto');
  }
  if (type === 'planned') parts.push('repetição planejada');
  if (expense.imported) parts.push('importado');
  return parts.join(' · ');
}

function renderExpenses() {
  const list = document.getElementById('expenseList');
  const allExpenses = expensesForMonth();
  const expenses = filteredExpenses();
  const total = allExpenses.reduce((s, e) => s + safeNumber(e.amount), 0);
  const filteredTotal = expenses.reduce((s, e) => s + safeNumber(e.amount), 0);
  document.getElementById('monthTotal').textContent = `${money(total)} em gastos`;

  const summary = document.getElementById('filterSummary');
  const isFiltered = filters.payer !== 'all' || filters.category !== 'all' || filters.text.trim();
  summary.innerHTML = `<strong>${expenses.length}</strong> lançamento${expenses.length === 1 ? '' : 's'} · <strong>${money(filteredTotal)}</strong>${isFiltered ? ' no filtro atual' : ' no mês'}`;

  if (!expenses.length) {
    list.innerHTML = `<div class="expense-empty">${allExpenses.length ? 'Nenhum gasto corresponde aos filtros.' : 'Nenhum gasto lançado neste mês.'}</div>`;
    return;
  }

  list.innerHTML = expenses.map(e => {
    const icon = CATEGORY_ICONS[e.category] || CATEGORY_ICONS.outros;
    const type = expenseType(e);
    return `<div class="expense-row">
      <div class="expense-main">
        <div class="expense-title">${icon} ${escapeHtml(e.description)} ${type !== 'single' ? `<span class="type-badge">${escapeHtml(TYPE_NAMES[type])}</span>` : ''}</div>
        <div class="expense-meta">${escapeHtml(expenseMeta(e))}</div>
      </div>
      <div class="expense-amount">${money(e.amount)}</div>
      <div class="row-actions">
        ${(type === 'continuous' || type === 'annual') && (!e.endMonth || e.endMonth > data.month) ? `<button type="button" onclick="stopRecurring('${escapeJsString(e.id)}', '${escapeJsString(type)}', '${escapeJsString(e.occurrenceMonth || data.month)}')" title="Encerrar recorrência após esta ocorrência">⏹️</button>` : ''}
        <button type="button" onclick="editExpense('${escapeJsString(e.id)}', '${escapeJsString(e.occurrenceMonth || data.month)}')" title="Editar">✏️</button>
        <button type="button" onclick="deleteExpense('${escapeJsString(e.id)}')" title="Excluir">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function resultMessage(c) {
  const p1 = personName('person1');
  const p2 = personName('person2');
  const eps = 0.005;
  if (!c.expenses.length && c.netObligation <= eps) return { type: '', title: 'Adicione os gastos do mês.', detail: 'O acerto aparecerá aqui automaticamente.' };
  if (!c.r.valid) return { type: 'warn', title: 'Falta configurar a renda.', detail: 'Informe pelo menos uma renda acima de zero para calcular a divisão proporcional.' };
  if (Math.abs(c.need1) < eps && Math.abs(c.need2) < eps) return { type: 'good', title: 'Tudo certo. Ninguém deve nada.', detail: 'Os pagamentos já ficaram alinhados com a divisão proporcional.' };
  if (Math.abs(c.paidJoint - c.balanceUsed) < eps && c.need1 * c.need2 < 0) {
    const from = c.need1 > 0 ? p1 : p2;
    const to = c.need1 < 0 ? p1 : p2;
    const value = Math.abs(c.need1 > 0 ? c.need1 : c.need2);
    return { type: 'good', title: `${from} transfere ${money(value)} para ${to}.`, detail: 'Isso equaliza o que cada um já pagou com a parte proporcional de cada um.' };
  }
  const actions = [];
  if (c.need1 > eps) actions.push(`${p1} coloca ${money(c.need1)} na conta conjunta`);
  if (c.need2 > eps) actions.push(`${p2} coloca ${money(c.need2)} na conta conjunta`);
  if (c.need1 < -eps) actions.push(`a conta conjunta devolve ${money(Math.abs(c.need1))} para ${p1}`);
  if (c.need2 < -eps) actions.push(`a conta conjunta devolve ${money(Math.abs(c.need2))} para ${p2}`);
  return { type: 'good', title: actions.length ? `${capitalize(actions.join(' e '))}.` : 'Acerto concluído.', detail: 'A conta conjunta funciona como o ponto de compensação dos gastos do casal.' };
}

function renderResult() {
  const c = calculation();
  const hero = document.getElementById('resultHero');
  const stats = document.getElementById('resultStats');
  const breakdown = document.getElementById('calculationBreakdown');
  const p1 = personName('person1');
  const p2 = personName('person2');
  const message = resultMessage(c);
  const outlay = effectiveOutlays(c);

  hero.className = `result-hero ${message.type}`.trim();
  hero.innerHTML = `<strong class="big">${escapeHtml(message.title)}</strong><p>${escapeHtml(message.detail)}</p>`;
  stats.innerHTML = `
    <div class="stat"><div class="stat-label">Gastos do casal</div><div class="stat-value">${money(c.total)}</div></div>
    <div class="stat"><div class="stat-label">Pago por ${escapeHtml(p1)}</div><div class="stat-value">${money(c.paid1)}</div></div>
    <div class="stat"><div class="stat-label">Pago por ${escapeHtml(p2)}</div><div class="stat-value">${money(c.paid2)}</div></div>
    <div class="stat"><div class="stat-label">Pago pela conta conjunta</div><div class="stat-value">${money(c.paidJoint)}</div></div>`;

  breakdown.innerHTML = `<div class="breakdown">
    <div class="breakdown-line"><span>Total de gastos</span><strong>${money(c.total)}</strong></div>
    <div class="breakdown-line"><span>${c.balanceUsed < 0 ? 'Saldo negativo da conta conjunta a cobrir' : c.balanceUsed > 0 ? 'Saldo positivo da conta conjunta usado como crédito' : 'Saldo da conta conjunta'}</span><strong>${c.balanceUsed < 0 ? `+ ${money(Math.abs(c.balanceUsed))}` : c.balanceUsed > 0 ? `− ${money(c.balanceUsed)}` : money(0)}</strong></div>
    <div class="breakdown-line total"><span>Valor líquido a dividir</span><strong>${money(c.netObligation)}</strong></div>
    <div class="breakdown-line"><span>Parte de ${escapeHtml(p1)} (${c.r.valid ? pct(c.r.p1) : '—'})</span><strong>${money(c.fair1)}</strong></div>
    <div class="breakdown-line"><span>Já pago pessoalmente por ${escapeHtml(p1)}</span><strong>− ${money(c.paid1)}</strong></div>
    <div class="breakdown-line"><span>Saldo de ${escapeHtml(p1)}</span><strong>${formatNeed(c.need1)}</strong></div>
    <div class="breakdown-line"><span>Parte de ${escapeHtml(p2)} (${c.r.valid ? pct(c.r.p2) : '—'})</span><strong>${money(c.fair2)}</strong></div>
    <div class="breakdown-line"><span>Já pago pessoalmente por ${escapeHtml(p2)}</span><strong>− ${money(c.paid2)}</strong></div>
    <div class="breakdown-line"><span>Saldo de ${escapeHtml(p2)}</span><strong>${formatNeed(c.need2)}</strong></div>
    <div class="breakdown-line total"><span>Desembolso efetivo de ${escapeHtml(p1)} após o acerto</span><strong>${money(outlay.person1)}</strong></div>
    <div class="breakdown-line"><span>Desembolso efetivo de ${escapeHtml(p2)} após o acerto</span><strong>${money(outlay.person2)}</strong></div>
  </div>`;
}

function renderDashboard() {
  const { months, rows } = dashboardOccurrences();
  const total = rows.reduce((s, e) => s + safeNumber(e.amount), 0);
  const monthly = months.map(month => {
    const items = rows.filter(e => e.occurrenceMonth === month);
    const fullCalculation = calculation(month);
    const outlay = effectiveOutlays(fullCalculation);
    return {
      month,
      total: items.reduce((s, e) => s + safeNumber(e.amount), 0),
      person1: items.filter(e => e.payer === 'person1').reduce((s, e) => s + safeNumber(e.amount), 0),
      person2: items.filter(e => e.payer === 'person2').reduce((s, e) => s + safeNumber(e.amount), 0),
      joint: items.filter(e => e.payer === 'joint').reduce((s, e) => s + safeNumber(e.amount), 0),
      outlay1: outlay.person1,
      outlay2: outlay.person2,
      income1: incomeForMonth('person1', month),
      income2: incomeForMonth('person2', month),
      ratio: ratios(month)
    };
  });
  const average = months.length ? total / months.length : 0;
  const highest = monthly.reduce((best, item) => !best || item.total > best.total ? item : best, null);
  const outlay1Total = monthly.reduce((s, m) => s + m.outlay1, 0);
  const outlay2Total = monthly.reduce((s, m) => s + m.outlay2, 0);
  const p1 = personName('person1');
  const p2 = personName('person2');

  document.getElementById('dashboardStats').innerHTML = `
    <div class="stat"><div class="stat-label">Total no recorte</div><div class="stat-value">${money(total)}</div></div>
    <div class="stat"><div class="stat-label">Média por mês</div><div class="stat-value">${money(average)}</div></div>
    <div class="stat"><div class="stat-label">Lançamentos</div><div class="stat-value">${rows.length}</div></div>
    <div class="stat"><div class="stat-label">Maior mês</div><div class="stat-value">${highest && highest.total > 0 ? `${escapeHtml(formatMonth(highest.month, true))} · ${money(highest.total)}` : '—'}</div></div>
    <div class="stat outlay-stat"><div class="stat-label">Desembolso de ${escapeHtml(p1)}</div><div class="stat-value">${money(outlay1Total)}</div></div>
    <div class="stat outlay-stat"><div class="stat-label">Desembolso de ${escapeHtml(p2)}</div><div class="stat-value">${money(outlay2Total)}</div></div>`;

  const tbody = document.getElementById('dashboardTableBody');
  tbody.innerHTML = monthly.length ? monthly.map(m => `<tr>
    <td>${escapeHtml(formatMonth(m.month, true))}</td><td><strong>${money(m.total)}</strong></td><td>${money(m.person1)}</td><td>${money(m.person2)}</td><td>${money(m.joint)}</td><td class="outlay-cell"><strong>${money(m.outlay1)}</strong></td><td class="outlay-cell"><strong>${money(m.outlay2)}</strong></td><td>${money(m.income1)}</td><td>${money(m.income2)}</td><td>${m.ratio.valid ? `${pct(m.ratio.p1)} / ${pct(m.ratio.p2)}` : '—'}</td>
  </tr>`).join('') : '<tr><td colspan="10">Selecione um período válido.</td></tr>';

  const categoryTotals = Object.keys(CATEGORY_NAMES).map(category => ({
    category,
    label: CATEGORY_NAMES[category],
    value: rows.filter(e => e.category === category).reduce((s, e) => s + safeNumber(e.amount), 0)
  })).filter(x => x.value > 0).sort((a, b) => b.value - a.value);

  renderCategoryLegend(categoryTotals, total);
  requestAnimationFrame(() => {
    drawMonthlyChart(document.getElementById('monthlyChart'), monthly);
    drawCategoryChart(document.getElementById('categoryChart'), categoryTotals);
  });
}

function renderCategoryLegend(items, total) {
  const colors = chartPalette();
  const legend = document.getElementById('categoryLegend');
  if (!items.length) {
    legend.innerHTML = '<span class="legend-empty">Sem dados no período.</span>';
    return;
  }
  legend.innerHTML = items.map((item, index) => `<div class="legend-item"><span class="legend-dot" style="background:${colors[index % colors.length]}"></span><span>${escapeHtml(item.label)}</span><strong>${money(item.value)} · ${total ? pct(item.value / total) : '0%'}</strong></div>`).join('');
}

function canvasContext(canvas, cssHeight = 260) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, rect.width || canvas.parentElement?.clientWidth || 600);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height: cssHeight };
}

function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function chartPalette() {
  return ['#2563eb', '#d97706', '#7c3aed', '#0891b2', '#64748b', '#ca8a04', '#475569'];
}

function drawMonthlyChart(canvas, items) {
  const { ctx, width, height } = canvasContext(canvas);
  ctx.clearRect(0, 0, width, height);
  const text = cssVar('--muted', '#647272');
  const grid = cssVar('--border', '#dbe5e4');
  const primary = cssVar('--primary', '#0f766e');
  const pad = { left: 54, right: 12, top: 18, bottom: 42 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const max = Math.max(...items.map(i => i.total), 0);

  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = text;
  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + chartH * (i / 4);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    const value = max ? max * (1 - i / 4) : 0;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(compactMoney(value).replace('R$ ', ''), pad.left - 7, y);
  }
  if (!items.length || max <= 0) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Sem gastos no período', width / 2, height / 2);
    return;
  }

  const gap = Math.max(4, Math.min(12, chartW / (items.length * 5)));
  const barW = Math.max(5, (chartW - gap * (items.length - 1)) / items.length);
  const labelStep = Math.max(1, Math.ceil(items.length / Math.max(4, Math.floor(width / 90))));
  items.forEach((item, index) => {
    const x = pad.left + index * (barW + gap);
    const h = max ? (item.total / max) * chartH : 0;
    const y = pad.top + chartH - h;
    ctx.fillStyle = primary;
    ctx.beginPath();
    const radius = Math.min(5, barW / 2);
    roundedRect(ctx, x, y, barW, Math.max(1, h), radius);
    ctx.fill();
    if (index % labelStep === 0 || index === items.length - 1) {
      ctx.fillStyle = text; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(formatMonth(item.month, true), x + barW / 2, height - pad.bottom + 10);
    }
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + rr, y); ctx.lineTo(x + w - rr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr); ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr); ctx.quadraticCurveTo(x, y, x + rr, y);
}

function drawCategoryChart(canvas, items) {
  const { ctx, width, height } = canvasContext(canvas);
  ctx.clearRect(0, 0, width, height);
  const text = cssVar('--muted', '#647272');
  const total = items.reduce((s, i) => s + i.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const inner = radius * 0.58;
  if (!total) {
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Sem gastos no período', cx, cy);
    return;
  }
  const colors = chartPalette();
  let angle = -Math.PI / 2;
  items.forEach((item, index) => {
    const slice = (item.value / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = colors[index % colors.length]; ctx.fill();
    angle += slice;
  });
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fillStyle = cssVar('--card', '#fff'); ctx.fill();
  ctx.fillStyle = cssVar('--text', '#172121'); ctx.font = '700 17px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(compactMoney(total), cx, cy - 5);
  ctx.fillStyle = text; ctx.font = '11px system-ui, sans-serif'; ctx.fillText('no período', cx, cy + 17);
}

function syncJointBalanceInput() {
  const input = document.getElementById('jointBalance');
  if (!input) return;
  input.value = moneyInputText(jointBalanceForMonth(data.month) || 0);
  document.getElementById('jointBalanceMonthLabel').textContent = formatMonth(data.month);
}

function formatNeed(value) {
  if (Math.abs(value) < .005) return 'Quitado';
  return value > 0 ? `${money(value)} a contribuir` : `${money(Math.abs(value))} a receber`;
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function escapeJsString(value) {
  return String(value ?? '').replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function syncIncomeEditorContext() {
  const label = document.getElementById('incomeEditMonthLabel');
  if (label) label.textContent = formatMonth(data.month);
}

function syncIncomeEditorValues() {
  document.getElementById('person1Name').value = data.people.person1.name || '';
  document.getElementById('person2Name').value = data.people.person2.name || '';
  document.getElementById('person1Income').value = incomeForMonth('person1', data.month) ? moneyInputText(incomeForMonth('person1', data.month)) : '';
  document.getElementById('person2Income').value = incomeForMonth('person2', data.month) ? moneyInputText(incomeForMonth('person2', data.month)) : '';
  document.getElementById('incomeScope').value = 'future';
  syncIncomeEditorContext();
}

function setIncomeChange(person, month, amount) {
  const current = Array.isArray(data.incomeChanges?.[person]) ? data.incomeChanges[person] : [];
  const kept = current.filter(change => change.startMonth < month);
  kept.push({ startMonth: month, amount: Math.max(0, safeNumber(amount)) });
  data.incomeChanges[person] = normalizeIncomeChanges(kept);
}

function saveIncomeFromInputs() {
  const p1 = Math.max(0, parseMoneyInput(document.getElementById('person1Income').value));
  const p2 = Math.max(0, parseMoneyInput(document.getElementById('person2Income').value));
  const scope = document.getElementById('incomeScope').value || 'future';
  const month = data.month;

  data.people.person1.name = document.getElementById('person1Name').value;
  data.people.person2.name = document.getElementById('person2Name').value;

  if (scope === 'month') {
    data.incomeOverrides[month] = { person1: p1, person2: p2 };
    showToast(`Rendas ajustadas somente em ${formatMonth(month)}.`);
  } else {
    setIncomeChange('person1', month, p1);
    setIncomeChange('person2', month, p2);
    Object.keys(data.incomeOverrides).filter(m => m >= month).forEach(m => delete data.incomeOverrides[m]);
    showToast(`Novas rendas aplicadas de ${formatMonth(month)} em diante. O passado foi preservado.`);
  }

  render();
  syncIncomeEditorValues();
}

function syncRepeatUntilBounds() {
  const start = document.getElementById('expenseMonth').value || data.month || currentMonth();
  const input = document.getElementById('repeatUntil');
  if (!input) return;
  const horizon = planningHorizonEnd();
  input.min = start;
  input.max = horizon;
  if (!input.value || input.value < start || input.value > horizon) input.value = horizon >= start ? horizon : start;
}

function updateLaunchTypeFields() {
  const type = document.getElementById('launchType').value;
  document.getElementById('plannedMonthsField').classList.toggle('hidden', type !== 'planned');
  document.getElementById('installmentTotalField').classList.toggle('hidden', type !== 'installment');
  document.getElementById('continuousInfoField').classList.toggle('hidden', type !== 'continuous');
  document.getElementById('annualInfoField').classList.toggle('hidden', type !== 'annual');
  const editingContinuous = Boolean(editingOriginal && expenseType(editingOriginal) === 'continuous');
  const editingAnnual = Boolean(editingOriginal && expenseType(editingOriginal) === 'annual');
  const editingSeries = Boolean(editingOriginal && ['planned', 'installment'].includes(expenseType(editingOriginal)));
  document.getElementById('continuousEditScopeField').classList.toggle('hidden', !editingContinuous);
  document.getElementById('annualEditScopeField').classList.toggle('hidden', !editingAnnual);
  document.getElementById('seriesEditScopeField').classList.toggle('hidden', !editingSeries);
  syncRepeatUntilBounds();

  const sameInstallment = editingOriginal && expenseType(editingOriginal) === 'installment' && type === 'installment';
  document.getElementById('installmentTotal').disabled = Boolean(sameInstallment);
}

function editExpense(id, occurrenceMonth = null) {
  const source = data.expenses.find(x => String(x.id) === String(id));
  if (!source) return;
  const type = expenseType(source);
  const isRuleRecurrence = type === 'continuous' || type === 'annual';
  const isPhysicalSeries = type === 'planned' || type === 'installment';
  const targetMonth = isRuleRecurrence ? (occurrenceMonth || data.month || source.month) : source.month;
  const e = isRuleRecurrence ? materializeExpense(source, targetMonth) : source;
  if (!e) return;

  editingId = source.id;
  editingOriginal = JSON.parse(JSON.stringify(source));
  editingOccurrenceMonth = targetMonth;
  document.getElementById('expenseDescription').value = e.description;
  document.getElementById('expenseAmount').value = moneyInputText(e.amount);
  document.getElementById('expensePayer').value = e.payer;
  document.getElementById('expenseCategory').value = e.category || 'outros';
  document.getElementById('expenseMonth').value = targetMonth || data.month;
  document.getElementById('expenseMonth').disabled = isRuleRecurrence || isPhysicalSeries;
  document.getElementById('launchType').value = type;
  document.getElementById('launchType').disabled = false;
  document.getElementById('continuousEditScope').value = 'month';
  document.getElementById('annualEditScope').value = 'month';
  document.getElementById('seriesEditScope').value = 'month';
  if (type === 'installment') document.getElementById('installmentTotal').value = String(e.installmentTotal);
  if (type === 'planned') {
    const siblings = data.expenses.filter(x => x.seriesId && x.seriesId === e.seriesId && expenseType(x) === 'planned');
    const lastMonth = siblings.reduce((max, x) => !max || x.month > max ? x.month : max, e.month);
    document.getElementById('repeatUntil').value = lastMonth;
  }
  updateLaunchTypeFields();
  document.getElementById('launchOptions').open = true;
  const notice = document.getElementById('editingNotice');
  let text = 'Editando este lançamento. O tipo também pode ser alterado.';
  if (type === 'installment') text = `Editando a parcela ${e.installmentCurrent}/${e.installmentTotal}. Se você mudar o nome, ele será sincronizado em todas as parcelas. Escolha abaixo até onde valor, pagador e categoria devem mudar.`;
  if (type === 'planned') text = 'Editando uma ocorrência da repetição planejada. Se você mudar o nome, ele será sincronizado em toda a série. Escolha abaixo até onde valor, pagador e categoria devem mudar.';
  if (type === 'continuous') text = `Editando “${e.description}” em ${formatMonth(targetMonth)}. O nome é sincronizado em toda a recorrência; escolha se valor, pagador e categoria valem só neste mês ou deste mês em diante.`;
  if (type === 'annual') text = `Editando “${e.description}” em ${formatMonth(targetMonth)}. O nome é sincronizado em toda a recorrência; escolha se valor, pagador e categoria valem só nesta ocorrência ou também nos próximos anos.`;
  notice.textContent = text;
  notice.classList.remove('hidden');
  document.getElementById('expenseDescription').focus();
  document.querySelector('#expenseForm .primary-button').textContent = 'Salvar alteração';
  window.scrollTo({ top: document.getElementById('expenseForm').getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
}

function deleteExpense(id) {
  const e = data.expenses.find(x => String(x.id) === String(id));
  if (!e) return;
  const type = expenseType(e);
  const question = type === 'continuous'
    ? `Excluir “${e.description}” (${money(e.amount)}) de todos os meses?`
    : type === 'annual'
      ? `Excluir “${e.description}” (${money(e.amount)}) de todas as ocorrências anuais?`
      : `Excluir “${e.description}” (${money(e.amount)}) somente de ${formatMonth(e.month)}?`;
  if (!confirm(question)) return;
  data.expenses = data.expenses.filter(x => String(x.id) !== String(id));
  if (String(editingId) === String(id)) resetExpenseForm();
  render();
  showToast(type === 'continuous' ? 'Gasto contínuo excluído.' : type === 'annual' ? 'Recorrência anual excluída.' : 'Gasto excluído.');
}

function stopRecurring(id, type = null, occurrenceMonth = null) {
  const e = data.expenses.find(x => String(x.id) === String(id));
  if (!e) return;
  const recurrence = type || expenseType(e);
  if (recurrence !== 'continuous' && recurrence !== 'annual') return;
  const targetMonth = occurrenceMonth || data.month;
  const label = recurrence === 'annual' ? 'recorrência anual' : 'gasto contínuo';
  if (!confirm(`Encerrar ${label} “${e.description}” após ${formatMonth(targetMonth)}? Ele não aparecerá nas ocorrências seguintes.`)) return;
  e.endMonth = targetMonth;
  render();
  showToast(`${recurrence === 'annual' ? 'Recorrência anual' : 'Gasto contínuo'} encerrado em ${formatMonth(targetMonth)}.`);
}

function resetExpenseForm() {
  editingId = null;
  editingOriginal = null;
  editingOccurrenceMonth = null;
  document.getElementById('expenseForm').reset();
  document.getElementById('expenseCategory').value = 'outros';
  document.getElementById('expenseMonth').value = data.month;
  document.getElementById('expenseMonth').disabled = false;
  document.getElementById('launchType').value = 'single';
  document.getElementById('launchType').disabled = false;
  document.getElementById('continuousEditScope').value = 'month';
  document.getElementById('annualEditScope').value = 'month';
  document.getElementById('seriesEditScope').value = 'month';
  document.getElementById('repeatUntil').value = planningHorizonEnd();
  document.getElementById('installmentTotal').value = '4';
  document.getElementById('installmentTotal').disabled = false;
  document.getElementById('editingNotice').classList.add('hidden');
  document.querySelector('#expenseForm .primary-button').textContent = '+ Adicionar';
  updateLaunchTypeFields();
  renderPeopleLabels();
}

function addGeneratedExpenses(base, type, startMonth, options = {}) {
  const stamp = Date.now();
  if (type === 'planned') {
    const horizon = planningHorizonEnd();
    const requestedEnd = options.repeatUntil || horizon;
    const endMonth = requestedEnd > horizon ? horizon : requestedEnd;
    const count = monthDistanceInclusive(startMonth, endMonth);
    if (count < 2) {
      data.expenses.push(normalizeExpense({ ...base, id: `${stamp}-${Math.random().toString(36).slice(2, 7)}`, month: startMonth, recurrenceType: 'single' }));
      showToast('Período sem meses futuros; salvo como gasto único.');
      return;
    }
    const seriesId = `planned-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
    for (let i = 0; i < count; i++) {
      data.expenses.push(normalizeExpense({ ...base, id: `${stamp}-${i}-${Math.random().toString(36).slice(2, 6)}`, month: addMonths(startMonth, i), recurrenceType: 'planned', seriesId }));
    }
    showToast(`Gasto repetido até ${formatMonth(endMonth)} (${count} meses).`);
  } else if (type === 'installment') {
    const total = Math.min(48, Math.max(2, Math.round(safeNumber(options.installmentTotal) || 2)));
    const seriesId = `installment-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
    for (let i = 0; i < total; i++) {
      data.expenses.push(normalizeExpense({ ...base, id: `${stamp}-${i}-${Math.random().toString(36).slice(2, 6)}`, month: addMonths(startMonth, i), recurrenceType: 'installment', seriesId, installmentCurrent: i + 1, installmentTotal: total }));
    }
    showToast(`Parcelamento criado: 1/${total} até ${total}/${total}.`);
  } else if (type === 'continuous') {
    const id = `continuous-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
    data.expenses.push(normalizeExpense({ ...base, id, recurrenceGroupId: id, month: startMonth, recurrenceType: 'continuous' }));
    showToast('Gasto contínuo criado.');
  } else if (type === 'annual') {
    const id = `annual-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
    data.expenses.push(normalizeExpense({ ...base, id, recurrenceGroupId: id, month: startMonth, recurrenceType: 'annual' }));
    showToast(`Recorrência anual criada para ${formatMonth(startMonth)}.`);
  } else {
    data.expenses.push(normalizeExpense({ ...base, id: `${stamp}-${Math.random().toString(36).slice(2, 7)}`, month: startMonth, recurrenceType: 'single' }));
    showToast('Gasto adicionado.');
  }
}

function cleanRecurrenceFields(item) {
  ['seriesId', 'installmentCurrent', 'installmentTotal', 'endMonth', 'continuous', 'overrides'].forEach(key => delete item[key]);
}

function sameScopedValues(item, base) {
  return Math.abs(safeNumber(item.amount) - safeNumber(base.amount)) < 0.005
    && item.payer === base.payer
    && item.category === base.category;
}

function seriesMembers(item) {
  if (!item?.seriesId) return [item];
  return data.expenses.filter(x => x.seriesId === item.seriesId && expenseType(x) === expenseType(item));
}

function recurringMembers(item) {
  const type = expenseType(item);
  if (!['continuous', 'annual'].includes(type)) return [item];
  const groupId = String(item.recurrenceGroupId || item.id);
  item.recurrenceGroupId = groupId;
  return data.expenses.filter(x => expenseType(x) === type && String(x.recurrenceGroupId || x.id) === groupId);
}

// O nome identifica o lançamento lógico e, por isso, fica igual em toda a série/recorrência.
// Valores, pagador e categoria continuam podendo variar por ocorrência.
function syncLogicalDescription(item, description) {
  const type = expenseType(item);
  const members = ['planned', 'installment'].includes(type) ? seriesMembers(item) : recurringMembers(item);
  members.forEach(member => {
    member.description = description;
    if (member.overrides && typeof member.overrides === 'object') {
      Object.values(member.overrides).forEach(override => {
        if (override && typeof override === 'object') override.description = description;
      });
    }
  });
}

function updatePhysicalSeriesExpense(item, base, type) {
  const oldType = expenseType(item);
  const scope = document.getElementById('seriesEditScope').value || 'month';
  const members = seriesMembers(item).sort((a, b) => a.month.localeCompare(b.month));

  if (type !== oldType) {
    if (scope !== 'all') {
      alert('Para trocar o tipo de um parcelamento ou repetição por período, escolha “Toda a série”.');
      return false;
    }
    const firstMonth = members[0]?.month || item.month;
    const ids = new Set(members.map(x => String(x.id)));
    data.expenses = data.expenses.filter(x => !ids.has(String(x.id)));
    addGeneratedExpenses(base, type, firstMonth, {
      repeatUntil: document.getElementById('repeatUntil').value,
      installmentTotal: document.getElementById('installmentTotal').value
    });
    showToast(`Toda a série foi convertida de ${TYPE_NAMES[oldType]} para ${TYPE_NAMES[type]}.`);
    return true;
  }

  syncLogicalDescription(item, base.description);
  const affected = members.filter(member => {
    if (scope === 'all') return true;
    if (scope === 'future') return member.month >= item.month;
    return String(member.id) === String(item.id);
  });

  affected.forEach(member => {
    member.amount = base.amount;
    member.payer = base.payer;
    member.category = base.category;
    member.imported = false;
  });

  if (scope === 'all') showToast('Nome sincronizado e dados atualizados em toda a série.');
  else if (scope === 'future') showToast(`Nome sincronizado em toda a série; valor e demais dados alterados de ${formatMonth(item.month)} em diante.`);
  else showToast(`Nome sincronizado em toda a série; valor e demais dados alterados somente em ${formatMonth(item.month)}.`);
  return true;
}

function updateContinuousExpense(item, base, type, targetMonth) {
  const scope = document.getElementById('continuousEditScope').value || 'month';
  const logicalDescription = base.description;

  if (type !== 'continuous') {
    if (scope === 'month') {
      alert('Para mudar o tipo de um gasto contínuo, escolha “Este mês e os próximos”. Para ajustar apenas o valor deste mês, mantenha o tipo Contínuo.');
      return false;
    }

    const index = data.expenses.findIndex(x => String(x.id) === String(item.id));
    if (targetMonth <= item.month) {
      if (index >= 0) data.expenses.splice(index, 1);
    } else {
      item.endMonth = addMonths(targetMonth, -1);
      if (item.overrides) {
        const prior = Object.fromEntries(Object.entries(item.overrides).filter(([m]) => m < targetMonth));
        if (Object.keys(prior).length) item.overrides = prior; else delete item.overrides;
      }
    }

    addGeneratedExpenses(base, type, targetMonth, {
      repeatUntil: document.getElementById('repeatUntil').value,
      installmentTotal: document.getElementById('installmentTotal').value
    });
    showToast(`Histórico preservado. Novo tipo aplicado a partir de ${formatMonth(targetMonth)}.`);
    return true;
  }

  syncLogicalDescription(item, logicalDescription);
  base.description = logicalDescription;

  if (scope === 'month') {
    item.overrides = item.overrides && typeof item.overrides === 'object' ? item.overrides : {};
    if (sameScopedValues(item, base)) {
      delete item.overrides[targetMonth];
      if (!Object.keys(item.overrides).length) delete item.overrides;
      showToast(`Ajuste de ${formatMonth(targetMonth)} removido; voltou ao valor padrão.`);
    } else {
      item.overrides[targetMonth] = {
        description: base.description,
        amount: base.amount,
        payer: base.payer,
        category: base.category
      };
      showToast(`Somente ${formatMonth(targetMonth)} foi ajustado. O passado e os meses seguintes foram preservados.`);
    }
    item.imported = false;
    return true;
  }

  // "Este mês e os próximos": fecha a regra antiga no mês anterior e cria
  // uma nova regra contínua. Dessa forma o histórico anterior nunca muda.
  const oldEndMonth = item.endMonth;
  const oldOverrides = item.overrides && typeof item.overrides === 'object' ? item.overrides : {};
  const futureOverrides = Object.fromEntries(Object.entries(oldOverrides).filter(([m]) => m > targetMonth));

  if (targetMonth <= item.month) {
    Object.assign(item, base, { month: item.month, recurrenceType: 'continuous', imported: false });
    delete item.seriesId;
    delete item.installmentCurrent;
    delete item.installmentTotal;
    delete item.continuous;
    delete item.overrides;
    if (Object.keys(futureOverrides).length) item.overrides = futureOverrides;
    showToast(`Novo valor aplicado a partir de ${formatMonth(targetMonth)}. O histórico anterior foi preservado.`);
    return true;
  }

  item.endMonth = addMonths(targetMonth, -1);
  const priorOverrides = Object.fromEntries(Object.entries(oldOverrides).filter(([m]) => m < targetMonth));
  if (Object.keys(priorOverrides).length) item.overrides = priorOverrides; else delete item.overrides;

  const replacement = normalizeExpense({
    ...base,
    id: `continuous-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recurrenceGroupId: String(item.recurrenceGroupId || item.id),
    month: targetMonth,
    recurrenceType: 'continuous',
    imported: false,
    ...(oldEndMonth && oldEndMonth >= targetMonth ? { endMonth: oldEndMonth } : {}),
    ...(Object.keys(futureOverrides).length ? { overrides: futureOverrides } : {})
  });
  data.expenses.push(replacement);
  showToast(`Novo valor aplicado de ${formatMonth(targetMonth)} em diante. Meses anteriores ficaram intactos.`);
  return true;
}

function updateAnnualExpense(item, base, type, targetMonth) {
  const scope = document.getElementById('annualEditScope').value || 'month';
  const logicalDescription = base.description;

  if (type !== 'annual') {
    if (scope === 'month') {
      alert('Para mudar o tipo de uma recorrência anual, escolha “Esta ocorrência e os próximos anos”. Para ajustar somente este ano, mantenha o tipo Recorrente anual.');
      return false;
    }
    const index = data.expenses.findIndex(x => String(x.id) === String(item.id));
    if (targetMonth <= item.month) {
      if (index >= 0) data.expenses.splice(index, 1);
    } else {
      item.endMonth = addMonths(targetMonth, -1);
      if (item.overrides) {
        const prior = Object.fromEntries(Object.entries(item.overrides).filter(([m]) => m < targetMonth));
        if (Object.keys(prior).length) item.overrides = prior; else delete item.overrides;
      }
    }
    addGeneratedExpenses(base, type, targetMonth, {
      repeatUntil: document.getElementById('repeatUntil').value,
      installmentTotal: document.getElementById('installmentTotal').value
    });
    showToast(`Histórico anual preservado. Novo tipo aplicado a partir de ${formatMonth(targetMonth)}.`);
    return true;
  }

  syncLogicalDescription(item, logicalDescription);
  base.description = logicalDescription;

  if (scope === 'month') {
    item.overrides = item.overrides && typeof item.overrides === 'object' ? item.overrides : {};
    if (sameScopedValues(item, base)) {
      delete item.overrides[targetMonth];
      if (!Object.keys(item.overrides).length) delete item.overrides;
      showToast(`Ajuste anual de ${formatMonth(targetMonth)} removido; voltou ao valor padrão.`);
    } else {
      item.overrides[targetMonth] = { description: base.description, amount: base.amount, payer: base.payer, category: base.category };
      showToast(`Somente a ocorrência de ${formatMonth(targetMonth)} foi ajustada. Os outros anos foram preservados.`);
    }
    item.imported = false;
    return true;
  }

  const oldEndMonth = item.endMonth;
  const oldOverrides = item.overrides && typeof item.overrides === 'object' ? item.overrides : {};
  const futureOverrides = Object.fromEntries(Object.entries(oldOverrides).filter(([m]) => m > targetMonth));

  if (targetMonth <= item.month) {
    Object.assign(item, base, { month: item.month, recurrenceType: 'annual', imported: false });
    delete item.seriesId; delete item.installmentCurrent; delete item.installmentTotal; delete item.continuous; delete item.overrides;
    if (Object.keys(futureOverrides).length) item.overrides = futureOverrides;
    showToast(`Novo valor anual aplicado a partir de ${formatMonth(targetMonth)}.`);
    return true;
  }

  item.endMonth = addMonths(targetMonth, -1);
  const priorOverrides = Object.fromEntries(Object.entries(oldOverrides).filter(([m]) => m < targetMonth));
  if (Object.keys(priorOverrides).length) item.overrides = priorOverrides; else delete item.overrides;

  data.expenses.push(normalizeExpense({
    ...base,
    id: `annual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recurrenceGroupId: String(item.recurrenceGroupId || item.id),
    month: targetMonth,
    recurrenceType: 'annual',
    imported: false,
    ...(oldEndMonth && oldEndMonth >= targetMonth ? { endMonth: oldEndMonth } : {}),
    ...(Object.keys(futureOverrides).length ? { overrides: futureOverrides } : {})
  }));
  showToast(`Novo valor anual aplicado de ${formatMonth(targetMonth)} em diante. Anos anteriores ficaram intactos.`);
  return true;
}

function updateExistingExpense(base, type, startMonth) {
  const index = data.expenses.findIndex(x => String(x.id) === String(editingId));
  if (index < 0) return false;
  const item = data.expenses[index];
  const oldType = expenseType(editingOriginal || item);

  if (oldType === 'continuous') {
    return updateContinuousExpense(item, base, type, editingOccurrenceMonth || startMonth || data.month);
  }
  if (oldType === 'annual') {
    return updateAnnualExpense(item, base, type, editingOccurrenceMonth || startMonth || data.month);
  }
  if (oldType === 'planned' || oldType === 'installment') {
    return updatePhysicalSeriesExpense(item, base, type);
  }

  if (type === oldType) {
    Object.assign(item, base, { month: startMonth, recurrenceType: type, imported: false });
    if (type === 'single') cleanRecurrenceFields(item);
    showToast('Gasto atualizado sem criar duplicata.');
    return true;
  }

  data.expenses.splice(index, 1);
  addGeneratedExpenses(base, type, startMonth, {
    repeatUntil: document.getElementById('repeatUntil').value,
    installmentTotal: document.getElementById('installmentTotal').value
  });
  showToast(`Tipo alterado de ${TYPE_NAMES[oldType]} para ${TYPE_NAMES[type]}.`);
  return true;
}

function addExpenseFromForm() {
  const description = document.getElementById('expenseDescription').value.trim();
  const amount = parseMoneyInput(document.getElementById('expenseAmount').value);
  const payer = document.getElementById('expensePayer').value;
  const category = document.getElementById('expenseCategory').value || 'outros';
  const startMonth = document.getElementById('expenseMonth').value || data.month;
  const type = document.getElementById('launchType').value || 'single';
  if (!description || amount <= 0) return false;

  const base = { description, amount, payer, category, imported: false };

  if (editingId !== null) {
    return updateExistingExpense(base, type, startMonth);
  }

  addGeneratedExpenses(base, type, startMonth, {
    repeatUntil: document.getElementById('repeatUntil').value,
    installmentTotal: document.getElementById('installmentTotal').value
  });
  return true;
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dividecerto-facil-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.people || !Array.isArray(parsed.expenses)) throw new Error('Formato inválido');
      data = normalizeLoadedData(parsed);
      initDashboardRange();
      syncFormFromData();
      render();
      showToast('Backup importado.');
    } catch { alert('Não foi possível importar este arquivo.'); }
  };
  reader.readAsText(file);
}

function setMonth(month) {
  data.month = month || currentMonth();
  document.getElementById('monthInput').value = data.month;
  if (editingId === null) document.getElementById('expenseMonth').value = data.month;
  filters = { payer: 'all', category: 'all', text: '' };
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('textFilter').value = '';
  syncIncomeEditorValues();
  render();
}

function printTypeLabel(e) {
  const type = expenseType(e);
  if (type === 'installment') return `Parcela ${e.installmentCurrent}/${e.installmentTotal}`;
  if (type === 'continuous') return `${e.adjustedThisMonth ? 'Contínuo ajustado' : 'Contínuo'} desde ${formatMonth(e.sourceMonth || e.month, true)}`;
  if (type === 'annual') return `${e.adjustedThisMonth ? 'Anual ajustado' : e.projected ? 'Anual previsto' : 'Anual'} desde ${formatMonth(e.sourceMonth || e.month, true)}`;
  return TYPE_NAMES[type];
}

function buildPrintReport(mode) {
  const c = calculation();
  const r = ratios(data.month);
  const p1 = personName('person1');
  const p2 = personName('person2');
  const message = resultMessage(c);
  const expenses = mode === 'statement' ? filteredExpenses() : expensesForMonth().sort((a, b) => String(a.description).localeCompare(String(b.description), 'pt-BR'));
  const totalShown = expenses.reduce((s, e) => s + safeNumber(e.amount), 0);
  const outlay = effectiveOutlays(c);
  const report = document.getElementById('printReport');

  const filterText = mode === 'statement' && (filters.payer !== 'all' || filters.category !== 'all' || filters.text.trim())
    ? `<p class="print-filter">Filtro: ${escapeHtml(filters.payer === 'all' ? 'todos os pagadores' : payerName(filters.payer))} · ${escapeHtml(filters.category === 'all' ? 'todas as categorias' : CATEGORY_NAMES[filters.category])}${filters.text.trim() ? ` · busca “${escapeHtml(filters.text.trim())}”` : ''}</p>` : '';

  report.innerHTML = `
    <div class="print-title">DivideCerto Fácil</div>
    <h1>${mode === 'statement' ? 'Extrato' : 'Status'} — ${escapeHtml(formatMonth(data.month))}</h1>
    <p class="print-date">Gerado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}</p>
    ${filterText}
    ${mode === 'status' ? `
      <section class="print-section"><h2>Divisão proporcional à renda</h2><table><tbody>
        <tr><td>${escapeHtml(p1)}</td><td>${money(r.i1)}</td><td>${r.valid ? pct(r.p1) : '—'}</td></tr>
        <tr><td>${escapeHtml(p2)}</td><td>${money(r.i2)}</td><td>${r.valid ? pct(r.p2) : '—'}</td></tr>
      </tbody></table></section>
      <section class="print-highlight"><strong>${escapeHtml(message.title)}</strong><span>${escapeHtml(message.detail)}</span></section>
      <section class="print-section"><h2>Resumo</h2><table><tbody>
        <tr><td>Gastos do casal</td><td>${money(c.total)}</td></tr><tr><td>Pago por ${escapeHtml(p1)}</td><td>${money(c.paid1)}</td></tr>
        <tr><td>Pago por ${escapeHtml(p2)}</td><td>${money(c.paid2)}</td></tr><tr><td>Pago pela conta conjunta</td><td>${money(c.paidJoint)}</td></tr>
        <tr><td>${c.balanceUsed < 0 ? 'Saldo negativo da conta conjunta a cobrir' : c.balanceUsed > 0 ? 'Saldo positivo da conta conjunta usado como crédito' : 'Saldo da conta conjunta'}</td><td>${c.balanceUsed < 0 ? `+ ${money(Math.abs(c.balanceUsed))}` : c.balanceUsed > 0 ? `− ${money(c.balanceUsed)}` : money(0)}</td></tr><tr><td>Valor líquido a dividir</td><td>${money(c.netObligation)}</td></tr><tr><td>Parte proporcional de ${escapeHtml(p1)}</td><td>${money(c.fair1)}</td></tr>
        <tr><td>Parte proporcional de ${escapeHtml(p2)}</td><td>${money(c.fair2)}</td></tr>
        <tr><td>Desembolso efetivo de ${escapeHtml(p1)}</td><td>${money(outlay.person1)}</td></tr>
        <tr><td>Desembolso efetivo de ${escapeHtml(p2)}</td><td>${money(outlay.person2)}</td></tr>
      </tbody></table></section>` : ''}
    <section class="print-section"><h2>${mode === 'statement' ? `Lançamentos (${money(totalShown)})` : 'Gastos do mês'}</h2>
      ${expenses.length ? `<table class="print-expenses"><thead><tr><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Pago por</th><th>Valor</th></tr></thead><tbody>${expenses.map(e => `<tr><td>${escapeHtml(e.description)}</td><td>${escapeHtml(CATEGORY_NAMES[e.category] || 'Outros')}</td><td>${escapeHtml(printTypeLabel(e))}</td><td>${escapeHtml(payerName(e.payer))}</td><td>${money(e.amount)}</td></tr>`).join('')}</tbody></table>` : '<p>Nenhum lançamento.</p>'}
    </section>`;
}

function printReportNow(mode) {
  buildPrintReport(mode);
  window.print();
}

function initTheme() {
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.dataset.theme = theme;
  document.getElementById('themeButton').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function populateInstallmentOptions() {
  const select = document.getElementById('installmentTotal');
  select.innerHTML = Array.from({ length: 47 }, (_, i) => i + 2).map(n => `<option value="${n}" ${n === 4 ? 'selected' : ''}>${n} parcelas</option>`).join('');
}

function bindEvents() {
  document.getElementById('themeButton').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    document.getElementById('themeButton').textContent = next === 'dark' ? '☀️' : '🌙';
    renderDashboard();
  });

  document.getElementById('monthInput').addEventListener('change', e => setMonth(e.target.value));
  document.getElementById('prevMonth').addEventListener('click', () => setMonth(addMonths(data.month, -1)));
  document.getElementById('nextMonth').addEventListener('click', () => setMonth(addMonths(data.month, 1)));
  document.getElementById('currentMonthButton').addEventListener('click', () => setMonth(currentMonth()));

  document.getElementById('toggleIncome').addEventListener('click', () => {
    const editor = document.getElementById('incomeEditor');
    const hidden = editor.classList.toggle('hidden');
    document.getElementById('toggleIncome').textContent = hidden ? 'Editar rendas' : 'Fechar';
    if (!hidden) syncIncomeEditorValues();
  });
  document.getElementById('saveIncomeButton').addEventListener('click', saveIncomeFromInputs);

  document.getElementById('launchType').addEventListener('change', updateLaunchTypeFields);
  document.getElementById('expenseMonth').addEventListener('change', syncRepeatUntilBounds);

  document.getElementById('categoryFilter').addEventListener('change', e => { filters.category = e.target.value; renderExpenses(); });
  document.getElementById('textFilter').addEventListener('input', e => { filters.text = e.target.value; renderExpenses(); });

  document.getElementById('jointBalance').addEventListener('input', e => {
    const value = parseMoneyInput(e.target.value);
    if (Math.abs(value) > 0.000001) data.jointBalances[data.month] = value; else delete data.jointBalances[data.month];
    renderResult(); renderDashboard(); save();
  });

  document.getElementById('expenseForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!addExpenseFromForm()) return;
    resetExpenseForm();
    render();
  });

  document.getElementById('printStatementButton').addEventListener('click', () => printReportNow('statement'));
  document.getElementById('printStatusButton').addEventListener('click', () => printReportNow('status'));

  ['dashboardFrom', 'dashboardTo', 'dashboardPayer', 'dashboardCategory', 'dashboardType'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      dashboardFilters.from = document.getElementById('dashboardFrom').value;
      dashboardFilters.to = document.getElementById('dashboardTo').value;
      dashboardFilters.payer = document.getElementById('dashboardPayer').value;
      dashboardFilters.category = document.getElementById('dashboardCategory').value;
      dashboardFilters.type = document.getElementById('dashboardType').value;
      renderDashboard();
    });
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderDashboard, 150);
  });

  document.getElementById('exportButton').addEventListener('click', exportData);
  document.getElementById('importInput').addEventListener('change', e => importData(e.target.files[0]));
  document.getElementById('clearButton').addEventListener('click', () => {
    if (!confirm('Apagar somente os dados do DivideCerto Fácil? Os dados antigos da V20 continuarão guardados.')) return;
    localStorage.removeItem(STORAGE_KEY);
    data = defaultData();
    editingId = null;
    editingOriginal = null;
    editingOccurrenceMonth = null;
    filters = { payer: 'all', category: 'all', text: '' };
    dashboardFilters = { from: '', to: '', payer: 'all', category: 'all', type: 'all' };
    initDashboardRange();
    syncFormFromData();
    render();
    showToast('Dados desta versão apagados.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateInstallmentOptions();
  bindMoneyInputs();
  initTheme();
  bindEvents();
  updateLaunchTypeFields();
  load();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
});
