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
    const generatedDate = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

    // Header: Title and Month
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Report", 14, 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`For: ${selectedMonth}`, 14, 25);

    // Table Headers and layout configurations
    const headers = ["PG", "Type", "Amount", "Date"];
    const data = expenses.filter(exp => exp.month === selectedMonth);

    const startX = 14;
    const columnWidths = [30, 50, 40, 50];
    const rowHeight = 10;
    const pageHeight = 280; // Height limit for page content

    let currentY = 35; // Starting Y position
    let pageIndex = 1;

    // Function to add table headers
    function addTableHeaders(yPosition) {
        doc.setFont("helvetica", "bold");
        headers.forEach((header, index) => {
            doc.setFillColor(60, 130, 200); // Blue background for header
            const headerX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
            doc.rect(headerX, yPosition, columnWidths[index], rowHeight, 'F');
            doc.setTextColor(255);
            doc.text(header, headerX + 2, yPosition + 7);
        });
        return yPosition + rowHeight;
    }

    currentY = addTableHeaders(currentY); // Add headers to the first page

    // Totals
    let totalPG1 = 0;
    let totalPG2 = 0;

    // Iterate through data rows
    data.forEach((row, rowIndex) => {
        if (currentY + rowHeight > pageHeight) {
            // Footer for page number and date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Page ${pageIndex}`, 195, 285, { align: "right" });
            doc.text(`Date Generated: ${generatedDate}`, 14, 285);

            doc.addPage();
            pageIndex += 1;
            currentY = 20; // Reset Y position for the new page
            currentY = addTableHeaders(currentY); // Add headers to new page
        }

        // Alternating row color
        const fillColor = rowIndex % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
        doc.setFillColor(...fillColor);
        doc.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

        // Add row data
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text(row.pg, startX + 2, currentY + 7);
        doc.text(row.type, startX + columnWidths[0] + 2, currentY + 7);
        doc.text(`${row.amount.toFixed(2)}`, startX + columnWidths[0] + columnWidths[1] + 2, currentY + 7);
        doc.text(row.date, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 2, currentY + 7);

        headers.forEach((_, cellIndex) => {
            const cellX = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);
            doc.rect(cellX, currentY, columnWidths[cellIndex], rowHeight);
        });

        if (row.pg === "PG1") totalPG1 += row.amount;
        else if (row.pg === "PG2") totalPG2 += row.amount;

        currentY += rowHeight; // Move Y position down for the next row
    });

    // Add footer with totals after data rows
    if (currentY + rowHeight * 1.5 > pageHeight) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${pageIndex}`, 195, 285, { align: "right" });
        doc.text(`Date Generated: ${generatedDate}`, 14, 285);

        doc.addPage();
        currentY = 20;
        pageIndex += 1;
    }

    // Footer Section with totals
    doc.setFillColor(220, 220, 220);
    doc.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight * 1.5, 'F');

    const totalSum = totalPG1 + totalPG2;
    const footerTextY = currentY + rowHeight;

    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Total PG1:", startX + 2, footerTextY);
    doc.text(`${totalPG1.toFixed(2)}`, startX + columnWidths[0] + 10, footerTextY);
    doc.text("Total PG2:", startX + columnWidths[0] + columnWidths[1] + 10, footerTextY);
    doc.text(`${totalPG2.toFixed(2)}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 10, footerTextY);

    // Grand Total Section
    const totalBoxY = currentY + rowHeight * 1.8;
    doc.setFillColor(255, 230, 180);
    doc.rect(startX, totalBoxY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    doc.setFontSize(14);
    doc.text(`Grand Total: ${totalSum.toFixed(2)}`, startX + 1, totalBoxY + 7);

    // Final page number and generated date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Page ${pageIndex}`, 195, 285, { align: "right" });
    doc.text(`Date Generated: ${generatedDate}`, 14, 285);

    // Save PDF
    doc.save(`${selectedMonth}-expenses-report.pdf`);
}
