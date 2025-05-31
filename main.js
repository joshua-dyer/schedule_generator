// Get references to the HTML elements
const startDateInput = document.getElementById('startDateInput');
const scheduleOutputDiv = document.getElementById('scheduleOutput');
const printScheduleBtn = document.getElementById('printScheduleBtn'); // NEW: Get print button

/**
 * Formats a Date object into a readable string (e.g., "MM/DD/YYYY").
 * @param {Date} date The Date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    const options = {   // Options include formatting for research date format
        year: 'numeric',
        month: 'short',
        day: '2-digit' 
    };
    // Generate the parts of the date string
    const day = date.getDate().toString().padStart(2, '0'); 
    const month = date.toLocaleDateString('en-US', {month: 'short'});
    const year = date.getFullYear();


    return `${day}-${month}-${year}`;
}

/**
 * Generates the visit schedule table based on the selected start date.
 */
function generateSchedule() {
    const startDateString = startDateInput.value;

    if (!startDateString) {
        scheduleOutputDiv.innerHTML = '<p>Please select a start date to generate the schedule.</p>';
        // Optionally disable print button if no schedule
        printScheduleBtn.disabled = true;
        return;
    }

    // Enable the print button once a schedule is generated
    printScheduleBtn.disabled = false;

    const parts = startDateString.split('-');
    let currentTargetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    let tableHTML = `
        <h2>Visit Schedule</h2>
        <table>
            <thead>
                <tr>
                    <th>Visit Number</th>
                    <th>Target Visit Date</th>
                    <th>Visit Window</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 2; i <= 10; i++) {
        let visitNumber = `Visit ${i}`;
        let visitWindowStart = new Date(currentTargetDate);
        let visitWindowEnd = new Date(currentTargetDate);

        visitWindowStart.setDate(currentTargetDate.getDate() - 7);
        visitWindowEnd.setDate(currentTargetDate.getDate() + 7);

        tableHTML += `
            <tr>
                <td>${visitNumber}</td>
                <td>${formatDate(currentTargetDate)}</td>
                <td>${formatDate(visitWindowStart)} - ${formatDate(visitWindowEnd)}</td>
            </tr>
        `;

        if (i < 10) {
            currentTargetDate.setDate(currentTargetDate.getDate() + 56);

            // Add an additional 4 weeks for Visit 8 and 10
            if(i === 7 || i === 9) {
                currentTargetDate.setDate(currentTargetDate.getDate() + 28);
        }
        }
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    scheduleOutputDiv.innerHTML = tableHTML;
}

/**
 * Handles printing the schedule table.
 */
function printSchedule() {
    const scheduleContent = scheduleOutputDiv.innerHTML; // Get the content of the schedule div

    if (!scheduleContent || scheduleOutputDiv.querySelector('table') === null) {
        alert('Please generate a schedule first!');
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Write the HTML for the print page
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Visit Schedule</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h1, h2 {
                    text-align: center;
                    color: #333; /* Darker for print */
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #000; /* Stronger borders for print */
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2; /* Lighter background for print */
                    color: #000;
                }
                /* Optional: Hide elements that are not useful for print */
                @media print {
                    /* You could add more print-specific styles here if needed */
                }
            </style>
        </head>
        <body>
            <h1>Visit Schedule</h1>
            ${scheduleContent}
        </body>
        </html>
    `);

    // Close the document stream for the new window
    printWindow.document.close();

    // Wait for the content to render, then trigger print dialog
    // A small delay ensures the content is fully loaded before printing
    printWindow.onload = function() {
        printWindow.focus(); // Focus on the new window
        printWindow.print(); // Open the print dialog
        printWindow.close(); // Close the print window after printing (optional, user preference)
    };
}

// Add event listeners
startDateInput.addEventListener('change', generateSchedule);
printScheduleBtn.addEventListener('click', printSchedule); // NEW: Listen for click on print button

// Initial call to generate the schedule (and set print button state)
generateSchedule();