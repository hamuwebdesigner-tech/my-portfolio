/**
 * BUDGETPILOT CORE CORE CONTROLLER ENGINE
 * Complete architectural framework handles State, DOM Actions, Charts, and Local Storage pipelines.
 */

// Application State Layer Object Matrix
let state = {
    transactions: [],
    editId: null,
    theme: 'dark',
    activeChart: 'bar'
};

// UI Object Cache References Elements Map
const DOM = {
    totalBalance: document.getElementById('total-balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    totalSavings: document.getElementById('total-savings'),
    weeklyIncomeSummary: document.getElementById('weekly-income-summary'),
    weeklyExpenseSummary: document.getElementById('weekly-expense-summary'),
    savingsRate: document.getElementById('savings-rate'),
    currentDate: document.getElementById('current-date'),
    
    form: document.getElementById('transaction-form'),
    formTitle: document.getElementById('form-title'),
    transactionId: document.getElementById('transaction-id'),
    type: document.getElementById('type'),
    amount: document.getElementById('amount'),
    description: document.getElementById('description'),
    category: document.getElementById('category'),
    date: document.getElementById('date'),
    submitBtn: document.getElementById('submit-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    
    search: document.getElementById('search-input'),
    filterCategory: document.getElementById('filter-category'),
    filterType: document.getElementById('filter-type'),
    list: document.getElementById('transaction-list'),
    emptyState: document.getElementById('empty-state'),
    
    themeCheckbox: document.getElementById('theme-checkbox'),
    exportBtn: document.getElementById('export-btn'),
    chartTabs: document.querySelectorAll('.chart-tab-btn'),
    barChartCanvas: document.getElementById('barChart'),
    pieChartCanvas: document.getElementById('pieChart')
};

// Global Chart References Layer Instances pointers
let barChartInstance = null;
let pieChartInstance = null;

/**
 * APPLICATION LIFECYCLE INITIALIZER MODULE
 */
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    loadLocalStorageState();
    setupEventListeners();
    evaluateDashboardEngine();
});

function initClock() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    DOM.currentDate.textContent = new Date().toLocaleDateString('en-US', options);
    // Set standard default input system date value to today
    DOM.date.value = new Date().toISOString().split('T')[0];
}

function loadLocalStorageState() {
    const savedData = localStorage.getItem('budgetpilot_state_data');
    if (savedData) {
        state.transactions = JSON.parse(savedData);
    }
    
    const savedTheme = localStorage.getItem('budgetpilot_theme');
    if (savedTheme) {
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        DOM.themeCheckbox.checked = (savedTheme === 'dark');
    }
}

function saveStateToLocalStorage() {
    localStorage.setItem('budgetpilot_state_data', JSON.stringify(state.transactions));
}

/**
 * INTERACTION MANAGEMENT SUITE (EVENT HANDLERS)
 */
function setupEventListeners() {
    DOM.form.addEventListener('submit', handleFormSubmit);
    DOM.cancelEditBtn.addEventListener('click', resetFormContext);
    
    // Search Filtering Interfaces
    DOM.search.addEventListener('input', evaluateDashboardEngine);
    DOM.filterCategory.addEventListener('change', evaluateDashboardEngine);
    DOM.filterType.addEventListener('change', evaluateDashboardEngine);
    
    // UI Theme State Modulators
    DOM.themeCheckbox.addEventListener('change', toggleApplicationTheme);
    DOM.exportBtn.addEventListener('click', exportLedgerToCSV);
    
    // Tab Data Matrix Swapping Switch Routing
    DOM.chartTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            DOM.chartTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            state.activeChart = e.target.dataset.chart;
            toggleChartDisplay();
        });
    });
}

/**
 * BUSINESS LOGIC PIPELINES
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const transactionData = {
        id: DOM.transactionId.value ? parseInt(DOM.transactionId.value) : Date.now(),
        type: DOM.type.value,
        amount: parseFloat(DOM.amount.value),
        description: DOM.description.value.trim(),
        category: DOM.category.value,
        date: DOM.date.value
    };

    if (state.editId) {
        // Core Modification Node Routing Array Replacement Execution
        state.transactions = state.transactions.map(item => item.id === state.editId ? transactionData : item);
        state.editId = null;
    } else {
        // Appending standard records onto operational stack array memory allocation
        state.transactions.unshift(transactionData);
    }

    saveStateToLocalStorage();
    resetFormContext();
    evaluateDashboardEngine();
}

function initEditTransaction(id) {
    const target = state.transactions.find(item => item.id === id);
    if (!target) return;

    state.editId = id;
    DOM.transactionId.value = target.id;
    DOM.type.value = target.type;
    DOM.amount.value = target.amount;
    DOM.description.value = target.description;
    DOM.category.value = target.category;
    DOM.date.value = target.date;

    DOM.formTitle.textContent = "Modify Transaction Reference";
    DOM.submitBtn.textContent = "Update Entry";
    DOM.cancelEditBtn.classList.remove('hidden');
    DOM.form.scrollIntoView({ behavior: 'smooth' });
}

function deleteTransactionItem(id) {
    if(confirm("Confirm removal of this transaction record allocation?")) {
        state.transactions = state.transactions.filter(item => item.id !== id);
        if (state.editId === id) state.editId = null;
        saveStateToLocalStorage();
        evaluateDashboardEngine();
    }
}

function resetFormContext() {
    DOM.form.reset();
    DOM.transactionId.value = '';
    state.editId = null;
    DOM.formTitle.textContent = "Log New Transaction";
    DOM.submitBtn.textContent = "Save Transaction";
    DOM.cancelEditBtn.classList.add('hidden');
    DOM.date.value = new Date().toISOString().split('T')[0];
}

/**
 * ENGINE CALCULATION COMPUTATION PIPELINE MATRIX
 */
function evaluateDashboardEngine() {
    const query = DOM.search.value.toLowerCase().trim();
    const selectedCategory = DOM.filterCategory.value;
    const selectedType = DOM.filterType.value;

    // Filter pipeline logic
    const filteredDataset = state.transactions.filter(item => {
        const matchSearch = item.description.toLowerCase().includes(query) || 
                            item.category.toLowerCase().includes(query);
        const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
        const matchType = selectedType === 'all' || item.type === selectedType;
        return matchSearch && matchCat && matchType;
    });

    // Operational Mathematical aggregators computing metrics
    let incomeSum = 0;
    let expenseSum = 0;
    let weeklyIncome = 0;
    let weeklyExpense = 0;

    const absoluteCurrentTime = new Date();
    const exactOneWeekAgo = new Date(absoluteCurrentTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    state.transactions.forEach(item => {
        const transactionDate = new Date(item.date);
        const isWithinCurrentWeek = transactionDate >= exactOneWeekAgo && transactionDate <= absoluteCurrentTime;

        if (item.type === 'income') {
            incomeSum += item.amount;
            if (isWithinCurrentWeek) weeklyIncome += item.amount;
        } else {
            expenseSum += item.amount;
            if (isWithinCurrentWeek) weeklyExpense += item.amount;
        }
    });

    const calculatedBalance = incomeSum - expenseSum;
    const computedSavings = calculatedBalance > 0 ? calculatedBalance : 0;
    const savingsRatioPercentage = incomeSum > 0 ? Math.round((computedSavings / incomeSum) * 100) : 0;

    // UI Rendering Binding Interpolations Execution
    DOM.totalBalance.textContent = formatCurrencySystem(calculatedBalance);
    DOM.totalIncome.textContent = formatCurrencySystem(incomeSum);
    DOM.totalExpenses.textContent = formatCurrencySystem(expenseSum);
    DOM.totalSavings.textContent = formatCurrencySystem(computedSavings);
    
    DOM.weeklyIncomeSummary.textContent = `Past 7 Days: ${formatCurrencySystem(weeklyIncome)}`;
    DOM.weeklyExpenseSummary.textContent = `Past 7 Days: ${formatCurrencySystem(weeklyExpense)}`;
    DOM.savingsRate.textContent = `Savings Rate: ${savingsRatioPercentage}%`;

    // Sign color tuning logic
    if(calculatedBalance < 0) {
        DOM.totalBalance.className = "text-danger";
    } else {
        DOM.totalBalance.className = "";
    }

    renderTableLedgerView(filteredDataset);
    generateChartGraphics();
}

/**
 * TABLE VIEW RENDERING ENGINE
 */
function renderTableLedgerView(dataset) {
    DOM.list.innerHTML = '';
    
    if (dataset.length === 0) {
        DOM.emptyState.classList.remove('hidden');
        return;
    }
    DOM.emptyState.classList.add('hidden');

    dataset.forEach(item => {
        const tableRowElement = document.createElement('tr');
        
        const columnDateIsoString = new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });

        tableRowElement.innerHTML = `
            <td>${columnDateIsoString}</td>
            <td style="font-weight: 500;">${escapeHtmlEncoding(item.description)}</td>
            <td><span class="category-pill">${item.category}</span></td>
            <td><span class="badge badge-${item.type}">${item.type.toUpperCase()}</span></td>
            <td class="text-right ${item.type === 'income' ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
                ${item.type === 'income' ? '+' : '-'}${formatCurrencySystem(item.amount)}
            </td>
            <td>
                <div class="action-btn-group">
                    <button class="action-btn btn-edit" onclick="initEditTransaction(${item.id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteTransactionItem(${item.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </td>
        `;
        DOM.list.appendChild(tableRowElement);
    });
}

/**
 * GRAPHICS RENDERING AND VISUALIZATION DATA PIPELINE
 */
function toggleChartDisplay() {
    if (state.activeChart === 'bar') {
        DOM.barChartCanvas.classList.remove('hidden');
        DOM.pieChartCanvas.classList.add('hidden');
    } else {
        DOM.barChartCanvas.classList.add('hidden');
        DOM.pieChartCanvas.classList.remove('hidden');
    }
}

function generateChartGraphics() {
    // 1. Data Aggregations Systems Strategy for Allocations Pie Visualizer
    const categoryAllocationDataMap = {
        Food: 0, Transport: 0, Shopping: 0, Entertainment: 0,
        Bills: 0, Education: 0, Healthcare: 0
    };
    
    // Aggregate absolute expense values only across dataset elements pointer array
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
        if (categoryAllocationDataMap.hasOwnProperty(t.category)) {
            categoryAllocationDataMap[t.category] += t.amount;
        }
    });

    const pieLabelsArray = Object.keys(categoryAllocationDataMap);
    const pieDataValuesArray = Object.values(categoryAllocationDataMap);

    // 2. Weekly Time Aggregation Pipeline Framework for Bar Representation
    const finalDaysMapping = {};
    for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dynamicDateKeyString = d.toISOString().split('T')[0];
        finalDaysMapping[dynamicDateKeyString] = { dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }), income: 0, expenses: 0 };
    }

    state.transactions.forEach(t => {
        if(finalDaysMapping.hasOwnProperty(t.date)) {
            if(t.type === 'income') finalDaysMapping[t.date].income += t.amount;
            else finalDaysMapping[t.date].expenses += t.amount;
        }
    });

    const barLabelsArray = Object.values(finalDaysMapping).map(o => o.dayLabel);
    const barIncomeDataSeries = Object.values(finalDaysMapping).map(o => o.income);
    const barExpenseDataSeries = Object.values(finalDaysMapping).map(o => o.expenses);

    // Dynamic Theme Configuration Injection variables
    const calculatedColorsThemeMode = state.theme === 'dark' ? '#8a94a6' : '#626d7f';
    const computedGridColorMode = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    // Rendering Logic System: Bar Graphics Initialization
    if(barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(DOM.barChartCanvas, {
        type: 'bar',
        data: {
            labels: barLabelsArray,
            datasets: [
                { label: 'Inflow', data: barIncomeDataSeries, backgroundColor: '#00e676', borderRadius: 6 },
                { label: 'Outflow', data: barExpenseDataSeries, backgroundColor: '#ff1744', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: calculatedColorsThemeMode, font: { family: 'Inter', weight: 500 } } }
            },
            scales: {
                x: { grid: { color: computedGridColorMode }, ticks: { color: calculatedColorsThemeMode } },
                y: { grid: { color: computedGridColorMode }, ticks: { color: calculatedColorsThemeMode } }
            }
        }
    });

    // Rendering Logic System: Allocation Matrix Pie Graphics Initialization
    if(pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(DOM.pieChartCanvas, {
        type: 'doughnut',
        data: {
            labels: pieLabelsArray,
            datasets: [{
                data: pieDataValuesArray,
                backgroundColor: ['#ff1744', '#00e5ff', '#7000ff', '#ffea00', '#ff9100', '#00e676', '#d500f9'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: calculatedColorsThemeMode, font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });
}

/**
 * EXPORT FILE MANAGEMENT COMPONENT
 */
function exportLedgerToCSV() {
    if(state.transactions.length === 0) {
        alert("Transaction list data buffer is empty. Action aborted.");
        return;
    }

    let manualCsvContentBuffer = "ID,Date,Description,Category,Type,Amount\n";
    state.transactions.forEach(t => {
        manualCsvContentBuffer += `${t.id},${t.date},"${t.description.replace(/"/g, '""')}",${t.category},${t.type},${t.amount}\n`;
    });

    const generatedBlob = new Blob([manualCsvContentBuffer], { type: 'text/csv;charset=utf-8;' });
    const virtualDownloadLinkAnchor = document.createElement("a");
    const structuralBlobUrl = URL.createObjectURL(generatedBlob);
    
    virtualDownloadLinkAnchor.setAttribute("href", structuralBlobUrl);
    virtualDownloadLinkAnchor.setAttribute("download", `BudgetPilot_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    virtualDownloadLinkAnchor.style.visibility = 'hidden';
    
    document.body.appendChild(virtualDownloadLinkAnchor);
    virtualDownloadLinkAnchor.click();
    document.body.removeChild(virtualDownloadLinkAnchor);
}

/**
 * APPLICATION SYSTEM SYSTEM UTILITIES
 */
function toggleApplicationTheme() {
    state.theme = DOM.themeCheckbox.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('budgetpilot_theme', state.theme);
    evaluateDashboardEngine(); // Force re-render of charts with updated colors
}

function formatCurrencySystem(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function escapeHtmlEncoding(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}