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

// function displayExpenses() {
//     const expenseList = document.getElementById('expenseList');
//     expenseList.innerHTML = '';
//     const selectedMonth = document.getElementById('monthFilter').value;
//     const selectedPG = document.getElementById('pg').value;

//     expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
//         .forEach(exp => {
//             expenseList.innerHTML += `<div>${exp.pg}: ${exp.type} - ₹${exp.amount} on ${exp.date}</div>`;
//         });
// }

// Update the total expenses
function updateTotalExpenses() {
    const selectedMonth = document.getElementById('monthFilter').value;
    const selectedPG = document.getElementById('pg').value;

    totalExpenses = expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    document.getElementById('totalExpensesDisplay').textContent = `₹${totalExpenses.toFixed(2)}`;
}

function displayExpenses() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    const selectedMonth = document.getElementById('monthFilter').value;
    const selectedPG = document.getElementById('pg').value;

    // Create table for expenses
    let table = `
        <table class="expense-table">
            <thead>
                <tr>
                    <th>PG</th>
                    <th>Type</th>
                    <th>Amount (₹)</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Filter and populate rows with data
    expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
        .forEach(exp => {
            table += `
                <tr>
                    <td>${exp.pg}</td>
                    <td>${exp.type}</td>
                    <td>₹${exp.amount.toFixed(2)}</td>
                    <td>${exp.date}</td>
                </tr>
            `;
        });

    table += `</tbody></table>`;
    expenseList.innerHTML = table;
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


// function downloadCSV() {
//     let csvContent = "data:text/csv;charset=utf-8,";

//     // Table headers
//     csvContent += "PG,Type,Amount (₹),Date\n";

//     const selectedMonth = document.getElementById('monthFilter').value;
//     const selectedPG = document.getElementById('pg').value;

//     // Filtered expenses
//     expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
//         .forEach(exp => {
//             const row = `${exp.pg},${exp.type},${exp.amount},${exp.date}\n`;
//             csvContent += row;
//         });

//     // Encode and trigger download
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `${selectedMonth}-${selectedPG}-expenses.csv`);
//     document.body.appendChild(link); 
//     link.click();
//     document.body.removeChild(link); 
// }

// function downloadPDF() {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF();
    
//     // Table column titles
//     doc.text("Expense Report", 14, 10);
//     doc.text("PG", 14, 30);
//     doc.text("Type", 40, 30);
//     doc.text("Amount (₹)", 90, 30);
//     doc.text("Date", 130, 30);
    
//     const selectedMonth = document.getElementById('monthFilter').value;
//     const selectedPG = document.getElementById('pg').value;

//     // Filtered expenses
//     let startY = 40; // Start drawing table content from this Y position
//     expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
//         .forEach(exp => {
//             doc.text(exp.pg, 14, startY);
//             doc.text(exp.type, 40, startY);
//             doc.text(`₹${exp.amount.toFixed(2)}`, 90, startY);
//             doc.text(exp.date, 130, startY);
//             startY += 10; // Move Y down for each expense
//         });

//     doc.save(`${selectedMonth}-${selectedPG}-expenses.pdf`);
// }

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Table headers
    csvContent += "PG,Type,Amount (₹),Date\n";

    const selectedMonth = document.getElementById('monthFilter').value;

    // Initialize totals for PG1 and PG2
    let totalPG1 = 0;
    let totalPG2 = 0;

    // Filtered expenses
    expenses.filter(exp => exp.month === selectedMonth) // Filter expenses by the selected month
        .forEach(exp => {
            const row = `${exp.pg},${exp.type},₹${exp.amount.toFixed(2)},${exp.date}\n`;
            csvContent += row;

            // Calculate totals based on PG
            if (exp.pg === "PG1") {
                totalPG1 += exp.amount;
            } else if (exp.pg === "PG2") {
                totalPG2 += exp.amount;
            }
        });

    // Add totals to the CSV
    csvContent += `\nTotal Expenses for PG1: ₹${totalPG1.toFixed(2)}\n`;
    csvContent += `Total Expenses for PG2: ₹${totalPG2.toFixed(2)}\n`;
    csvContent += `Final Total (PG1 + PG2): ₹${(totalPG1 + totalPG2).toFixed(2)}\n`;

    // Encode and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedMonth}-expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const selectedMonth = document.getElementById('monthFilter').value;

    // Table Title
    doc.setFontSize(18);
    doc.text("Expense Report", 14, 10);
    doc.setFontSize(12);
    doc.text(`For: ${selectedMonth}`, 14, 15);

    // Table Headers
    const headers = ["PG", "Type", "Amount(₹)", "Date"];
    const data = expenses.filter(exp => exp.month === selectedMonth);

    // Create Table
    const startY = 30; // Starting Y position for table
    const startX = 14; // Starting X position for table
    const columnWidths = [40, 40, 40, 40]; // Set column widths
    const rowHeight = 10;

    // Draw Header
    headers.forEach((header, index) => {
        doc.setFillColor(255, 99, 132); // Header background color
        doc.rect(startX + index * columnWidths[index], startY, columnWidths[index], rowHeight, 'F'); // Fill rectangle
        doc.setTextColor(255); // Set text color to white
        doc.text(header, startX + index * columnWidths[index] + 5, startY + 7); // Header text
    });

    // Draw Data Rows
    doc.setTextColor(0); // Reset text color to black
    let totalPG1 = 0;
    let totalPG2 = 0;

    data.forEach((row, rowIndex) => {
        const fillColor = row.pg === "PG1" ? [235, 236, 240] : [255, 243, 220]; // Alternating colors based on PG
        doc.setFillColor(...fillColor);
        doc.rect(startX, startY + (rowIndex + 1) * rowHeight, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F'); // Fill rectangle
    
        // Add cell data
        doc.text(row.pg, startX, startY + (rowIndex + 1) * rowHeight + 7); // PG
        doc.text(row.type, startX + columnWidths[0], startY + (rowIndex + 1) * rowHeight + 7); // Type
        doc.text(row.amount.toFixed(2), startX + columnWidths[0] + columnWidths[1], startY + (rowIndex + 1) * rowHeight + 7); // Amount
        doc.text(row.date, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY + (rowIndex + 1) * rowHeight + 7); // Date
    
        // Draw borders
        headers.forEach((_, cellIndex) => {
            doc.rect(startX + cellIndex * columnWidths[cellIndex], startY + (rowIndex + 1) * rowHeight, columnWidths[cellIndex], rowHeight);
        });
    
        // Calculate totals for PG1 and PG2
        if (row.pg === "PG1") {
            totalPG1 += row.amount;
        } else if (row.pg === "PG2") {
            totalPG2 += row.amount;
        }
    });
    

    // Draw the bottom border for the data
    headers.forEach((_, index) => {
        doc.rect(startX + index * columnWidths[index], startY, columnWidths[index], (data.length + 1) * rowHeight);
    });

    // Add Total Expenses Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Total Expenses", startX, startY + (data.length + 2) * rowHeight); // Total Expenses Title

    doc.setFontSize(12);
    doc.text(`PG1 Total: ₹${totalPG1.toFixed(2)}`, startX, startY + (data.length + 3) * rowHeight);
    doc.text(`PG2 Total: ₹${totalPG2.toFixed(2)}`, startX, startY + (data.length + 4) * rowHeight);

    // Save PDF
    doc.save(`${selectedMonth}-expenses-report.pdf`);
}
