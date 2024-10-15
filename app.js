document.getElementById('expenseForm').addEventListener('submit', addExpense);

let expenses = [];
let totalExpenses = 0;
let expenseChart;

// Initialize the page and load expenses
window.onload = function () {
    initializeMonthFilter();
    loadExpenses();
    setupChart();
    displayExpenses();
    updateTotalExpenses();
    updateChart(); // Ensure chart updates after loading saved data
};

// Initialize month filter dropdown
function initializeMonthFilter() {
    const monthFilter = document.getElementById('monthFilter');
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const options = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        .map((month) => {
            const year = new Date().getFullYear();
            return `<option value="${month} ${year}">${month} ${year}</option>`;
        }).join('');
    monthFilter.innerHTML = options;
    monthFilter.value = currentMonth;
}

// Setup the chart for displaying expenses
function setupChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Month labels will be dynamically updated
            datasets: [{
                label: 'Total Expenses',
                data: [], // Expense data for each month
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Bar color
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Add a new expense
function addExpense(event) {
    event.preventDefault();
    const pg = document.getElementById('pg').value;
    const type = document.getElementById('expenseType').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const month = document.getElementById('monthFilter').value;
    const date = document.getElementById('expenseDate').value;

    if (isNaN(amount) || amount <= 0) {
        showToast('Invalid amount!');
        return;
    }

    const expense = { pg, type, amount, month , date };
    expenses.push(expense);
    saveExpenses();
    displayExpenses();
    updateTotalExpenses();
    updateChart();
    showToast('Expense added successfully!');
    document.getElementById('expenseForm').reset();
}

// Save expenses to local storage
function saveExpenses() {
    const monthlyData = JSON.parse(localStorage.getItem('expenses')) || [];

    expenses.forEach(exp => {
        monthlyData.push(exp);
    });

    localStorage.setItem('expenses', JSON.stringify(monthlyData)); // Save to local storage
}

function loadExpenses() {
    expenses = JSON.parse(localStorage.getItem('expenses')) || []; 
    displayExpenses(); // display expenses after loading
    updateTotalExpenses(); // update total expenses after loading
    updateChart(); // update chart after loading
}

function displayExpenses() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    const selectedMonth = document.getElementById('monthFilter').value;
    const selectedPG = document.getElementById('pg').value;

    expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
        .forEach(exp => {
            expenseList.innerHTML += `<div>${exp.pg}: ${exp.type} - ₹${exp.amount} on ${exp.date}</div>`;
        });
}

// Update the total expenses
function updateTotalExpenses() {
    const selectedMonth = document.getElementById('monthFilter').value;
    const selectedPG = document.getElementById('pg').value;

    totalExpenses = expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    document.getElementById('totalExpensesDisplay').textContent = `₹${totalExpenses.toFixed(2)}`;
}

// Update the chart with monthly expenses
function updateChart() {
    const monthlyData = {}; // Object to hold expenses grouped by month
    
    // Populate monthlyData with expenses for each month
    expenses.forEach(exp => {
        if (!monthlyData[exp.month]) {
            monthlyData[exp.month] = 0;
        }
        monthlyData[exp.month] += exp.amount;
    });

    // Extract the labels (months) and the data (total expenses for each month)
    const monthLabels = Object.keys(monthlyData); // Labels: months
    const expenseData = Object.values(monthlyData); // Data: total expenses per month

    if (expenseChart) {
        expenseChart.data.labels = monthLabels;  // Set the labels for the chart
        expenseChart.data.datasets[0].data = expenseData;  // Set the data for the chart
        expenseChart.update();  // Refresh the chart with new data
    } else {
        console.error("Expense chart is not initialized.");
    }
}

// Show a temporary toast message
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'show';
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

// Event listeners for filtering
document.getElementById('monthFilter').addEventListener('change', () => {
    displayExpenses();
    updateTotalExpenses();
    updateChart(); // Update chart when month changes
});

document.getElementById('pg').addEventListener('change', () => {
    displayExpenses();
    updateTotalExpenses();
    updateChart(); // Update chart when PG changes
});

document.getElementById('expenseForm').addEventListener('submit', addExpense);
